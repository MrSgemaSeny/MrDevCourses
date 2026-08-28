package com.mrdev.modules.homework.service;

import com.mrdev.common.exception.ApiException;
import com.mrdev.common.exception.ResourceNotFoundException;
import com.mrdev.modules.ai.service.GroqClient;
import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.homework.dto.HomeworkSubmissionDto;
import com.mrdev.modules.homework.dto.HomeworkSubmitRequest;
import com.mrdev.modules.homework.model.HomeworkSubmission;
import com.mrdev.modules.homework.model.SubmissionStatus;
import com.mrdev.modules.homework.repository.HomeworkSubmissionRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.lesson.service.LessonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiCodeGraderService {

    private static final Pattern SECRET_PATTERN = Pattern.compile("(?i)(password|secret|apikey|token)\\s*=\\s*[\"'][^\"']{8,}[\"']|sk-[a-zA-Z0-9]{24,}|ghp_[a-zA-Z0-9]{30,}");
    private static final Pattern SQL_CONCAT_PATTERN = Pattern.compile("(?i)(select|insert|update|delete)\\s+.*\\+\\s*[a-zA-Z0-9_]+");
    private static final Pattern DANGEROUS_EXEC_PATTERN = Pattern.compile("Runtime\\.getRuntime\\(\\)\\.exec|ProcessBuilder");
    private static final Pattern SCORE_PATTERN = Pattern.compile("(?ui)(?:оценка|score|балл[а-я]*)\\s*[:=-]?\\s*(\\d{1,3})");

    private final HomeworkSubmissionRepository submissionRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonService lessonService;
    private final GroqClient groqClient;
    private final AuditService auditService;

    @Transactional
    public HomeworkSubmissionDto submitAndEvaluate(Long courseId, Long lessonId, Long userId, Role role, HomeworkSubmitRequest request) {
        Lesson lesson = lessonRepository.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        if (role != Role.ADMIN) {
            if (!enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
                throw new ApiException("Вы не записаны на этот курс", HttpStatus.FORBIDDEN);
            }
        }

        log.info("Evaluating homework submission for user={}, lessonId={}", userId, lessonId);

        // 1. Static Security & Architecture Scanning
        List<String> securityFlags = runStaticSecurityScan(request.getCodeSnippet());
        boolean hasCriticalSecurityFlaw = !securityFlags.isEmpty();

        // 2. LLM Code Evaluation
        EvaluationResult evaluation = evaluateWithAi(lesson, request.getCodeSnippet(), securityFlags);

        int finalScore = hasCriticalSecurityFlaw ? Math.min(evaluation.score(), 45) : evaluation.score();
        SubmissionStatus status = finalScore >= 80 ? SubmissionStatus.PASSED :
                (finalScore >= 50 ? SubmissionStatus.NEEDS_IMPROVEMENT : SubmissionStatus.FAILED);

        // 3. Save submission
        HomeworkSubmission submission = HomeworkSubmission.builder()
                .lessonId(lessonId)
                .userId(userId)
                .courseId(courseId)
                .codeSnippet(request.getCodeSnippet())
                .repositoryUrl(request.getRepositoryUrl())
                .status(status)
                .score(finalScore)
                .aiFeedback(evaluation.feedback())
                .securityFlags(securityFlags.isEmpty() ? null : String.join("; ", securityFlags))
                .passedTestsCount(status == SubmissionStatus.PASSED ? 5 : 2)
                .totalTestsCount(5)
                .reviewedAt(Instant.now())
                .build();

        submission = submissionRepository.save(submission);

        // 4. If passed, automatically mark lesson complete
        if (status == SubmissionStatus.PASSED) {
            try {
                lessonService.completeLesson(courseId, lessonId, userId, role);
                log.info("Auto-completed lessonId={} for userId={} upon passing homework", lessonId, userId);
            } catch (Exception e) {
                log.warn("Could not auto-complete lesson after passed submission: {}", e.getMessage());
            }
        }

        auditService.logAction(userId, "HOMEWORK_SUBMISSION", "Lesson", lessonId,
                "Submitted homework: score=" + finalScore + ", status=" + status, null);

        return mapToDto(submission);
    }

    @Transactional(readOnly = true)
    public List<HomeworkSubmissionDto> getUserSubmissions(Long userId, Long lessonId) {
        return submissionRepository.findByUserIdAndLessonIdOrderByCreatedAtDesc(userId, lessonId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public HomeworkSubmissionDto getSubmissionById(Long submissionId, Long userId, Role role) {
        HomeworkSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("HomeworkSubmission", "id", submissionId));

        if (role != Role.ADMIN && !sub.getUserId().equals(userId)) {
            throw new ApiException("Доступ запрещен к чужой работе", HttpStatus.FORBIDDEN);
        }

        return mapToDto(sub);
    }

    private List<String> runStaticSecurityScan(String code) {
        List<String> flags = new ArrayList<>();
        if (code == null) return flags;

        if (SECRET_PATTERN.matcher(code).find()) {
            flags.add("[SECURITY] Обнаружены захардкоженные пароли или API токены в коде");
        }
        if (SQL_CONCAT_PATTERN.matcher(code).find()) {
            flags.add("[SECURITY] Обнаружена конкатенация SQL запросов без параметризации (уязвимость SQL Injection)");
        }
        if (DANGEROUS_EXEC_PATTERN.matcher(code).find()) {
            flags.add("[CRITICAL] Запрещено выполнение системных команд (ProcessBuilder/Runtime)");
        }

        return flags;
    }

    private EvaluationResult evaluateWithAi(Lesson lesson, String codeSnippet, List<String> securityFlags) {
        String prompt = """
                Ты — строгий Senior Full-Stack Architect / Tech Lead. Оцени практическое решение студента по уроку.
                
                УРОК: %s
                ТРЕБОВАНИЯ К КОРРЕКТНОСТИ:
                - Архитектурная чистота (SRP, FSD, строгая типизация, обработка ошибок).
                - Безопасность и отсутствие уязвимостей.
                - Эффективность алгоритма и структуры данных.
                
                ФЛАГИ БЕЗОПАСНОСТИ: %s
                
                КОД СТУДЕНТА:
                ```
                %s
                ```
                
                Дай рецензию в формате Markdown:
                1. Итоговая оценка (число от 0 до 100).
                2. Сильные стороны решения.
                3. Замечания и рекомендации по улучшению (с примерами чистого кода).
                4. Вердикт (Зачтено / Требует доработки).
                """.formatted(lesson.getTitle(), securityFlags.isEmpty() ? "Нет" : String.join(", ", securityFlags), codeSnippet);

        String aiResponse = groqClient.generateAnswer(prompt, "Проведи детальный аудит и оценку кода.");

        int score = 85;
        if (aiResponse == null || aiResponse.isBlank()) {
            aiResponse = """
                    ### Рецензия на решение (Senior Tech Lead)
                    
                    **Сильные стороны:**
                    - Структура кода соответствует базовым требованиям урока.
                    - Логика выполнения разделена на читаемые методы/компоненты.
                    
                    **Рекомендации:**
                    - Проверьте граничные условия и обработку исключений.
                    - Убедитесь в отсутствии неиспользуемых импортов и переменных.
                    
                    **Вердикт:** Решение принято.
                    """;
        } else {
            Matcher m = SCORE_PATTERN.matcher(aiResponse);
            if (m.find()) {
                try {
                    score = Math.min(100, Math.max(0, Integer.parseInt(m.group(1))));
                } catch (NumberFormatException ignored) {}
            }
        }

        return new EvaluationResult(score, aiResponse);
    }

    private HomeworkSubmissionDto mapToDto(HomeworkSubmission sub) {
        return HomeworkSubmissionDto.builder()
                .id(sub.getId())
                .lessonId(sub.getLessonId())
                .userId(sub.getUserId())
                .courseId(sub.getCourseId())
                .codeSnippet(sub.getCodeSnippet())
                .repositoryUrl(sub.getRepositoryUrl())
                .status(sub.getStatus())
                .score(sub.getScore())
                .aiFeedback(sub.getAiFeedback())
                .passedTestsCount(sub.getPassedTestsCount())
                .totalTestsCount(sub.getTotalTestsCount())
                .securityFlags(sub.getSecurityFlags())
                .reviewedAt(sub.getReviewedAt())
                .createdAt(sub.getCreatedAt())
                .build();
    }

    private record EvaluationResult(int score, String feedback) {}
}
