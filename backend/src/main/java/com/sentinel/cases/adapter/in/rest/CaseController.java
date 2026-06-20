package com.sentinel.cases.adapter.in.rest;

import com.sentinel.cases.application.dto.AddCommentRequest;
import com.sentinel.cases.application.dto.AssignCaseRequest;
import com.sentinel.cases.application.dto.CaseHistoryResponse;
import com.sentinel.cases.application.dto.CaseResponse;
import com.sentinel.cases.application.dto.CommentResponse;
import com.sentinel.cases.application.dto.CreateCaseRequest;
import com.sentinel.cases.application.dto.UpdateCaseStatusRequest;
import com.sentinel.cases.application.service.CaseService;
import com.sentinel.cases.application.service.CollaborationService;
import com.sentinel.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;
    private final CollaborationService collaborationService;

    @PostMapping
    public ResponseEntity<ApiResponse<CaseResponse>> createCase(
            @RequestBody @Valid CreateCaseRequest request,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        CaseResponse response = caseService.createFromAlert(orgId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CaseResponse>>> listCases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID assignedTo,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(caseService.list(orgId, status, assignedTo, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CaseResponse>> getCase(
            @PathVariable UUID id, Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(caseService.getById(orgId, id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CaseResponse>> changeStatus(
            @PathVariable UUID id,
            @RequestBody @Valid UpdateCaseStatusRequest request,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.success(caseService.changeStatus(orgId, userId, id, request)));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<CaseResponse>> assignCase(
            @PathVariable UUID id,
            @RequestBody @Valid AssignCaseRequest request,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.success(caseService.assign(orgId, userId, id, request)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable UUID id,
            @RequestBody @Valid AddCommentRequest request,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        CommentResponse response = collaborationService.addComment(orgId, userId, id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> listComments(
            @PathVariable UUID id, Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(collaborationService.listComments(orgId, id)));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<CaseHistoryResponse>>> getHistory(
            @PathVariable UUID id, Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(caseService.getHistory(orgId, id)));
    }
}
