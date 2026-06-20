package com.sentinel.events.application.dto;

import com.sentinel.events.domain.model.FraudEvent;
import lombok.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {

    private UUID eventId;
    private UUID aggregateId;
    private String eventType;
    private Instant occurredAt;
    private Map<String, Object> payload;
    private String actor;

    public static EventResponse from(FraudEvent event) {
        return EventResponse.builder()
                .eventId(event.getEventId())
                .aggregateId(event.getAggregateId())
                .eventType(event.getEventType().name())
                .occurredAt(event.getOccurredAt())
                .payload(event.getPayload())
                .actor(event.getActor())
                .build();
    }
}
