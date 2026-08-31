-- V18: Create project_showcases table for Phase 1 Public Graduation Wall (/projects)
CREATE TABLE IF NOT EXISTS project_showcases (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url VARCHAR(1024),
    live_demo_url VARCHAR(1024) NOT NULL,
    github_repo_url VARCHAR(1024) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_avatar_url VARCHAR(1024),
    tech_stack VARCHAR(255) DEFAULT 'React 19, Vite, Tailwind CSS',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    likes_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_showcases_featured_created ON project_showcases(featured DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_showcases_user ON project_showcases(user_id);
