package com.mrdevcourses.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRetentionDto {
    private Long courseId;
    private String courseTitle;
    private long totalEnrolled;
    private long completedCount;
    private double overallCompletionRate;
    private List<LessonRetentionDto> lessonRetention;
}
