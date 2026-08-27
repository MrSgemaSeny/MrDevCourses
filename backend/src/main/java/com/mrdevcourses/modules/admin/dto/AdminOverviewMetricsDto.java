package com.mrdevcourses.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewMetricsDto {
    private long totalStudents;
    private long totalEnrollments;
    private long totalLessonsCompleted;
    private long totalCompletions;
    private double averageStreak;
    private long activeStudents;
    private double completionRate;
}
