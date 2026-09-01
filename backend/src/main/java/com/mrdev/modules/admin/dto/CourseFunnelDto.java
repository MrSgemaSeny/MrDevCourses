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
public class CourseFunnelDto {
    private Long courseId;
    private String courseTitle;
    private long totalEnrolled;
    private List<LessonFunnelStepDto> steps;
    private double overallCompletionRate;
    private String biggestBottleneckLessonTitle;
    private double biggestDropOffRate;
}