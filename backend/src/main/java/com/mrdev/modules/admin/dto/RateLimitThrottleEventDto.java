package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RateLimitThrottleEventDto {
    private Instant timestamp;
    private String tier;
    private String key;
    private String path;
    private long retryAfterSeconds;
}
