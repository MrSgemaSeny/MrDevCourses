package com.mrdevcourses.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseFunnelStepDto {
    private int stepOrder;
    private String stepName;
    private Integer dayNumber;
    private Long lessonId;
    private String lessonTitle;
    private long studentsCount;
    private double conversionRate;
    private double dropOffRate;
}
