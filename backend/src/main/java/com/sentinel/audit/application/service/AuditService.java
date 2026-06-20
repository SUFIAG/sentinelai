package com.sentinel.audit.application.service;

import com.sentinel.audit.adapter.out.persistence.AuditRepository;
import com.sentinel.audit.domain.model.AuditAction;
import com.sentinel.audit.domain.model.AuditEntry;
import com.sentinel.audit.domain.model.EntityType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditRepository auditRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(UUID organizationId, UUID entityId, AuditAction action, EntityType entityType) {
        logAction(organizationId, null, entityId, action, entityType, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(UUID organizationId, UUID userId, UUID entityId,
                          AuditAction action, EntityType entityType,
                          String decisionFactors, String reasoning) {
        try {
            AuditEntry entry = AuditEntry.builder()
                    .organizationId(organizationId)
                    .userId(userId)
                    .action(action.name())
                    .entityType(entityType.name())
                    .entityId(entityId)
                    .decisionFactors(decisionFactors)
                    .reasoning(reasoning)
                    .result("SUCCESS")
                    .timestamp(Instant.now())
                    .build();
            auditRepository.save(entry);
        } catch (Exception e) {
            log.error("Failed to create audit entry: action={}, entityId={}", action, entityId, e);
        }
    }
}
