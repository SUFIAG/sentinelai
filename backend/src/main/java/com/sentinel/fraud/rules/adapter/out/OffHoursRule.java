package com.sentinel.fraud.rules.adapter.out;

import com.sentinel.fraud.rules.domain.model.FraudRule;
import com.sentinel.fraud.rules.domain.model.RuleResult;
import com.sentinel.transaction.domain.model.Transaction;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.time.ZonedDateTime;

@Component
public class OffHoursRule implements FraudRule {

    @Override
    public String getName() {
        return "OFF_HOURS";
    }

    @Override
    public String getDescription() {
        return "Flags transactions occurring during unusual hours (midnight to 5 AM)";
    }

    @Override
    public RuleResult evaluate(Transaction transaction) {
        ZonedDateTime txnTime = transaction.getTimestamp().atZone(ZoneId.of("UTC"));
        int hour = txnTime.getHour();
        if (hour >= 0 && hour < 5) {
            return RuleResult.triggered(getName(), 40,
                    String.format("Transaction at %02d:%02d UTC falls within off-hours (00:00-05:00)",
                            hour, txnTime.getMinute()));
        }
        return RuleResult.pass(getName());
    }
}
