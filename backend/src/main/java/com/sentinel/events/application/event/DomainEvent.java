package com.sentinel.events.application.event;

import com.sentinel.events.domain.model.EventType;

import java.util.Map;
import java.util.UUID;

/**
 * In-process domain event published after an event is persisted to the store.
 * Acts as the decoupling seam that a Kafka producer can later subscribe to
 * without changing producers of the event.
 */
public record DomainEvent(
        UUID aggregateId,
        EventType eventType,
        Map<String, Object> payload,
        UUID organizationId
) {
}
