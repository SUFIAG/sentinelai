package com.sentinel.transaction.adapter.out.persistence;

import com.sentinel.transaction.domain.model.Transaction;
import com.sentinel.transaction.domain.model.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Page<Transaction> findByOrganizationId(UUID organizationId, Pageable pageable);

    Page<Transaction> findByOrganizationIdAndStatus(UUID organizationId, TransactionStatus status, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND t.timestamp > :since ORDER BY t.timestamp DESC")
    List<Transaction> findRecentByUserId(@Param("userId") String userId, @Param("since") Instant since);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.userId = :userId AND t.timestamp > :since")
    long countRecentByUserId(@Param("userId") String userId, @Param("since") Instant since);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.organizationId = :orgId AND t.createdAt > :since")
    long countByOrganizationIdSince(@Param("orgId") UUID orgId, @Param("since") Instant since);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.organizationId = :orgId AND t.status = :status AND t.createdAt > :since")
    long countByOrganizationIdAndStatusSince(@Param("orgId") UUID orgId, @Param("status") TransactionStatus status, @Param("since") Instant since);

    @Query("SELECT COALESCE(AVG(t.amount), 0) FROM Transaction t WHERE t.userId = :userId")
    BigDecimal findAverageAmountByUserId(@Param("userId") String userId);

    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND t.country IS NOT NULL ORDER BY t.timestamp DESC")
    List<Transaction> findRecentWithCountryByUserId(@Param("userId") String userId, Pageable pageable);

    List<Transaction> findByOrganizationIdAndUserId(UUID organizationId, String userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.userId = :userId AND t.timestamp > :since")
    BigDecimal sumAmountByUserIdSince(@Param("userId") String userId, @Param("since") Instant since);

    @Query("SELECT COUNT(DISTINCT t.merchantId) FROM Transaction t WHERE t.userId = :userId AND t.timestamp > :since")
    long countDistinctMerchantsByUserIdSince(@Param("userId") String userId, @Param("since") Instant since);

    @Query("SELECT COUNT(DISTINCT t.country) FROM Transaction t WHERE t.userId = :userId AND t.timestamp > :since")
    long countDistinctCountriesByUserIdSince(@Param("userId") String userId, @Param("since") Instant since);

    // ----- Analytics / Reporting aggregations (Phase 4) -----

    @Query("SELECT t.merchantId, COUNT(t) FROM Transaction t " +
            "WHERE t.organizationId = :orgId AND t.status = :status " +
            "GROUP BY t.merchantId ORDER BY COUNT(t) DESC")
    List<Object[]> findTopMerchantsByStatus(@Param("orgId") UUID orgId,
                                            @Param("status") TransactionStatus status,
                                            Pageable pageable);

    @Query("SELECT t.country, COUNT(t), " +
            "SUM(CASE WHEN t.status = :flagged THEN 1 ELSE 0 END) " +
            "FROM Transaction t WHERE t.organizationId = :orgId AND t.country IS NOT NULL " +
            "GROUP BY t.country ORDER BY COUNT(t) DESC")
    List<Object[]> findGeographicBreakdown(@Param("orgId") UUID orgId,
                                           @Param("flagged") TransactionStatus flagged);

    @Query(value = "SELECT CAST(created_at AS DATE) AS day, COUNT(*) AS total, " +
            "COUNT(*) FILTER (WHERE status = 'FLAGGED') AS flagged " +
            "FROM transactions WHERE organization_id = :orgId AND created_at > :since " +
            "GROUP BY CAST(created_at AS DATE) ORDER BY day", nativeQuery = true)
    List<Object[]> findDailyFraudTrend(@Param("orgId") UUID orgId, @Param("since") Instant since);
}
