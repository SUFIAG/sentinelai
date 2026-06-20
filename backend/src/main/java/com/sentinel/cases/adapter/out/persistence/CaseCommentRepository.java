package com.sentinel.cases.adapter.out.persistence;

import com.sentinel.cases.domain.model.CaseComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CaseCommentRepository extends JpaRepository<CaseComment, UUID> {

    List<CaseComment> findByCaseIdOrderByCreatedAtAsc(UUID caseId);
}
