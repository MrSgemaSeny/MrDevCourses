package com.mrdev.modules.automation.service;

import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.automation.dto.StuckStudentAlertDto;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.Enrollment;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.help.service.TelegramNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StuckDetectionService {

    private final EnrollmentRepository enrollmentRepository;
    private final TelegramNotificationService telegramNotificationService;
    private final AuditService auditService;

    @Scheduled(cron = "0 0 9 * * *") // Every day at 09:00 UTC
    @Transactional
    public List<StuckStudentAlertDto> runStuckCheck() {
        log.info("Executing scheduled Stuck Student Detection scan...");
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        LocalDate now = LocalDate.now();
        List<StuckStudentAlertDto> stuckList = new ArrayList<>();

        for (Enrollment enrollment : enrollments) {
            User student = enrollment.getUser();
            Course course = enrollment.getCourse();
            if (student == null || course == null) continue;

            LocalDate lastActive = student.getLastActiveDate();
            long daysInactive = (lastActive != null)
                    ? ChronoUnit.DAYS.between(lastActive, now)
                    : 99;

            if (daysInactive >= 3) {
                StuckStudentAlertDto dto = StuckStudentAlertDto.builder()
                        .studentId(student.getId())
                        .studentName(student.getName() != null ? student.getName() : "Студент")
                        .studentEmail(student.getEmail())
                        .courseId(course.getId())
                        .courseTitle(course.getTitle())
                        .daysInactive(daysInactive)
                        .lastActiveDate(lastActive)
                        .build();

                stuckList.add(dto);

                // Send Telegram alert to mentor
                String details = String.format(
                        "👤 *Студент:* %s (`%s`)\n📖 *Курс:* %s\n⏳ *Неактивен:* %d дн.\n💡 *Рекомендация:* Напишите студенту в Discord для поддержки!",
                        dto.getStudentName(),
                        dto.getStudentEmail(),
                        dto.getCourseTitle(),
                        daysInactive
                );
                telegramNotificationService.sendMentorAlert("[Stuck Alert] Студент застрял!", details);

                // Audit log
                auditService.logAction(
                        student.getId(),
                        "STUCK_STUDENT_DETECTED",
                        "User",
                        student.getId(),
                        "Student inactive for " + daysInactive + " days in course " + course.getTitle(),
                        null
                );
            }
        }

        log.info("Stuck Student scan complete. Identified {} inactive students.", stuckList.size());
        return stuckList;
    }
}
