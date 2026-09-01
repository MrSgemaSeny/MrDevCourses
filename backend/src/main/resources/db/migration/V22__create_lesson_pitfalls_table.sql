-- V22__create_lesson_pitfalls_table.sql
-- Создание таблицы типичных ошибок и решений (Common Pitfalls) для уроков

CREATE TABLE IF NOT EXISTS lesson_pitfalls (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    error_symptom TEXT,
    solution_markdown TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_pitfalls_lesson_id ON lesson_pitfalls(lesson_id);