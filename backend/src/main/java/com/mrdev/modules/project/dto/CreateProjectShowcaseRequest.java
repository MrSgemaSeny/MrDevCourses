package com.mrdev.modules.project.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectShowcaseRequest {

    private Long courseId;

    @NotBlank(message = "Название проекта обязательно")
    private String title;

    @NotBlank(message = "Описание проекта обязательно")
    private String description;

    private String thumbnailUrl;

    @NotBlank(message = "Ссылка на задеплоенный проект (Live Demo) обязательна")
    private String liveDemoUrl;

    @NotBlank(message = "Ссылка на репозиторий GitHub обязательна")
    private String githubRepoUrl;

    private String techStack;
}
