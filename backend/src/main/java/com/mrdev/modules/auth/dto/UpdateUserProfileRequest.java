package com.mrdev.modules.auth.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequest {

    @Size(max = 100, message = "Имя не должно превышать 100 символов")
    private String name;

    @Size(max = 1024, message = "URL аватара не должен превышать 1024 символа")
    private String avatarUrl;

    @Size(max = 100, message = "Telegram username не должен превышать 100 символов")
    private String telegramUsername;

    @Size(max = 100, message = "GitHub username не должен превышать 100 символов")
    private String githubUsername;

    @Size(max = 2000, message = "Описание bio не должно превышать 2000 символов")
    private String bio;

    @Size(max = 255, message = "Цель не должна превышать 255 символов")
    private String goal;
}