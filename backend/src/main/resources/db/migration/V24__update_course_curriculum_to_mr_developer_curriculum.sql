-- MrDevCourses: Migration V24 - Update Course Curriculum to official Mr Developer Curriculum (mr-developer-curriculum.md)
-- 5 modules (weeks), 30 lessons with rich titles and content

DO $$
DECLARE
    target_course_id BIGINT;
    m1_id BIGINT;
    m2_id BIGINT;
    m3_id BIGINT;
    m4_id BIGINT;
    m5_id BIGINT;
BEGIN
    SELECT id INTO target_course_id FROM courses WHERE slug = 'mrdeveloper' LIMIT 1;
    
    IF target_course_id IS NULL THEN
        SELECT id INTO target_course_id FROM courses WHERE slug = 'vibecoding-zero-to-one' LIMIT 1;
    END IF;

    IF target_course_id IS NULL THEN
        SELECT id INTO target_course_id FROM courses ORDER BY id ASC LIMIT 1;
    END IF;

    IF target_course_id IS NOT NULL THEN
        -- 1. Update Course description
        UPDATE courses 
        SET title = 'MrDeveloper',
            description = 'Практический курс по разработке современных веб-приложений с использованием ИИ, архитектурных протоколов и лучших инженерных практик. 5 модулей, 30 уроков.'
        WHERE id = target_course_id;

        -- 2. Upsert Module 1
        SELECT id INTO m1_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 1 LIMIT 1;
        IF m1_id IS NULL THEN
            INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
            VALUES (target_course_id, 'Неделя 1 — Введение и инструментарий', 'Вайбкодинг как методология, настройка окружения, Git и GitHub с нуля, структура проекта и MVP-мышление, бизнес-идея и первый лендинг.', 1, TRUE, NOW())
            RETURNING id INTO m1_id;
        ELSE
            UPDATE course_modules 
            SET title = 'Неделя 1 — Введение и инструментарий', 
                description = 'Вайбкодинг как методология, настройка окружения, Git и GitHub с нуля, структура проекта и MVP-мышление, бизнес-идея и первый лендинг.', 
                is_free_preview = TRUE 
            WHERE id = m1_id;
        END IF;

        -- 3. Upsert Module 2
        SELECT id INTO m2_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 2 LIMIT 1;
        IF m2_id IS NULL THEN
            INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
            VALUES (target_course_id, 'Неделя 2 — Frontend-разработка (Маркетплейс)', 'Feature-Sliced Design, старт проекта, ролевая модель покупатель/продавец, деплой на GitHub Pages, code review через Claude и финал маркетплейса.', 2, FALSE, NOW())
            RETURNING id INTO m2_id;
        ELSE
            UPDATE course_modules 
            SET title = 'Неделя 2 — Frontend-разработка (Маркетплейс)', 
                description = 'Feature-Sliced Design, старт проекта, ролевая модель покупатель/продавец, деплой на GitHub Pages, code review через Claude и финал маркетплейса.' 
            WHERE id = m2_id;
        END IF;

        -- 4. Upsert Module 3
        SELECT id INTO m3_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 3 LIMIT 1;
        IF m3_id IS NULL THEN
            INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
            VALUES (target_course_id, 'Неделя 3 — Full-Stack + 3D (Трекер денег)', 'Системная архитектура, инициализация full-stack, RBAC и JWT, Google OAuth 2.0, Three.js 3D-сцена и Second Brain разработчика, code review и деплой.', 3, FALSE, NOW())
            RETURNING id INTO m3_id;
        ELSE
            UPDATE course_modules 
            SET title = 'Неделя 3 — Full-Stack + 3D (Трекер денег)', 
                description = 'Системная архитектура, инициализация full-stack, RBAC и JWT, Google OAuth 2.0, Three.js 3D-сцена и Second Brain разработчика, code review и деплой.' 
            WHERE id = m3_id;
        END IF;

        -- 5. Upsert Module 4
        SELECT id INTO m4_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 4 LIMIT 1;
        IF m4_id IS NULL THEN
            INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
            VALUES (target_course_id, 'Неделя 4 — CRM: Kanban + Trackers', 'Полное планирование продукта, технический foundation, самостоятельная реализация, Telegram Bot интеграция, CI/CD pipeline и production-режим.', 4, FALSE, NOW())
            RETURNING id INTO m4_id;
        ELSE
            UPDATE course_modules 
            SET title = 'Неделя 4 — CRM: Kanban + Trackers', 
                description = 'Полное планирование продукта, технический foundation, самостоятельная реализация, Telegram Bot интеграция, CI/CD pipeline и production-режим.' 
            WHERE id = m4_id;
        END IF;

        -- 6. Upsert Module 5
        SELECT id INTO m5_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 5 LIMIT 1;
        IF m5_id IS NULL THEN
            INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
            VALUES (target_course_id, 'Неделя 5 — Pensee (всё в одном)', 'Архитектура финального продукта, LLM API, AI-ассистент со стримингом, RAG-система и AI Core, Google SMTP и финальный релиз Pensee.', 5, FALSE, NOW())
            RETURNING id INTO m5_id;
        ELSE
            UPDATE course_modules 
            SET title = 'Неделя 5 — Pensee (всё в одном)', 
                description = 'Архитектура финального продукта, LLM API, AI-ассистент со стримингом, RAG-система и AI Core, Google SMTP и финальный релиз Pensee.' 
            WHERE id = m5_id;
        END IF;

        -- 7. Upsert 30 Lessons
        -- Неделя 1 (Lessons 1-6)
        INSERT INTO lessons (course_id, module_id, day_number, sort_order, title, lesson_type, duration_minutes, is_free_preview, youtube_url, content, created_at)
        VALUES
        (target_course_id, m1_id, 1, 1, 'Вайбкодинг как методология: сравнение с классической разработкой, место AI-ассистентов в современном IT-рынке', 'VIDEO', 25, TRUE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 1: Вайбкодинг как методология\nСравнение с классической разработкой, роль и место AI-ассистентов в современном IT-рынке.', NOW()),
        (target_course_id, m1_id, 2, 2, 'Настройка рабочего окружения: VS Code, Cursor, Antigravity, Claude, ChatGPT, Gemini — установка и верификация', 'VIDEO', 25, TRUE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 2: Настройка рабочего окружения\nПошаговая установка, верификация и тестирование тулинга: VS Code, Cursor, Antigravity, Claude, ChatGPT, Gemini.', NOW()),
        (target_course_id, m1_id, 3, 3, 'Git и GitHub с нуля: инициализация репозитория, первый коммит, GitHub Pages — деплой статики', 'ARTICLE', 20, TRUE, NULL, '### Урок 3: Git и GitHub с нуля\nИнициализация локального репозитория, первый коммит, ветвление и публикация статического сайта на GitHub Pages.', NOW()),
        (target_course_id, m1_id, 4, 4, 'Структура проекта и MVP-мышление: файловая архитектура, README, agents.md', 'VIDEO', 30, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 4: Структура проекта и MVP-мышление\nФайловая архитектура проекта, составление README по инженерному стандарту, настройка правил `.agents/` и контекста для AI.', NOW()),
        (target_course_id, m1_id, 5, 5, 'Бизнес-идея: Customer Problem Statement, целевая аудитория, feature scope', 'PRACTICE', 45, FALSE, NULL, '### Урок 5: Бизнес-идея и скоупинг\nФормулирование Customer Problem Statement, определение целевой аудитории, декомпозиция минимального feature scope.', NOW()),
        (target_course_id, m1_id, 6, 6, 'Лендинг бизнес-идеи: вёрстка через AI-ассистента, публикация на GitHub Pages', 'QUIZ', 20, FALSE, NULL, '### Урок 6: Лендинг бизнес-идеи\nВёрстка продающего лендинга через AI-ассистента, адаптивность, анимации и публикация онлайн на GitHub Pages.', NOW())
        ON CONFLICT (course_id, day_number) DO UPDATE SET
            module_id = EXCLUDED.module_id,
            title = EXCLUDED.title,
            lesson_type = EXCLUDED.lesson_type,
            duration_minutes = EXCLUDED.duration_minutes,
            is_free_preview = EXCLUDED.is_free_preview,
            content = EXCLUDED.content;

        -- Неделя 2 (Lessons 7-12)
        INSERT INTO lessons (course_id, module_id, day_number, sort_order, title, lesson_type, duration_minutes, is_free_preview, youtube_url, content, created_at)
        VALUES
        (target_course_id, m2_id, 7, 7, 'Feature-Sliced Design: слои, сегменты, публичное API модуля — планировка маркетплейса', 'VIDEO', 30, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 7: Feature-Sliced Design\nМетодология FSD: слои, сегменты, публичное API модуля. Архитектурная планировка маркетплейса.', NOW()),
        (target_course_id, m2_id, 8, 8, 'Старт проекта: роутинг, страницы, базовая бизнес-логика', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 8: Старт проекта Маркетплейс\nНастройка клиентского роутинга, создание страниц, каталога товаров и базовой бизнес-логики.', NOW()),
        (target_course_id, m2_id, 9, 9, 'Углубление логики: ролевая модель (покупатель / продавец), условный рендеринг по роли', 'ARTICLE', 30, FALSE, NULL, '### Урок 9: Ролевая модель Маркетплейса\nРеализация ролевой модели (покупатель / продавец), условный рендеринг компонентов по активной роли.', NOW()),
        (target_course_id, m2_id, 10, 10, 'Деплой на GitHub Pages: конфигурация base path, сборка и публикация', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 10: Деплой Маркетплейса\nКонфигурация base path в Vite, настройка SPA-редиректов, сборка и публикация на GitHub Pages.', NOW()),
        (target_course_id, m2_id, 11, 11, 'Code review через Claude: рефакторинг, исправление архитектурных нарушений, финальный дизайн-аудит', 'PRACTICE', 50, FALSE, NULL, '### Урок 11: Code review через Claude\nГлубокий рефакторинг кода, исправление архитектурных нарушений слоев FSD, финальный дизайн-аудит.', NOW()),
        (target_course_id, m2_id, 12, 12, 'Финал маркетплейса: приёмочное тестирование, ретроспектива', 'QUIZ', 20, FALSE, NULL, '### Урок 12: Финал Маркетплейса\nПриёмочное тестирование всех пользовательских сценариев, ретроспектива и упаковка проекта в портфолио.', NOW())
        ON CONFLICT (course_id, day_number) DO UPDATE SET
            module_id = EXCLUDED.module_id,
            title = EXCLUDED.title,
            lesson_type = EXCLUDED.lesson_type,
            duration_minutes = EXCLUDED.duration_minutes,
            is_free_preview = EXCLUDED.is_free_preview,
            content = EXCLUDED.content;

        -- Неделя 3 (Lessons 13-18)
        INSERT INTO lessons (course_id, module_id, day_number, sort_order, title, lesson_type, duration_minutes, is_free_preview, youtube_url, content, created_at)
        VALUES
        (target_course_id, m3_id, 13, 13, 'Системная архитектура: монолит vs микросервисы, выбор стека, ERD базы данных — планировка трекера', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 13: Системная архитектура\nСравнение монолита и микросервисов, обоснование стека, проектирование ERD схемы базы данных для трекера денег.', NOW()),
        (target_course_id, m3_id, 14, 14, 'Инициализация full-stack: настройка фронтенда, бэкенда и БД, связка окружений', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 14: Инициализация Full-Stack\nНастройка бэкенда, фронтенда и базы данных PostgreSQL, конфигурация CORS и связка окружений.', NOW()),
        (target_course_id, m3_id, 15, 15, 'Закладка архитектуры: RBAC, JWT-аутентификация, защищённые роуты, миграции схемы', 'ARTICLE', 30, FALSE, NULL, '### Урок 15: Закладка архитектуры безопасности\nРолевая модель RBAC, stateless JWT аутентификация в httpOnly cookies, защита эндпоинтов и миграции схемы через Flyway.', NOW()),
        (target_course_id, m3_id, 16, 16, 'OAuth 2.0 через Google: интеграция провайдера, мультиаккаунтность, проверка ролей в админ-панели', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 16: Google OAuth 2.0\nИнтеграция Google OAuth 2.0, обработка мультиаккаунтности, проверка ролей и разграничение доступа в админ-панели.', NOW()),
        (target_course_id, m3_id, 17, 17, 'Three.js: 3D-сцена, анимации, интерактив — Second Brain разработчика: Notion/Obsidian система', 'PRACTICE', 50, FALSE, NULL, '### Урок 17: Three.js 3D и Second Brain\nСоздание интерактивной 3D-сцены на Three.js для визуализации финансовых потоков. Внедрение Second Brain системы.', NOW()),
        (target_course_id, m3_id, 18, 18, 'Code review: масштабируемость архитектуры, рефакторинг, финальный деплой Render + Vercel', 'QUIZ', 20, FALSE, NULL, '### Урок 18: Code review и Деплой Трекера денег\nАнализ масштабируемости архитектуры, рефакторинг сервисного слоя, деплой бэкенда на Render и фронтенда на Vercel.', NOW())
        ON CONFLICT (course_id, day_number) DO UPDATE SET
            module_id = EXCLUDED.module_id,
            title = EXCLUDED.title,
            lesson_type = EXCLUDED.lesson_type,
            duration_minutes = EXCLUDED.duration_minutes,
            is_free_preview = EXCLUDED.is_free_preview,
            content = EXCLUDED.content;

        -- Неделя 4 (Lessons 19-24)
        INSERT INTO lessons (course_id, module_id, day_number, sort_order, title, lesson_type, duration_minutes, is_free_preview, youtube_url, content, created_at)
        VALUES
        (target_course_id, m4_id, 19, 19, 'Полное планирование продукта: user stories, архитектурное решение, выбор стека с обоснованием', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 19: Планирование CRM продукта\nСоставление User Stories, проектирование API контрактов, выбор библиотек для Drag & Drop и стейт-менеджмента.', NOW()),
        (target_course_id, m4_id, 20, 20, 'Технический foundation: README по стандарту, углублённый Second Brain, финализация tech stack', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 20: Технический foundation\nОформление репозитория по стандарту, углубленный Second Brain, настройка базовых сущностей и репозиториев.', NOW()),
        (target_course_id, m4_id, 21, 21, 'Самостоятельная работа студента: декомпозиция на фазы, написание промптов, старт реализации', 'ARTICLE', 30, FALSE, NULL, '### Урок 21: Самостоятельная реализация CRM\nДекомпозиция на этапы, составление промптов для генерации колонок, карточек и фильтрации задач.', NOW()),
        (target_course_id, m4_id, 22, 22, 'Telegram Bot: webhook-интеграция, алерты, уведомления о событиях CRM', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 22: Telegram Bot для CRM\nИнтеграция Telegram-бота, настройка вебхуков, оперативные алерты и уведомления о смене статусов задач.', NOW()),
        (target_course_id, m4_id, 23, 23, 'Code review + CI/CD pipeline: GitHub Actions, деплой на Vercel (фронт) и Render (бэк)', 'PRACTICE', 60, FALSE, NULL, '### Урок 23: CI/CD Pipeline\nПостроение CI/CD пайплайна на GitHub Actions: автоматический запуск тестов, деплой фронтенда на Vercel и бэкенда на Render.', NOW()),
        (target_course_id, m4_id, 24, 24, 'Production-режим: smoke testing, мониторинг, работа с живыми данными', 'QUIZ', 20, FALSE, NULL, '### Урок 24: Production-режим CRM\nПроведение smoke testing, настройка логирования и мониторинга, валидация работы CRM с живыми данными.', NOW())
        ON CONFLICT (course_id, day_number) DO UPDATE SET
            module_id = EXCLUDED.module_id,
            title = EXCLUDED.title,
            lesson_type = EXCLUDED.lesson_type,
            duration_minutes = EXCLUDED.duration_minutes,
            is_free_preview = EXCLUDED.is_free_preview,
            content = EXCLUDED.content;

        -- Неделя 5 (Lessons 25-30)
        INSERT INTO lessons (course_id, module_id, day_number, sort_order, title, lesson_type, duration_minutes, is_free_preview, youtube_url, content, created_at)
        VALUES
        (target_course_id, m5_id, 25, 25, 'Архитектура финального продукта: scope, интеграционная карта всех компонентов — старт', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 25: Архитектура Pensee\nАрхитектура финального продукта, составление интеграционной карты компонентов, проектирование сквозных потоков данных.', NOW()),
        (target_course_id, m5_id, 26, 26, 'Подключение LLM API: Claude / OpenAI, prompt engineering, обработка ошибок и стоимость токенов', 'VIDEO', 45, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 26: Подключение LLM API\nИнтеграция Claude / OpenAI API, structured outputs, prompt engineering, обработка rate limits и оптимизация расходов токенов.', NOW()),
        (target_course_id, m5_id, 27, 27, 'AI-ассистент: chat-интерфейс, контекстное окно, streaming-ответы', 'ARTICLE', 30, FALSE, NULL, '### Урок 27: AI-ассистент и Streaming\nРазработка чат-интерфейса, управление контекстным окном, стриминг ответов в реальном времени.', NOW()),
        (target_course_id, m5_id, 28, 28, 'RAG-система и AI Core: Groq API, реактивный WebClient, Server-Sent Events (SSE), детерминированное закрытие подписок, PII-маскирование персональных данных', 'VIDEO', 45, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 28: RAG Core и Безопасность\nПостроение RAG-системы на Groq API, реактивный WebClient, Server-Sent Events (SSE), безопасное закрытие подписок и PII-маскирование данных.', NOW()),
        (target_course_id, m5_id, 29, 29, 'Google SMTP / Gmail API: отправка транзакционных писем из приложения — подготовка к релизу', 'PRACTICE', 60, FALSE, NULL, '### Урок 29: Транзакционная почта\nИнтеграция Google SMTP / Gmail API, отправка транзакционных уведомлений, отчетов и подготовка к релизу.', NOW()),
        (target_course_id, m5_id, 30, 30, 'Финал Pensee: полный деплой, нагрузочное тестирование, презентация продукта', 'QUIZ', 25, FALSE, NULL, '### Урок 30: Финал Pensee и Выпускной\nПолный деплой приложения Pensee, нагрузочное тестирование, публичная презентация продукта и получение сертификата.', NOW())
        ON CONFLICT (course_id, day_number) DO UPDATE SET
            module_id = EXCLUDED.module_id,
            title = EXCLUDED.title,
            lesson_type = EXCLUDED.lesson_type,
            duration_minutes = EXCLUDED.duration_minutes,
            is_free_preview = EXCLUDED.is_free_preview,
            content = EXCLUDED.content;

    END IF;
END
$$;
