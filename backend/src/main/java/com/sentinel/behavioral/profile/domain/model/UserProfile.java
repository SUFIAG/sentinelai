package com.sentinel.behavioral.profile.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "user_profiles", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"organization_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "average_transaction_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal averageTransactionAmount = BigDecimal.ZERO;

    @Column(name = "transaction_count", nullable = false)
    @Builder.Default
    private Long transactionCount = 0L;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "countries_json", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private Set<String> countriesUsed = new HashSet<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "devices_json", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private Set<String> devicesUsed = new HashSet<>();

    @Column(name = "typical_transaction_hour")
    private Integer typicalTransactionHour;

    @Column(name = "risk_score", nullable = false)
    @Builder.Default
    private Integer riskScore = 0;

    @Column(name = "last_updated", nullable = false)
    private Instant lastUpdated;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
