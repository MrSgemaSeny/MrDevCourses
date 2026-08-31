package com.mrdev.modules.homework.dto;

import com.mrdev.modules.homework.model.SubmissionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewHomeworkRequest {

    @NotNull(message = "Статус проверки обязателен")
    private SubmissionStatus status;

    private String mentorFeedback;
}
