-- MrDevCourses: Migration V67 - Add checklist column to lessons table

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS checklist TEXT;
