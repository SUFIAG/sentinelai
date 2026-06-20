package com.sentinel.fraud.rules.domain.service;

import com.sentinel.fraud.rules.domain.model.FraudRule;
import com.sentinel.fraud.rules.domain.model.RuleResult;
import com.sentinel.transaction.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuleEngine {

    private final List<FraudRule> fraudRules;

    public List<RuleResult> evaluate(Transaction transaction) {
        log.debug("Evaluating {} rules for transaction {}", fraudRules.size(), transaction.getId());
        return fraudRules.stream()
                .map(rule -> {
                    try {
                        return rule.evaluate(transaction);
                    } catch (Exception e) {
                        log.error("Rule {} failed for transaction {}: {}",
                                rule.getName(), transaction.getId(), e.getMessage());
                        return RuleResult.pass(rule.getName());
                    }
                })
                .toList();
    }

    public List<RuleResult> getTriggeredRules(Transaction transaction) {
        return evaluate(transaction).stream()
                .filter(RuleResult::isTriggered)
                .toList();
    }
}
