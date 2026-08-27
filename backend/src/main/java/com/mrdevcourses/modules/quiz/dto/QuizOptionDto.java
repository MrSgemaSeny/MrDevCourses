package com.mrdevcourses.modules.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizOptionDto {
    private Long id;
    private String optionText;
    private Integer sortOrder;
}
