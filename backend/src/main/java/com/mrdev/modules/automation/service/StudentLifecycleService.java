package com.mrdev.modules.automation.service;

import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.automation.dto.StudentRiskDto;
import com.mrdev.modules.course.model.Enrollment;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentLifecycleService {

    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;

    @Transactional(readOnly = true)
    public List<StudentRiskDto> analyzeRetentionRisks() {
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        List<StudentRiskDto> risks = new ArrayList<>();
        Instant now = Instant.now();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        for (Enrollment enrollment : enrollments) {
            User user = enrollment.getUser();
            LocalDate lastActive = user.getLastActiveDate();
            long daysInactive = 0;

            if (lastActive != null) {
                daysInactive = java.time.temporal.ChronoUnit.DAYS.between(lastActive, today);
            } else {
                daysInactive = Duration.between(enrollment.getEnrolledAt(), now).toDays();
            }

            if (daysInactive >= 2) {
                String riskLevel = daysInactive >= 7 ? "HIGH" : (daysInactive >= 4 ? "MEDIUM" : "LOW");
                String nudge = "Привет, " + user.getName() + "! Твой следующий урок по курсу \"" +
                        enrollment.getCourse().getTitle() + "\" уже открыт. Продолжи обучение, чтобы сохранить стрик!";

                risks.add(StudentRiskDto.builder()
                        .userId(user.getId())
                        .userEmail(user.getEmail())
                        .userName(user.getName())
                        .courseId(enrollment.getCourse().getId())
                        .courseTitle(enrollment.getCourse().getTitle())
                        .currentDay((int) Math.max(1, Duration.between(enrollment.getEnrolledAt(), now).toDays() + 1))
                        .daysInactive(daysInactive)
                        .lastActiveDate(lastActive != null ? lastActive.atStartOfDay().toInstant(ZoneOffset.UTC) : enrollment.getEnrolledAt())
                        .riskLevel(riskLevel)
                        .recommendedNudge(nudge)
                        .build());
            }
        }

        return risks;
    }
}
