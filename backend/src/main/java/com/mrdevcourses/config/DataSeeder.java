package com.mrdevcourses.config;

import com.mrdevcourses.modules.ai.rag.model.GlossaryEmbedding;
import com.mrdevcourses.modules.ai.rag.repository.GlossaryEmbeddingRepository;
import com.mrdevcourses.modules.ai.rag.service.EmbeddingService;
import com.mrdevcourses.modules.ai.rag.service.LessonIngestionService;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
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
    private final LessonRepository lessonRepository;
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

        log.info("Seeding initial MrDevCourses data with vectorization & automation...");

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

        // 3. Glossary terms for course
        List<GlossaryEmbedding> terms = List.of(
                createGlossaryEmbedding(savedCourse.getId(), "RAG", "AI", "Retrieval-Augmented Generation — архитектурный паттерн обогащения промпта LLM актуальными векторными и текстовыми фрагментами из базы данных."),
                createGlossaryEmbedding(savedCourse.getId(), "pgvector", "Database", "Расширение PostgreSQL для хранения векторных эмбеддингов и быстрого поиска ближайших соседей по HNSW и IVFFlat индексам."),
                createGlossaryEmbedding(savedCourse.getId(), "FSD", "Frontend", "Feature-Sliced Design — архитектурная методология для фронтенда с разделением на app, pages, widgets, features, entities, shared."),
                createGlossaryEmbedding(savedCourse.getId(), "IDOR", "Security", "Insecure Direct Object Reference — уязвимость авторизации, когда пользователь может обращаться к чужим объектам через подмену идентификатора."),
                createGlossaryEmbedding(savedCourse.getId(), "Transactional Outbox", "Architecture", "Паттерн надежной доставки сообщений, сохраняющий события в таблицу БД в рамках той же транзакции, что и бизнес-сущность.")
        );
        glossaryEmbeddingRepository.saveAll(terms);

        // 4. Lessons for Course
        List<Lesson> lessons = List.of(
                Lesson.builder()
                        .course(savedCourse)
                        .title("День 1: Мышление разработчика и настройка окружения")
                        .dayNumber(1)
                        .sortOrder(1)
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
                        .build(),
                Lesson.builder()
                        .course(savedCourse)
                        .title("День 2: Промпт-инжиниринг и проектирование архитектуры")
                        .dayNumber(2)
                        .sortOrder(2)
                        .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                        .content("""
                                ### Промпт-инжиниринг и RAG
                                Изучаем как управлять ИИ-агентами:
                                - Разница между базовыми и профессиональными системными инструкциями.
                                - Архитектура RAG (Retrieval-Augmented Generation) и векторизация через pgvector.
                                - Паттерн Smart Merge и DTO-структурирование.
                                
                                ### Практическое задание
                                Напишите DTO-контракт и проверку ответов модели.
                                """)
                        .build(),
                Lesson.builder()
                        .course(savedCourse)
                        .title("День 3: Разработка первого UI на React и Tailwind v4")
                        .dayNumber(3)
                        .sortOrder(3)
                        .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                        .content("""
                                ### Frontend Foundations
                                - Структура Feature-Sliced Design (FSD).
                                - Настройка Tailwind CSS v4 с темной эстетикой (#0d1117).
                                - Компонентный подход, TanStack Query и типизация на TypeScript.
                                
                                ### Практическое задание
                                Создайте интерактивный виджет для отправки домашних заданий.
                                """)
                        .build(),
                Lesson.builder()
                        .course(savedCourse)
                        .title("День 4: Бэкенд на Spring Boot 3 и безопасность")
                        .dayNumber(4)
                        .sortOrder(4)
                        .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                        .content("""
                                ### Backend & Security
                                - Архитектура модульного монолита и Transactional Outbox.
                                - Spring Security 6, Google OAuth2 и JWT в httpOnly cookie.
                                - Защита от IDOR и безопасность на уровне строк через SecurityUtils.
                                
                                ### Практическое задание
                                Реализуйте защищенный эндпоинт с проверкой прав доступа.
                                """)
                        .build(),
                Lesson.builder()
                        .course(savedCourse)
                        .title("День 5: Деплой, CI/CD и релиз продукта")
                        .dayNumber(5)
                        .sortOrder(5)
                        .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                        .content("""
                                ### Production Release
                                - Настройка GitHub Actions пайплайна с обязательным прогоном тестов.
                                - Контейнеризация и деплой на Fly.io / Vercel.
                                - Проверка логов, мониторинг и финальная генерация сертификата.
                                
                                ### Практическое задание
                                Настройте CI/CD сборку и выполните успешный деплой.
                                """)
                        .build()
        );

        List<Lesson> savedLessons = lessonRepository.saveAll(lessons);
        log.info("Seeded 1 course and {} lessons successfully.", savedLessons.size());

        // Ingest lessons into vector embeddings
        for (Lesson l : savedLessons) {
            lessonIngestionService.ingestLesson(l);
        }
        log.info("Vector ingestion completed for all seeded course materials.");
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
