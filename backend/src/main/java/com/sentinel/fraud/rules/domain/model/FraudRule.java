package com.sentinel.fraud.rules.domain.model;

import com.sentinel.transaction.domain.model.Transaction;

public interface FraudRule {

    String getName();

    String getDescription();

    RuleResult evaluate(Transaction transaction);
}
