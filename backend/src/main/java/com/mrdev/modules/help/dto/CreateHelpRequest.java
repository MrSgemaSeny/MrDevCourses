package com.mrdev.modules.help.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateHelpRequest {

    @NotBlank(message = "Укажите шаг или этап урока")
    private String stepIdentifier;

    private String stepTitle;

    @NotBlank(message = "Опишите, с чем именно возникла сложность")
    private String problemText;

    private String errorLogs;
}
