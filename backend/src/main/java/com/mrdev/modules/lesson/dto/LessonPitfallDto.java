package com.mrdev.modules.lesson.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonPitfallDto {
    private Long id;
    private Long lessonId;
    private String title;
    private String errorSymptom;
    private String solutionMarkdown;
    private int orderIndex;
    private Instant createdAt;
}