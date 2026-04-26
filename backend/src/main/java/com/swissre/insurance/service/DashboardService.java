package com.swissre.insurance.service;

import com.swissre.insurance.model.Policy;
import com.swissre.insurance.repository.PolicyRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PolicyRepository policyRepository;

    public DashboardStats getStats(String username) {
        List<Policy> userPolicies = policyRepository.findAll().stream()
                .filter(p -> p.getCreatedBy().equals(username))
                .collect(Collectors.toList());

        DashboardStats stats = new DashboardStats();
        stats.setTotalPolicies(userPolicies.size());
        stats.setActivePolicies((int) userPolicies.stream()
                .filter(p -> p.getStatus() == Policy.PolicyStatus.ACTIVE).count());
        stats.setPendingPolicies((int) userPolicies.stream()
                .filter(p -> p.getStatus() == Policy.PolicyStatus.PENDING).count());
        stats.setExpiredPolicies((int) userPolicies.stream()
                .filter(p -> p.getStatus() == Policy.PolicyStatus.EXPIRED).count());

        stats.setTotalPremium(userPolicies.stream()
                .filter(p -> p.getStatus() == Policy.PolicyStatus.ACTIVE)
                .map(Policy::getPremium)
                .filter(p -> p != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        stats.setTotalCoverage(userPolicies.stream()
                .filter(p -> p.getStatus() == Policy.PolicyStatus.ACTIVE)
                .map(Policy::getCoverageAmount)
                .filter(c -> c != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        // Policies by type
        Map<String, Long> byType = userPolicies.stream()
                .collect(Collectors.groupingBy(p -> p.getType().name(), Collectors.counting()));
        stats.setPoliciesByType(byType);

        // Policies by risk level
        Map<String, Long> byRisk = userPolicies.stream()
                .filter(p -> p.getRiskLevel() != null)
                .collect(Collectors.groupingBy(p -> p.getRiskLevel().name(), Collectors.counting()));
        stats.setPoliciesByRisk(byRisk);

        return stats;
    }

    @Data
    public static class DashboardStats {
        private int totalPolicies;
        private int activePolicies;
        private int pendingPolicies;
        private int expiredPolicies;
        private BigDecimal totalPremium;
        private BigDecimal totalCoverage;
        private Map<String, Long> policiesByType;
        private Map<String, Long> policiesByRisk;
    }
}
