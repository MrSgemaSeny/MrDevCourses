-- MrDevCourses: Enterprise Domain Hierarchy Migration
-- Course -> CourseModule -> Lesson -> Materials + Quizzes + Cohorts

-- 1. Course Modules / Chapters
CREATE TABLE IF NOT EXISTS course_modules (
    id               BIGSERIAL PRIMARY KEY,
    course_id        BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    sort_order       INT NOT NULL DEFAULT 1,
    is_free_preview  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id, sort_order);

-- 2. Update Lessons table with module_id, type, duration, preview
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_id BIGINT REFERENCES course_modules(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS lesson_type VARCHAR(50) NOT NULL DEFAULT 'VIDEO';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_minutes INT NOT NULL DEFAULT 0;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_free_preview BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);

-- 3. Data Migration: Create default module for existing courses and link lessons
DO $$
DECLARE
    r RECORD;
    new_module_id BIGINT;
BEGIN
    FOR r IN SELECT id, title FROM courses LOOP
        IF NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = r.id) THEN
            INSERT INTO course_modules (course_id, title, description, sort_order, is_free_preview)
            VALUES (r.id, 'Модуль 1: Архитектурный фундамент и разработка', 'Базовый модуль курса', 1, TRUE)
            RETURNING id INTO new_module_id;

            UPDATE lessons SET module_id = new_module_id WHERE course_id = r.id AND module_id IS NULL;
        END IF;
    END LOOP;
END
$$;

-- 4. Lesson Attachments & Materials (Cheat-sheets, Source Code, PDF)
CREATE TABLE IF NOT EXISTS lesson_materials (
    id             BIGSERIAL PRIMARY KEY,
    lesson_id      BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title          VARCHAR(255) NOT NULL,
    material_type  VARCHAR(50) NOT NULL DEFAULT 'CHEAT_SHEET',
    url            VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    sort_order     INT NOT NULL DEFAULT 1,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson ON lesson_materials(lesson_id, sort_order);

-- 5. Quizzes & Interactive Assessment
CREATE TABLE IF NOT EXISTS quizzes (
    id                       BIGSERIAL PRIMARY KEY,
    lesson_id                BIGINT NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
    title                    VARCHAR(255) NOT NULL,
    description              TEXT,
    passing_score_percentage INT NOT NULL DEFAULT 80,
    max_attempts             INT NOT NULL DEFAULT 3,
    time_limit_seconds       INT NOT NULL DEFAULT 600,
    created_at               TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id             BIGSERIAL PRIMARY KEY,
    quiz_id        BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text  TEXT NOT NULL,
    question_type  VARCHAR(50) NOT NULL DEFAULT 'SINGLE_CHOICE',
    explanation    TEXT,
    points         INT NOT NULL DEFAULT 1,
    sort_order     INT NOT NULL DEFAULT 1,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id, sort_order);

CREATE TABLE IF NOT EXISTS quiz_question_options (
    id          BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order  INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON quiz_question_options(question_id);

CREATE TABLE IF NOT EXISTS quiz_submissions (
    id               BIGSERIAL PRIMARY KEY,
    quiz_id          BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score_percentage INT NOT NULL DEFAULT 0,
    passed           BOOLEAN NOT NULL DEFAULT FALSE,
    answers_payload  TEXT,
    started_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user ON quiz_submissions(user_id, quiz_id);

-- 6. Cohorts (Learning Batches)
CREATE TABLE IF NOT EXISTS cohorts (
    id           BIGSERIAL PRIMARY KEY,
    course_id    BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    start_date   TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date     TIMESTAMP WITH TIME ZONE,
    max_students INT DEFAULT 50,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cohorts_course ON cohorts(course_id, is_active);
