package com.sentinel.audit.adapter.out.persistence;

import com.sentinel.audit.domain.model.AuditEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditRepository extends JpaRepository<AuditEntry, UUID> {

    Page<AuditEntry> findByOrganizationIdOrderByTimestampDesc(UUID organizationId, Pageable pageable);

    List<AuditEntry> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, UUID entityId);

    long countByOrganizationIdAndTimestampAfter(UUID organizationId, Instant since);
}
