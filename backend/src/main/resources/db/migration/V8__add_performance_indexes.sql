-- MrDevCourses: Add composite performance indexes for courses and enrollments
CREATE INDEX IF NOT EXISTS idx_courses_active_created ON courses(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_enrolled ON enrollments(user_id, enrolled_at DESC);
