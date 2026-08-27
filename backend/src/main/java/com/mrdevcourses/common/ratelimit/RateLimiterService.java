package com.mrdevcourses.common.ratelimit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class RateLimiterService {

    private final Cache<String, Bucket> bucketCache;

    public RateLimiterService() {
        this.bucketCache = Caffeine.newBuilder()
                .expireAfterAccess(1, TimeUnit.HOURS)
                .maximumSize(50_000)
                .build();
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
    }

    public long getCacheSize() {
        return bucketCache.estimatedSize();
    }
}
