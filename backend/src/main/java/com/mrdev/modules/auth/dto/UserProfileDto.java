package com.mrdev.modules.auth.dto;

import com.mrdev.modules.auth.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String email;
    private String name;
    private String avatarUrl;
    private Role role;
    private int currentStreak;
    private int longestStreak;
    private LocalDate lastActiveDate;
    private String telegramUsername;
    private String githubUsername;
    private String bio;
    private String goal;
    private Instant createdAt;

    // Aggregated Metrics
    private int enrolledCoursesCount;
    private int completedLessonsCount;
    private int certificatesCount;
}