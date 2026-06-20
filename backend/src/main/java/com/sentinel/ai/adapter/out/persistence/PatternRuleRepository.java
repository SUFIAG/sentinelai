package com.sentinel.ai.adapter.out.persistence;

import com.sentinel.ai.domain.model.PatternRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatternRuleRepository extends JpaRepository<PatternRule, UUID> {

    Optional<PatternRule> findByOrganizationIdAndPatternName(UUID organizationId, String patternName);

    List<PatternRule> findByOrganizationIdOrderByOccurrencesDesc(UUID organizationId);
}
