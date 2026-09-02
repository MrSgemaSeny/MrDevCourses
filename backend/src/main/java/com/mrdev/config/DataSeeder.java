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
import org.springframework.context.annotation.Profile;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@Profile("!prod")
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

        // 2. Primary Course: MrDeveloper
        Course vibeCourse = Course.builder()
                .title("MrDeveloper")
                .description("Практический курс по разработке современных веб-приложений с использованием ИИ, архитектурных протоколов и лучших инженерных практик. 5 модулей, 30 уроков.")
                .slug("mrdeveloper")
                .active(true)
                .createdAt(Instant.now())
                .build();
        Course savedCourse = courseRepository.save(vibeCourse);

        // 3. Course Modules (5 modules / 5 weeks)
        CourseModule module1 = CourseModule.builder()
                .course(savedCourse)
                .title("Неделя 1 — Введение и инструментарий")
                .description("Вайбкодинг как методология, настройка окружения, Git и GitHub с нуля, структура проекта и MVP-мышление, бизнес-идея и первый лендинг.")
                .sortOrder(1)
                .isFreePreview(true)
                .build();

        CourseModule module2 = CourseModule.builder()
                .course(savedCourse)
                .title("Неделя 2 — Frontend-разработка (Маркетплейс)")
                .description("Feature-Sliced Design, старт проекта, ролевая модель покупатель/продавец, деплой на GitHub Pages, code review через Claude и финал маркетплейса.")
                .sortOrder(2)
                .isFreePreview(false)
                .build();

        CourseModule module3 = CourseModule.builder()
                .course(savedCourse)
                .title("Неделя 3 — Full-Stack + 3D (Трекер денег)")
                .description("Системная архитектура, инициализация full-stack, RBAC и JWT, Google OAuth 2.0, Three.js 3D-сцена и Second Brain разработчика, code review и деплой.")
                .sortOrder(3)
                .isFreePreview(false)
                .build();

        CourseModule module4 = CourseModule.builder()
                .course(savedCourse)
                .title("Неделя 4 — CRM: Kanban + Trackers")
                .description("Полное планирование продукта, технический foundation, самостоятельная реализация, Telegram Bot интеграция, CI/CD pipeline и production-режим.")
                .sortOrder(4)
                .isFreePreview(false)
                .build();

        CourseModule module5 = CourseModule.builder()
                .course(savedCourse)
                .title("Неделя 5 — Pensee (всё в одном)")
                .description("Архитектура финального продукта, LLM API, AI-ассистент со стримингом, RAG-система и AI Core, Google SMTP и финальный релиз Pensee.")
                .sortOrder(5)
                .isFreePreview(false)
                .build();

        List<CourseModule> savedModules = courseModuleRepository.saveAll(List.of(module1, module2, module3, module4, module5));

        // 4. Glossary terms for course
        List<GlossaryEmbedding> terms = List.of(
                createGlossaryEmbedding(savedCourse.getId(), "Вайбкодинг", "AI", "Подход к разработке ПО, где разработчик управляет архитектурой и логикой через ИИ-агентов и системные протоколы."),
                createGlossaryEmbedding(savedCourse.getId(), "FSD", "Frontend", "Feature-Sliced Design — архитектурная методология для фронтенда с разделением на app, pages, widgets, features, entities, shared."),
                createGlossaryEmbedding(savedCourse.getId(), "Three.js", "Frontend", "Библиотека для создания интерактивной 3D-графики в браузере с использованием WebGL."),
                createGlossaryEmbedding(savedCourse.getId(), "Second Brain", "Architecture", "Методология организации цифровой базы знаний для структурирования контекста, решений и проектов."),
                createGlossaryEmbedding(savedCourse.getId(), "Pensee", "Architecture", "Финальный выпускной пет-проект супераппа «Всё в одном» (задачи, финансы, база знаний, AI).")
        );
        glossaryEmbeddingRepository.saveAll(terms);

        // 5. Lessons for Course (30 lessons, 6 per module / 1 week = 6 lessons)
        List<Lesson> lessonsToSave = new ArrayList<>();

        // Module 1 / Неделя 1 (Lessons 1-6)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Вайбкодинг как методология: сравнение с классической разработкой, место AI-ассистентов в современном IT-рынке", 1, LessonType.VIDEO, 25, true,
                "### Урок 1: Вайбкодинг как методология\nСравнение с классической разработкой, роль и место AI-ассистентов в современном IT-рынке."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Настройка рабочего окружения: VS Code, Cursor, Antigravity, Claude, ChatGPT, Gemini — установка и верификация", 2, LessonType.VIDEO, 25, true,
                "### Урок 2: Настройка рабочего окружения\nПошаговая установка, верификация и тестирование тулинга: VS Code, Cursor, Antigravity, Claude, ChatGPT, Gemini."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Git и GitHub с нуля: инициализация репозитория, первый коммит, GitHub Pages — деплой статики", 3, LessonType.ARTICLE, 20, true,
                "### Урок 3: Git и GitHub с нуля\nИнициализация локального репозитория, первый коммит, ветвление и публикация статического сайта на GitHub Pages."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Структура проекта и MVP-мышление: файловая архитектура, README, agents.md", 4, LessonType.VIDEO, 30, false,
                "### Урок 4: Структура проекта и MVP-мышление\nФайловая архитектура проекта, составление README по инженерному стандарту, настройка правил `.agents/` и контекста для AI."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Бизнес-идея: Customer Problem Statement, целевая аудитория, feature scope", 5, LessonType.PRACTICE, 45, false,
                "### Урок 5: Бизнес-идея и скоупинг\nФормулирование Customer Problem Statement, определение целевой аудитории, декомпозиция минимального feature scope."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Лендинг бизнес-идеи: вёрстка через AI-ассистента, публикация на GitHub Pages", 6, LessonType.QUIZ, 20, false,
                "### Урок 6: Лендинг бизнес-идеи\nВёрстка продающего лендинга через AI-ассистента, адаптивность, анимации и публикация онлайн на GitHub Pages."));

        // Module 2 / Неделя 2 (Lessons 7-12)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Feature-Sliced Design: слои, сегменты, публичное API модуля — планировка маркетплейса", 7, LessonType.VIDEO, 30, false,
                "### Урок 7: Feature-Sliced Design\nМетодология FSD: слои, сегменты, публичное API модуля. Архитектурная планировка маркетплейса."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Старт проекта: роутинг, страницы, базовая бизнес-логика", 8, LessonType.VIDEO, 35, false,
                "### Урок 8: Старт проекта Маркетплейс\nНастройка клиентского роутинга, создание страниц, каталога товаров и базовой бизнес-логики."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Углубление логики: ролевая модель (покупатель / продавец), условный рендеринг по роли", 9, LessonType.ARTICLE, 30, false,
                "### Урок 9: Ролевая модель Маркетплейса\nРеализация ролевой модели (покупатель / продавец), условный рендеринг компонентов по активной роли."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Деплой на GitHub Pages: конфигурация base path, сборка и публикация", 10, LessonType.VIDEO, 40, false,
                "### Урок 10: Деплой Маркетплейса\nКонфигурация base path в Vite, настройка SPA-редиректов, сборка и публикация на GitHub Pages."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Code review через Claude: рефакторинг, исправление архитектурных нарушений, финальный дизайн-аудит", 11, LessonType.PRACTICE, 50, false,
                "### Урок 11: Code review через Claude\nГлубокий рефакторинг кода, исправление архитектурных нарушений слоев FSD, финальный дизайн-аудит."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Финал маркетплейса: приёмочное тестирование, ретроспектива", 12, LessonType.QUIZ, 20, false,
                "### Урок 12: Финал Маркетплейса\nПриёмочное тестирование всех пользовательских сценариев, ретроспектива и упаковка проекта в портфолио."));

        // Module 3 / Неделя 3 (Lessons 13-18)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Системная архитектура: монолит vs микросервисы, выбор стека, ERD базы данных — планировка трекера", 13, LessonType.VIDEO, 35, false,
                "### Урок 13: Системная архитектура\nСравнение монолита и микросервисов, обоснование стека, проектирование ERD схемы базы данных для трекера денег."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Инициализация full-stack: настройка фронтенда, бэкенда и БД, связка окружений", 14, LessonType.VIDEO, 35, false,
                "### Урок 14: Инициализация Full-Stack\nНастройка бэкенда, фронтенда и базы данных PostgreSQL, конфигурация CORS и связка окружений."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Закладка архитектуры: RBAC, JWT-аутентификация, защищённые роуты, миграции схемы", 15, LessonType.ARTICLE, 30, false,
                "### Урок 15: Закладка архитектуры безопасности\nРолевая модель RBAC, stateless JWT аутентификация в httpOnly cookies, защита эндпоинтов и миграции схемы через Flyway."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "OAuth 2.0 через Google: интеграция провайдера, мультиаккаунтность, проверка ролей в админ-панели", 16, LessonType.VIDEO, 40, false,
                "### Урок 16: Google OAuth 2.0\nИнтеграция Google OAuth 2.0, обработка мультиаккаунтности, проверка ролей и разграничение доступа в админ-панели."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Three.js: 3D-сцена, анимации, интерактив — Second Brain разработчика: Notion/Obsidian система", 17, LessonType.PRACTICE, 50, false,
                "### Урок 17: Three.js 3D и Second Brain\nСоздание интерактивной 3D-сцены на Three.js для визуализации финансовых потоков. Внедрение Second Brain системы."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Code review: масштабируемость архитектуры, рефакторинг, финальный деплой Render + Vercel", 18, LessonType.QUIZ, 20, false,
                "### Урок 18: Code review и Деплой Трекера денег\nАнализ масштабируемости архитектуры, рефакторинг сервисного слоя, деплой бэкенда на Render и фронтенда на Vercel."));

        // Module 4 / Неделя 4 (Lessons 19-24)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Полное планирование продукта: user stories, архитектурное решение, выбор стека с обоснованием", 19, LessonType.VIDEO, 35, false,
                "### Урок 19: Планирование CRM продукта\nСоставление User Stories, проектирование API контрактов, выбор библиотек для Drag & Drop и стейт-менеджмента."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Технический foundation: README по стандарту, углублённый Second Brain, финализация tech stack", 20, LessonType.VIDEO, 35, false,
                "### Урок 20: Технический foundation\nОформление репозитория по стандарту, углубленный Second Brain, настройка базовых сущностей и репозиториев."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Самостоятельная работа студента: декомпозиция на фазы, написание промптов, старт реализации", 21, LessonType.ARTICLE, 30, false,
                "### Урок 21: Самостоятельная реализация CRM\nДекомпозиция на этапы, составление промптов для генерации колонок, карточек и фильтрации задач."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Telegram Bot: webhook-интеграция, алерты, уведомления о событиях CRM", 22, LessonType.VIDEO, 40, false,
                "### Урок 22: Telegram Bot для CRM\nИнтеграция Telegram-бота, настройка вебхуков, оперативные алерты и уведомления о смене статусов задач."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Code review + CI/CD pipeline: GitHub Actions, деплой на Vercel (фронт) и Render (бэк)", 23, LessonType.PRACTICE, 60, false,
                "### Урок 23: CI/CD Pipeline\nПостроение CI/CD пайплайна на GitHub Actions: автоматический запуск тестов, деплой фронтенда на Vercel и бэкенда на Render."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Production-режим: smoke testing, мониторинг, работа с живыми данными", 24, LessonType.QUIZ, 20, false,
                "### Урок 24: Production-режим CRM\nПроведение smoke testing, настройка логирования и мониторинга, валидация работы CRM с живыми данными."));

        // Module 5 / Неделя 5 (Lessons 25-30)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Архитектура финального продукта: scope, интеграционная карта всех компонентов — старт", 25, LessonType.VIDEO, 40, false,
                "### Урок 25: Архитектура Pensee\nАрхитектура финального продукта, составление интеграционной карты компонентов, проектирование сквозных потоков данных."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Подключение LLM API: Claude / OpenAI, prompt engineering, обработка ошибок и стоимость токенов", 26, LessonType.VIDEO, 45, false,
                "### Урок 26: Подключение LLM API\nИнтеграция Claude / OpenAI API, structured outputs, prompt engineering, обработка rate limits и оптимизация расходов токенов."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "AI-ассистент: chat-интерфейс, контекстное окно, streaming-ответы", 27, LessonType.ARTICLE, 30, false,
                "### Урок 27: AI-ассистент и Streaming\nРазработка чат-интерфейса, управление контекстным окном, стриминг ответов в реальном времени."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "RAG-система и AI Core: Groq API, реактивный WebClient, Server-Sent Events (SSE), детерминированное закрытие подписок, PII-маскирование персональных данных", 28, LessonType.VIDEO, 45, false,
                "### Урок 28: RAG Core и Безопасность\nПостроение RAG-системы на Groq API, реактивный WebClient, Server-Sent Events (SSE), безопасное закрытие подписок и PII-маскирование данных."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Google SMTP / Gmail API: отправка транзакционных писем из приложения — подготовка к релизу", 29, LessonType.PRACTICE, 60, false,
                "### Урок 29: Транзакционная почта\nИнтеграция Google SMTP / Gmail API, отправка транзакционных уведомлений, отчетов и подготовка к релизу."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Финал Pensee: полный деплой, нагрузочное тестирование, презентация продукта", 30, LessonType.QUIZ, 25, false,
                "### Урок 30: Финал Pensee и Выпускной\nПолный деплой приложения Pensee, нагрузочное тестирование, публичная презентация продукта и получение сертификата."));



        List<Lesson> savedLessons = lessonRepository.saveAll(lessonsToSave);
        log.info("Seeded 1 course, 5 modules and {} lessons successfully.", savedLessons.size());

        // 6. Seed Materials
        List<LessonMaterial> materialsToSeed = List.of(
                LessonMaterial.builder()
                        .lesson(savedLessons.get(1)) // Неделя 1 Урок 2
                        .title("Неделя 1 Урок 2 — Сравнение промптов Spotify (Basic vs Pro Prompting)")
                        .materialType(MaterialType.CHEAT_SHEET)
                        .url("/docs?tag=Prompt")
                        .fileSizeBytes(6144L)
                        .sortOrder(1)
                        .build(),
                LessonMaterial.builder()
                        .lesson(savedLessons.get(1)) // Неделя 1 Урок 2
                        .title("Неделя 1 Урок 2 — Системный ролевой промпт ментора Claude (Senior Architect)")
                        .materialType(MaterialType.CHEAT_SHEET)
                        .url("/docs?tag=AI")
                        .fileSizeBytes(4915L)
                        .sortOrder(2)
                        .build(),
                LessonMaterial.builder()
                        .lesson(savedLessons.get(2)) // Неделя 1 Урок 3
                        .title("Неделя 1 Урок 3 — Словарь Git и рабочий процесс (ветвление, коммиты, PR, деплой)")
                        .materialType(MaterialType.CHEAT_SHEET)
                        .url("/docs?tag=DevOps")
                        .fileSizeBytes(13400L)
                        .sortOrder(1)
                        .build(),
                LessonMaterial.builder()
                        .lesson(savedLessons.get(3)) // Неделя 1 Урок 4
                        .title("Неделя 1 Урок 4 — Эталонный промпт лендинга Global Coffee (Glassmorphism & Mobile-first)")
                        .materialType(MaterialType.SOURCE_CODE)
                        .url("/docs?tag=Frontend")
                        .fileSizeBytes(8800L)
                        .sortOrder(1)
                        .build(),
                LessonMaterial.builder()
                        .lesson(savedLessons.get(6)) // Неделя 2 Урок 1
                        .title("Неделя 2 Урок 1 — Онбординг во фронтенд и Feature-Sliced Design архитектура")
                        .materialType(MaterialType.DOCUMENTATION)
                        .url("/docs?tag=FSD")
                        .fileSizeBytes(13200L)
                        .sortOrder(1)
                        .build(),
                LessonMaterial.builder()
                        .lesson(savedLessons.get(6)) // Неделя 2 Урок 1
                        .title("Неделя 2 Урок 1 — Полный словарь фронтенд-разработчика (React 19, TS, Vite, Query, Zustand)")
                        .materialType(MaterialType.CHEAT_SHEET)
                        .url("/docs?tag=Frontend")
                        .fileSizeBytes(23200L)
                        .sortOrder(2)
                        .build(),
                LessonMaterial.builder()
                        .lesson(savedLessons.get(12)) // Неделя 3 Урок 1
                        .title("Неделя 3 Урок 1 — Справочник сетевого взаимодействия: HTTP-методы, статус-коды и REST API")
                        .materialType(MaterialType.CHEAT_SHEET)
                        .url("/docs?tag=Auth")
                        .fileSizeBytes(13100L)
                        .sortOrder(1)
                        .build(),
                LessonMaterial.builder()
                        .lesson(savedLessons.get(12)) // Неделя 3 Урок 1
                        .title("Неделя 3 Урок 1 — Справочник бэкенда: Java 17, Spring Boot 3, JPA/Hibernate, Flyway, Redis")
                        .materialType(MaterialType.CHEAT_SHEET)
                        .url("/docs?tag=Backend")
                        .fileSizeBytes(20500L)
                        .sortOrder(2)
                        .build(),
                LessonMaterial.builder()
                        .lesson(savedLessons.get(16)) // Неделя 3 Урок 5
                        .title("Неделя 3 Урок 5 — Справочник по тестированию (Unit, Integration, E2E) и CI/CD пайплайнам")
                        .materialType(MaterialType.CHEAT_SHEET)
                        .url("/docs?tag=DevOps")
                        .fileSizeBytes(17050L)
                        .sortOrder(1)
                        .build()
        );
        lessonMaterialRepository.saveAll(materialsToSeed);

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
                .youtubeUrl("https://youtu.be/qnYl2ibf-rQ?si=_3UjIZihZ-z_MC6_")
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
