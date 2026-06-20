package com.sentinel.cases.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignCaseRequest {

    @NotNull(message = "assigneeId is required")
    private UUID assigneeId;
}
