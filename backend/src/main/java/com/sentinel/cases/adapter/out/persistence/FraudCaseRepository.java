package com.sentinel.cases.adapter.out.persistence;

import com.sentinel.cases.domain.model.CaseStatus;
import com.sentinel.cases.domain.model.FraudCase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FraudCaseRepository extends JpaRepository<FraudCase, UUID> {

    Page<FraudCase> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId, Pageable pageable);

    Page<FraudCase> findByOrganizationIdAndStatusOrderByCreatedAtDesc(UUID organizationId, CaseStatus status, Pageable pageable);

    Page<FraudCase> findByOrganizationIdAndAssignedToOrderByCreatedAtDesc(UUID organizationId, UUID assignedTo, Pageable pageable);

    boolean existsByAlertId(UUID alertId);

    long countByOrganizationIdAndStatus(UUID organizationId, CaseStatus status);
}
