package com.sentinel.fraud.rules.adapter.out;

import com.sentinel.fraud.rules.domain.model.FraudRule;
import com.sentinel.fraud.rules.domain.model.RuleResult;
import com.sentinel.transaction.domain.model.Transaction;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class HighAmountRule implements FraudRule {

    private static final BigDecimal HIGH_THRESHOLD = new BigDecimal("5000");
    private static final BigDecimal CRITICAL_THRESHOLD = new BigDecimal("10000");

    @Override
    public String getName() {
        return "HIGH_AMOUNT";
    }

    @Override
    public String getDescription() {
        return "Flags transactions with unusually high amounts";
    }

    @Override
    public RuleResult evaluate(Transaction transaction) {
        BigDecimal amount = transaction.getAmount();
        if (amount.compareTo(CRITICAL_THRESHOLD) >= 0) {
            return RuleResult.triggered(getName(), 90,
                    String.format("Critical amount: $%s exceeds $%s threshold", amount, CRITICAL_THRESHOLD));
        }
        if (amount.compareTo(HIGH_THRESHOLD) >= 0) {
            return RuleResult.triggered(getName(), 60,
                    String.format("High amount: $%s exceeds $%s threshold", amount, HIGH_THRESHOLD));
        }
        return RuleResult.pass(getName());
    }
}
