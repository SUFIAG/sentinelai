package com.sentinel.ai.adapter.out.persistence;

import com.sentinel.ai.domain.model.AgentType;
import com.sentinel.ai.domain.model.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, UUID> {

    Optional<AiConversation> findFirstByCaseIdAndAgentTypeOrderByCreatedAtDesc(UUID caseId, AgentType agentType);
}
