package com.sentinel.alert.adapter.out.persistence;

import com.sentinel.alert.domain.model.AlertStatus;
import com.sentinel.alert.domain.model.FraudAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<FraudAlert, UUID> {

    Page<FraudAlert> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId, Pageable pageable);

    Page<FraudAlert> findByOrganizationIdAndStatusOrderByCreatedAtDesc(UUID organizationId, AlertStatus status, Pageable pageable);

    long countByOrganizationIdAndStatus(UUID organizationId, AlertStatus status);

    long countByOrganizationIdAndCreatedAtAfter(UUID organizationId, Instant since);

    @Query("SELECT COUNT(a) FROM FraudAlert a WHERE a.organizationId = :orgId AND a.status IN ('OPEN','INVESTIGATING')")
    long countOpenAlerts(@Param("orgId") UUID orgId);
}
