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

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class TelegramBotCommandService {

    private final HomeworkService homeworkService;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final TelegramNotificationService telegramNotificationService;
    private final TelegramLinkTokenService linkTokenService;
    private final String authorizedChatId;

    public TelegramBotCommandService(
            HomeworkService homeworkService,
            UserRepository userRepository,
            EnrollmentRepository enrollmentRepository,
            LessonProgressRepository lessonProgressRepository,
            LessonRepository lessonRepository,
            CourseRepository courseRepository,
            TelegramNotificationService telegramNotificationService,
            TelegramLinkTokenService linkTokenService,
            @Value("${app.telegram.chat-id:}") String authorizedChatId) {
        this.homeworkService = homeworkService;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
        this.telegramNotificationService = telegramNotificationService;
        this.linkTokenService = linkTokenService;
        this.authorizedChatId = authorizedChatId != null ? authorizedChatId.trim() : "";
    }

    public String processCommand(String senderChatId, String text) {
        if (senderChatId == null || text == null || text.isBlank()) {
            return null;
        }

        String trimmed = text.trim();
        String command = trimmed.split("\\s+")[0].toLowerCase();
        boolean isMentor = !authorizedChatId.isBlank() && senderChatId.trim().equals(authorizedChatId);

        try {
            // Check student link command: /start LINK_<token>
            if (command.equals("/start") && trimmed.contains("LINK_")) {
                return handleStudentLink(senderChatId, trimmed);
            }

            if (isMentor) {
                return switch (command) {
                    case "/hw", "hw", "дз", "домашки", "проверка" -> handleHwQueue();
                    case "/approve", "approve", "принять", "одобрить", "+", "/ok", "ok" -> handleApprove(trimmed);
                    case "/reject", "reject", "отклонить", "доработать", "-" -> handleReject(trimmed);
                    case "/status", "status", "статус", "стата", "поток" -> handleStatus();
                    case "/stuck", "stuck", "застряли", "должники", "долги" -> handleStuck();
                    case "/progress", "progress", "прогресс", "студент" -> handleProgress(trimmed);
                    case "/broadcast", "broadcast", "анонс", "рассылка" -> handleBroadcast(trimmed);
                    case "/start", "/help", "help", "помощь", "команды", "меню", "start" -> handleMentorHelp();
                    default -> "Команда не распознана. Введите /help или 'помощь' для списка доступных команд.";
                };
            } else {
                return switch (command) {
                    case "/status", "status", "статус", "прогресс" -> handleStudentStatus(senderChatId);
                    case "/unlink", "unlink", "отвязать" -> handleStudentUnlink(senderChatId);
                    case "/start", "/help", "help", "помощь", "команды" -> handleStudentHelp(senderChatId);
                    default -> "Команда не распознана. Введите /help для справки.";
                };
            }
        } catch (Exception e) {
            log.error("Error processing Telegram command '{}': {}", trimmed, e.getMessage(), e);
            return "Не удалось выполнить команду: " + e.getMessage();
        }
    }

    private String handleStudentLink(String senderChatId, String fullText) {
        int linkIndex = fullText.indexOf("LINK_");
        if (linkIndex == -1) {
            return "Некорректный токен привязки.";
        }

        String token = fullText.substring(linkIndex + 5).trim();
        Long userId = linkTokenService.validateAndConsumeToken(token);

        if (userId == null) {
            return "Срок действия ссылки привязки истек или токен недействителен. Пожалуйста, сгенерируйте новую ссылку в профиле на сайте.";
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return "Пользователь не найден.";
        }

        User user = userOpt.get();
        user.setTelegramChatId(Long.parseLong(senderChatId));
        user.setTelegramLinkedAt(Instant.now());
        userRepository.save(user);

        return "Telegram-аккаунт успешно привязан к профилю " + user.getEmail() + "!\nТеперь вы будете получать уведомления о проверке ДЗ и открытии новых уроков.";
    }

    private String handleStudentStatus(String senderChatId) {
        Long chatId = Long.parseLong(senderChatId);
        Optional<User> userOpt = userRepository.findByTelegramChatId(chatId);
        if (userOpt.isEmpty()) {
            return "Ваш Telegram-аккаунт не привязан к профилю на сайте. Перейдите в настройки профиля на платформе и нажмите 'Подключить Telegram'.";
        }

        User user = userOpt.get();
        List<Enrollment> enrollments = enrollmentRepository.findAllByUserId(user.getId());
        if (enrollments.isEmpty()) {
            return "У вас пока нет активных курсов.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("*Ваш учебный прогресс (").append(user.getEmail()).append("):*\n\n");

        for (Enrollment e : enrollments) {
            Course c = e.getCourse();
            if (c == null) continue;

            long totalLessons = lessonRepository.countByCourseId(c.getId());
            long completed = lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(user.getId(), c.getId());
            long pct = totalLessons > 0 ? (completed * 100 / totalLessons) : 0;

            sb.append("• *").append(c.getTitle()).append("*\n")
              .append("  Пройдено: ").append(completed).append("/").append(totalLessons).append(" уроков (").append(pct).append("%)\n")
              .append("  Текущий стрик: ").append(user.getCurrentStreak()).append(" дн.\n\n");
        }

        return sb.toString();
    }

    private String handleStudentUnlink(String senderChatId) {
        Long chatId = Long.parseLong(senderChatId);
        Optional<User> userOpt = userRepository.findByTelegramChatId(chatId);
        if (userOpt.isEmpty()) {
            return "Telegram-аккаунт не был привязан.";
        }

        User user = userOpt.get();
        user.setTelegramChatId(null);
        user.setTelegramUsername(null);
        user.setTelegramLinkedAt(null);
        userRepository.save(user);

        return "Telegram-аккаунт успешно отвязан от профиля на платформе.";
    }

    private String handleStudentHelp(String senderChatId) {
        return """
                *MrDevCourses — Бот студента*

                Доступные команды:
                • `/status` — Мой прогресс обучения и текущий стрик
                • `/unlink` — Отвязать Telegram-аккаунт
                • `/help` — Справка по боту
                """;
    }

    private String handleMentorHelp() {
        return """
                ⚡ *MrDevCourses — Пульт Ментора*

                Быстрые команды:
                • `/hw` (или `дз`) — Очередь сданных работ
                • `/approve 1` (или `принять 1`, `+ 1`) — Принять ДЗ #1
                • `/reject 1 правка` (или `доработать 1 правка`, `- 1`) — Вернуть ДЗ #1
                • `/progress orka@gmail.com` — Карточка и стрик студента
                • `/broadcast текст` — Рассылка анонса всем студентам
                • `/status` (или `стата`) — Сводка по всему потоку
                • `/stuck` (или `застряли`) — Студенты без активности (3+ дня)
                • `/help` — Эта справка
                """;
    }

    private String handleProgress(String fullText) {
        String[] parts = fullText.split("\\s+", 2);
        if (parts.length < 2) {
            return "Формат: `/progress orka@gmail.com` или `/progress @username`";
        }

        String rawQuery = parts[1].trim();
        String query = rawQuery.startsWith("@") ? rawQuery.substring(1) : rawQuery;
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(query)
                .or(() -> userRepository.findByTelegramUsernameIgnoreCase(query));

        if (userOpt.isEmpty()) {
            return "Студент '" + query + "' не найден в системе.";
        }

        User u = userOpt.get();
        List<Enrollment> enrollments = enrollmentRepository.findAllByUserId(u.getId());

        StringBuilder sb = new StringBuilder();
        sb.append("📋 *Карточка студента: ").append(u.getName() != null ? u.getName() : "Студент").append("*\n")
          .append("Email: `").append(u.getEmail()).append("`\n")
          .append("Telegram: ").append(u.getTelegramUsername() != null ? "@" + u.getTelegramUsername() : "Не привязан").append("\n")
          .append("Стрик: ").append(u.getCurrentStreak()).append(" дн. (рекорд: ").append(u.getLongestStreak()).append(")\n")
          .append("Последняя активность: ").append(u.getLastActiveDate() != null ? u.getLastActiveDate() : "Не зафиксирована").append("\n\n");

        if (enrollments.isEmpty()) {
            sb.append("Студент пока не записан ни на один курс.");
        } else {
            sb.append("*Курсы:*\n");
            for (Enrollment e : enrollments) {
                Course c = e.getCourse();
                if (c == null) continue;
                long total = lessonRepository.countByCourseId(c.getId());
                long done = lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(u.getId(), c.getId());
                long pct = total > 0 ? (done * 100 / total) : 0;
                sb.append("• ").append(c.getTitle()).append(": ").append(done).append("/").append(total).append(" уроков (").append(pct).append("%)\n");
            }
        }

        return sb.toString();
    }

    private String handleBroadcast(String fullText) {
        String[] parts = fullText.split("\\s+", 2);
        if (parts.length < 2) {
            return "Формат: `/broadcast <текст объявления>`";
        }

        String announcement = parts[1].trim();
        List<User> students = userRepository.findAllByRole(Role.STUDENT);
        int sentCount = 0;

        for (User student : students) {
            if (student.getTelegramChatId() != null && student.isTelegramNotificationsEnabled()) {
                try {
                    String msg = "📢 *Объявление от ментора:*\n\n" + announcement;
                    telegramNotificationService.sendDirectMessage(String.valueOf(student.getTelegramChatId()), msg);
                    sentCount++;
                } catch (Exception e) {
                    log.warn("Failed to broadcast message to student {}: {}", student.getId(), e.getMessage());
                }
            }
        }

        return "📢 Анонс успешно разослан " + sentCount + " студентам с подключенным Telegram.";
    }

    private String handleHwQueue() {
        List<HomeworkSubmissionDto> pending = homeworkService.getAllSubmissions(SubmissionStatus.PENDING);
        if (pending.isEmpty()) {
            return "Очередь ДЗ пуста! Все работы проверены.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📝 *Очередь ДЗ на проверку (").append(pending.size()).append(")*:\n\n");

        for (HomeworkSubmissionDto sub : pending) {
            sb.append("🔹 *ДЗ #").append(sub.getId()).append("*\n")
              .append("👤 Студент: ").append(sub.getStudentName() != null ? sub.getStudentName() : "Студент").append("\n")
              .append("📖 Урок: ").append(sub.getLessonTitle() != null ? sub.getLessonTitle() : "Урок").append("\n");

            if (sub.getRepositoryUrl() != null && !sub.getRepositoryUrl().isBlank()) {
                sb.append("🔗 GitHub: ").append(sub.getRepositoryUrl()).append("\n");
            }
            if (sub.getLiveDemoUrl() != null && !sub.getLiveDemoUrl().isBlank()) {
                sb.append("🌐 Live Demo: ").append(sub.getLiveDemoUrl()).append("\n");
            }

            sb.append("Действия:\n")
              .append("• Принять: `/approve ").append(sub.getId()).append("`\n")
              .append("• Отклонить: `/reject ").append(sub.getId()).append(" комментарий`\n\n");
        }

        return sb.toString();
    }

    private Optional<Long> extractNumericId(String input) {
        if (input == null || input.isBlank()) {
            return Optional.empty();
        }
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("\\b(\\d+)\\b").matcher(input);
        if (matcher.find()) {
            try {
                return Optional.of(Long.parseLong(matcher.group(1)));
            } catch (NumberFormatException e) {
                return Optional.empty();
            }
        }
        return Optional.empty();
    }

    private String handleApprove(String fullText) {
        Optional<Long> idOpt = extractNumericId(fullText);
        if (idOpt.isEmpty()) {
            return "Укажите номер сдачи ДЗ. Например: `/approve 1` или `принять 1`\nСписок непроверенных ДЗ: `/hw`";
        }

        Long submissionId = idOpt.get();
        Long mentorAdminId = getFirstAdminId();

        AdminReviewHomeworkRequest req = AdminReviewHomeworkRequest.builder()
                .status(SubmissionStatus.PASSED)
                .mentorFeedback("Отличная работа! Домашнее задание принято.")
                .build();

        try {
            homeworkService.reviewSubmission(submissionId, mentorAdminId, req);
            return "ДЗ #" + submissionId + " успешно принято! Студенту отправлено уведомление и открыт следующий урок.";
        } catch (com.mrdev.common.exception.ResourceNotFoundException e) {
            return "Сдача ДЗ #" + submissionId + " не найдена. Возможно, она уже проверена. Проверьте очередь через /hw.";
        } catch (Exception e) {
            log.error("Error approving submission #{}: {}", submissionId, e.getMessage(), e);
            return "Не удалось одобрить ДЗ #" + submissionId + ": " + e.getMessage();
        }
    }

    private String handleReject(String fullText) {
        Optional<Long> idOpt = extractNumericId(fullText);
        if (idOpt.isEmpty()) {
            return "Укажите номер сдачи ДЗ. Например: `/reject 1 поправь верстку` или `доработать 1 поправь верстку`\nСписок непроверенных ДЗ: `/hw`";
        }

        Long submissionId = idOpt.get();
        
        // Remove command name and ID to extract the custom feedback message
        String cleaned = fullText.replaceFirst("(?i)^(/reject|reject|отклонить|доработать|-)\\s*", "");
        cleaned = cleaned.replaceFirst("(?i)(<" + submissionId + ">|#" + submissionId + "|\\[" + submissionId + "\\]|" + submissionId + ")\\s*", "").trim();
        
        String feedback = !cleaned.isBlank()
                ? cleaned
                : "Требуются доработки по критериям урока. Пожалуйста, проверьте требования к заданию и отправьте обновленную версию.";

        Long mentorAdminId = getFirstAdminId();

        AdminReviewHomeworkRequest req = AdminReviewHomeworkRequest.builder()
                .status(SubmissionStatus.NEEDS_IMPROVEMENT)
                .mentorFeedback(feedback)
                .build();

        try {
            homeworkService.reviewSubmission(submissionId, mentorAdminId, req);
            return "ДЗ #" + submissionId + " отправлено на доработку.\nКомментарий студенту: \"" + feedback + "\"";
        } catch (com.mrdev.common.exception.ResourceNotFoundException e) {
            return "Сдача ДЗ #" + submissionId + " не найдена. Возможно, она уже проверена. Проверьте очередь через /hw.";
        } catch (Exception e) {
            log.error("Error rejecting submission #{}: {}", submissionId, e.getMessage(), e);
            return "Не удалось отправить ДЗ #" + submissionId + " на доработку: " + e.getMessage();
        }
    }

    private String handleStatus() {
        List<Enrollment> enrollments = enrollmentRepository.findAllWithCourseAndUser();
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
        List<Enrollment> enrollments = enrollmentRepository.findAllWithCourseAndUser();
        LocalDate now = LocalDate.now();

        List<Enrollment> stuck = enrollments.stream().filter(e -> {
            User u = e.getUser();
            if (u == null) return false;
            LocalDate lastActive = u.getLastActiveDate();
            if (lastActive == null) return true;
            return ChronoUnit.DAYS.between(lastActive, now) >= 3;
        }).toList();

        if (stuck.isEmpty()) {
            return "Все студенты активны! Никто не застрял 3+ дней.";
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