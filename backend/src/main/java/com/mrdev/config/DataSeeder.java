package com.mrdev.config;

import com.mrdev.modules.ai.rag.model.GlossaryEmbedding;
import com.mrdev.modules.ai.rag.repository.GlossaryEmbeddingRepository;
import com.mrdev.modules.ai.rag.service.EmbeddingService;
import com.mrdev.modules.ai.rag.service.LessonIngestionService;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.CourseModule;
import com.mrdev.modules.course.repository.CourseModuleRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.model.LessonMaterial;
import com.mrdev.modules.lesson.model.LessonType;
import com.mrdev.modules.lesson.model.MaterialType;
import com.mrdev.modules.lesson.repository.LessonMaterialRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.quiz.model.QuestionType;
import com.mrdev.modules.quiz.model.Quiz;
import com.mrdev.modules.quiz.model.QuizQuestion;
import com.mrdev.modules.quiz.model.QuizQuestionOption;
import com.mrdev.modules.quiz.repository.QuizQuestionOptionRepository;
import com.mrdev.modules.quiz.repository.QuizQuestionRepository;
import com.mrdev.modules.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
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

        log.info("Seeding initial MrDeveloper data with domain hierarchy, modules & quizzes...");

        // 1. Admin User
        if (!userRepository.existsByEmail("admin@mrdev.com")) {
            User admin = User.builder()
                    .email("admin@mrdev.com")
                    .name("Mr Developer Admin")
                    .avatarUrl("https://github.com/identicons/mrdev.png")
                    .role(Role.ADMIN)
                    .createdAt(Instant.now())
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin@mrdev.com");
        }

        // 2. Primary Course: Вайбкодинг с нуля
        Course vibeCourse = Course.builder()
                .title("Вайбкодинг: от Новичка до Продукта за 5 недель")
                .description("Практический курс по разработке современных веб-приложений с использованием ИИ, архитектурных протоколов и лучших инженерных практик. 1 неделя — 6 уроков.")
                .slug("vibecoding-zero-to-one")
                .active(true)
                .createdAt(Instant.now())
                .build();
        Course savedCourse = courseRepository.save(vibeCourse);

        // 3. Course Modules (5 modules)
        CourseModule module1 = CourseModule.builder()
                .course(savedCourse)
                .title("Модуль 1: Архитектурный фундамент и AI-разработка")
                .description("Основы мышления senior-разработчика, промпт-инжиниринг, спецификации и AI-пайплайны.")
                .sortOrder(1)
                .isFreePreview(true)
                .build();

        CourseModule module2 = CourseModule.builder()
                .course(savedCourse)
                .title("Модуль 2: Современный Frontend и FSD Архитектура")
                .description("React 19, Feature-Sliced Design, Tailwind CSS v4 и реактивное кеширование с TanStack Query.")
                .sortOrder(2)
                .isFreePreview(false)
                .build();

        CourseModule module3 = CourseModule.builder()
                .course(savedCourse)
                .title("Модуль 3: Бэкенд на Spring Boot 3 и Базы Данных")
                .description("Модульный монолит, Java 17, PostgreSQL 17, Flyway миграции и оптимизация JPA & Hibernate.")
                .sortOrder(3)
                .isFreePreview(false)
                .build();

        CourseModule module4 = CourseModule.builder()
                .course(savedCourse)
                .title("Модуль 4: Безопасность, Rate Limiting и Векторная БД")
                .description("Spring Security 6, JWT в httpOnly cookie, защита от IDOR, Bucket4j и pgvector Hybrid RAG.")
                .sortOrder(4)
                .isFreePreview(false)
                .build();

        CourseModule module5 = CourseModule.builder()
                .course(savedCourse)
                .title("Модуль 5: Production-Ready, Outbox Engine, CI/CD и Релиз")
                .description("Transactional Outbox, AI Code Reviewer, OpenHTMLtoPDF сертификаты, аналитика когорт и деплой.")
                .sortOrder(5)
                .isFreePreview(false)
                .build();

        List<CourseModule> savedModules = courseModuleRepository.saveAll(List.of(module1, module2, module3, module4, module5));

        // 4. Glossary terms for course
        List<GlossaryEmbedding> terms = List.of(
                createGlossaryEmbedding(savedCourse.getId(), "RAG", "AI", "Retrieval-Augmented Generation — архитектурный паттерн обогащения промпта LLM актуальными векторными и текстовыми фрагментами из базы данных."),
                createGlossaryEmbedding(savedCourse.getId(), "pgvector", "Database", "Расширение PostgreSQL для хранения векторных эмбеддингов и быстрого поиска ближайших соседей по HNSW и IVFFlat индексам."),
                createGlossaryEmbedding(savedCourse.getId(), "FSD", "Frontend", "Feature-Sliced Design — архитектурная методология для фронтенда с разделением на app, pages, widgets, features, entities, shared."),
                createGlossaryEmbedding(savedCourse.getId(), "IDOR", "Security", "Insecure Direct Object Reference — уязвимость авторизации, когда пользователь может обращаться к чужим объектам через подмену идентификатора."),
                createGlossaryEmbedding(savedCourse.getId(), "Transactional Outbox", "Architecture", "Паттерн надежной доставки сообщений, сохраняющий события в таблицу БД в рамках той же транзакции, что и бизнес-сущность.")
        );
        glossaryEmbeddingRepository.saveAll(terms);

        // 5. Lessons for Course (30 lessons, 6 per module / 1 week = 6 lessons)
        List<Lesson> lessonsToSave = new ArrayList<>();

        // Module 1 / Неделя 1 (Lessons 1-6)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Мышление разработчика и настройка окружения", 1, LessonType.VIDEO, 25, true,
                "### Урок 1: Введение в курс\nДобро пожаловать в обучение! Разбираем постановку целей, Second Brain и сетап окружения."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Промпт-инжиниринг, спецификации и протоколы", 2, LessonType.ARTICLE, 30, true,
                "### Урок 2: Промпт-инжиниринг\nКак управлять AI-агентами через структурированные системные протоколы и четкие спецификации."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Настройка проекта, линтеры и Git-воркфлоу", 3, LessonType.VIDEO, 35, false,
                "### Урок 3: Базовый сетап\nИнициализация монорепозитория, правила коммитов, eslint, prettier и pre-commit хуки."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Векторный поиск, RAG и эмбеддинги", 4, LessonType.VIDEO, 35, false,
                "### Урок 4: Векторный RAG\nМатематика косинусного расстояния, модели эмбеддингов и семантический поиск по кодовой базе."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Практикум: Разработка UI дизайн-системы и сдача отчета", 5, LessonType.PRACTICE, 50, false,
                "### Урок 5: Сложный практикум\nСоздание переиспользуемых атомарных компонентов и отправка отчета на AI-ревью."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Инженерный дайджест: Разбор архитектурных ошибок и квиз", 6, LessonType.QUIZ, 15, false,
                "### Урок 6: Итоги 1-й недели\nИнформационный разбор типичных ошибок и легкий проверочный квиз."));

        // Module 2 / Неделя 2 (Lessons 7-12)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Feature-Sliced Design: архитектура слоев", 7, LessonType.VIDEO, 35, false,
                "### Урок 7: FSD Архитектура\nСлои app, pages, widgets, features, entities, shared. Правила импортов и изоляция модулей."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "React 19: хуки, оптимистичные мутации и рендер", 8, LessonType.ARTICLE, 30, false,
                "### Урок 8: React 19 Core\nНовые возможности React 19, useActionState, useOptimistic и Server Actions."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Стилизация и дизайн-система на Tailwind CSS v4", 9, LessonType.VIDEO, 40, false,
                "### Урок 9: Tailwind CSS v4\nCSS-first конфигурация, дизайн-токены, строгая темная палитра."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Управление состоянием и кеширование с TanStack Query", 10, LessonType.VIDEO, 35, false,
                "### Урок 10: TanStack Query v5\nКеширование запросов, инвалидация, фоновая ревалидация и обработка ошибок."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Практикум: Разработка REST сервиса с тестами и отчетом", 11, LessonType.PRACTICE, 55, false,
                "### Урок 11: Сложный практикум\nРеализация сервисного слоя, интеграционные тесты с WebMvcTest и сдача отчета."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Инженерный дайджест: Факапы REST API, лайфхаки и квиз", 12, LessonType.QUIZ, 15, false,
                "### Урок 12: Итоги 2-й недели\nРазбор антипаттернов API, полезные инструменты и легкий проверочный квиз."));

        // Module 3 / Неделя 3 (Lessons 13-18)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Модульный монолит на Spring Boot 3 и Java 17", 13, LessonType.VIDEO, 40, false,
                "### Урок 13: Spring Boot 3\nАрхитектура модульного монолита, разделение по пакетам modules, SRP и DI."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Проектирование схемы БД, PostgreSQL 17 и Flyway", 14, LessonType.ARTICLE, 35, false,
                "### Урок 14: Database Design\nРеляционная схема, внешние ключи, каскадные удаления, версионирование миграций Flyway."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "JPA & Hibernate: оптимизация запросов и N+1", 15, LessonType.VIDEO, 45, false,
                "### Урок 15: JPA Optimization\nEntityGraph, JOIN FETCH, проекции DTO, индексы и профилирование Hibernate SQL."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "DTO, маппинг, валидация и Global Exception Handling", 16, LessonType.VIDEO, 35, false,
                "### Урок 16: API Contracts\nСтандартизированный ApiResponse<T>, Bean Validation (@NotNull, @Size), ControllerAdvice."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Практикум: Оптимизация сложных запросов и отчет по производительности", 17, LessonType.PRACTICE, 55, false,
                "### Урок 17: Сложный практикум\nEXPLAIN ANALYZE, когортные воронки и формирование отчета по оптимизации SQL."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Инженерный дайджест: История падений реальных БД и квиз", 18, LessonType.QUIZ, 15, false,
                "### Урок 18: Итоги 3-й недели\nИнформационный обзор аварий в продакшене баз данных и закрепляющий квиз."));

        // Module 4 / Неделя 4 (Lessons 19-24)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Spring Security 6: Google OAuth2 и stateless JWT", 19, LessonType.VIDEO, 40, false,
                "### Урок 19: Spring Security 6\nSecurityFilterChain, Google OAuth2 Client, выпуск и валидация JWT токенов."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Защита от XSS, CSRF, IDOR и безопасные cookies", 20, LessonType.ARTICLE, 35, false,
                "### Урок 20: Web Security\nhttpOnly cookie (SameSite=Strict, Secure), IDOR защита в сервисах через SecurityUtils."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Token Bucket Rate Limiting с Bucket4j и Caffeine", 21, LessonType.VIDEO, 40, false,
                "### Урок 21: Rate Limiting\nОграничение запросов по IP и User ID, заголовки X-RateLimit-Remaining и Retry-After."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "pgvector: HNSW индексы и Hybrid RAG поиск", 22, LessonType.VIDEO, 45, false,
                "### Урок 22: Hybrid Search\nОбъединение векторного поиска по HNSW косинусу и полнотекстового поиска по pg_trgm."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Практикум: Аудит безопасности, IDOR тестирование и защитный отчет", 23, LessonType.PRACTICE, 60, false,
                "### Урок 23: Сложный практикум\nПентест эндпоинтов, исправление уязвимостей и сдача отчета по безопасности."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Инженерный дайджест: Истории эпичных взломов, Security-мемы и квиз", 24, LessonType.QUIZ, 15, false,
                "### Урок 24: Итоги 4-й недели\nРазвлекательно-информационный обзор утечек данных в IT и квиз."));

        // Module 5 / Неделя 5 (Lessons 25-30)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Transactional Outbox Pattern и надежные события", 25, LessonType.VIDEO, 40, false,
                "### Урок 25: Transactional Outbox\nТаблица outbox_events, фоновый OutboxProcessor (@Scheduled) и гарантия доставки at-least-once."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "AI Code Reviewer и автоматический грейдер заданий", 26, LessonType.ARTICLE, 35, false,
                "### Урок 26: AI Reviewer\nСтатический анализ кода, проверка безопасности регулярными выражениями и LLM-грейдинг."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Генерация PDF-сертификатов с OpenHTMLtoPDF", 27, LessonType.VIDEO, 45, false,
                "### Урок 27: PDF Certificates\nРендеринг HTML-шаблона в Thymeleaf, конвертация в PDF и верификация по уникальному коду."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Аналитика когорт, удержание и воронки студентов", 28, LessonType.ARTICLE, 35, false,
                "### Урок 28: Cohort Analytics\nРасчет retention rate по урокам, воронка завершения уроков и выявление дроп-оффов."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Выпускной практикум: Финальная сборка MVP и сводный отчет", 29, LessonType.PRACTICE, 60, false,
                "### Урок 29: Сложный выпускной практикум\nИнтеграция всех модулей, подготовка продакшн-бандла и сдача итогового отчета."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Финишная прямая: Инсайты курса, награждение и выдача сертификата", 30, LessonType.QUIZ, 20, false,
                "### Урок 30: Торжественное завершение\nПодведение итогов 5 недель, генерация именного диплома и дальнейшие шаги."));


        List<Lesson> savedLessons = lessonRepository.saveAll(lessonsToSave);
        log.info("Seeded 1 course, 5 modules and {} lessons successfully.", savedLessons.size());

        // 6. Seed Materials
        LessonMaterial mat1 = LessonMaterial.builder()
                .lesson(savedLessons.get(0))
                .title("Шпаргалка: Архитектура FSD и правила именования")
                .materialType(MaterialType.CHEAT_SHEET)
                .url("https://feature-sliced.design/docs/get-started/overview")
                .sortOrder(1)
                .build();
        LessonMaterial mat2 = LessonMaterial.builder()
                .lesson(savedLessons.get(0))
                .title("Исходный код: Шаблон репозитория MrDeveloper")
                .materialType(MaterialType.REPO_LINK)
                .url("https://github.com/MrSgemaSeny/MrDeveloper")
                .sortOrder(2)
                .build();
        lessonMaterialRepository.saveAll(List.of(mat1, mat2));

        // 7. Seed Quizzes for quiz lessons (Lesson 5, 11, 17, 23, 29)
        Quiz quiz23 = Quiz.builder()
                .lesson(savedLessons.get(22))
                .title("Аттестация: Spring Security 6, JWT и Transactional Outbox")
                .description("Проверьте свои знания по защите REST API и надежной доставке событий.")
                .passingScorePercentage(80)
                .maxAttempts(5)
                .timeLimitSeconds(600)
                .build();
        Quiz savedQuiz = quizRepository.save(quiz23);

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
                .explanation("Паттерн Transactional Outbox гарантирует надежную доставку событий во внешние системы без потери данных при сбоях JVM.")
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

    private Lesson buildLesson(Course course, CourseModule module, String title, int dayNumber,
                               LessonType type, int durationMinutes, boolean isFree, String content) {
        return Lesson.builder()
                .course(course)
                .module(module)
                .title(title)
                .dayNumber(dayNumber)
                .sortOrder(dayNumber)
                .lessonType(type)
                .durationMinutes(durationMinutes)
                .isFreePreview(isFree)
                .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                .content(content)
                .build();
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
