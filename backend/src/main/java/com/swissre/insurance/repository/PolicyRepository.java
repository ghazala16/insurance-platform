package com.swissre.insurance.repository;

import com.swissre.insurance.model.Policy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyRepository extends MongoRepository<Policy, String> {

    Optional<Policy> findByPolicyNumber(String policyNumber);

    Page<Policy> findByCreatedBy(String username, Pageable pageable);

    Page<Policy> findByStatus(Policy.PolicyStatus status, Pageable pageable);

    Page<Policy> findByCreatedByAndStatus(String username, Policy.PolicyStatus status, Pageable pageable);

    List<Policy> findByStatusAndEndDateBefore(Policy.PolicyStatus status, LocalDate date);

    @Query("{ $or: [ { 'holderName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'policyNumber': { $regex: ?0, $options: 'i' } }, " +
           "{ 'title': { $regex: ?0, $options: 'i' } } ] }")
    Page<Policy> searchPolicies(String searchTerm, Pageable pageable);

    long countByStatus(Policy.PolicyStatus status);

    long countByCreatedBy(String username);
}
