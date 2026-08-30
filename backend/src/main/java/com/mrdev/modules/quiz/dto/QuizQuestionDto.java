package com.mrdev.modules.quiz.dto;

import com.mrdev.modules.quiz.model.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionDto {
    private Long id;
    private String questionText;
    private QuestionType questionType;
    private String explanation;
    private Integer points;
    private Integer sortOrder;
    private List<QuizOptionDto> options;
}
