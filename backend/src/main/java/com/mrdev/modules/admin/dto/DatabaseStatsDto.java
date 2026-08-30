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
public class DatabaseStatsDto {
    private String status;
    private String databaseName;
    private String databaseVersion;
    private Long uptimeSeconds;
    private Instant postmasterStartTime;
    private Double responseTimeMs;
}
