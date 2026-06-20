package com.sentinel.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private ErrorDetails error;
    private MetaData meta;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .meta(MetaData.now())
                .build();
    }

    public static <T> ApiResponse<T> success(T data, int page, int totalPages, long totalElements) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .meta(MetaData.of(page, totalPages, totalElements))
                .build();
    }

    public static ApiResponse<Void> error(ErrorDetails error) {
        return ApiResponse.<Void>builder()
                .success(false)
                .error(error)
                .meta(MetaData.now())
                .build();
    }
}
