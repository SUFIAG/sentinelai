package com.sentinel.common.exception;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String entityType, String identifier) {
        super("NOT_FOUND", entityType + " not found with identifier: " + identifier);
    }
}
