package com.sentinel.transaction.adapter.out.persistence;

import com.sentinel.transaction.domain.model.IdempotencyKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKey, UUID> {

    @Query("SELECT ik FROM IdempotencyKey ik WHERE ik.idempotencyKey = :key")
    Optional<IdempotencyKey> findByKey(@Param("key") String key);
}
