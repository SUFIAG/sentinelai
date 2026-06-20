package com.sentinel.cases.application.service;

import com.sentinel.cases.domain.model.CaseStatus;
import com.sentinel.cases.domain.model.FraudCase;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Lightweight notification dispatcher. For the MVP notifications are emitted to
 * the application log asynchronously; the same seams can later be bound to email,
 * websockets or Kafka without touching callers.
 */
@Service
@Slf4j
public class NotificationService {

    @Async
    public void notifyAssignment(FraudCase fraudCase, UUID assigneeId) {
        log.info("[NOTIFY] Case {} ('{}') assigned to user {}",
                fraudCase.getId(), fraudCase.getTitle(), assigneeId);
    }

    @Async
    public void notifyStatusChange(FraudCase fraudCase, CaseStatus oldStatus, CaseStatus newStatus) {
        log.info("[NOTIFY] Case {} status changed {} -> {}",
                fraudCase.getId(), oldStatus, newStatus);
    }

    @Async
    public void notifyComment(UUID caseId, UUID authorId) {
        log.info("[NOTIFY] New comment on case {} by user {}", caseId, authorId);
    }
}
