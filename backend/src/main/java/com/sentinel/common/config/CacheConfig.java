package com.sentinel.common.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        manager.setAllowNullValues(false);

        manager.registerCustomCache(USER_PROFILES, Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterWrite(Duration.ofHours(1))
                .recordStats()
                .build());

        manager.registerCustomCache(DEVICES, Caffeine.newBuilder()
                .maximumSize(50_000)
                .expireAfterWrite(Duration.ofMinutes(30))
                .recordStats()
                .build());

        manager.registerCustomCache(DASHBOARD, Caffeine.newBuilder()
                .maximumSize(1_000)
                .expireAfterWrite(Duration.ofMinutes(1))
                .recordStats()
                .build());

        return manager;
    }
}
