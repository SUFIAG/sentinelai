package com.sentinel.ai.adapter.out.persistence;

import com.sentinel.ai.domain.model.AiExplanation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExplanationRepository extends JpaRepository<AiExplanation, UUID> {

    Optional<AiExplanation> findByAlertId(UUID alertId);
}
