package com.sentinel.cases.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCaseStatusRequest {

    @NotBlank(message = "status is required")
    private String status;

    /** Required when transitioning to RESOLVED: FRAUD, FALSE_POSITIVE or MANUAL_REVIEW. */
    private String resolution;
}
