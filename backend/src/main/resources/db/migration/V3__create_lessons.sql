CREATE TABLE lessons (
    id           BIGSERIAL PRIMARY KEY,
    course_id    BIGINT       NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    content      TEXT,
    youtube_url  VARCHAR(500),
    day_number   INT          NOT NULL,
    sort_order   INT          NOT NULL DEFAULT 0,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_lessons_course_day UNIQUE (course_id, day_number)
);

CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_course_sort ON lessons(course_id, sort_order);
