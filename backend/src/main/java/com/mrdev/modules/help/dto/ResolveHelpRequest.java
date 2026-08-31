package com.mrdev.modules.help.dto;

import com.mrdev.modules.help.model.HelpRequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolveHelpRequest {

    @NotNull(message = "Статус обязателен")
    private HelpRequestStatus status;

    private String mentorSolution;
}
