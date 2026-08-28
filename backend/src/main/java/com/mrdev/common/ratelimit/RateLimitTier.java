package com.mrdev.common.ratelimit;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.Duration;

@Getter
@RequiredArgsConstructor
public enum RateLimitTier {
    AUTH(100, 100, Duration.ofMinutes(1)),
    AI(5, 5, Duration.ofMinutes(1)),
    GENERAL(60, 60, Duration.ofMinutes(1));

    private final long capacity;
    private final long refillTokens;
    private final Duration refillDuration;
}
