-- V21__add_profile_fields_to_users.sql
-- Добавление полей профиля пользователя: telegram, github, bio, goal

ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_username VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS goal VARCHAR(255);