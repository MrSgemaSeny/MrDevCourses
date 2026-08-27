package com.mrdevcourses.modules.homework.dto;

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

    @NotBlank(message = "Код решения не может быть пустым")
    @Size(max = 20000, message = "Размер кода не должен превышать 20000 символов")
    private String codeSnippet;

    @Size(max = 500, message = "Ссылка на репозиторий слишком длинная")
    private String repositoryUrl;
}
