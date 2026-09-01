package com.mrdev.modules.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtBlacklistService {

    private final JwtTokenProvider jwtTokenProvider;
    private final Map<String, Instant> blacklistedJtis = new ConcurrentHashMap<>();

    public void revokeToken(String token) {
        if (token == null || token.isBlank()) {
            return;
        }

        try {
            String jti = jwtTokenProvider.getJtiFromToken(token);
            Date expiry = jwtTokenProvider.getExpirationDateFromToken(token);

            if (jti != null && expiry != null) {
                Instant expiryInstant = expiry.toInstant();
                if (expiryInstant.isAfter(Instant.now())) {
                    blacklistedJtis.put(jti, expiryInstant);
                    log.info("[JWT Blacklist] Revoked token with jti: {}", jti);
                }
            }
        } catch (Exception e) {
            log.warn("[JWT Blacklist] Could not revoke token: {}", e.getMessage());
        }
    }

    public boolean isTokenRevoked(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        try {
            String jti = jwtTokenProvider.getJtiFromToken(token);
            return isJtiRevoked(jti);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isJtiRevoked(String jti) {
        if (jti == null || jti.isBlank()) {
            return false;
        }

        Instant expiry = blacklistedJtis.get(jti);
        if (expiry == null) {
            return false;
        }

        if (expiry.isBefore(Instant.now())) {
            blacklistedJtis.remove(jti);
            return false;
        }

        return true;
    }

    @Scheduled(fixedRate = 3600000) // Hourly eviction of expired tokens
    public void cleanExpiredBlacklistEntries() {
        Instant now = Instant.now();
        blacklistedJtis.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }
}