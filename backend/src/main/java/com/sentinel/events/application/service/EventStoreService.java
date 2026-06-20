package com.sentinel.events.application.service;

import com.sentinel.events.adapter.out.persistence.EventStoreRepository;
import com.sentinel.events.application.dto.EventResponse;
import com.sentinel.events.application.event.DomainEvent;
import com.sentinel.events.domain.model.EventType;
import com.sentinel.events.domain.model.FraudEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Append-only event store. Every significant decision is persisted for full
 * auditability/replay and then re-published as an in-process {@link DomainEvent}
 * so downstream consumers (autonomous agents today, Kafka tomorrow) can react.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventStoreService {

    private final EventStoreRepository eventStoreRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Transactional
    public void append(UUID aggregateId, EventType eventType, UUID organizationId,
                       Map<String, Object> payload, String actor) {
        try {
            FraudEvent event = FraudEvent.builder()
                    .eventId(UUID.randomUUID())
                    .aggregateId(aggregateId)
                    .eventType(eventType)
                    .occurredAt(Instant.now())
                    .payload(payload)
                    .actor(actor)
                    .metadata(organizationId != null
                            ? Map.of("organizationId", organizationId.toString()) : Map.of())
                    .build();
            eventStoreRepository.save(event);
            applicationEventPublisher.publishEvent(
                    new DomainEvent(aggregateId, eventType, payload, organizationId));
        } catch (Exception e) {
            // Event capture must never break the primary flow.
            log.error("Failed to append event {} for aggregate {}: {}", eventType, aggregateId, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<EventResponse> findByAggregate(UUID aggregateId) {
        return eventStoreRepository.findByAggregateIdOrderByOccurredAtAsc(aggregateId)
                .stream().map(EventResponse::from).toList();
    }
}
