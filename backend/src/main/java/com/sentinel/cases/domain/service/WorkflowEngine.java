package com.sentinel.cases.domain.service;

import com.sentinel.cases.domain.model.CaseStatus;
import com.sentinel.common.exception.BusinessException;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Enforces the fraud case lifecycle state machine:
 * <pre>
 * OPEN -> INVESTIGATING -> RESOLVED -> CLOSED
 *   \           \             /
 *    \-----------\---> CLOSED
 * </pre>
 */
@Service
public class WorkflowEngine {

    private static final Map<CaseStatus, Set<CaseStatus>> TRANSITIONS = new EnumMap<>(CaseStatus.class);

    static {
        TRANSITIONS.put(CaseStatus.OPEN, EnumSet.of(CaseStatus.INVESTIGATING, CaseStatus.CLOSED));
        TRANSITIONS.put(CaseStatus.INVESTIGATING, EnumSet.of(CaseStatus.RESOLVED, CaseStatus.CLOSED));
        TRANSITIONS.put(CaseStatus.RESOLVED, EnumSet.of(CaseStatus.CLOSED));
        TRANSITIONS.put(CaseStatus.CLOSED, EnumSet.noneOf(CaseStatus.class));
    }

    public boolean canTransition(CaseStatus from, CaseStatus to) {
        return TRANSITIONS.getOrDefault(from, EnumSet.noneOf(CaseStatus.class)).contains(to);
    }

    /**
     * Validates a status transition, throwing a {@link BusinessException} when illegal.
     */
    public void validateTransition(CaseStatus from, CaseStatus to) {
        if (from == to) {
            throw new BusinessException("INVALID_TRANSITION",
                    "Case is already in status " + to);
        }
        if (!canTransition(from, to)) {
            throw new BusinessException("INVALID_TRANSITION",
                    "Cannot transition case from " + from + " to " + to);
        }
    }
}
