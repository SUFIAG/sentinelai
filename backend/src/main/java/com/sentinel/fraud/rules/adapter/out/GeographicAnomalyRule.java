package com.sentinel.fraud.rules.adapter.out;

import com.sentinel.fraud.rules.domain.model.FraudRule;
import com.sentinel.fraud.rules.domain.model.RuleResult;
import com.sentinel.transaction.adapter.out.persistence.TransactionRepository;
import com.sentinel.transaction.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class GeographicAnomalyRule implements FraudRule {

    private final TransactionRepository transactionRepository;

    @Override
    public String getName() {
        return "GEOGRAPHIC_ANOMALY";
    }

    @Override
    public String getDescription() {
        return "Detects transactions from unusual locations compared to user history";
    }

    @Override
    public RuleResult evaluate(Transaction transaction) {
        if (transaction.getCountry() == null || transaction.getCountry().isBlank()) {
            return RuleResult.pass(getName());
        }

        List<Transaction> recent = transactionRepository.findRecentWithCountryByUserId(
                transaction.getUserId(), PageRequest.of(0, 10));

        if (recent.isEmpty()) {
            return RuleResult.pass(getName());
        }

        boolean countryMismatch = recent.stream()
                .noneMatch(t -> transaction.getCountry().equals(t.getCountry()));

        if (countryMismatch) {
            return RuleResult.triggered(getName(), 70,
                    String.format("Transaction from country '%s' not seen in user's recent history",
                            transaction.getCountry()));
        }
        return RuleResult.pass(getName());
    }
}
