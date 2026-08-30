package com.mrdev.modules.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCohortRequest {

    @NotBlank(message = "Cohort name is required")
    private String name;

    @NotNull(message = "Start date is required")
    private Instant startDate;

    private Instant endDate;

    private Integer maxStudents;

    private Boolean isActive;
}
