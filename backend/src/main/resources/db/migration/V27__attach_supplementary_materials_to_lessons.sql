-- MrDevCourses: Migration V27 - Attach Supplementary Theoretical Materials to Lessons
-- Full lesson naming: Неделя X Урок Y

DO $$
DECLARE
    target_course_id BIGINT;
    l_n1u2_id BIGINT;
    l_n1u3_id BIGINT;
    l_n1u4_id BIGINT;
    l_n2u1_id BIGINT;
    l_n3u1_id BIGINT;
    l_n3u5_id BIGINT;
BEGIN
    SELECT id INTO target_course_id FROM courses WHERE slug = 'mrdeveloper' LIMIT 1;
    IF target_course_id IS NULL THEN
        SELECT id INTO target_course_id FROM courses WHERE slug = 'vibecoding-zero-to-one' LIMIT 1;
    END IF;
    IF target_course_id IS NULL THEN
        SELECT id INTO target_course_id FROM courses ORDER BY id ASC LIMIT 1;
    END IF;

    IF target_course_id IS NOT NULL THEN
        -- Resolve lesson IDs by day_number
        SELECT id INTO l_n1u2_id FROM lessons WHERE course_id = target_course_id AND day_number = 2 LIMIT 1;
        SELECT id INTO l_n1u3_id FROM lessons WHERE course_id = target_course_id AND day_number = 3 LIMIT 1;
        SELECT id INTO l_n1u4_id FROM lessons WHERE course_id = target_course_id AND day_number = 4 LIMIT 1;
        SELECT id INTO l_n2u1_id FROM lessons WHERE course_id = target_course_id AND day_number = 7 LIMIT 1;
        SELECT id INTO l_n3u1_id FROM lessons WHERE course_id = target_course_id AND day_number = 13 LIMIT 1;
        SELECT id INTO l_n3u5_id FROM lessons WHERE course_id = target_course_id AND day_number = 17 LIMIT 1;

        -- 1. Неделя 1 Урок 2: Внедрение в ИИ и промпт-инжиниринг
        IF l_n1u2_id IS NOT NULL THEN
            DELETE FROM lesson_materials WHERE lesson_id = l_n1u2_id;

            INSERT INTO lesson_materials (lesson_id, title, material_type, url, file_size_bytes, sort_order, created_at)
            VALUES
            (l_n1u2_id, 'Неделя 1 Урок 2 — Сравнение промптов Spotify (Basic vs Pro Prompting)', 'CHEAT_SHEET', '/docs?tag=Prompt', 6144, 1, NOW()),
            (l_n1u2_id, 'Неделя 1 Урок 2 — Системный ролевой промпт ментора Claude (Senior Architect)', 'CHEAT_SHEET', '/docs?tag=AI', 4915, 2, NOW());
        END IF;

        -- 2. Неделя 1 Урок 3: GitHub с нуля
        IF l_n1u3_id IS NOT NULL THEN
            DELETE FROM lesson_materials WHERE lesson_id = l_n1u3_id;

            INSERT INTO lesson_materials (lesson_id, title, material_type, url, file_size_bytes, sort_order, created_at)
            VALUES
            (l_n1u3_id, 'Неделя 1 Урок 3 — Словарь Git и рабочий процесс (ветвление, коммиты, PR, деплой)', 'CHEAT_SHEET', '/docs?tag=DevOps', 13400, 1, NOW());
        END IF;

        -- 3. Неделя 1 Урок 4: Структура проекта. MVP фронтенда
        IF l_n1u4_id IS NOT NULL THEN
            DELETE FROM lesson_materials WHERE lesson_id = l_n1u4_id;

            INSERT INTO lesson_materials (lesson_id, title, material_type, url, file_size_bytes, sort_order, created_at)
            VALUES
            (l_n1u4_id, 'Неделя 1 Урок 4 — Эталонный промпт лендинга Global Coffee (Glassmorphism & Mobile-first)', 'SOURCE_CODE', '/docs?tag=Frontend', 8800, 1, NOW());
        END IF;

        -- 4. Неделя 2 Урок 1: Что такое фронтенд. FSD. Теория
        IF l_n2u1_id IS NOT NULL THEN
            DELETE FROM lesson_materials WHERE lesson_id = l_n2u1_id;

            INSERT INTO lesson_materials (lesson_id, title, material_type, url, file_size_bytes, sort_order, created_at)
            VALUES
            (l_n2u1_id, 'Неделя 2 Урок 1 — Онбординг во фронтенд и Feature-Sliced Design архитектура', 'DOCUMENTATION', '/docs?tag=FSD', 13200, 1, NOW()),
            (l_n2u1_id, 'Неделя 2 Урок 1 — Полный словарь фронтенд-разработчика (React 19, TS, Vite, Query, Zustand)', 'CHEAT_SHEET', '/docs?tag=Frontend', 23200, 2, NOW());
        END IF;

        -- 5. Неделя 3 Урок 1: Архитектура: Бэк + Фронт + База данных
        IF l_n3u1_id IS NOT NULL THEN
            DELETE FROM lesson_materials WHERE lesson_id = l_n3u1_id;

            INSERT INTO lesson_materials (lesson_id, title, material_type, url, file_size_bytes, sort_order, created_at)
            VALUES
            (l_n3u1_id, 'Неделя 3 Урок 1 — Справочник сетевого взаимодействия: HTTP-методы, статус-коды и REST API', 'CHEAT_SHEET', '/docs?tag=Auth', 13100, 1, NOW()),
            (l_n3u1_id, 'Неделя 3 Урок 1 — Справочник бэкенда: Java 17, Spring Boot 3, JPA/Hibernate, Flyway, Redis', 'CHEAT_SHEET', '/docs?tag=Backend', 20500, 2, NOW());
        END IF;

        -- 6. Неделя 3 Урок 5: Тестирование и проверка работоспособности
        IF l_n3u5_id IS NOT NULL THEN
            DELETE FROM lesson_materials WHERE lesson_id = l_n3u5_id;

            INSERT INTO lesson_materials (lesson_id, title, material_type, url, file_size_bytes, sort_order, created_at)
            VALUES
            (l_n3u5_id, 'Неделя 3 Урок 5 — Справочник по тестированию (Unit, Integration, E2E) и CI/CD пайплайнам', 'CHEAT_SHEET', '/docs?tag=DevOps', 17050, 1, NOW());
        END IF;

    END IF;
END
$$;
