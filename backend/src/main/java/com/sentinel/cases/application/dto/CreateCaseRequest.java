package com.sentinel.cases.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCaseRequest {

    @NotNull(message = "alertId is required")
    private UUID alertId;

    private String title;

    /** Optional override; defaults to priority derived from the alert severity. */
    private String priority;
}
