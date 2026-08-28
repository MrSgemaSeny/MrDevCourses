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

        log.info("Seeding initial MrDeveloperdata with domain hierarchy, modules & quizzes...");

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
                .description("Практический курс по разработке современных веб-приложений с использованием ИИ, архитектурных протоколов и лучших инженерных практик. 1 день — 1 урок.")
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

        // 5. Lessons for Course (30 lessons, 6 per module)
        List<Lesson> lessonsToSave = new ArrayList<>();

        // Module 1: Lessons 1-6
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Мышление разработчика и настройка окружения", 1, LessonType.VIDEO, 25, true,
                "### Введение в курс\nДобро пожаловать в первый день обучения! Разбираем постановку целей, Second Brain и сетап окружения."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Промпт-инжиниринг, спецификации и протоколы", 2, LessonType.ARTICLE, 30, true,
                "### Промпт-инжиниринг\nКак управлять AI-агентами через структурированные системные протоколы и четкие спецификации."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Настройка проекта, линтеры и Git-воркфлоу", 3, LessonType.PRACTICE, 40, false,
                "### Базовый сетап\nИнициализация монорепозитория, правила коммитов, eslint, prettier и pre-commit хуки."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Векторный поиск, RAG и эмбеддинги", 4, LessonType.VIDEO, 35, false,
                "### Векторный RAG\nМатематика косинусного расстояния, модели эмбеддингов и семантический поиск по кодовой базе."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Аттестация по базовым протоколам и AI-разработке", 5, LessonType.QUIZ, 20, false,
                "### Квиз по модулю 1\nПроверка фундаментальных знаний по архитектурному мышлению и работе с AI."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Практикум: создание первого автономного AI-пайплайна", 6, LessonType.PRACTICE, 45, false,
                "### Практикум\nРеализация сквозного сценария интеграции LLM с локальной базой знаний."));

        // Module 2: Lessons 7-12
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Feature-Sliced Design: архитектура слоев", 7, LessonType.VIDEO, 35, false,
                "### FSD Архитектура\nСлои app, pages, widgets, features, entities, shared. Правила импортов и изоляция модулей."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "React 19: хуки, оптимистичные мутации и рендер", 8, LessonType.ARTICLE, 30, false,
                "### React 19 Core\nНовые возможности React 19, useActionState, useOptimistic и Server Actions."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Стилизация и дизайн-система на Tailwind CSS v4", 9, LessonType.PRACTICE, 40, false,
                "### Tailwind CSS v4\nCSS-first конфигурация, дизайн-токены, строгая темная палитра (#0d1117)."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Управление состоянием и кеширование с TanStack Query", 10, LessonType.VIDEO, 35, false,
                "### TanStack Query v5\nКеширование запросов, инвалидация, фоновая ревалидация и обработка ошибок."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Тестирование фронтенда: Vitest и React Testing Library", 11, LessonType.QUIZ, 25, false,
                "### Frontend Testing\nКвиз и практика по компонентному тестированию и мокированию API."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Практикум: разработка интерактивного дашборда", 12, LessonType.PRACTICE, 50, false,
                "### Практикум\nСоздание полнофункционального личного кабинета студента со статистикой прогресса."));

        // Module 3: Lessons 13-18
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Модульный монолит на Spring Boot 3 и Java 17", 13, LessonType.VIDEO, 40, false,
                "### Spring Boot 3\nАрхитектура модульного монолита, разделение по пакетам modules, SRP и DI."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Проектирование схемы БД, PostgreSQL 17 и Flyway", 14, LessonType.ARTICLE, 35, false,
                "### Database Design\nРеляционная схема, внешние ключи, каскадные удаления, версионирование миграций Flyway."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "JPA & Hibernate: оптимизация запросов и N+1", 15, LessonType.PRACTICE, 45, false,
                "### JPA Optimization\nEntityGraph, JOIN FETCH, проекции DTO, индексы и профилирование Hibernate SQL."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "DTO, маппинг, валидация и Global Exception Handling", 16, LessonType.VIDEO, 35, false,
                "### API Contracts\nСтандартизированный ApiResponse<T>, Bean Validation (@NotNull, @Size), ControllerAdvice."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Квиз по архитектуре сервисов и репозиториев", 17, LessonType.QUIZ, 25, false,
                "### Квиз по модулю 3\nТестирование знаний транзакционности (@Transactional), уровней изоляции и Spring Data."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Практикум: построение REST API с Row-Level Security", 18, LessonType.PRACTICE, 50, false,
                "### Практикум\nРеализация API с фильтрацией данных по текущему аутентифицированному пользователю."));

        // Module 4: Lessons 19-24
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Spring Security 6: Google OAuth2 и stateless JWT", 19, LessonType.VIDEO, 40, false,
                "### Spring Security 6\nSecurityFilterChain, Google OAuth2 Client, выпуск и валидация JWT токенов."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Защита от XSS, CSRF, IDOR и безопасные cookies", 20, LessonType.ARTICLE, 35, false,
                "### Web Security\nhttpOnly cookie (SameSite=Strict, Secure), IDOR защита в сервисах через SecurityUtils."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Token Bucket Rate Limiting с Bucket4j и Caffeine", 21, LessonType.PRACTICE, 40, false,
                "### Rate Limiting\nОграничение запросов по IP и User ID, заголовки X-RateLimit-Remaining и Retry-After."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "pgvector: HNSW индексы и Hybrid RAG поиск", 22, LessonType.VIDEO, 45, false,
                "### Hybrid Search\nОбъединение векторного поиска по HNSW косинусу и полнотекстового поиска по pg_trgm."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Аттестация: Аутентификация, IDOR и pgvector", 23, LessonType.QUIZ, 30, false,
                "### Квиз по безопасности и RAG\nКомплексная проверка устойчивости приложения к распространенным атакам."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Практикум: защита эндпоинтов и проверка на уязвимости", 24, LessonType.PRACTICE, 50, false,
                "### Практикум\nНаписание интеграционных тестов с MockMvc для проверки разграничения прав доступа."));

        // Module 5: Lessons 25-30
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Transactional Outbox Pattern и надежные события", 25, LessonType.VIDEO, 40, false,
                "### Transactional Outbox\nТаблица outbox_events, фоновый OutboxProcessor (@Scheduled) и гарантия доставки at-least-once."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "AI Code Reviewer и автоматический грейдер заданий", 26, LessonType.ARTICLE, 35, false,
                "### AI Reviewer\nСтатический анализ кода, проверка безопасности регулярными выражениями и LLM-грейдинг."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Генерация PDF-сертификатов с OpenHTMLtoPDF", 27, LessonType.PRACTICE, 45, false,
                "### PDF Certificates\nРендеринг HTML-шаблона в Thymeleaf, конвертация в PDF и верификация по уникальному коду."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Аналитика когорт, удержание и воронки студентов", 28, LessonType.VIDEO, 35, false,
                "### Cohort Analytics\nРасчет retention rate по дням, воронка завершения уроков и выявление дроп-оффов."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Финальная аттестация по всей платформе", 29, LessonType.QUIZ, 30, false,
                "### Финальный экзамен\nИтоговый тест по всем модулям программы для допуска к выдаче сертификата."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "CI/CD, Fly.io деплой и получение сертификата", 30, LessonType.PRACTICE, 60, false,
                "### Production Release\nДеплой бэкенда на Fly.io, фронтенда на Vercel, прогон автотестов и выпуск сертификата."));

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
