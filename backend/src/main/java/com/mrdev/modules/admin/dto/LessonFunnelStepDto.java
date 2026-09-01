package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonFunnelStepDto {
    private Long lessonId;
    private String lessonTitle;
    private int orderIndex;
    private long completedUsersCount;
    private double completionRatePercent;
    private double dropOffRatePercent;
    private long hwSubmissionsCount;
    private long hwRejectionsCount;
    private boolean isBottleneck;
}