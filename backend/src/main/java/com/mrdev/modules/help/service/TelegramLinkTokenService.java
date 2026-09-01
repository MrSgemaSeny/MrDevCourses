package com.mrdev.modules.help.service;

import lombok.Getter;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TelegramLinkTokenService {

    private final Map<String, LinkTokenData> tokenStore = new ConcurrentHashMap<>();

    public String createToken(Long userId) {
        // Clean expired tokens
        cleanExpiredTokens();

        String token = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        tokenStore.put(token, new LinkTokenData(userId, Instant.now().plusSeconds(900))); // 15 mins TTL
        return token;
    }

    public Long validateAndConsumeToken(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }

        LinkTokenData data = tokenStore.remove(token);
        if (data != null && data.getExpiresAt().isAfter(Instant.now())) {
            return data.getUserId();
        }
        return null;
    }

    private void cleanExpiredTokens() {
        Instant now = Instant.now();
        tokenStore.entrySet().removeIf(entry -> entry.getValue().getExpiresAt().isBefore(now));
    }

    @Getter
    private static class LinkTokenData {
        private final Long userId;
        private final Instant expiresAt;

        public LinkTokenData(Long userId, Instant expiresAt) {
            this.userId = userId;
            this.expiresAt = expiresAt;
        }
    }
}