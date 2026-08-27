package com.mrdevcourses.common.ratelimit;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.Duration;

@Getter
@RequiredArgsConstructor
public enum RateLimitTier {
    AUTH(10, 10, Duration.ofMinutes(15)),
    AI(5, 5, Duration.ofMinutes(1)),
    GENERAL(60, 60, Duration.ofMinutes(1));

    private final long capacity;
    private final long refillTokens;
    private final Duration refillDuration;
}
