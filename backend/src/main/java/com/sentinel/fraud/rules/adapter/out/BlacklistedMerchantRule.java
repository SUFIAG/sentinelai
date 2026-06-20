package com.sentinel.fraud.rules.adapter.out;

import com.sentinel.fraud.rules.domain.model.FraudRule;
import com.sentinel.fraud.rules.domain.model.RuleResult;
import com.sentinel.transaction.domain.model.Transaction;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class BlacklistedMerchantRule implements FraudRule {

    private static final Set<String> BLACKLISTED = Set.of(
            "MERCHANT_FRAUD_001", "MERCHANT_FRAUD_002", "MERCHANT_SUSPICIOUS_003",
            "MERCHANT_BLOCKED_004", "MERCHANT_RISK_005"
    );

    @Override
    public String getName() {
        return "BLACKLISTED_MERCHANT";
    }

    @Override
    public String getDescription() {
        return "Flags transactions with known blacklisted merchants";
    }

    @Override
    public RuleResult evaluate(Transaction transaction) {
        if (BLACKLISTED.contains(transaction.getMerchantId())) {
            return RuleResult.triggered(getName(), 95,
                    String.format("Merchant '%s' is on the blacklist", transaction.getMerchantId()));
        }
        return RuleResult.pass(getName());
    }
}
