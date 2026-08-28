package com.mrdev.modules.lesson.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLessonRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String content;

    @Size(max = 500, message = "YouTube URL must not exceed 500 characters")
    private String youtubeUrl;

    @Min(value = 1, message = "Day number must be at least 1")
    private int dayNumber;

    @Builder.Default
    private int sortOrder = 0;
}
