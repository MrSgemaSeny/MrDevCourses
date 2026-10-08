-- Migration V69: Seed student graduation projects for showcase wall (/projects)

-- 1. Ensure students exist in users table
INSERT INTO users (email, name, role, avatar_url, created_at)
VALUES 
    ('usman@mrdevcourses.com', 'Усман Сулейманов', 'STUDENT', 'https://github.com/usmansulaimanov.png', NOW())
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO users (email, name, role, avatar_url, created_at)
VALUES 
    ('ratmir@mrdevcourses.com', 'Ратмир Мекенов', 'STUDENT', 'https://github.com/rmekenov-pixel.png', NOW())
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url;

-- 2. Insert student projects into project_showcases
DO $$
DECLARE
    v_course_id BIGINT;
    v_usman_id BIGINT;
    v_ratmir_id BIGINT;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE slug = 'mrdeveloper' LIMIT 1;
    SELECT id INTO v_usman_id FROM users WHERE email = 'usman@mrdevcourses.com' LIMIT 1;
    SELECT id INTO v_ratmir_id FROM users WHERE email = 'ratmir@mrdevcourses.com' LIMIT 1;

    -- Project 1: Tandamen.kz (Commercial live startup by Usman)
    IF NOT EXISTS (SELECT 1 FROM project_showcases WHERE live_demo_url = 'https://tandamen.kz/') THEN
        INSERT INTO project_showcases (
            user_id, course_id, title, description,
            live_demo_url, github_repo_url, author_name, author_avatar_url,
            tech_stack, featured, likes_count, created_at
        ) VALUES (
            v_usman_id, v_course_id,
            'Таңда (Tanda) — Платформа аудио и электронных книг',
            'Полноценный запущенный коммерческий веб-сервис на собственном домене: қазақ тіліндегі аудиокітаптар мен электронды кітаптар платформасы. PWA, онлайн-оқу, аудио-плеер, 100+ кітап.',
            'https://tandamen.kz/',
            'https://github.com/usmansulaimanov',
            'Усман Сулейманов',
            'https://github.com/usmansulaimanov.png',
            'React, TypeScript, PWA, Audio Stream, SEO',
            TRUE, 14, NOW() - INTERVAL '4 days'
        );
    END IF;

    -- Project 2: QazaqMarket by Ratmir
    IF NOT EXISTS (SELECT 1 FROM project_showcases WHERE live_demo_url = 'https://rmekenov-pixel.github.io/test-marketplace/') THEN
        INSERT INTO project_showcases (
            user_id, course_id, title, description,
            live_demo_url, github_repo_url, author_name, author_avatar_url,
            tech_stack, featured, likes_count, created_at
        ) VALUES (
            v_ratmir_id, v_course_id,
            'QazaqMarket — Онлайн маркетплейс книг',
            'Казахстанский маркетплейс книг с рубрикатором, корзиной, умной фильтрацией и быстрым оформлением заказов.',
            'https://rmekenov-pixel.github.io/test-marketplace/',
            'https://github.com/rmekenov-pixel/test-marketplace',
            'Ратмир Мекенов',
            'https://github.com/rmekenov-pixel.png',
            'React 19, Vite, TypeScript, Tailwind CSS',
            TRUE, 9, NOW() - INTERVAL '3 days'
        );
    END IF;

    -- Project 3: KitapAll Marketplace by Usman
    IF NOT EXISTS (SELECT 1 FROM project_showcases WHERE live_demo_url = 'https://usmansulaimanov.github.io/test_marketplace/#/') THEN
        INSERT INTO project_showcases (
            user_id, course_id, title, description,
            live_demo_url, github_repo_url, author_name, author_avatar_url,
            tech_stack, featured, likes_count, created_at
        ) VALUES (
            v_usman_id, v_course_id,
            'KitapAll — Заманауи киім және кітап маркетплейсі',
            'Маркетплейс с каталогом товаров, переключением темной/светлой темы, интерактивной корзиной и адаптивным интерфейсом.',
            'https://usmansulaimanov.github.io/test_marketplace/#/',
            'https://github.com/usmansulaimanov/test_marketplace',
            'Усман Сулейманов',
            'https://github.com/usmansulaimanov.png',
            'React 19, Vite, TypeScript, Tailwind CSS',
            FALSE, 7, NOW() - INTERVAL '2 days'
        );
    END IF;

    -- Project 4: Global Coffee Landing by Usman
    IF NOT EXISTS (SELECT 1 FROM project_showcases WHERE live_demo_url = 'https://usmansulaimanov.github.io/landing/') THEN
        INSERT INTO project_showcases (
            user_id, course_id, title, description,
            live_demo_url, github_repo_url, author_name, author_avatar_url,
            tech_stack, featured, likes_count, created_at
        ) VALUES (
            v_usman_id, v_course_id,
            'Global Coffee — Сеть кофеен',
            'Презентационный лендинг сети кофеен в Шымкенте и на юге Казахстана с эстетичным Glassmorphism-дизайном, меню и картой локаций.',
            'https://usmansulaimanov.github.io/landing/',
            'https://github.com/usmansulaimanov/landing',
            'Усман Сулейманов',
            'https://github.com/usmansulaimanov.png',
            'HTML5, CSS3, JavaScript, Glassmorphism',
            FALSE, 5, NOW() - INTERVAL '1 day'
        );
    END IF;

    -- Project 5: Digital Projects Hub by Ratmir
    IF NOT EXISTS (SELECT 1 FROM project_showcases WHERE live_demo_url = 'https://rmekenov-pixel.github.io/landing/') THEN
        INSERT INTO project_showcases (
            user_id, course_id, title, description,
            live_demo_url, github_repo_url, author_name, author_avatar_url,
            tech_stack, featured, likes_count, created_at
        ) VALUES (
            v_ratmir_id, v_course_id,
            'Digital Projects Hub — Spotify & MindCheck',
            'Портал цифровых сервисов с интерактивным музыкальным плеером Spotify и психологическим трекером MindCheck.',
            'https://rmekenov-pixel.github.io/landing/',
            'https://github.com/rmekenov-pixel/landing',
            'Ратмир Мекенов',
            'https://github.com/rmekenov-pixel.png',
            'HTML5, CSS3, JavaScript, Spotify API',
            FALSE, 6, NOW()
        );
    END IF;
END $$;
