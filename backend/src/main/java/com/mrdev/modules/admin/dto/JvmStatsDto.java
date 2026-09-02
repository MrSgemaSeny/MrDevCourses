package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JvmStatsDto {
    private long totalMemoryBytes;
    private long freeMemoryBytes;
    private long usedMemoryBytes;
    private long maxMemoryBytes;
    private int availableProcessors;
    private int activeThreads;
    private long uptimeMs;
}
