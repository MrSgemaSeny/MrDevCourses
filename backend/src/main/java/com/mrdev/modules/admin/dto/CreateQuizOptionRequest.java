package com.mrdev.modules.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizOptionRequest {
    private Long id;

    @NotBlank(message = "Option text is required")
    private String optionText;

    @Builder.Default
    private Boolean isCorrect = false;

    @Builder.Default
    private Integer sortOrder = 1;
}
