package com.mrdev.modules.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GroqClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GroqClient(
            ObjectMapper objectMapper,
            @Value("${app.groq.api-key:}") String apiKey,
            @Value("${app.groq.api-url:https://api.groq.com/openai/v1/chat/completions}") String apiUrl,
            @Value("${app.groq.model:llama-3.3-70b-versatile}") String model
    ) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = (model != null && !model.isBlank()) ? model : "llama-3.3-70b-versatile";

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(10).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(45).toMillis());

        this.restClient = RestClient.builder()
                .baseUrl(apiUrl)
                .requestFactory(factory)
                .build();
    }

    public boolean isConfigured() {
        return !apiKey.isBlank() && !apiKey.equalsIgnoreCase("placeholder");
    }

    public String generateAnswer(String systemPrompt, String userMessage) {
        if (!isConfigured()) {
            log.warn("[GroqClient] Groq API key is not configured — falling back to deterministic response");
            return null;
        }

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", this.model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userMessage)
                    ),
                    "temperature", 0.3,
                    "max_tokens", 1024
            );

            String responseJson = restClient.post()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + this.apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode rootNode = objectMapper.readTree(responseJson);
            JsonNode choices = rootNode.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                return choices.get(0).path("message").path("content").asText();
            }
        } catch (Exception e) {
            log.error("[GroqClient] Error communicating with Groq API: {}", e.getMessage());
        }

        return null;
    }
}
