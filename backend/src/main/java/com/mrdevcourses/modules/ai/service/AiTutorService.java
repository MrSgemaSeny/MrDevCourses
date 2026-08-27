package com.mrdevcourses.modules.ai.service;

import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.common.exception.ResourceNotFoundException;
import com.mrdevcourses.modules.audit.service.AuditService;
import com.mrdevcourses.modules.ai.dto.AiTutorRequest;
import com.mrdevcourses.modules.ai.dto.AiTutorResponse;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiTutorService {

    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GroqClient groqClient;
    private final PromptSanitizer promptSanitizer;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public AiTutorResponse askTutor(AiTutorRequest request, Long userId, Role userRole) {
        Lesson lesson = lessonRepository.findByIdAndCourseId(request.getLessonId(), request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", request.getLessonId()));

        if (userRole != Role.ADMIN) {
            if (!enrollmentRepository.existsByUserIdAndCourseId(userId, request.getCourseId())) {
                throw new ApiException("Вы не записаны на этот курс", HttpStatus.FORBIDDEN);
            }
        }

        String cleanQuestion = promptSanitizer.sanitizeInput(request.getQuestion());

        String systemPrompt = """
                Ты — профессиональный Senior AI-наставник образовательной платформы MrDevCourses.
                Твоя задача — помогать студенту глубоко понимать материал текущего урока.
                
                Правила:
                1. Отвечай кратко, ёмко, точно по существу и без воды.
                2. Опирайся в первую очередь на контекст урока, предоставленный ниже.
                3. Используй чистый Markdown для оформления кода и терминов.
                4. Если студент спрашивает о вещах, не связанных с программированием/уроком, вежливо направь его обратно к теме.
                
                КОНТЕКСТ УРОКА:
                Название: %s (День %d)
                Материал урока:
                %s
                """.formatted(lesson.getTitle(), lesson.getDayNumber(), lesson.getContent() != null ? lesson.getContent() : "");

        String rawAnswer = groqClient.generateAnswer(systemPrompt, cleanQuestion);
        boolean isFallback = false;

        if (rawAnswer == null || rawAnswer.isBlank()) {
            isFallback = true;
            rawAnswer = """
                    В уроке **"%s"** рассматриваются ключевые концепции дня №%d.
                    
                    Для успешного освоения материала:
                    1. Внимательно изучите видеоматериалы и примеры кода из описания.
                    2. Обратите внимание на термины в глоссарии справа.
                    3. Выполните практическое задание перед переходом к следующему дню.
                    
                    *(Режим локального ассистента: для генерации индивидуальных ответов задайте API-ключ GROQ в настройках).*
                    """.formatted(lesson.getTitle(), lesson.getDayNumber());
        }

        auditService.logAction(userId, "AI_TUTOR_QUERY", "Lesson", lesson.getId(),
                "Asked AI tutor on lesson: " + lesson.getTitle(), null);

        List<String> suggestedFollowUps = List.of(
                "Как применить это на практике?",
                "Какие частые ошибки бывают в этой теме?",
                "Поясни подробнее ключевой термин из урока"
        );

        return AiTutorResponse.builder()
                .answer(rawAnswer)
                .lessonTitle(lesson.getTitle())
                .suggestedFollowUps(suggestedFollowUps)
                .fallbackMode(isFallback)
                .build();
    }
}
