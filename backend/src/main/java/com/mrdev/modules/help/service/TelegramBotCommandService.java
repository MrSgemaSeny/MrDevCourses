package com.mrdev.modules.help.service;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.Enrollment;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.homework.dto.AdminReviewHomeworkRequest;
import com.mrdev.modules.homework.dto.HomeworkSubmissionDto;
import com.mrdev.modules.homework.model.SubmissionStatus;
import com.mrdev.modules.homework.service.HomeworkService;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
public class TelegramBotCommandService {

    private final HomeworkService homeworkService;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final TelegramNotificationService telegramNotificationService;
    private final String authorizedChatId;

    public TelegramBotCommandService(
            HomeworkService homeworkService,
            UserRepository userRepository,
            EnrollmentRepository enrollmentRepository,
            LessonProgressRepository lessonProgressRepository,
            LessonRepository lessonRepository,
            CourseRepository courseRepository,
            TelegramNotificationService telegramNotificationService,
            @Value("${app.telegram.chat-id:}") String authorizedChatId) {
        this.homeworkService = homeworkService;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
        this.telegramNotificationService = telegramNotificationService;
        this.authorizedChatId = authorizedChatId != null ? authorizedChatId.trim() : "";
    }

    public String processCommand(String senderChatId, String text) {
        if (senderChatId == null || !senderChatId.trim().equals(authorizedChatId)) {
            log.warn("Ignored Telegram command from unauthorized chatId: {}", senderChatId);
            return null;
        }

        if (text == null || text.isBlank()) {
            return null;
        }

        String trimmed = text.trim();
        String command = trimmed.split("\\s+")[0].toLowerCase();

        try {
            return switch (command) {
                case "/hw" -> handleHwQueue();
                case "/approve" -> handleApprove(trimmed);
                case "/reject" -> handleReject(trimmed);
                case "/status" -> handleStatus();
                case "/stuck" -> handleStuck();
                case "/start", "/help" -> handleHelp();
                default -> "Неизвестная команда. Введите /help для списка команд ментора.";
            };
        } catch (Exception e) {
            log.error("Error processing Telegram command '{}': {}", trimmed, e.getMessage(), e);
            return "❌ Ошибка выполнения команды: " + e.getMessage();
        }
    }

    private String handleHelp() {
        return """
                ⚡ *MrDevCourses — Пульт Ментора*

                Доступные команды:
                • `/hw` — Очередь сданных ДЗ на проверку
                • `/approve <id>` — Принять ДЗ и открыть следующий день
                • `/reject <id> <комментарий>` — Вернуть ДЗ на доработку
                • `/status` — Сводка прогресса всех студентов
                • `/stuck` — Список студентов без активности (3+ дня)
                • `/help` — Справка по командам
                """;
    }

    private String handleHwQueue() {
        List<HomeworkSubmissionDto> pending = homeworkService.getAllSubmissions(SubmissionStatus.PENDING);
        if (pending.isEmpty()) {
            return "🎉 Очередь ДЗ пуста! Все работы проверены.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📝 *Очередь ДЗ на проверку (").append(pending.size()).append(")*:\n\n");

        for (HomeworkSubmissionDto sub : pending) {
            sb.append("🔹 *ID: #").append(sub.getId()).append("*\n")
              .append("👤 Студент: ").append(sub.getStudentName() != null ? sub.getStudentName() : "Студент").append("\n")
              .append("📖 Урок: ").append(sub.getLessonTitle() != null ? sub.getLessonTitle() : "Урок").append("\n");

            if (sub.getRepositoryUrl() != null && !sub.getRepositoryUrl().isBlank()) {
                sb.append("🔗 GitHub: ").append(sub.getRepositoryUrl()).append("\n");
            }
            if (sub.getLiveDemoUrl() != null && !sub.getLiveDemoUrl().isBlank()) {
                sb.append("🌐 Live Demo: ").append(sub.getLiveDemoUrl()).append("\n");
            }

            sb.append("Команды:\n")
              .append("`/approve ").append(sub.getId()).append("`\n")
              .append("`/reject ").append(sub.getId()).append(" <комментарий>`\n\n");
        }

        return sb.toString();
    }

    private String handleApprove(String fullText) {
        String[] parts = fullText.split("\\s+", 2);
        if (parts.length < 2) {
            return "Формат: `/approve <id>` (например: `/approve 101`)";
        }

        Long submissionId = Long.parseLong(parts[1].trim());
        Long mentorAdminId = getFirstAdminId();

        AdminReviewHomeworkRequest req = AdminReviewHomeworkRequest.builder()
                .status(SubmissionStatus.PASSED)
                .mentorFeedback("Отличная работа! Домашнее задание принято.")
                .build();

        homeworkService.reviewSubmission(submissionId, mentorAdminId, req);

        return "✅ ДЗ #" + submissionId + " успешно принято! Урок засчитан, студенту открыт следующий день.";
    }

    private String handleReject(String fullText) {
        String[] parts = fullText.split("\\s+", 3);
        if (parts.length < 3) {
            return "Формат: `/reject <id> <комментарий>`\nПример: `/reject 101 Поправь адаптивную верстку`";
        }

        Long submissionId = Long.parseLong(parts[1].trim());
        String feedback = parts[2].trim();
        Long mentorAdminId = getFirstAdminId();

        AdminReviewHomeworkRequest req = AdminReviewHomeworkRequest.builder()
                .status(SubmissionStatus.NEEDS_IMPROVEMENT)
                .mentorFeedback(feedback)
                .build();

        homeworkService.reviewSubmission(submissionId, mentorAdminId, req);

        return "⚠️ ДЗ #" + submissionId + " отправлено на доработку с комментарием:\n\"" + feedback + "\"";
    }

    private String handleStatus() {
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        if (enrollments.isEmpty()) {
            return "На платформе пока нет зачисленных студентов.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📊 *Сводка студентов потока:*\n\n");

        for (Enrollment e : enrollments) {
            User u = e.getUser();
            Course c = e.getCourse();
            if (u == null || c == null) continue;

            long totalLessons = lessonRepository.countByCourseId(c.getId());
            long completedLessons = lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(u.getId(), c.getId());
            long pct = totalLessons > 0 ? (completedLessons * 100 / totalLessons) : 0;

            sb.append("• *").append(u.getName() != null ? u.getName() : u.getEmail()).append("*\n")
              .append("  Курс: ").append(c.getTitle()).append("\n")
              .append("  Прогресс: ").append(completedLessons).append("/").append(totalLessons)
              .append(" уроков (").append(pct).append("%)\n")
              .append("  Стрик: ").append(u.getCurrentStreak()).append(" дн.\n\n");
        }

        return sb.toString();
    }

    private String handleStuck() {
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        LocalDate now = LocalDate.now();

        List<Enrollment> stuck = enrollments.stream().filter(e -> {
            User u = e.getUser();
            if (u == null) return false;
            LocalDate lastActive = u.getLastActiveDate();
            if (lastActive == null) return true;
            return ChronoUnit.DAYS.between(lastActive, now) >= 3;
        }).toList();

        if (stuck.isEmpty()) {
            return "🚀 Все студенты активны! Никто не застрял 3+ дней.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("⚠️ *Застрявшие студенты (3+ дня без активности):*\n\n");

        for (Enrollment e : stuck) {
            User u = e.getUser();
            LocalDate lastActive = u.getLastActiveDate();
            long daysInactive = lastActive != null ? ChronoUnit.DAYS.between(lastActive, now) : 99;

            sb.append("• *").append(u.getName() != null ? u.getName() : "Студент").append("*\n")
              .append("  Email: `").append(u.getEmail()).append("`\n")
              .append("  Без активности: ").append(daysInactive).append(" дн.\n\n");
        }

        return sb.toString();
    }

    private Long getFirstAdminId() {
        return userRepository.findAllByRole(Role.ADMIN).stream()
                .findFirst()
                .map(User::getId)
                .orElse(1L);
    }
}
