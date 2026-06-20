package com.sentinel.auth.domain.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserRole {
    ADMIN("Full system access"),
    ANALYST("Investigate fraud cases"),
    REVIEWER("Review and approve cases"),
    AUDITOR("View-only audit access"),
    USER("Limited access");

    private final String description;
}
