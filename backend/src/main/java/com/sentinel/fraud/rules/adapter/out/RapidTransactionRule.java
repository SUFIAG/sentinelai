package com.sentinel.fraud.rules.adapter.out;

import com.sentinel.fraud.rules.domain.model.FraudRule;
import com.sentinel.fraud.rules.domain.model.RuleResult;
import com.sentinel.transaction.adapter.out.persistence.TransactionRepository;
import com.sentinel.transaction.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class RapidTransactionRule implements FraudRule {

    private static final int RAPID_THRESHOLD = 5;
    private static final Duration WINDOW = Duration.ofMinutes(10);
    private final TransactionRepository transactionRepository;

    @Override
    public String getName() {
        return "RAPID_TRANSACTION";
    }

    @Override
    public String getDescription() {
        return "Detects rapid succession of transactions from same user";
    }

    @Override
    public RuleResult evaluate(Transaction transaction) {
        long recentCount = transactionRepository.countRecentByUserId(
                transaction.getUserId(), Instant.now().minus(WINDOW));
        if (recentCount >= RAPID_THRESHOLD) {
            return RuleResult.triggered(getName(), 75,
                    String.format("User has %d transactions in last %d minutes (threshold: %d)",
                            recentCount, WINDOW.toMinutes(), RAPID_THRESHOLD));
        }
        return RuleResult.pass(getName());
    }
}
