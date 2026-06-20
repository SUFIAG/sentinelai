package com.sentinel.fraud.rules.domain.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RuleResult {

    private String ruleName;
    private boolean triggered;
    private int riskContribution;
    private String reason;

    public static RuleResult pass(String ruleName) {
        return RuleResult.builder()
                .ruleName(ruleName)
                .triggered(false)
                .riskContribution(0)
                .reason("No risk detected")
                .build();
    }

    public static RuleResult triggered(String ruleName, int riskContribution, String reason) {
        return RuleResult.builder()
                .ruleName(ruleName)
                .triggered(true)
                .riskContribution(riskContribution)
                .reason(reason)
                .build();
    }
}
