package com.swissre.insurance.dto;

import com.swissre.insurance.model.Policy;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class PolicyDto {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 100)
        private String title;

        private String description;

        @NotNull(message = "Policy type is required")
        private Policy.PolicyType type;

        @NotBlank(message = "Holder name is required")
        private String holderName;

        @NotBlank(message = "Holder email is required")
        @Email(message = "Invalid email format")
        private String holderEmail;

        @NotNull(message = "Premium amount is required")
        @DecimalMin(value = "0.01", message = "Premium must be positive")
        private BigDecimal premium;

        @NotNull(message = "Coverage amount is required")
        @DecimalMin(value = "1.0", message = "Coverage must be positive")
        private BigDecimal coverageAmount;

        @NotBlank(message = "Currency is required")
        @Size(min = 3, max = 3, message = "Currency must be ISO 3-letter code")
        private String currency;

        @NotNull(message = "Start date is required")
        @FutureOrPresent(message = "Start date cannot be in the past")
        private LocalDate startDate;

        @NotNull(message = "End date is required")
        @Future(message = "End date must be in the future")
        private LocalDate endDate;
    }

    @Data
    public static class UpdateRequest {
        @Size(min = 3, max = 100)
        private String title;

        private String description;

        private Policy.PolicyStatus status;

        @DecimalMin(value = "0.01")
        private BigDecimal premium;

        @DecimalMin(value = "1.0")
        private BigDecimal coverageAmount;

        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Data
    public static class Response {
        private String id;
        private String policyNumber;
        private String title;
        private String description;
        private Policy.PolicyType type;
        private Policy.PolicyStatus status;
        private String holderName;
        private String holderEmail;
        private BigDecimal premium;
        private BigDecimal coverageAmount;
        private String currency;
        private LocalDate startDate;
        private LocalDate endDate;
        private Policy.RiskLevel riskLevel;
        private String createdBy;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    public static class PagedResponse {
        private java.util.List<Response> content;
        private int pageNumber;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }
}
