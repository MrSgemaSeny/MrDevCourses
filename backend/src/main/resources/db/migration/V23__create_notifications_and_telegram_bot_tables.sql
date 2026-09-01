-- V23__create_notifications_and_telegram_bot_tables.sql
-- Создание инфраструктуры Telegram-бота, очереди Outbox и настроек уведомлений для MrDevCourses

-- 1. Telegram поля и трекинг активности пользователей
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_linked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS telegram_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS last_inactivity_email_sent_at TIMESTAMP WITH TIME ZONE;

-- 2. Таблица очереди исходящих уведомлений (Outbox)
CREATE TABLE IF NOT EXISTS notification_outbox (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    channel VARCHAR(20) NOT NULL, -- 'EMAIL', 'TELEGRAM'
    recipient VARCHAR(255) NOT NULL, -- email или chat_id
    event_type VARCHAR(60) NOT NULL, -- 'HELP_REQUEST_SOS', 'HOMEWORK_REVIEWED', 'LESSON_UNLOCKED', etc.
    subject VARCHAR(255),
    payload TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notification_outbox_pending 
ON notification_outbox(status, next_retry_at) 
WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id ON users(telegram_chat_id);