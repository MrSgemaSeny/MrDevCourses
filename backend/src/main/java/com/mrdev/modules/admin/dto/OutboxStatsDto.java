package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutboxStatsDto {
    private long pendingCount;
    private long processingCount;
    private long completedCount;
    private long failedCount;
    private long totalCount;
}
