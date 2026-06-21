package com.sentinel.common.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.Duration;

/**
 * L1 in-process cache (Caffeine). Frequently read, slowly changing data is
 * cached to cut database round-trips and reduce P95 latency. Each cache has an
 * independent size/TTL tuned to its volatility.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String USER_PROFILES = "userProfiles";
    public static final String DEVICES = "devices";
    public static final String DASHBOARD = "dashboard";
    public static final String FRAUD_RULES = "fraudRules";
    public static final String ORGANIZATIONS = "organizations";
    public static final String MERCHANTS = "merchantRiskProfiles";
    public static final String COUNTRIES = "countryRiskProfiles";
    public static final String ANALYTICS = "analytics";

    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        manager.setAllowNullValues(false);

        // User profiles - 1 hour TTL, 10k entries
        manager.registerCustomCache(USER_PROFILES, Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterWrite(Duration.ofHours(1))
                .recordStats()
                .build());

        // Devices - 30 min TTL, 50k entries
        manager.registerCustomCache(DEVICES, Caffeine.newBuilder()
                .maximumSize(50_000)
                .expireAfterWrite(Duration.ofMinutes(30))
                .recordStats()
                .build());

        // Dashboard - 1 min TTL for real-time feel
        manager.registerCustomCache(DASHBOARD, Caffeine.newBuilder()
                .maximumSize(1_000)
                .expireAfterWrite(Duration.ofMinutes(1))
                .recordStats()
                .build());

        // Fraud rules - 2 hours TTL (rules change infrequently)
        manager.registerCustomCache(FRAUD_RULES, Caffeine.newBuilder()
                .maximumSize(1_000)
                .expireAfterWrite(Duration.ofHours(2))
                .recordStats()
                .build());

        // Organizations - 4 hours TTL (very stable data)
        manager.registerCustomCache(ORGANIZATIONS, Caffeine.newBuilder()
                .maximumSize(1_000)
                .expireAfterWrite(Duration.ofHours(4))
                .recordStats()
                .build());

        // Merchant risk profiles - 1 hour TTL, 20k entries
        manager.registerCustomCache(MERCHANTS, Caffeine.newBuilder()
                .maximumSize(20_000)
                .expireAfterWrite(Duration.ofHours(1))
                .recordStats()
                .build());

        // Country risk profiles - 24 hours TTL (stable data)
        manager.registerCustomCache(COUNTRIES, Caffeine.newBuilder()
                .maximumSize(300) // ~200 countries max
                .expireAfterWrite(Duration.ofHours(24))
                .recordStats()
                .build());

        // Analytics reports - 15 min TTL, 5k entries
        manager.registerCustomCache(ANALYTICS, Caffeine.newBuilder()
                .maximumSize(5_000)
                .expireAfterWrite(Duration.ofMinutes(15))
                .recordStats()
                .build());

        return manager;
    }
}
