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
public class SystemHealthDto {
    private String status;
    private HikariPoolStatsDto databasePool;
    private DatabaseStatsDto database;
    private FlywayStatsDto flyway;
    private OutboxStatsDto outboxQueue;
    private JvmStatsDto jvm;
    private Instant timestamp;
}
