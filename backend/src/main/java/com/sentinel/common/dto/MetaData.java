package com.sentinel.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MetaData {

    private String timestamp;
    private String requestId;
    private Integer page;
    private Integer totalPages;
    private Long totalElements;

    public static MetaData now() {
        return MetaData.builder()
                .timestamp(Instant.now().toString())
                .requestId(UUID.randomUUID().toString())
                .build();
    }

    public static MetaData of(int page, int totalPages, long totalElements) {
        return MetaData.builder()
                .timestamp(Instant.now().toString())
                .requestId(UUID.randomUUID().toString())
                .page(page)
                .totalPages(totalPages)
                .totalElements(totalElements)
                .build();
    }
}
