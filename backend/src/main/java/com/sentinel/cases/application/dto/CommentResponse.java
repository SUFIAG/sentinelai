package com.sentinel.cases.application.dto;

import com.sentinel.cases.domain.model.CaseComment;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    private UUID id;
    private UUID caseId;
    private UUID userId;
    private String content;
    private Instant createdAt;

    public static CommentResponse from(CaseComment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .caseId(comment.getCaseId())
                .userId(comment.getUserId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
