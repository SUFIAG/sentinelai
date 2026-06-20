package com.sentinel.alert.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAlertRequest {

    @NotBlank(message = "Status is required")
    private String status;
}
