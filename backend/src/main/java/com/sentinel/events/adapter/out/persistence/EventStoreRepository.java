package com.sentinel.events.adapter.out.persistence;

import com.sentinel.events.domain.model.EventType;
import com.sentinel.events.domain.model.FraudEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventStoreRepository extends JpaRepository<FraudEvent, Long> {

    List<FraudEvent> findByAggregateIdOrderByOccurredAtAsc(UUID aggregateId);

    List<FraudEvent> findByEventTypeOrderByOccurredAtDesc(EventType eventType);
}
