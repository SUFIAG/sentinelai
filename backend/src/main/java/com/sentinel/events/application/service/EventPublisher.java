package com.sentinel.events.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.common.config.KafkaConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Event Publisher for Phase 6: Event Sourcing & Kafka Integration
 *
 * Responsibilities:
 * 1. Publish events to Kafka topics
 * 2. Store events in event store (database)
 * 3. Ensure reliable event delivery
 * 4. Support event correlation and tracing
 *
 * Event Types:
 * - Transaction events: TransactionIngested, TransactionAnalyzed
 * - Fraud events: FraudDetected, AlertCreated
 * - Case events: CaseCreated, CaseUpdated, CaseResolved
 * - Learning events: FraudConfirmed, PatternDiscovered
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Publish transaction event
     */
    public CompletableFuture<SendResult<String, Object>> publishTransactionEvent(
            String eventType,
            UUID transactionId,
            Object eventData
    ) {
        return publishEvent(
            KafkaConfig.Topics.TRANSACTION_EVENTS,
            eventType,
            transactionId.toString(),
            eventData
        );
    }

    /**
     * Publish fraud detection event
     */
    public CompletableFuture<SendResult<String, Object>> publishFraudEvent(
            String eventType,
            UUID alertId,
            Object eventData
    ) {
        return publishEvent(
            KafkaConfig.Topics.FRAUD_EVENTS,
            eventType,
            alertId.toString(),
            eventData
        );
    }

    /**
     * Publish case management event
     */
    public CompletableFuture<SendResult<String, Object>> publishCaseEvent(
            String eventType,
            UUID caseId,
            Object eventData
    ) {
        return publishEvent(
            KafkaConfig.Topics.CASE_EVENTS,
            eventType,
            caseId.toString(),
            eventData
        );
    }

    /**
     * Publish learning/feedback event
     */
    public CompletableFuture<SendResult<String, Object>> publishLearningEvent(
            String eventType,
            String key,
            Object eventData
    ) {
        return publishEvent(
            KafkaConfig.Topics.LEARNING_EVENTS,
            eventType,
            key,
            eventData
        );
    }

    /**
     * Generic event publishing with error handling
     */
    private CompletableFuture<SendResult<String, Object>> publishEvent(
            String topic,
            String eventType,
            String key,
            Object eventData
    ) {
        FraudEvent event = FraudEvent.builder()
            .eventId(UUID.randomUUID())
            .eventType(eventType)
            .timestamp(Instant.now())
            .aggregateId(key)
            .payload(eventData)
            .build();

        log.debug("Publishing event: type={}, key={}, topic={}", eventType, key, topic);

        return kafkaTemplate.send(topic, key, event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish event: type={}, key={}, error={}",
                        eventType, key, ex.getMessage(), ex);
                } else {
                    log.debug("Event published successfully: type={}, key={}, partition={}, offset={}",
                        eventType, key,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                }
            });
    }

    /**
     * Event envelope for Kafka messages
     */
    @lombok.Data
    @lombok.Builder
    public static class FraudEvent {
        private UUID eventId;
        private String eventType;
        private Instant timestamp;
        private String aggregateId;
        private Object payload;
        private String correlationId;
        private String actor;
    }
}

