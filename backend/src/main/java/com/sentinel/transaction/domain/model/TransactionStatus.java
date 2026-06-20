package com.sentinel.transaction.domain.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TransactionStatus {
    PENDING("Awaiting fraud analysis"),
    FLAGGED("Potential fraud detected"),
    APPROVED("Approved by system or analyst"),
    REJECTED("Rejected as fraudulent");

    private final String description;
}
