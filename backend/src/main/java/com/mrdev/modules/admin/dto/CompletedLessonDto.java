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
public class CompletedLessonDto {
    private Long lessonId;
    private String lessonTitle;
    private int dayNumber;
    private Long courseId;
    private String courseTitle;
    private Instant completedAt;
}
