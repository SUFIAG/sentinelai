package com.sentinel.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorDetails {

    private String code;
    private String message;
    private Map<String, String> details;
    private String timestamp;
    private String requestId;
    private String path;

    public static ErrorDetails of(String code, String message, String requestId, String path) {
        return ErrorDetails.builder()
                .code(code)
                .message(message)
                .timestamp(Instant.now().toString())
                .requestId(requestId)
                .path(path)
                .build();
    }
}
