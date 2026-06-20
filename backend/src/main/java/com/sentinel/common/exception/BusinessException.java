package com.sentinel.common.exception;

import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

@Getter
public class BusinessException extends RuntimeException {

    private final String code;
    private final Map<String, String> details;

    public BusinessException(String code, String message) {
        super(message);
        this.code = code;
        this.details = new HashMap<>();
    }

    public BusinessException(String code, String message, Map<String, String> details) {
        super(message);
        this.code = code;
        this.details = details != null ? details : new HashMap<>();
    }
}
