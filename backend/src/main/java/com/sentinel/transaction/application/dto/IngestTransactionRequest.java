package com.sentinel.transaction.application.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngestTransactionRequest {

    @NotBlank(message = "External ID is required")
    private String transactionExternalId;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Merchant ID is required")
    private String merchantId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be 3 characters")
    private String currency;

    @Size(min = 2, max = 2, message = "Country must be 2 characters")
    private String country;

    private String deviceId;
    private String ipAddress;

    @NotNull(message = "Timestamp is required")
    private Instant timestamp;
}
