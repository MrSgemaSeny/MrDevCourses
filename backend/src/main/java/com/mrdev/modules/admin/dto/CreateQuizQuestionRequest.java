package com.mrdev.modules.admin.dto;

import com.mrdev.modules.quiz.model.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizQuestionRequest {
    private Long id;

    @NotBlank(message = "Question text is required")
    private String questionText;

    @Builder.Default
    private QuestionType questionType = QuestionType.SINGLE_CHOICE;

    private String explanation;

    @Builder.Default
    private Integer points = 1;

    @Builder.Default
    private Integer sortOrder = 1;

    @Valid
    @Builder.Default
    private List<CreateQuizOptionRequest> options = new ArrayList<>();
}
