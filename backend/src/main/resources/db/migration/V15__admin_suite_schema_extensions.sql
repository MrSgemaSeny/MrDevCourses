-- MrDevCourses: Admin Suite Schema Extensions
-- Adds cohort support to enrollments, draft/publish status to lessons, and ai_tutor_queries telemetry

-- 1. Link enrollments to cohorts
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS cohort_id BIGINT REFERENCES cohorts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_enrollments_cohort ON enrollments(cohort_id);

-- 2. Add is_published flag to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published);

-- 3. Create AI Tutor Queries telemetry table
CREATE TABLE IF NOT EXISTS ai_tutor_queries (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    course_id       BIGINT REFERENCES courses(id) ON DELETE SET NULL,
    lesson_id       BIGINT REFERENCES lessons(id) ON DELETE SET NULL,
    prompt          TEXT NOT NULL,
    response        TEXT,
    tokens_used     INT DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tutor_queries_user ON ai_tutor_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_queries_course ON ai_tutor_queries(course_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_queries_created_at ON ai_tutor_queries(created_at);
