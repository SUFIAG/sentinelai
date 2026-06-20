package com.sentinel.ai.adapter.out.llm;

import com.sentinel.ai.config.AiProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Thin client over the OpenAI Chat Completions API. All failures are swallowed
 * and surfaced as {@link Optional#empty()} so callers can fall back to
 * deterministic rule-based reasoning without disrupting the request flow.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LlmClient {

    private final AiProperties properties;

    public boolean isEnabled() {
        return properties.isEnabled();
    }

    /**
     * Sends a system + user prompt to the LLM and returns the assistant message,
     * or empty when AI is disabled or the call fails.
     */
    @SuppressWarnings("unchecked")
    public Optional<String> complete(String systemPrompt, String userPrompt) {
        if (!properties.isEnabled()) {
            return Optional.empty();
        }

        try {
            RestClient client = RestClient.builder()
                    .baseUrl(properties.getOpenai().getBaseUrl())
                    .build();

            Map<String, Object> body = Map.of(
                    "model", properties.getModel(),
                    "temperature", 0.2,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    )
            );

            Map<String, Object> response = client.post()
                    .uri("/v1/chat/completions")
                    .header("Authorization", "Bearer " + properties.getOpenai().getApiKey())
                    .header("Content-Type", "application/json")
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response == null) return Optional.empty();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) return Optional.empty();
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            if (message == null) return Optional.empty();
            Object content = message.get("content");
            return content != null ? Optional.of(content.toString()) : Optional.empty();
        } catch (Exception e) {
            log.warn("LLM call failed, falling back to rule-based reasoning: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Duration timeout() {
        return Duration.ofSeconds(properties.getTimeoutSeconds());
    }
}
