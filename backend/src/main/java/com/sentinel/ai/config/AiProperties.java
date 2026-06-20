package com.sentinel.ai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration for the LLM integration. When no API key is supplied the
 * platform transparently falls back to deterministic rule-based reasoning,
 * so the system remains fully functional without external dependencies.
 */
@Component
@ConfigurationProperties(prefix = "ai")
@Getter
@Setter
public class AiProperties {

    /** Provider identifier: "openai" or "none" (rule-based fallback). */
    private String provider = "none";

    private String model = "gpt-4o-mini";

    private int timeoutSeconds = 30;

    private final OpenAi openai = new OpenAi();
    private final Retry retry = new Retry();

    public boolean isEnabled() {
        return "openai".equalsIgnoreCase(provider)
                && openai.getApiKey() != null
                && !openai.getApiKey().isBlank();
    }

    @Getter
    @Setter
    public static class OpenAi {
        private String apiKey;
        private String baseUrl = "https://api.openai.com";
    }

    @Getter
    @Setter
    public static class Retry {
        private int maxAttempts = 3;
        private long backoffMs = 1000;
    }
}
