package com.mrdev.modules.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiTutorRequest {

    @NotNull(message = "courseId обязателен")
    private Long courseId;

    @NotNull(message = "lessonId обязателен")
    private Long lessonId;

    @NotBlank(message = "Вопрос не может быть пустым")
    @Size(max = 1000, message = "Вопрос не должен превышать 1000 символов")
    private String question;
}
