package com.sentinel.fraud.risk.adapter.out.persistence;

import com.sentinel.fraud.risk.domain.model.RiskLevel;
import com.sentinel.fraud.risk.domain.model.RiskScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RiskScoreRepository extends JpaRepository<RiskScore, UUID> {

    Optional<RiskScore> findByTransactionId(UUID transactionId);

    long countByLevelAndCreatedAtAfter(RiskLevel level, Instant since);

    @Query("SELECT COALESCE(AVG(r.score), 0) FROM RiskScore r WHERE r.createdAt > :since")
    double findAverageScoreSince(@Param("since") Instant since);
}
