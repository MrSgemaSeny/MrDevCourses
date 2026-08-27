package com.mrdevcourses.modules.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRiskDto {
    private Long userId;
    private String userEmail;
    private String userName;
    private Long courseId;
    private String courseTitle;
    private Integer currentDay;
    private Long daysInactive;
    private Instant lastActiveDate;
    private String riskLevel; // LOW, MEDIUM, HIGH
    private String recommendedNudge;
}
