-- MrDevCourses: Add Live Demo URL and Mentor Review Fields to Homework Submissions
ALTER TABLE homework_submissions ADD COLUMN IF NOT EXISTS live_demo_url VARCHAR(500);
ALTER TABLE homework_submissions ADD COLUMN IF NOT EXISTS mentor_feedback TEXT;
ALTER TABLE homework_submissions ADD COLUMN IF NOT EXISTS reviewed_by BIGINT;

CREATE INDEX IF NOT EXISTS idx_homework_submissions_reviewed_at ON homework_submissions(reviewed_at);
