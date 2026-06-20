package com.sentinel.fraud.risk.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "risk_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "transaction_id", nullable = false)
    private UUID transactionId;

    @Column(nullable = false)
    private int score;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel level;

    @Column(name = "amount_risk", nullable = false)
    private int amountRisk;

    @Column(name = "velocity_risk", nullable = false)
    private int velocityRisk;

    @Column(name = "location_risk", nullable = false)
    private int locationRisk;

    @Column(name = "device_risk", nullable = false)
    private int deviceRisk;

    @Column(name = "history_risk", nullable = false)
    private int historyRisk;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
