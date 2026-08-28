-- MrDevCourses: Migration V13 - Update course curriculum according to handwritten notebook syllabus
-- 5 modules, 30 lessons (1 week = 6 lessons) with smooth progression:
-- Week 1: Введение в Вайбкодинг и Быстрый Старт
-- Week 2: Фронтенд, FSD и Пет-проект «Маркетплейс»
-- Week 3: Фулстек, Three.js и Пет-проект «Трекер денег»
-- Week 4: Сложные интерфейсы: Trello + Second Brain
-- Week 5: Финальный Проект: Pensee (Всё в одном) & Релиз

DO $$
DECLARE
    target_course_id BIGINT;
    m1_id BIGINT;
    m2_id BIGINT;
    m3_id BIGINT;
    m4_id BIGINT;
    m5_id BIGINT;
BEGIN
    SELECT id INTO target_course_id FROM courses WHERE slug = 'vibecoding-zero-to-one' LIMIT 1;
    
    IF target_course_id IS NULL THEN
        SELECT id INTO target_course_id FROM courses WHERE slug = 'fullstack-developer-pro' LIMIT 1;
    END IF;

    IF target_course_id IS NULL THEN
        SELECT id INTO target_course_id FROM courses ORDER BY id ASC LIMIT 1;
    END IF;

    IF target_course_id IS NOT NULL THEN
        -- 1. Update Course description
        UPDATE courses 
        SET description = 'Практический курс по разработке современных веб-приложений с использованием ИИ, архитектурных протоколов и лучших инженерных практик. 1 неделя — 6 уроков.'
        WHERE id = target_course_id;

        -- 2. Upsert Module 1
        SELECT id INTO m1_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 1 LIMIT 1;
        IF m1_id IS NULL THEN
            INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
            VALUES (target_course_id, 'Неделя 1: Введение в Вайбкодинг и Быстрый Старт', 'Мягкий вход: что такое вайбкодинг, работа с ИИ, лендинг, GitHub с нуля, MVP-фронтенд и бизнес-планирование.', 1, TRUE, NOW())
            RETURNING id INTO m1_id;
        ELSE
            UPDATE course_modules SET title = 'Неделя 1: Введение в Вайбкодинг и Быстрый Старт', description = 'Мягкий вход: что такое вайбкодинг, работа с ИИ, лендинг, GitHub с нуля, MVP-фронтенд и бизнес-планирование.', is_free_preview = TRUE WHERE id = m1_id;
        END IF;

        -- 3. Upsert Module 2
        SELECT id INTO m2_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 2 LIMIT 1;
        IF m2_id IS NULL THEN
            INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
            VALUES (target_course_id, 'Неделя 2: Фронтенд, FSD и Пет-проект «Маркетплейс»', 'Что такое фронтенд, архитектура FSD, дизайн и разработка полноценного пет-проекта маркетплейса.', 2, FALSE, NOW())
            RETURNING id INTO m2_id;
        ELSE
            UPDATE course_modules SET title = 'Неделя 2: Фронтенд, FSD и Пет-проект «Маркетплейс»', description = 'Что такое фронтенд, архитектура FSD, дизайн и разработка полноценного пет-проекта маркетплейса.' WHERE id = m2_id;
        END IF;

        -- 4. Upsert Module 3
        SELECT id INTO m3_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 3 LIMIT 1;
        IF m3_id IS NULL THEN
            INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
            VALUES (target_course_id, 'Неделя 3: Фулстек, Three.js и Пет-проект «Трекер денег»', 'Архитектура Бэкенд + Фронтенд + БД, 3D визуал на Three.js, реализация логики и тестирование.', 3, FALSE, NOW())
            RETURNING id INTO m3_id;
        ELSE
            UPDATE course_modules SET title = 'Неделя 3: Фулстек, Three.js и Пет-проект «Трекер денег»', description = 'Архитектура Бэкенд + Фронтенд + БД, 3D визуал на Three.js, реализация логики и тестирование.' WHERE id = m3_id;
        END IF;

        -- 5. Upsert Module 4
        SELECT id INTO m4_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 4 LIMIT 1;
        IF m4_id IS NULL THEN
            INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
            VALUES (target_course_id, 'Неделя 4: Сложные интерфейсы: Trello + Second Brain', 'Интерактивные канбан-доски, стейт-менеджмент, протоколы Second Brain и системное мышление.', 4, FALSE, NOW())
            RETURNING id INTO m4_id;
        ELSE
            UPDATE course_modules SET title = 'Неделя 4: Сложные интерфейсы: Trello + Second Brain', description = 'Интерактивные канбан-доски, стейт-менеджмент, протоколы Second Brain и системное мышление.' WHERE id = m4_id;
        END IF;

        -- 6. Upsert Module 5
        SELECT id INTO m5_id FROM course_modules WHERE course_id = target_course_id AND sort_order = 5 LIMIT 1;
        IF m5_id IS NULL THEN
            INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview, created_at)
            VALUES (target_course_id, 'Неделя 5: Финальный Проект: Pensee (Всё в одном) & Релиз', 'Разработка супераппа Pensee, CI/CD, облачный деплой, финальная защита и получение сертификата.', 5, FALSE, NOW())
            RETURNING id INTO m5_id;
        ELSE
            UPDATE course_modules SET title = 'Неделя 5: Финальный Проект: Pensee (Всё в одном) & Релиз', description = 'Разработка супераппа Pensee, CI/CD, облачный деплой, финальная защита и получение сертификата.' WHERE id = m5_id;
        END IF;

        -- 7. Upsert 30 Lessons (6 lessons per module / 1 week = 6 lessons)
        -- Неделя 1 (Lessons 1-6)
        INSERT INTO lessons (course_id, module_id, day_number, sort_order, title, lesson_type, duration_minutes, is_free_preview, youtube_url, content, created_at)
        VALUES
        (target_course_id, m1_id, 1, 1, 'Что такое Вайбкодинг', 'VIDEO', 20, TRUE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 1: Что такое Вайбкодинг\nМягкий старт: концепция вайбкодинга, как эффективно думать и кодить в связке с ИИ.', NOW()),
        (target_course_id, m1_id, 2, 2, 'Внедрение в ИИ, лендинг, промпт инжиниринг', 'VIDEO', 25, TRUE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 2: Внедрение в ИИ\nБыстрое создание первого лендинга, основы промпт-инжиниринга и структурирования запросов к LLM.', NOW()),
        (target_course_id, m1_id, 3, 3, 'GitHub с нуля. Pages. Коммиты.', 'ARTICLE', 20, TRUE, NULL, '### Урок 3: GitHub с нуля\nБазовый Git: создание репозитория, первые коммиты, публикация лендинга на GitHub Pages.', NOW()),
        (target_course_id, m1_id, 4, 4, 'Структура проекта. MVP-фронтенд.', 'VIDEO', 30, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 4: Структура проекта\nОрганизация файлов простого веб-приложения, быстрый сбор первого интерактивного MVP.', NOW()),
        (target_course_id, m1_id, 5, 5, 'Бизнес идея, полный разбор. Планирование.', 'PRACTICE', 45, FALSE, NULL, '### Урок 5: Сложный практикум\nГлубокий разбор бизнес-идеи, составление спецификации проекта и сдача первого плана на AI-ревью.', NOW()),
        (target_course_id, m1_id, 6, 6, 'Инженерный дайджест: Лайфхаки вайбкодинга и квиз', 'QUIZ', 15, FALSE, NULL, '### Урок 6: Итоги 1-й недели\nИнформационный обзор частых ошибок новичков, полезные инструменты и легкий проверочный квиз.', NOW())
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
        (target_course_id, m2_id, 7, 7, 'Что такое фронтенд. FSD. Теория.', 'VIDEO', 30, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 7: Что такое фронтенд\nПонятие интерфейса, основы современной FSD (Feature-Sliced Design) методологии.', NOW()),
        (target_course_id, m2_id, 8, 8, 'Пет проект на фронте — Маркетплейс.', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 8: Маркетплейс\nПостановка задачи для пет-проекта, каталог товаров, корзина и карточки.', NOW()),
        (target_course_id, m2_id, 9, 9, 'Полное планирование. Гений архитектуры.', 'ARTICLE', 25, FALSE, NULL, '### Урок 9: Гений архитектуры\nДекомпозиция слоев FSD: entities (продукт), features (добавление в корзину), widgets (каталог).', NOW()),
        (target_course_id, m2_id, 10, 10, 'Реализация идеи. Дизайн.', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 10: Реализация и дизайн\nСборка интерфейса маркетплейса, адаптивная верстка, анимации и стили.', NOW()),
        (target_course_id, m2_id, 11, 11, 'Доведение до конца пет-проекта.', 'PRACTICE', 55, FALSE, NULL, '### Урок 11: Сложный практикум\nЗавершение всей функциональности маркетплейса, полировка деталей и сдача отчета.', NOW()),
        (target_course_id, m2_id, 12, 12, 'Инженерный дайджест: Разбор маркетплейса, UI-мемы и квиз', 'QUIZ', 15, FALSE, NULL, '### Урок 12: Итоги 2-й недели\nРазбор типовых ошибок при верстке интернет-магазинов, юмор в IT и квиз.', NOW())
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
        (target_course_id, m3_id, 13, 13, 'Архитектура проекта. Бэкенд + фронт + БД', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 13: Фулстек архитектура\nКак соединяются интерфейс, серверное API и база данных PostgreSQL.', NOW()),
        (target_course_id, m3_id, 14, 14, 'Трекер денег. Планирование.', 'VIDEO', 30, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 14: Трекер денег\nСпецификация пет-проекта учета финансов: транзакции, категории, баланс и аналитика.', NOW()),
        (target_course_id, m3_id, 15, 15, 'Реализация. Лендинг. Three.js.', 'VIDEO', 45, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 15: Three.js визуал\nСоздание промо-лендинга для Трекера денег с 3D-элементами на Three.js.', NOW()),
        (target_course_id, m3_id, 16, 16, 'До конца.', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 16: Доведение логики до конца\nСвязка бэкенда с фронтендом, сохранение транзакций в БД и обновление баланса.', NOW()),
        (target_course_id, m3_id, 17, 17, 'Тесты.', 'PRACTICE', 50, FALSE, NULL, '### Урок 17: Сложный практикум\nПокрытие ключевой логики подсчета денег тестами, сдача отчета по надежности.', NOW()),
        (target_course_id, m3_id, 18, 18, 'Инженерный дайджест: Ошибки в финансовых системах и квиз', 'QUIZ', 15, FALSE, NULL, '### Урок 18: Итоги 3-й недели\nИнформационный обзор багов округления и транзакций, проверочный квиз.', NOW())
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
        (target_course_id, m4_id, 19, 19, 'Trello. Испытание.', 'VIDEO', 35, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 19: Trello. Испытание\nСтарт пет-проекта канбан-доски: постановка требований к интерактивному drag-and-drop.', NOW()),
        (target_course_id, m4_id, 20, 20, 'Канбан-архитектура, dnd-kit и стейт-менеджмент', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 20: dnd-kit на практике\nРеализация перемещения карточек между колонками с мгновенным оптимистичным обновлением.', NOW()),
        (target_course_id, m4_id, 21, 21, 'Second Brain.', 'ARTICLE', 30, FALSE, NULL, '### Урок 21: Second Brain\nКонцепция личной базы знаний, организация markdown заметок и zettelkasten связей.', NOW()),
        (target_course_id, m4_id, 22, 22, 'Интеграция базы знаний и протоколы', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 22: Интеграция базы знаний\nСвязывание канбан-задач со страницами базы знаний и правилами проекта.', NOW()),
        (target_course_id, m4_id, 23, 23, 'Урок 5! (Сложный практикум: Защита Trello + Second Brain)', 'PRACTICE', 60, FALSE, NULL, '### Урок 23: Сложный практикум\nФинальная полировка проекта Trello + Second Brain и сдача отчета на AI-ревью.', NOW()),
        (target_course_id, m4_id, 24, 24, 'Инженерный дайджест: Инструменты продуктивности и квиз', 'QUIZ', 15, FALSE, NULL, '### Урок 24: Итоги 4-й недели\nОбзор инструментов разработчика (Obsidian, Notion, Trello) и квиз 4-й недели.', NOW())
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
        (target_course_id, m5_id, 25, 25, 'Pensee. Всё в одном.', 'VIDEO', 40, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 25: Pensee. Всё в одном\nАрхитектура выпускного супераппа Pensee: объединение задач, финансов, заметок и AI.', NOW()),
        (target_course_id, m5_id, 26, 26, 'Реализация супераппа и подключение AI', 'VIDEO', 45, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 26: Pensee Core\nСборка интерфейса, подключение AI-наставника и интеграция базы данных.', NOW()),
        (target_course_id, m5_id, 27, 27, 'Полировка UI, UX и Three.js анимаций', 'ARTICLE', 30, FALSE, NULL, '### Урок 27: UI & UX полировка\nСведение всех компонентов в единую темную дизайн-систему, адаптивность и плавность.', NOW()),
        (target_course_id, m5_id, 28, 28, 'CI/CD и облачный деплой (Fly.io + Vercel)', 'VIDEO', 45, FALSE, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '### Урок 28: Деплой в облако\nАвтоматическая сборка, GitHub Actions, деплой бэкенда на Fly.io и фронтенда на Vercel.', NOW()),
        (target_course_id, m5_id, 29, 29, 'Выпускной практикум: Защита проекта и сводный отчет', 'PRACTICE', 60, FALSE, NULL, '### Урок 29: Сложный выпускной практикум\nФинальная сдача проекта Pensee, прохождение полного чек-листа и защита отчета.', NOW()),
        (target_course_id, m5_id, 30, 30, 'Финишная прямая: Торжественное завершение и сертификат', 'QUIZ', 20, FALSE, NULL, '### Урок 30: Выпускной\nПодведение итогов 5 недель, генерация именного диплома и дальнейшие шаги разработчика.', NOW())
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
