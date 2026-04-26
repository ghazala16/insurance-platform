package com.swissre.insurance.service.impl;

import com.swissre.insurance.dto.PolicyDto;
import com.swissre.insurance.exception.*;
import com.swissre.insurance.model.Policy;
import com.swissre.insurance.repository.PolicyRepository;
import com.swissre.insurance.service.PolicyService;
import com.swissre.insurance.service.PolicyMessagingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PolicyServiceImpl implements PolicyService {

    private final PolicyRepository policyRepository;
    private final PolicyMessagingService messagingService;

    @Override
    public PolicyDto.Response createPolicy(PolicyDto.CreateRequest request, String username) {
        Policy policy = Policy.builder()
                .policyNumber(generatePolicyNumber(request.getType()))
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .status(Policy.PolicyStatus.PENDING)
                .holderName(request.getHolderName())
                .holderEmail(request.getHolderEmail())
                .premium(request.getPremium())
                .coverageAmount(request.getCoverageAmount())
                .currency(request.getCurrency())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(username)
                .build();

        Policy saved = policyRepository.save(policy);
        log.info("Policy created: {} by user: {}", saved.getPolicyNumber(), username);

        // Publish to Azure Service Bus for async processing
        messagingService.publishPolicyCreatedEvent(saved);

        return mapToResponse(saved);
    }

    @Override
    public PolicyDto.Response getPolicyById(String id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", "id", id));
        return mapToResponse(policy);
    }

    @Override
    public PolicyDto.Response getPolicyByNumber(String policyNumber) {
        Policy policy = policyRepository.findByPolicyNumber(policyNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", "policyNumber", policyNumber));
        return mapToResponse(policy);
    }

    @Override
    public PolicyDto.PagedResponse getAllPolicies(Pageable pageable, String username) {
        Page<Policy> policies = policyRepository.findByCreatedBy(username, pageable);
        return mapToPagedResponse(policies);
    }

    @Override
    public PolicyDto.PagedResponse getPoliciesByStatus(Policy.PolicyStatus status, Pageable pageable) {
        Page<Policy> policies = policyRepository.findByStatus(status, pageable);
        return mapToPagedResponse(policies);
    }

    @Override
    public PolicyDto.PagedResponse searchPolicies(String searchTerm, Pageable pageable) {
        Page<Policy> policies = policyRepository.searchPolicies(searchTerm, pageable);
        return mapToPagedResponse(policies);
    }

    @Override
    public PolicyDto.Response updatePolicy(String id, PolicyDto.UpdateRequest request, String username) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", "id", id));

        // Only the creator or admin can update
        if (!policy.getCreatedBy().equals(username)) {
            throw new ForbiddenException("You don't have permission to update this policy");
        }

        if (request.getTitle() != null) policy.setTitle(request.getTitle());
        if (request.getDescription() != null) policy.setDescription(request.getDescription());
        if (request.getStatus() != null) policy.setStatus(request.getStatus());
        if (request.getPremium() != null) policy.setPremium(request.getPremium());
        if (request.getCoverageAmount() != null) policy.setCoverageAmount(request.getCoverageAmount());
        if (request.getStartDate() != null) policy.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) policy.setEndDate(request.getEndDate());

        Policy updated = policyRepository.save(policy);
        log.info("Policy updated: {} by user: {}", updated.getPolicyNumber(), username);

        return mapToResponse(updated);
    }

    @Override
    public void deletePolicy(String id, String username) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", "id", id));

        log.info("Policy deleted: {} by user: {}", policy.getPolicyNumber(), username);
        policyRepository.delete(policy);
    }

    private String generatePolicyNumber(Policy.PolicyType type) {
        String prefix = type.name().substring(0, 2).toUpperCase();
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return prefix + "-" + uuid;
    }

    private PolicyDto.Response mapToResponse(Policy policy) {
        PolicyDto.Response response = new PolicyDto.Response();
        response.setId(policy.getId());
        response.setPolicyNumber(policy.getPolicyNumber());
        response.setTitle(policy.getTitle());
        response.setDescription(policy.getDescription());
        response.setType(policy.getType());
        response.setStatus(policy.getStatus());
        response.setHolderName(policy.getHolderName());
        response.setHolderEmail(policy.getHolderEmail());
        response.setPremium(policy.getPremium());
        response.setCoverageAmount(policy.getCoverageAmount());
        response.setCurrency(policy.getCurrency());
        response.setStartDate(policy.getStartDate());
        response.setEndDate(policy.getEndDate());
        response.setRiskLevel(policy.getRiskLevel());
        response.setCreatedBy(policy.getCreatedBy());
        response.setCreatedAt(policy.getCreatedAt());
        response.setUpdatedAt(policy.getUpdatedAt());
        return response;
    }

    private PolicyDto.PagedResponse mapToPagedResponse(Page<Policy> page) {
        PolicyDto.PagedResponse response = new PolicyDto.PagedResponse();
        response.setContent(page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()));
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        return response;
    }
}
