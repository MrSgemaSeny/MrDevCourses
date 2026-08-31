package com.mrdev.modules.homework.dto;

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
public class HomeworkSubmitRequest {

    @Size(max = 20000, message = "Размер описания/кода не должен превышать 20000 символов")
    private String codeSnippet;

    @Size(max = 500, message = "Ссылка на репозиторий слишком длинная")
    private String repositoryUrl;

    @Size(max = 500, message = "Ссылка на демо-сайт слишком длинная")
    private String liveDemoUrl;
}
