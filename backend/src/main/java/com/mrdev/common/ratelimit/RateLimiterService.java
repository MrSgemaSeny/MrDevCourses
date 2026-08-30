package com.mrdev.common.ratelimit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.mrdev.modules.admin.dto.RateLimitTelemetryDto;
import com.mrdev.modules.admin.dto.RateLimitThrottleEventDto;
import com.mrdev.modules.admin.dto.RateLimitTierDto;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Service
public class RateLimiterService {

    private static final int MAX_RECENT_THROTTLES = 50;

    private final Cache<String, Bucket> bucketCache;
    private final Map<RateLimitTier, AtomicLong> throttledCounts = new EnumMap<>(RateLimitTier.class);
    private final ConcurrentLinkedDeque<RateLimitThrottleEventDto> recentThrottles = new ConcurrentLinkedDeque<>();
    private final AtomicLong totalThrottledRequests = new AtomicLong(0);

    public RateLimiterService() {
        this.bucketCache = Caffeine.newBuilder()
                .expireAfterAccess(1, TimeUnit.HOURS)
                .maximumSize(50_000)
                .build();

        for (RateLimitTier tier : RateLimitTier.values()) {
            throttledCounts.put(tier, new AtomicLong(0));
        }
    }

    public Bucket resolveBucket(String key, RateLimitTier tier) {
        String cacheKey = tier.name() + ":" + key;
        return bucketCache.get(cacheKey, k -> createNewBucket(tier));
    }

    public ConsumptionProbe tryConsume(String key, RateLimitTier tier) {
        return tryConsume(key, tier, 1);
    }

    public ConsumptionProbe tryConsume(String key, RateLimitTier tier, long tokens) {
        Bucket bucket = resolveBucket(key, tier);
        return bucket.tryConsumeAndReturnRemaining(tokens);
    }

    public long getRemainingTokens(String key, RateLimitTier tier) {
        Bucket bucket = resolveBucket(key, tier);
        return bucket.getAvailableTokens();
    }

    public void recordThrottle(RateLimitTier tier, String key, String path, long retryAfterSeconds) {
        totalThrottledRequests.incrementAndGet();
        AtomicLong counter = throttledCounts.get(tier);
        if (counter != null) {
            counter.incrementAndGet();
        }

        RateLimitThrottleEventDto event = RateLimitThrottleEventDto.builder()
                .timestamp(Instant.now())
                .tier(tier != null ? tier.name() : "UNKNOWN")
                .key(key)
                .path(path)
                .retryAfterSeconds(retryAfterSeconds)
                .build();

        recentThrottles.addFirst(event);
        while (recentThrottles.size() > MAX_RECENT_THROTTLES) {
            recentThrottles.pollLast();
        }
    }

    public RateLimitTelemetryDto getTelemetry() {
        Map<String, Bucket> cacheMap = bucketCache.asMap();
        Map<RateLimitTier, Long> activeCountByTier = new EnumMap<>(RateLimitTier.class);

        for (RateLimitTier tier : RateLimitTier.values()) {
            activeCountByTier.put(tier, 0L);
        }

        for (String cacheKey : cacheMap.keySet()) {
            for (RateLimitTier tier : RateLimitTier.values()) {
                if (cacheKey.startsWith(tier.name() + ":")) {
                    activeCountByTier.put(tier, activeCountByTier.get(tier) + 1);
                    break;
                }
            }
        }

        Map<String, RateLimitTierDto> tierDtos = new LinkedHashMap<>();
        for (RateLimitTier tier : RateLimitTier.values()) {
            AtomicLong throttled = throttledCounts.get(tier);
            long throttledCount = throttled != null ? throttled.get() : 0L;
            long activeCount = activeCountByTier.getOrDefault(tier, 0L);

            String periodStr = tier.getRefillDuration().toSeconds() >= 60
                    ? (tier.getRefillDuration().toMinutes() + "m")
                    : (tier.getRefillDuration().toSeconds() + "s");

            tierDtos.put(tier.name(), RateLimitTierDto.builder()
                    .name(tier.name())
                    .capacity(tier.getCapacity())
                    .refillTokens(tier.getRefillTokens())
                    .refillPeriod(periodStr)
                    .activeBucketsCount(activeCount)
                    .throttledCount(throttledCount)
                    .build());
        }

        List<RateLimitThrottleEventDto> throttlesList = new ArrayList<>(recentThrottles);

        return RateLimitTelemetryDto.builder()
                .totalActiveBuckets(cacheMap.size())
                .totalThrottledRequests(totalThrottledRequests.get())
                .tiers(tierDtos)
                .recentThrottles(throttlesList)
                .timestamp(Instant.now())
                .build();
    }

    private Bucket createNewBucket(RateLimitTier tier) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(tier.getCapacity())
                .refillIntervally(tier.getRefillTokens(), tier.getRefillDuration())
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    public void reset() {
        bucketCache.invalidateAll();
        for (AtomicLong counter : throttledCounts.values()) {
            counter.set(0);
        }
        totalThrottledRequests.set(0);
        recentThrottles.clear();
    }

    public long getCacheSize() {
        return bucketCache.estimatedSize();
    }
}
