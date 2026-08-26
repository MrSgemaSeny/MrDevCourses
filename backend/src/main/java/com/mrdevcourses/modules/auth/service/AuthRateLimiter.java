package com.mrdevcourses.modules.auth.service;

import com.mrdevcourses.common.exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory rate limiter for auth endpoints (register + login).
 * Sliding window: max 10 attempts per IP per 15 minutes.
 *
 * No Redis — single-instance deployment (Fly.io, one machine). If the app
 * scales to multiple instances in the future, replace with Redis-backed limiter.
 */
@Slf4j
@Component
public class AuthRateLimiter {

    private static final int MAX_ATTEMPTS = 10;
    private static final long WINDOW_SECONDS = 15 * 60L; // 15 minutes

    // IP -> timestamps of recent attempts
    private final Map<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    public void checkAndConsume(String ip) {
        Instant now = Instant.now();
        Instant windowStart = now.minusSeconds(WINDOW_SECONDS);

        Deque<Instant> timestamps = attempts.computeIfAbsent(ip, k -> new ArrayDeque<>());

        synchronized (timestamps) {
            // Evict expired entries
            while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(windowStart)) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= MAX_ATTEMPTS) {
                log.warn("[AuthRateLimiter] Rate limit exceeded for IP: {}", ip);
                throw new ApiException(
                        "Слишком много попыток. Подождите 15 минут.",
                        HttpStatus.TOO_MANY_REQUESTS
                );
            }

            timestamps.addLast(now);
        }
    }
}
