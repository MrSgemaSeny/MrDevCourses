package com.mrdevcourses.config;

import com.mrdevcourses.modules.ai.rag.model.GlossaryEmbedding;
import com.mrdevcourses.modules.ai.rag.repository.GlossaryEmbeddingRepository;
import com.mrdevcourses.modules.ai.rag.service.EmbeddingService;
import com.mrdevcourses.modules.ai.rag.service.LessonIngestionService;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.model.CourseModule;
import com.mrdevcourses.modules.course.repository.CourseModuleRepository;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.model.LessonMaterial;
import com.mrdevcourses.modules.lesson.model.LessonType;
import com.mrdevcourses.modules.lesson.model.MaterialType;
import com.mrdevcourses.modules.lesson.repository.LessonMaterialRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import com.mrdevcourses.modules.quiz.model.QuestionType;
import com.mrdevcourses.modules.quiz.model.Quiz;
import com.mrdevcourses.modules.quiz.model.QuizQuestion;
import com.mrdevcourses.modules.quiz.model.QuizQuestionOption;
import com.mrdevcourses.modules.quiz.repository.QuizQuestionOptionRepository;
import com.mrdevcourses.modules.quiz.repository.QuizQuestionRepository;
import com.mrdevcourses.modules.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final LessonMaterialRepository lessonMaterialRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizQuestionOptionRepository quizQuestionOptionRepository;
    private final UserRepository userRepository;
    private final GlossaryEmbeddingRepository glossaryEmbeddingRepository;
    private final LessonIngestionService lessonIngestionService;
    private final EmbeddingService embeddingService;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialData() {
        if (courseRepository.count() > 0) {
            log.info("Database already seeded with courses, skipping initial seeding.");
            return;
        }

        log.info("Seeding initial MrDevCourses data with domain hierarchy, modules & quizzes...");

        // 1. Admin User
        if (!userRepository.existsByEmail("admin@mrdevcourses.com")) {
            User admin = User.builder()
                    .email("admin@mrdevcourses.com")
                    .name("Mr Developer Admin")
                    .avatarUrl("https://github.com/identicons/mrdev.png")
                    .role(Role.ADMIN)
                    .createdAt(Instant.now())
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin@mrdevcourses.com");
        }

        // 2. Primary Course: Вайбкодинг с нуля
        Course vibeCourse = Course.builder()
                .title("Вайбкодинг: от Новичка до Продукта за 5 недель")
                .description("Практический курс по разработке современных веб-приложений с использованием ИИ, архитектурных протоколов и лучших инженерных практик. 1 день — 1 урок.")
                .slug("vibecoding-zero-to-one")
                .active(true)
                .createdAt(Instant.now())
                .build();
        Course savedCourse = courseRepository.save(vibeCourse);

        // 3. Course Modules
        CourseModule module1 = CourseModule.builder()
                .course(savedCourse)
                .title("Модуль 1: Архитектурный фундамент, AI и UI")
                .description("Основы мышления senior-разработчика, промпт-инжиниринг, FSD и React 19.")
                .sortOrder(1)
                .isFreePreview(true)
                .build();
        CourseModule savedModule1 = courseModuleRepository.save(module1);

        CourseModule module2 = CourseModule.builder()
                .course(savedCourse)
                .title("Модуль 2: Бэкенд, Безопасность и Production Релиз")
                .description("Spring Boot 3, Transactional Outbox, JWT в httpOnly cookie и деплой.")
                .sortOrder(2)
                .isFreePreview(false)
                .build();
        CourseModule savedModule2 = courseModuleRepository.save(module2);

        // 4. Glossary terms for course
        List<GlossaryEmbedding> terms = List.of(
                createGlossaryEmbedding(savedCourse.getId(), "RAG", "AI", "Retrieval-Augmented Generation — архитектурный паттерн обогащения промпта LLM актуальными векторными и текстовыми фрагментами из базы данных."),
                createGlossaryEmbedding(savedCourse.getId(), "pgvector", "Database", "Расширение PostgreSQL для хранения векторных эмбеддингов и быстрого поиска ближайших соседей по HNSW и IVFFlat индексам."),
                createGlossaryEmbedding(savedCourse.getId(), "FSD", "Frontend", "Feature-Sliced Design — архитектурная методология для фронтенда с разделением на app, pages, widgets, features, entities, shared."),
                createGlossaryEmbedding(savedCourse.getId(), "IDOR", "Security", "Insecure Direct Object Reference — уязвимость авторизации, когда пользователь может обращаться к чужим объектам через подмену идентификатора."),
                createGlossaryEmbedding(savedCourse.getId(), "Transactional Outbox", "Architecture", "Паттерн надежной доставки сообщений, сохраняющий события в таблицу БД в рамках той же транзакции, что и бизнес-сущность.")
        );
        glossaryEmbeddingRepository.saveAll(terms);

        // 5. Lessons for Course
        Lesson l1 = Lesson.builder()
                .course(savedCourse)
                .module(savedModule1)
                .title("День 1: Мышление разработчика и настройка окружения")
                .dayNumber(1)
                .sortOrder(1)
                .lessonType(LessonType.VIDEO)
                .durationMinutes(25)
                .isFreePreview(true)
                .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                .content("""
                        ### Введение в курс
                        Добро пожаловать в первый день обучения! Сегодня мы разберем:
                        - Как формулировать идеи в инженерные спецификации.
                        - Настройку редактора кода, терминала и пакетных менеджеров.
                        - Принципы Second Brain и протоколы фиксации контекста.
                        
                        ### Практическое задание
                        Настройте проект и создайте первый модуль с соблюдением FSD структуры.
                        """)
                .build();

        Lesson l2 = Lesson.builder()
                .course(savedCourse)
                .module(savedModule1)
                .title("День 2: Промпт-инжиниринг, RAG и проектирование архитектуры")
                .dayNumber(2)
                .sortOrder(2)
                .lessonType(LessonType.ARTICLE)
                .durationMinutes(30)
                .isFreePreview(true)
                .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                .content("""
                        ### Промпт-инжиниринг и RAG
                        Изучаем как управлять ИИ-агентами:
                        - Разница между базовыми и профессиональными системными инструкциями.
                        - Архитектура RAG (Retrieval-Augmented Generation) и векторизация через pgvector.
                        - Паттерн Smart Merge и DTO-структурирование.
                        
                        ### Практическое задание
                        Пройдите квиз по архитектуре RAG и напишите DTO-контракт.
                        """)
                .build();

        Lesson l3 = Lesson.builder()
                .course(savedCourse)
                .module(savedModule1)
                .title("День 3: Разработка первого UI на React и Tailwind v4")
                .dayNumber(3)
                .sortOrder(3)
                .lessonType(LessonType.PRACTICE)
                .durationMinutes(40)
                .isFreePreview(false)
                .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                .content("""
                        ### Frontend Foundations
                        - Структура Feature-Sliced Design (FSD).
                        - Настройка Tailwind CSS v4 с темной эстетикой (#0d1117).
                        - Компонентный подход, TanStack Query и типизация на TypeScript.
                        
                        ### Практическое задание
                        Создайте интерактивный виджет для отправки домашних заданий и отправьте код на AI-ревью.
                        """)
                .build();

        Lesson l4 = Lesson.builder()
                .course(savedCourse)
                .module(savedModule2)
                .title("День 4: Бэкенд на Spring Boot 3 и безопасность")
                .dayNumber(4)
                .sortOrder(4)
                .lessonType(LessonType.QUIZ)
                .durationMinutes(35)
                .isFreePreview(false)
                .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                .content("""
                        ### Backend & Security
                        - Архитектура модульного монолита и Transactional Outbox.
                        - Spring Security 6, Google OAuth2 и JWT в httpOnly cookie.
                        - Защита от IDOR и безопасность на уровне строк через SecurityUtils.
                        
                        ### Аттестация
                        Пройдите итоговый квиз по безопасности Spring Boot 3 для открытия следующего дня.
                        """)
                .build();

        Lesson l5 = Lesson.builder()
                .course(savedCourse)
                .module(savedModule2)
                .title("День 5: Деплой, CI/CD и релиз продукта")
                .dayNumber(5)
                .sortOrder(5)
                .lessonType(LessonType.VIDEO)
                .durationMinutes(45)
                .isFreePreview(false)
                .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                .content("""
                        ### Production Release
                        - Настройка GitHub Actions пайплайна с обязательным прогоном тестов.
                        - Контейнеризация и деплой на Fly.io / Vercel.
                        - Проверка логов, мониторинг и финальная генерация сертификата.
                        
                        ### Практическое задание
                        Настройте CI/CD сборку и выполните успешный деплой.
                        """)
                .build();

        List<Lesson> savedLessons = lessonRepository.saveAll(List.of(l1, l2, l3, l4, l5));
        log.info("Seeded 1 course, 2 modules and {} lessons successfully.", savedLessons.size());

        // 6. Seed Materials for Lesson 1 & 2
        LessonMaterial mat1 = LessonMaterial.builder()
                .lesson(savedLessons.get(0))
                .title("Шпаргалка: Архитектура FSD и правила именования")
                .materialType(MaterialType.CHEAT_SHEET)
                .url("https://feature-sliced.design/docs/get-started/overview")
                .sortOrder(1)
                .build();
        LessonMaterial mat2 = LessonMaterial.builder()
                .lesson(savedLessons.get(0))
                .title("Исходный код: Шаблон репозитория MrDev")
                .materialType(MaterialType.REPO_LINK)
                .url("https://github.com/MrSgemaSeny/MrDevCourses")
                .sortOrder(2)
                .build();
        lessonMaterialRepository.saveAll(List.of(mat1, mat2));

        // 7. Seed Quiz for Lesson 4
        Quiz quiz4 = Quiz.builder()
                .lesson(savedLessons.get(3))
                .title("Аттестация: Spring Security 6, JWT и Transactional Outbox")
                .description("Проверьте свои знания по защите REST API и надежной доставке событий.")
                .passingScorePercentage(80)
                .maxAttempts(5)
                .timeLimitSeconds(600)
                .build();
        Quiz savedQuiz = quizRepository.save(quiz4);

        QuizQuestion q1 = QuizQuestion.builder()
                .quiz(savedQuiz)
                .questionText("Где наиболее безопасно хранить JWT-токен на стороне браузера для защиты от XSS-атак?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(1)
                .sortOrder(1)
                .explanation("httpOnly cookie недоступны для JavaScript, что предотвращает их кражу вредоносными скриптами при XSS уязвимостях.")
                .build();
        QuizQuestion savedQ1 = quizQuestionRepository.save(q1);

        QuizQuestionOption opt1_1 = QuizQuestionOption.builder().question(savedQ1).optionText("В localStorage").isCorrect(false).sortOrder(1).build();
        QuizQuestionOption opt1_2 = QuizQuestionOption.builder().question(savedQ1).optionText("В защищенной httpOnly cookie").isCorrect(true).sortOrder(2).build();
        QuizQuestionOption opt1_3 = QuizQuestionOption.builder().question(savedQ1).optionText("В sessionStorage").isCorrect(false).sortOrder(3).build();
        quizQuestionOptionRepository.saveAll(List.of(opt1_1, opt1_2, opt1_3));

        QuizQuestion q2 = QuizQuestion.builder()
                .quiz(savedQuiz)
                .questionText("Какую проблему решает архитектурный паттерн Transactional Outbox?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(1)
                .sortOrder(2)
                .explanation("Паттерн Transactional Outbox гарантирует надежную доставку событий во внешние системы (брокеры, очереди) без потери данных при сбоях JVM.")
                .build();
        QuizQuestion savedQ2 = quizQuestionRepository.save(q2);

        QuizQuestionOption opt2_1 = QuizQuestionOption.builder().question(savedQ2).optionText("Ускоряет выполнение SQL-запросов SELECT").isCorrect(false).sortOrder(1).build();
        QuizQuestionOption opt2_2 = QuizQuestionOption.builder().question(savedQ2).optionText("Гарантирует надежную публикацию событий вместе с транзакцией БД").isCorrect(true).sortOrder(2).build();
        QuizQuestionOption opt2_3 = QuizQuestionOption.builder().question(savedQ2).optionText("Заменяет реляционную базу данных").isCorrect(false).sortOrder(3).build();
        quizQuestionOptionRepository.saveAll(List.of(opt2_1, opt2_2, opt2_3));

        // 8. Vector ingestion for all seeded lessons
        for (Lesson l : savedLessons) {
            lessonIngestionService.ingestLesson(l);
        }
        log.info("Vector ingestion and Quiz seeding completed successfully.");
    }

    private GlossaryEmbedding createGlossaryEmbedding(Long courseId, String term, String category, String definition) {
        float[] vec = embeddingService.generateEmbedding(term + ": " + definition);
        return GlossaryEmbedding.builder()
                .courseId(courseId)
                .term(term)
                .category(category)
                .definition(definition)
                .embedding(embeddingService.vectorToString(vec))
                .build();
    }
}
