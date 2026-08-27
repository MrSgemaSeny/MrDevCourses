package com.mrdevcourses.modules.ai.service;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class PromptSanitizer {

    private static final Pattern INJECTION_PATTERNS = Pattern.compile(
            "(?i)(ignore previous instructions|disregard all prior prompts|system prompt|reveal system instructions|you are now|dan mode|jailbreak)",
            Pattern.CASE_INSENSITIVE
    );

    public String sanitizeInput(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        String sanitized = input.trim();
        if (INJECTION_PATTERNS.matcher(sanitized).find()) {
            sanitized = INJECTION_PATTERNS.matcher(sanitized).replaceAll("[FILTERED]");
        }

        return sanitized;
    }
}
