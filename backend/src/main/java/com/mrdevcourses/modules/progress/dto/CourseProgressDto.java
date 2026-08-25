package com.mrdevcourses.modules.progress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgressDto {
    private Long courseId;
    private String courseTitle;
    private String courseDescription;
    private String courseSlug;
    private Instant enrolledAt;
    private int currentDay;
    private long completedCount;
    private long totalUnlocked;
    private long totalLessons;
    private double progressPercentage;
    private Instant nextUnlockAt;
}
