package com.mrdev.modules.auth.service;

import com.mrdev.common.exception.ApiException;
import com.mrdev.common.ratelimit.RateLimiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthRateLimiterTest {

    private RateLimiterService rateLimiterService;
    private AuthRateLimiter authRateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiterService = new RateLimiterService();
        authRateLimiter = new AuthRateLimiter(rateLimiterService);
    }

    @Test
    @DisplayName("Should allow up to 10 attempts and throw ApiException(TOO_MANY_REQUESTS) on 11th")
    void testCheckAndConsumeLimit() {
        String ip = "10.10.10.10";

        for (int i = 0; i < 10; i++) {
            authRateLimiter.checkAndConsume(ip);
        }

        assertThatThrownBy(() -> authRateLimiter.checkAndConsume(ip))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    ApiException apiEx = (ApiException) ex;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
                    assertThat(apiEx.getMessage()).contains("Слишком много попыток");
                });
    }
}
