-- MrDevCourses: Migration V12 - Seed and update 5 modules and 30 lessons
-- Distributes lessons across 5 structured modules (6 lessons each = 30 lessons total)

DO $$
DECLARE
    target_course_id BIGINT;
    m1_id BIGINT;
    m2_id BIGINT;
    m3_id BIGINT;
    m4_id BIGINT;
    m5_id BIGINT;
BEGIN
    -- 1. Get the primary course or create one if none exists
    SELECT id INTO target_course_id FROM courses WHERE slug = 'fullstack-developer-pro' LIMIT 1;
    
    IF target_course_id IS NULL THEN
        SELECT id INTO target_course_id FROM courses ORDER BY id ASC LIMIT 1;
    END IF;

    IF target_course_id IS NULL THEN
        INSERT INTO courses (title, slug, description, is_active, created_at)
        VALUES ('Full-Stack Developer: From Junior to Lead', 'fullstack-developer-pro', 'Интенсивная практическая программа подготовки Full-Stack инженеров.', TRUE, NOW())
        RETURNING id INTO target_course_id;
    END IF;

    -- 2. Upsert Module 1
    SELECT id INTO m1_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 1 LIMIT 1;
    IF m1_id IS NULL THEN
        INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
        VALUES (target_course_id, 'Модуль 1: Архитектурный фундамент и чистый код', 'Погружение в инженерную культуру, FSD архитектуру на фронтенде и SOLID принципы.', 1, TRUE, NOW())
        RETURNING id INTO m1_id;
    ELSE
        UPDATE course_modules SET title = 'Модуль 1: Архитектурный фундамент и чистый код', is_free_preview = TRUE WHERE id = m1_id;
    END IF;

    -- 3. Upsert Module 2
    SELECT id INTO m2_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 2 LIMIT 1;
    IF m2_id IS NULL THEN
        INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
        VALUES (target_course_id, 'Модуль 2: Spring Boot 3 & Проектирование REST API', 'Разработка масштабируемого backend-монолита, внедрение DTO, Validation, Rate Limiting.', 2, FALSE, NOW())
        RETURNING id INTO m2_id;
    ELSE
        UPDATE course_modules SET title = 'Модуль 2: Spring Boot 3 & Проектирование REST API' WHERE id = m2_id;
    END IF;

    -- 4. Upsert Module 3
    SELECT id INTO m3_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 3 LIMIT 1;
    IF m3_id IS NULL THEN
        INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
        VALUES (target_course_id, 'Модуль 3: PostgreSQL, Индексы и Оптимизация', 'Глубокая работа с реляционной базой данных, миграции Flyway, HNSW pgvector и транзакции.', 3, FALSE, NOW())
        RETURNING id INTO m3_id;
    ELSE
        UPDATE course_modules SET title = 'Модуль 3: PostgreSQL, Индексы и Оптимизация' WHERE id = m3_id;
    END IF;

    -- 5. Upsert Module 4
    SELECT id INTO m4_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 4 LIMIT 1;
    IF m4_id IS NULL THEN
        INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
        VALUES (target_course_id, 'Модуль 4: Безопасность, Spring Security 6 & JWT', 'Stateless JWT авторизация в httpOnly cookies, OAuth2 Google Client, IDOR защита и CORS.', 4, FALSE, NOW())
        RETURNING id INTO m4_id;
    ELSE
        UPDATE course_modules SET title = 'Модуль 4: Безопасность, Spring Security 6 & JWT' WHERE id = m4_id;
    END IF;

    -- 6. Upsert Module 5
    SELECT id INTO m5_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 5 LIMIT 1;
    IF m5_id IS NULL THEN
        INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
        VALUES (target_course_id, 'Модуль 5: Production Launch, CI/CD & Мониторинг', 'Transactional Outbox паттерн, генерация PDF сертификатов, деплой на Fly.io и Vercel.', 5, FALSE, NOW())
        RETURNING id INTO m5_id;
    ELSE
        UPDATE course_modules SET title = 'Модуль 5: Production Launch, CI/CD & Мониторинг' WHERE id = m5_id;
    END IF;

    -- 7. Upsert 30 Lessons (6 lessons per module)
    -- Module 1 (Lessons 1-6)
    INSERT INTO lessons (course_id, module_id, day_number, sort_order, title, lesson_type, duration_minutes, is_free_preview, youtube_url, content, created_at)
    VALUES
    (target_course_id, m1_id, 1, 1, 'Введение в курс и настройка окружения', 'VIDEO', 25, TRUE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 1: Старт обучения\nРазвертывание Java 17, Node.js 20, Docker PostgreSQL и Git.', NOW()),
    (target_course_id, m1_id, 2, 2, 'Архитектура Feature-Sliced Design (FSD)', 'VIDEO', 30, TRUE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 2: FSD на практике\nСлои: app, pages, widgets, features, entities, shared.', NOW()),
    (target_course_id, m1_id, 3, 3, 'TypeScript, React 19 и Tailwind CSS v4', 'ARTICLE', 20, TRUE, NULL, '### День 3: Современный фронтенд\nТипизация стейта, TanStack React Query v5 и dark mode эстетика.', NOW()),
    (target_course_id, m1_id, 4, 4, 'Модульный монолит: принципы декомпозиции', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 4: Модульный монолит на бэкенде\nСлоистая архитектура, Package by Feature, изоляция контекстов.', NOW()),
    (target_course_id, m1_id, 5, 5, 'Практикум: Разработка UI дизайн-системы', 'PRACTICE', 45, FALSE, NULL, '### День 5: Дизайн-система\nСоздание переиспользуемых атомарных компонентов с Tailwind CSS.', NOW()),
    (target_course_id, m1_id, 6, 6, 'Аттестация модуля 1: Архитектурный фундамент', 'QUIZ', 15, FALSE, NULL, '### День 6: Тестирование знаний Модуля 1\nТест на знание FSD, SOLID и структуры проекта.', NOW())
    ON CONFLICT (course_id, day_number) DO UPDATE SET
        module_id = EXCLUDED.module_id,
        title = EXCLUDED.title,
        lesson_type = EXCLUDED.lesson_type,
        duration_minutes = EXCLUDED.duration_minutes,
        is_free_preview = EXCLUDED.is_free_preview,
        content = EXCLUDED.content;

    -- Module 2 (Lessons 7-12)
    INSERT INTO lessons (course_id, module_id, day_number, sort_order, title, lesson_type, duration_minutes, is_free_preview, youtube_url, content, created_at)
    VALUES
    (target_course_id, m2_id, 7, 7, 'Spring Boot 3: Стартеры, Конфигурация и Профили', 'VIDEO', 30, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 7: Spring Boot 3 Core\nКонфигурационные бины, application.yml, dev/prod профили.', NOW()),
    (target_course_id, m2_id, 8, 8, 'Проектирование REST API и DTO маппинг', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 8: REST API Design\nВерсионирование /api/v1, DTO records, MapStruct и конвенции ответов.', NOW()),
    (target_course_id, m2_id, 9, 9, 'Валидация данных и глобальный Exception Handling', 'ARTICLE', 25, FALSE, NULL, '### День 9: Обработка ошибок\nProblemDetail RFC 7807, @ControllerAdvice, Bean Validation 3.0.', NOW()),
    (target_course_id, m2_id, 10, 10, 'Защита от DoS: Rate Limiting на Bucket4j & Caffeine', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 10: Rate Limiting\nМногоуровневые лимиты: Auth, AI, General с заголовками Retry-After.', NOW()),
    (target_course_id, m2_id, 11, 11, 'Практикум: Реализация CRUD операций для курсов', 'PRACTICE', 50, FALSE, NULL, '### День 11: Практика\nСоздание сервисного слоя, репозиториев и контроллеров управления курсами.', NOW()),
    (target_course_id, m2_id, 12, 12, 'Аттестация модуля 2: Spring Boot 3 & REST API', 'QUIZ', 15, FALSE, NULL, '### День 12: Тест по Модулю 2\nПроверка знаний жизненного цикла бинов, обработки исключений и rate-limiting.', NOW())
    ON CONFLICT (course_id, day_number) DO UPDATE SET
        module_id = EXCLUDED.module_id,
        title = EXCLUDED.title,
        lesson_type = EXCLUDED.lesson_type,
        duration_minutes = EXCLUDED.duration_minutes,
        is_free_preview = EXCLUDED.is_free_preview,
        content = EXCLUDED.content;

    -- Module 3 (Lessons 13-18)
    INSERT INTO lessons (course_id, module_id, day_number, sort_order, title, lesson_type, duration_minutes, is_free_preview, youtube_url, content, created_at)
    VALUES
    (target_course_id, m3_id, 13, 13, 'PostgreSQL 17 и миграции схемы с Flyway', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 13: Управление схемой БД\nИдемпотентные миграции V1..V12, версионирование, rollback стратегии.', NOW()),
    (target_course_id, m3_id, 14, 14, 'Spring Data JPA & Hibernate: N+1 проблема и индексы', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 14: Оптимизация запросов\nEntityGraph, JOIN FETCH, DTO проекции, B-Tree и BRIN индексы.', NOW()),
    (target_course_id, m3_id, 15, 15, 'Векторный поиск pgvector: HNSW и Cosine Similarity', 'ARTICLE', 30, FALSE, NULL, '### День 15: Векторные БД\nИндексы HNSW, pgvector extension, dense embeddings для RAG.', NOW()),
    (target_course_id, m3_id, 16, 16, 'Полнотекстовый поиск (FTS) и Reciprocal Rank Fusion', 'VIDEO', 45, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 16: Гибридный поиск\nКомбинация BM25 FTS и dense векторов через алгоритм RRF.', NOW()),
    (target_course_id, m3_id, 17, 17, 'Практикум: Оптимизация сложных агрегатных запросов', 'PRACTICE', 45, FALSE, NULL, '### День 17: SQL Практика\nEXPLAIN ANALYZE, когортный анализ и воронки удержания в PostgreSQL.', NOW()),
    (target_course_id, m3_id, 18, 18, 'Аттестация модуля 3: PostgreSQL & Индексация', 'QUIZ', 15, FALSE, NULL, '### День 18: Тест по Модулю 3\nВопросы по уровням изоляции транзакций, индексам и pgvector.', NOW())
    ON CONFLICT (course_id, day_number) DO UPDATE SET
        module_id = EXCLUDED.module_id,
        title = EXCLUDED.title,
        lesson_type = EXCLUDED.lesson_type,
        duration_minutes = EXCLUDED.duration_minutes,
        is_free_preview = EXCLUDED.is_free_preview,
        content = EXCLUDED.content;

    -- Module 4 (Lessons 19-24)
    INSERT INTO lessons (course_id, module_id, day_number, sort_order, title, lesson_type, duration_minutes, is_free_preview, youtube_url, content, created_at)
    VALUES
    (target_course_id, m4_id, 19, 19, 'Spring Security 6 Architecture & Filter Chain', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 19: Архитектура Security 6\nSecurityFilterChain, AuthenticationManager, Stateless Session.', NOW()),
    (target_course_id, m4_id, 20, 20, 'JWT в httpOnly Cookie против XSS и CSRF', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 20: Безопасные токены\nНастройка SameSite=Strict, Secure, httpOnly cookie и JWT sign validation.', NOW()),
    (target_course_id, m4_id, 21, 21, 'Google OAuth2 Client и интеграция аккаунтов', 'ARTICLE', 30, FALSE, NULL, '### День 21: OAuth2 Single Sign-On\nCustomOAuth2UserService, сопоставление пользователей и генерация JWT.', NOW()),
    (target_course_id, m4_id, 22, 22, 'Row-Level Security, IDOR защита и RBAC', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 22: Защита данных\nSecurityUtils.getCurrentUserId(), разграничение ролей STUDENT и ADMIN.', NOW()),
    (target_course_id, m4_id, 23, 23, 'Практикум: Автоматический AI Grader кода решений', 'PRACTICE', 60, FALSE, NULL, '### День 23: AI Рецензирование\nСтатический анализ безопасности, поиск hardcoded secrets и оценка решений.', NOW()),
    (target_course_id, m4_id, 24, 24, 'Аттестация модуля 4: Security, OAuth2 & JWT', 'QUIZ', 15, FALSE, NULL, '### День 24: Тест по Модулю 4\nПроверка понимания атак CSRF/XSS, защиты IDOR и конфигурации Security 6.', NOW())
    ON CONFLICT (course_id, day_number) DO UPDATE SET
        module_id = EXCLUDED.module_id,
        title = EXCLUDED.title,
        lesson_type = EXCLUDED.lesson_type,
        duration_minutes = EXCLUDED.duration_minutes,
        is_free_preview = EXCLUDED.is_free_preview,
        content = EXCLUDED.content;

    -- Module 5 (Lessons 25-30)
    INSERT INTO lessons (course_id, module_id, day_number, sort_order, title, lesson_type, duration_minutes, is_free_preview, youtube_url, content, created_at)
    VALUES
    (target_course_id, m5_id, 25, 25, 'Transactional Outbox Pattern для фоновых задач', 'VIDEO', 45, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 25: Надежная доставка событий\nТаблица outbox_events, гарантированная доставка at-least-once, @Scheduled Processor.', NOW()),
    (target_course_id, m5_id, 26, 26, 'Генерация PDF сертификатов с верификацией по коду', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 26: Сертификаты\nThymeleaf + OpenHTMLtoPDF, уникальный UUID код проверки и публичный эндпоинт.', NOW()),
    (target_course_id, m5_id, 27, 27, 'Когортная аналитика и когортное удержание студентов', 'ARTICLE', 30, FALSE, NULL, '### День 27: Аналитика платформы\nРасчет Drop-off rate, распределение streak и воронка прохождения по дням.', NOW()),
    (target_course_id, m5_id, 28, 28, 'CI/CD Pipeline: GitHub Actions, Тесты и Качество кода', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 28: Непрерывная интеграция\nАвтоматический запуск тестов Gradle и Vitest, сборка Docker образов.', NOW()),
    (target_course_id, m5_id, 29, 29, 'Деплой в Production: Fly.io (Backend) + Vercel (Frontend)', 'VIDEO', 50, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### День 29: Релиз в облако\nНастройка переменных окружения, подключение управляемой PostgreSQL и SSL.', NOW()),
    (target_course_id, m5_id, 30, 30, 'Финальная защита проекта и получение сертификата', 'PRACTICE', 60, FALSE, NULL, '### День 30: Выпускной практикум\nЗавершение всех модулей, прохождение аттестации и получение подтвержденного диплома.', NOW())
    ON CONFLICT (course_id, day_number) DO UPDATE SET
        module_id = EXCLUDED.module_id,
        title = EXCLUDED.title,
        lesson_type = EXCLUDED.lesson_type,
        duration_minutes = EXCLUDED.duration_minutes,
        is_free_preview = EXCLUDED.is_free_preview,
        content = EXCLUDED.content;

END
$$;
