-- V20__create_project_likes_table.sql
-- Создание таблицы project_likes для защиты от накрутки (1 пользователь = 1 лайк с toggle)

CREATE TABLE IF NOT EXISTS project_likes (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES project_showcases(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_project_user_like UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_likes_user_id ON project_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON project_likes(project_id);

