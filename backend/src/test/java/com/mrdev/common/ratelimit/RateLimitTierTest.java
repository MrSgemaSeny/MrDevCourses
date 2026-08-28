package com.mrdev.common.ratelimit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitTierTest {

    @Test
    @DisplayName("Verify rate limit tier specifications (Auth: 10/15m, AI: 5/1m, General: 60/1m)")
    void testTierSpecifications() {
        // Auth tier
        assertThat(RateLimitTier.AUTH.getCapacity()).isEqualTo(10);
        assertThat(RateLimitTier.AUTH.getRefillTokens()).isEqualTo(10);
        assertThat(RateLimitTier.AUTH.getRefillDuration()).isEqualTo(Duration.ofMinutes(15));

        // AI tier
        assertThat(RateLimitTier.AI.getCapacity()).isEqualTo(5);
        assertThat(RateLimitTier.AI.getRefillTokens()).isEqualTo(5);
        assertThat(RateLimitTier.AI.getRefillDuration()).isEqualTo(Duration.ofMinutes(1));

        // General tier
        assertThat(RateLimitTier.GENERAL.getCapacity()).isEqualTo(60);
        assertThat(RateLimitTier.GENERAL.getRefillTokens()).isEqualTo(60);
        assertThat(RateLimitTier.GENERAL.getRefillDuration()).isEqualTo(Duration.ofMinutes(1));
    }
}
