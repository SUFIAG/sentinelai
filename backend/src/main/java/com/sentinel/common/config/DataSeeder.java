package com.sentinel.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    @Bean
    CommandLineRunner seedDatabase() {
        return args -> {
            try {
                // Check if data already exists
                Integer userCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE email = 'admin@sentinel.ai'",
                    Integer.class
                );

                if (userCount != null && userCount > 0) {
                    log.info("✅ Database already seeded. Users exist.");
                    return;
                }

                log.info("🌱 Seeding database with initial data...");

                // Execute seed script
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
                populator.addScript(new ClassPathResource("db/seed-data.sql"));
                populator.setSeparator(";");
                populator.execute(dataSource);

                log.info("✅ Database seeded successfully!");

                // Log summary
                Integer totalUsers = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
                Integer totalTransactions = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM transactions", Integer.class);
                Integer totalAlerts = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM fraud_alerts", Integer.class);

                log.info("📊 Seed Summary:");
                log.info("   - Users: {}", totalUsers);
                log.info("   - Transactions: {}", totalTransactions);
                log.info("   - Alerts: {}", totalAlerts);
                log.info("📝 Login credentials:");
                log.info("   - Admin: admin@sentinel.ai / Admin@123");
                log.info("   - Analyst: analyst@sentinel.ai / Admin@123");
                log.info("   - Reviewer: reviewer@sentinel.ai / Admin@123");

            } catch (Exception e) {
                log.error("❌ Failed to seed database: {}", e.getMessage());
            }
        };
    }
}

