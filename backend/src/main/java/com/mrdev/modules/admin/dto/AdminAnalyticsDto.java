package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsDto {
    private long totalStudents;
    private long totalEnrollments;
    private long totalCompletions;
    private long totalCertificates;
    private double overallCompletionRate;
    private List<LessonFunnelItemDto> funnel;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonFunnelItemDto {
        private Long lessonId;
        private int dayNumber;
        private String title;
        private long completedCount;
        private double conversionRate; // % от всех зачисленных
        private double dropOffRate;     // % отвала по сравнению с предыдущим шагом
    }
}
