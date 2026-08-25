ALTER TABLE users
    ADD COLUMN current_streak INT NOT NULL DEFAULT 0,
    ADD COLUMN longest_streak INT NOT NULL DEFAULT 0,
    ADD COLUMN last_active_date DATE;

CREATE TABLE certificates (
    id BIGSERIAL PRIMARY KEY,
    certificate_code VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_user_course_certificate UNIQUE (user_id, course_id)
);

CREATE INDEX idx_certificates_code ON certificates(certificate_code);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
