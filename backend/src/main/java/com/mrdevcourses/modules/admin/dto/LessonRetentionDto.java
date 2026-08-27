package com.mrdevcourses.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonRetentionDto {
    private Long lessonId;
    private int dayNumber;
    private String lessonTitle;
    private long completedCount;
    private double completionRate;
    private double dropOffRate;
    private double avgDaysToComplete;
}
