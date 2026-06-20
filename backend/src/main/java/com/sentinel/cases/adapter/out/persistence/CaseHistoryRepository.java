package com.sentinel.cases.adapter.out.persistence;

import com.sentinel.cases.domain.model.CaseHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CaseHistoryRepository extends JpaRepository<CaseHistory, UUID> {

    List<CaseHistory> findByCaseIdOrderByPerformedAtAsc(UUID caseId);
}
