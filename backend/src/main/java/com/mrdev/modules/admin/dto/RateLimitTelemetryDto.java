package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RateLimitTelemetryDto {
    private long totalActiveBuckets;
    private long totalThrottledRequests;
    private Map<String, RateLimitTierDto> tiers;
    private List<RateLimitThrottleEventDto> recentThrottles;
    private Instant timestamp;
}
