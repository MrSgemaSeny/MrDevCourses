package com.mrdev.modules.admin.dto;

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
public class CreateQuizRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @Builder.Default
    private Integer passingScorePercentage = 80;

    @Builder.Default
    private Integer maxAttempts = 3;

    @Builder.Default
    private Integer timeLimitSeconds = 600;

    @Valid
    @Builder.Default
    private List<CreateQuizQuestionRequest> questions = new ArrayList<>();
}
