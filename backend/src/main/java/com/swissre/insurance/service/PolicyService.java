package com.swissre.insurance.service;

import com.swissre.insurance.dto.PolicyDto;
import com.swissre.insurance.model.Policy;
import org.springframework.data.domain.Pageable;

public interface PolicyService {
    PolicyDto.Response createPolicy(PolicyDto.CreateRequest request, String username);
    PolicyDto.Response getPolicyById(String id);
    PolicyDto.Response getPolicyByNumber(String policyNumber);
    PolicyDto.PagedResponse getAllPolicies(Pageable pageable, String username);
    PolicyDto.PagedResponse getPoliciesByStatus(Policy.PolicyStatus status, Pageable pageable);
    PolicyDto.PagedResponse searchPolicies(String searchTerm, Pageable pageable);
    PolicyDto.Response updatePolicy(String id, PolicyDto.UpdateRequest request, String username);
    void deletePolicy(String id, String username);
}
