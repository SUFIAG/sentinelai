package com.sentinel.transaction.application.dto;

import com.sentinel.transaction.domain.model.Transaction;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {

    private UUID id;
    private String transactionExternalId;
    private String userId;
    private String merchantId;
    private BigDecimal amount;
    private String currency;
    private String country;
    private String deviceId;
    private String ipAddress;
    private String status;
    private Instant timestamp;
    private Instant createdAt;

    public static TransactionResponse from(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .transactionExternalId(t.getTransactionExternalId())
                .userId(t.getUserId())
                .merchantId(t.getMerchantId())
                .amount(t.getAmount())
                .currency(t.getCurrency())
                .country(t.getCountry())
                .deviceId(t.getDeviceId())
                .ipAddress(t.getIpAddress())
                .status(t.getStatus().name())
                .timestamp(t.getTimestamp())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
