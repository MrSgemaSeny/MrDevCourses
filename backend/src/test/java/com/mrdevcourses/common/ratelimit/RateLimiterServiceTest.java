package com.mrdevcourses.common.ratelimit;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimiterServiceTest {

    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        rateLimiterService = new RateLimiterService();
    }

    @Test
    @DisplayName("Auth tier should allow 10 requests and reject 11th")
    void testAuthTierThrottling() {
        String key = "ip:198.51.100.1";

        for (int i = 0; i < 10; i++) {
            ConsumptionProbe probe = rateLimiterService.tryConsume(key, RateLimitTier.AUTH);
            assertThat(probe.isConsumed()).isTrue();
            assertThat(probe.getRemainingTokens()).isEqualTo(9 - i);
        }

        // 11th attempt must be rejected
        ConsumptionProbe rejectedProbe = rateLimiterService.tryConsume(key, RateLimitTier.AUTH);
        assertThat(rejectedProbe.isConsumed()).isFalse();
        assertThat(rejectedProbe.getNanosToWaitForRefill()).isGreaterThan(0);
    }

    @Test
    @DisplayName("AI tier should allow 5 requests per user and reject 6th")
    void testAiTierThrottling() {
        String key = "user:42";

        for (int i = 0; i < 5; i++) {
            ConsumptionProbe probe = rateLimiterService.tryConsume(key, RateLimitTier.AI);
            assertThat(probe.isConsumed()).isTrue();
            assertThat(probe.getRemainingTokens()).isEqualTo(4 - i);
        }

        // 6th attempt must be rejected
        ConsumptionProbe rejectedProbe = rateLimiterService.tryConsume(key, RateLimitTier.AI);
        assertThat(rejectedProbe.isConsumed()).isFalse();
        assertThat(rejectedProbe.getNanosToWaitForRefill()).isGreaterThan(0);
    }

    @Test
    @DisplayName("General tier should allow 60 requests and reject 61st")
    void testGeneralTierThrottling() {
        String key = "ip:10.0.0.1";

        for (int i = 0; i < 60; i++) {
            ConsumptionProbe probe = rateLimiterService.tryConsume(key, RateLimitTier.GENERAL);
            assertThat(probe.isConsumed()).isTrue();
            assertThat(probe.getRemainingTokens()).isEqualTo(59 - i);
        }

        ConsumptionProbe rejectedProbe = rateLimiterService.tryConsume(key, RateLimitTier.GENERAL);
        assertThat(rejectedProbe.isConsumed()).isFalse();
        assertThat(rejectedProbe.getNanosToWaitForRefill()).isGreaterThan(0);
    }

    @Test
    @DisplayName("Rate limits should be isolated between different keys and tiers")
    void testKeyAndTierIsolation() {
        String userA = "user:100";
        String userB = "user:200";

        // Exhaust userA AI tier
        for (int i = 0; i < 5; i++) {
            rateLimiterService.tryConsume(userA, RateLimitTier.AI);
        }
        assertThat(rateLimiterService.tryConsume(userA, RateLimitTier.AI).isConsumed()).isFalse();

        // userB should still have full quota
        assertThat(rateLimiterService.tryConsume(userB, RateLimitTier.AI).isConsumed()).isTrue();
        assertThat(rateLimiterService.getRemainingTokens(userB, RateLimitTier.AI)).isEqualTo(4);

        // userA should still have full General tier quota
        assertThat(rateLimiterService.tryConsume(userA, RateLimitTier.GENERAL).isConsumed()).isTrue();
        assertThat(rateLimiterService.getRemainingTokens(userA, RateLimitTier.GENERAL)).isEqualTo(59);
    }

    @Test
    @DisplayName("Reset should clear all cached buckets")
    void testReset() {
        String key = "ip:192.168.1.1";
        rateLimiterService.tryConsume(key, RateLimitTier.AUTH);
        assertThat(rateLimiterService.getCacheSize()).isGreaterThanOrEqualTo(1);

        rateLimiterService.reset();
        assertThat(rateLimiterService.getCacheSize()).isZero();
    }
}
