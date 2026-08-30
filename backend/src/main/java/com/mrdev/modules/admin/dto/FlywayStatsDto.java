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
public class FlywayStatsDto {
    private String currentVersion;
    private String currentDescription;
    private String state;
    private int totalMigrations;
    private Instant installedOn;
}
