package com.sentinel.transaction.application.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BulkUploadResponse {
    private int totalProcessed;
    private int totalFailed;
    private List<String> errors;
}
