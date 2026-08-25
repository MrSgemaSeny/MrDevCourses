package com.mrdevcourses.modules.lesson.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDetailDto {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private String title;
    private String content;
    private String youtubeUrl;
    private int dayNumber;
    private int sortOrder;
    private boolean accessible;
    private Instant opensAt;
    private boolean completed;
    private Instant completedAt;
    private Long prevLessonId;
    private Long nextLessonId;
}
