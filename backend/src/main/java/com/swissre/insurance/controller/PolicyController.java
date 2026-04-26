package com.swissre.insurance.controller;

import com.swissre.insurance.dto.PolicyDto;
import com.swissre.insurance.model.Policy;
import com.swissre.insurance.service.PolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Policies", description = "Insurance policy management")
public class PolicyController {

    private final PolicyService policyService;

    @PostMapping
    @Operation(summary = "Create a new insurance policy")
    public ResponseEntity<PolicyDto.Response> createPolicy(
            @Valid @RequestBody PolicyDto.CreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(policyService.createPolicy(request, userDetails.getUsername()));
    }

    @GetMapping
    @Operation(summary = "Get all policies for current user")
    public ResponseEntity<PolicyDto.PagedResponse> getAllPolicies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetails userDetails) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(policyService.getAllPolicies(pageable, userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get policy by ID")
    public ResponseEntity<PolicyDto.Response> getPolicyById(@PathVariable String id) {
        return ResponseEntity.ok(policyService.getPolicyById(id));
    }

    @GetMapping("/number/{policyNumber}")
    @Operation(summary = "Get policy by policy number")
    public ResponseEntity<PolicyDto.Response> getPolicyByNumber(@PathVariable String policyNumber) {
        return ResponseEntity.ok(policyService.getPolicyByNumber(policyNumber));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get policies by status")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<PolicyDto.PagedResponse> getPoliciesByStatus(
            @PathVariable Policy.PolicyStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(policyService.getPoliciesByStatus(status, pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Search policies by keyword")
    public ResponseEntity<PolicyDto.PagedResponse> searchPolicies(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(policyService.searchPolicies(q, pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a policy")
    public ResponseEntity<PolicyDto.Response> updatePolicy(
            @PathVariable String id,
            @Valid @RequestBody PolicyDto.UpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(policyService.updatePolicy(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a policy")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Void> deletePolicy(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        policyService.deletePolicy(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
