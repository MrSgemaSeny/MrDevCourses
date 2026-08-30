package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RateLimitTierDto {
    private String name;
    private long capacity;
    private long refillTokens;
    private String refillPeriod;
    private long activeBucketsCount;
    private long throttledCount;
}
