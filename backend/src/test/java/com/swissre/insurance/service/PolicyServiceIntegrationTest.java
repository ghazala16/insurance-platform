package com.swissre.insurance.service;

import com.swissre.insurance.dto.PolicyDto;
import com.swissre.insurance.model.Policy;
import com.swissre.insurance.repository.PolicyRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("PolicyService Integration Tests")
class PolicyServiceIntegrationTest {

    @Autowired
    private PolicyService policyService;

    @Autowired
    private PolicyRepository policyRepository;

    @BeforeEach
    void setUp() {
        policyRepository.deleteAll();
    }

    @Test
    @DisplayName("Should create policy and return PENDING status")
    void shouldCreatePolicyWithPendingStatus() {
        PolicyDto.CreateRequest request = buildCreateRequest();

        PolicyDto.Response response = policyService.createPolicy(request, "testuser");

        assertThat(response.getId()).isNotNull();
        assertThat(response.getPolicyNumber()).startsWith("LI-");
        assertThat(response.getStatus()).isEqualTo(Policy.PolicyStatus.PENDING);
        assertThat(response.getCreatedBy()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Should retrieve policy by ID")
    void shouldRetrievePolicyById() {
        PolicyDto.CreateRequest request = buildCreateRequest();
        PolicyDto.Response created = policyService.createPolicy(request, "testuser");

        PolicyDto.Response found = policyService.getPolicyById(created.getId());

        assertThat(found.getId()).isEqualTo(created.getId());
        assertThat(found.getHolderName()).isEqualTo("John Doe");
    }

    @Test
    @DisplayName("Should update policy fields")
    void shouldUpdatePolicy() {
        PolicyDto.Response created = policyService.createPolicy(buildCreateRequest(), "testuser");

        PolicyDto.UpdateRequest update = new PolicyDto.UpdateRequest();
        update.setTitle("Updated Policy Title");
        update.setPremium(new BigDecimal("1500.00"));

        PolicyDto.Response updated = policyService.updatePolicy(created.getId(), update, "testuser");

        assertThat(updated.getTitle()).isEqualTo("Updated Policy Title");
        assertThat(updated.getPremium()).isEqualByComparingTo("1500.00");
    }

    @Test
    @DisplayName("Should delete policy")
    void shouldDeletePolicy() {
        PolicyDto.Response created = policyService.createPolicy(buildCreateRequest(), "testuser");

        policyService.deletePolicy(created.getId(), "testuser");

        assertThat(policyRepository.findById(created.getId())).isEmpty();
    }

    private PolicyDto.CreateRequest buildCreateRequest() {
        PolicyDto.CreateRequest request = new PolicyDto.CreateRequest();
        request.setTitle("Life Insurance Policy");
        request.setType(Policy.PolicyType.LIFE);
        request.setHolderName("John Doe");
        request.setHolderEmail("john@example.com");
        request.setPremium(new BigDecimal("1200.00"));
        request.setCoverageAmount(new BigDecimal("500000.00"));
        request.setCurrency("USD");
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusYears(1));
        return request;
    }
}
