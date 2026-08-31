-- V17: Create student_help_requests table for SOS signals, mentor triage, and future RAG dataset
CREATE TABLE IF NOT EXISTS student_help_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    step_identifier VARCHAR(128) NOT NULL,
    step_title VARCHAR(256),
    problem_text TEXT NOT NULL,
    error_logs TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    mentor_solution TEXT,
    resolved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_help_requests_lesson ON student_help_requests(lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_help_requests_user ON student_help_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_student_help_requests_status ON student_help_requests(status);
CREATE INDEX IF NOT EXISTS idx_student_help_requests_created ON student_help_requests(created_at DESC);
