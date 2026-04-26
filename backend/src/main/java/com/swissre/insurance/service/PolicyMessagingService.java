package com.swissre.insurance.service;

import com.azure.messaging.servicebus.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.swissre.insurance.model.Policy;
import com.swissre.insurance.repository.PolicyRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class PolicyMessagingService {

    @Value("${app.azure.service-bus.connection-string:}")
    private String connectionString;

    @Value("${app.azure.service-bus.policy-queue-name:policy-processing-queue}")
    private String queueName;

    private final ObjectMapper objectMapper;
    private final PolicyRepository policyRepository;
    private ServiceBusSenderClient senderClient;
    private ServiceBusProcessorClient processorClient;

    @PostConstruct
    public void init() {
        if (connectionString == null || connectionString.isBlank()) {
            log.warn("Azure Service Bus connection string not configured. Running in local mode.");
            return;
        }
        try {
            senderClient = new ServiceBusClientBuilder()
                    .connectionString(connectionString)
                    .sender()
                    .queueName(queueName)
                    .buildClient();

            processorClient = new ServiceBusClientBuilder()
                    .connectionString(connectionString)
                    .processor()
                    .queueName(queueName)
                    .processMessage(this::processMessage)
                    .processError(this::processError)
                    .buildProcessorClient();

            processorClient.start();
            log.info("Azure Service Bus processor started for queue: {}", queueName);
        } catch (Exception e) {
            log.error("Failed to initialize Azure Service Bus: {}", e.getMessage());
        }
    }

    /**
     * Publishes a policy creation event to Azure Service Bus.
     * Falls back to in-process async processing if Service Bus is not configured.
     */
    public void publishPolicyCreatedEvent(Policy policy) {
        if (senderClient == null) {
            log.info("Service Bus not configured — processing policy {} locally", policy.getPolicyNumber());
            processLocallyAsync(policy);
            return;
        }

        try {
            Map<String, String> payload = Map.of(
                    "policyId", policy.getId(),
                    "policyNumber", policy.getPolicyNumber(),
                    "type", policy.getType().name(),
                    "event", "POLICY_CREATED"
            );
            String messageBody = objectMapper.writeValueAsString(payload);
            ServiceBusMessage message = new ServiceBusMessage(messageBody);
            message.setMessageId(policy.getId());
            message.getApplicationProperties().put("eventType", "POLICY_CREATED");

            senderClient.sendMessage(message);
            log.info("Published POLICY_CREATED event for: {}", policy.getPolicyNumber());
        } catch (Exception e) {
            log.error("Failed to publish message to Service Bus: {}", e.getMessage());
            processLocallyAsync(policy);
        }
    }

    /**
     * Processes messages received from Azure Service Bus queue.
     */
    private void processMessage(ServiceBusReceivedMessageContext context) {
        ServiceBusReceivedMessage message = context.getMessage();
        log.info("Received message: {}", message.getMessageId());

        try {
            Map<?, ?> payload = objectMapper.readValue(message.getBody().toString(), Map.class);
            String policyId = (String) payload.get("policyId");
            performRiskAssessment(policyId);
            context.complete();
        } catch (Exception e) {
            log.error("Error processing message {}: {}", message.getMessageId(), e.getMessage());
            context.abandon();
        }
    }

    private void processError(ServiceBusErrorContext context) {
        log.error("Service Bus error: {} — Source: {}", context.getException().getMessage(), context.getErrorSource());
    }

    /**
     * Async fallback when Service Bus is not available (local dev).
     */
    @Async
    public void processLocallyAsync(Policy policy) {
        try {
            Thread.sleep(2000); // Simulate processing delay
            performRiskAssessment(policy.getId());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Core risk assessment logic — simulates underwriting computation.
     */
    private void performRiskAssessment(String policyId) {
        policyRepository.findById(policyId).ifPresent(policy -> {
            Policy.RiskLevel riskLevel = calculateRiskLevel(policy);
            policy.setRiskLevel(riskLevel);
            policy.setStatus(Policy.PolicyStatus.ACTIVE);
            policy.setRiskNotes(generateRiskNotes(riskLevel));
            policyRepository.save(policy);
            log.info("Risk assessment complete for policy {}: {} risk", policy.getPolicyNumber(), riskLevel);
        });
    }

    private Policy.RiskLevel calculateRiskLevel(Policy policy) {
        // Simplified risk scoring based on coverage amount and policy type
        BigDecimal coverage = policy.getCoverageAmount();
        return switch (policy.getType()) {
            case AVIATION, MARINE -> coverage.compareTo(new BigDecimal("5000000")) > 0
                    ? Policy.RiskLevel.VERY_HIGH : Policy.RiskLevel.HIGH;
            case LIFE, HEALTH -> coverage.compareTo(new BigDecimal("1000000")) > 0
                    ? Policy.RiskLevel.HIGH : Policy.RiskLevel.MEDIUM;
            default -> coverage.compareTo(new BigDecimal("500000")) > 0
                    ? Policy.RiskLevel.MEDIUM : Policy.RiskLevel.LOW;
        };
    }

    private String generateRiskNotes(Policy.RiskLevel riskLevel) {
        return switch (riskLevel) {
            case LOW -> "Standard risk profile. Auto-approved.";
            case MEDIUM -> "Moderate risk. Standard underwriting terms applied.";
            case HIGH -> "Elevated risk. Enhanced monitoring required.";
            case VERY_HIGH -> "High-risk profile. Senior underwriter review recommended.";
        };
    }

    @PreDestroy
    public void shutdown() {
        if (processorClient != null) processorClient.close();
        if (senderClient != null) senderClient.close();
    }
}
