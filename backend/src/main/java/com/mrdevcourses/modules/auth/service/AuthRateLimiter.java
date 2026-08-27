package com.mrdevcourses.modules.auth.service;

import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.common.ratelimit.RateLimitTier;
import com.mrdevcourses.common.ratelimit.RateLimiterService;
import io.github.bucket4j.ConsumptionProbe;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Rate limiter for auth endpoints (register + login), backed by Token Bucket RateLimiterService (Tier: AUTH, 10 req / 15 min).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthRateLimiter {

    private final RateLimiterService rateLimiterService;

    public void checkAndConsume(String ip) {
        ConsumptionProbe probe = rateLimiterService.tryConsume("ip:" + ip, RateLimitTier.AUTH);
        if (!probe.isConsumed()) {
            log.warn("[AuthRateLimiter] Rate limit exceeded for IP: {}", ip);
            throw new ApiException(
                    "Слишком много попыток. Подождите 15 минут.",
                    HttpStatus.TOO_MANY_REQUESTS
            );
        }
    }
}
