-- MrDevCourses: Enterprise Vectorization and Automation Schema
-- Extensions for vector similarity search and trigram matching
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Lesson Semantic Chunks for Dense + Sparse Hybrid Search
CREATE TABLE IF NOT EXISTS lesson_chunks (
    id            BIGSERIAL PRIMARY KEY,
    lesson_id     BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    course_id     BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    chunk_index   INT NOT NULL,
    chunk_type    VARCHAR(50) NOT NULL DEFAULT 'THEORY',
    header        VARCHAR(255),
    content       TEXT NOT NULL,
    token_count   INT NOT NULL DEFAULT 0,
    content_hash  VARCHAR(64) NOT NULL,
    embedding     vector(1536),
    metadata      JSONB,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_lesson_chunks_lesson_index UNIQUE (lesson_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_lesson_chunks_lesson ON lesson_chunks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_chunks_course ON lesson_chunks(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_chunks_hash ON lesson_chunks(content_hash);
CREATE INDEX IF NOT EXISTS idx_lesson_chunks_fts ON lesson_chunks USING gin (to_tsvector('russian', content));
CREATE INDEX IF NOT EXISTS idx_lesson_chunks_hnsw ON lesson_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- 2. Semantic Glossary Term Embeddings for Auto-Linking
CREATE TABLE IF NOT EXISTS glossary_embeddings (
    id          BIGSERIAL PRIMARY KEY,
    course_id   BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    term        VARCHAR(150) NOT NULL,
    category    VARCHAR(100),
    definition  TEXT NOT NULL,
    embedding   vector(1536),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_glossary_embeddings_course_term UNIQUE (course_id, term)
);

CREATE INDEX IF NOT EXISTS idx_glossary_embeddings_course ON glossary_embeddings(course_id);
CREATE INDEX IF NOT EXISTS idx_glossary_embeddings_hnsw ON glossary_embeddings USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- 3. Automated Homework Submissions & AI Code Grader
CREATE TABLE IF NOT EXISTS homework_submissions (
    id                  BIGSERIAL PRIMARY KEY,
    lesson_id           BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id           BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    code_snippet        TEXT NOT NULL,
    repository_url      VARCHAR(500),
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    score               INT DEFAULT 0,
    ai_feedback         TEXT,
    passed_tests_count  INT DEFAULT 0,
    total_tests_count   INT DEFAULT 0,
    security_flags      TEXT,
    reviewed_at         TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homework_user_lesson ON homework_submissions(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_homework_status ON homework_submissions(status);
CREATE INDEX IF NOT EXISTS idx_homework_course ON homework_submissions(course_id);

-- 4. Transactional Outbox for Reliable Async Automation & Ingestion
CREATE TABLE IF NOT EXISTS outbox_events (
    id              BIGSERIAL PRIMARY KEY,
    aggregate_type  VARCHAR(100) NOT NULL,
    aggregate_id    BIGINT NOT NULL,
    event_type      VARCHAR(100) NOT NULL,
    payload         TEXT NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    retry_count     INT NOT NULL DEFAULT 0,
    error_message   TEXT,
    processed_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox_events(status, created_at);
