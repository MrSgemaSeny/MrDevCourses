package com.mrdev.modules.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectShowcaseDto {
    private Long id;
    private Long userId;
    private Long courseId;
    private String courseTitle;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String liveDemoUrl;
    private String githubRepoUrl;
    private String authorName;
    private String authorAvatarUrl;
    private String techStack;
    private boolean featured;
    private int likesCount;
    private Instant createdAt;
}
