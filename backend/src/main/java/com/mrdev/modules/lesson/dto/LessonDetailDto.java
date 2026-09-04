package com.mrdev.modules.lesson.dto;

import com.mrdev.modules.lesson.model.LessonType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDetailDto {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private Long moduleId;
    private String moduleTitle;
    private String title;
    private LessonType lessonType;
    private Integer durationMinutes;
    private boolean isFreePreview;
    @Builder.Default
    private boolean isPublished = true;
    private String content;
    private String checklist;
    private String youtubeUrl;
    private int dayNumber;
    private int sortOrder;
    private boolean accessible;
    private Instant opensAt;
    private boolean completed;
    private Instant completedAt;
    private boolean hasQuiz;
    private List<LessonMaterialDto> materials;
    private Long prevLessonId;
    private Long nextLessonId;
}
