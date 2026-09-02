package com.mrdev.modules.lesson.dto;

import com.mrdev.modules.lesson.model.LessonType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonSummaryDto {
    private Long id;
    private Long courseId;
    private Long moduleId;
    private String title;
    private LessonType lessonType;
    private Integer durationMinutes;
    private boolean isFreePreview;
    @Builder.Default
    private boolean isPublished = true;
    private String content;
    private String youtubeUrl;
    private int dayNumber;
    private int sortOrder;
    private boolean accessible;
    private Instant opensAt;
    private boolean completed;
    private Instant completedAt;
}
