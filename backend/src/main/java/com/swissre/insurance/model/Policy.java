package com.swissre.insurance.model;

import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Document(collection = "policies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Policy {

    @Id
    private String id;

    @Indexed
    private String policyNumber;

    private String title;
    private String description;

    private PolicyType type;
    private PolicyStatus status;

    private String holderName;
    private String holderEmail;

    private BigDecimal premium;
    private BigDecimal coverageAmount;
    private String currency;

    private LocalDate startDate;
    private LocalDate endDate;

    // Risk assessment result (populated asynchronously)
    private RiskLevel riskLevel;
    private String riskNotes;

    @Indexed
    private String createdBy;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @CreatedBy
    private String createdByAudit;

    @LastModifiedBy
    private String lastModifiedBy;

    public enum PolicyType {
        LIFE, HEALTH, PROPERTY, CASUALTY, LIABILITY, MARINE, AVIATION
    }

    public enum PolicyStatus {
        PENDING,    // Just created, awaiting processing
        ACTIVE,     // Processed and active
        EXPIRED,    // Past end date
        CANCELLED,  // Manually cancelled
        SUSPENDED   // Temporarily suspended
    }

    public enum RiskLevel {
        LOW, MEDIUM, HIGH, VERY_HIGH
    }
}
