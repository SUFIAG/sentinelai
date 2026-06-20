package com.sentinel.cases.application.service;

import com.sentinel.audit.application.service.AuditService;
import com.sentinel.audit.domain.model.AuditAction;
import com.sentinel.audit.domain.model.EntityType;
import com.sentinel.cases.adapter.out.persistence.CaseCommentRepository;
import com.sentinel.cases.adapter.out.persistence.FraudCaseRepository;
import com.sentinel.cases.application.dto.AddCommentRequest;
import com.sentinel.cases.application.dto.CommentResponse;
import com.sentinel.cases.domain.model.CaseComment;
import com.sentinel.cases.domain.model.FraudCase;
import com.sentinel.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Team collaboration features for fraud cases (comments + activity surfacing).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CollaborationService {

    private final CaseCommentRepository caseCommentRepository;
    private final FraudCaseRepository fraudCaseRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public CommentResponse addComment(UUID organizationId, UUID userId, UUID caseId, AddCommentRequest request) {
        FraudCase fraudCase = loadOwned(organizationId, caseId);

        CaseComment comment = CaseComment.builder()
                .caseId(fraudCase.getId())
                .userId(userId)
                .content(request.getContent())
                .build();

        CaseComment saved = caseCommentRepository.save(comment);
        auditService.logAction(organizationId, caseId, AuditAction.CASE_COMMENTED, EntityType.CASE);
        notificationService.notifyComment(caseId, userId);
        return CommentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> listComments(UUID organizationId, UUID caseId) {
        loadOwned(organizationId, caseId);
        return caseCommentRepository.findByCaseIdOrderByCreatedAtAsc(caseId)
                .stream().map(CommentResponse::from).toList();
    }

    private FraudCase loadOwned(UUID organizationId, UUID caseId) {
        FraudCase fraudCase = fraudCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case", caseId.toString()));
        if (!fraudCase.getOrganizationId().equals(organizationId)) {
            throw new ResourceNotFoundException("Case", caseId.toString());
        }
        return fraudCase;
    }
}
