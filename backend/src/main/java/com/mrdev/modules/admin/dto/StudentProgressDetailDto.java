package com.mrdev.modules.admin.dto;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.progress.dto.CourseProgressDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProgressDetailDto {
    private Long userId;
    private String email;
    private String name;
    private String avatarUrl;
    private Role role;
    private int currentStreak;
    private int longestStreak;
    private LocalDate lastActiveDate;
    private Instant createdAt;
    private List<CourseProgressDto> enrolledCourses;
    private List<CompletedLessonDto> completedLessons;
    private List<StudentQuizScoreDto> quizScores;
    private List<StudentHomeworkStatusDto> homeworkSubmissions;
}
