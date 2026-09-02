-- MrDevCourses: Migration V26 - Update default YouTube URL to official Mr Developer course trailer/lesson video
UPDATE lessons
SET youtube_url = 'https://youtu.be/qnYl2ibf-rQ?si=_3UjIZihZ-z_MC6_'
WHERE youtube_url IS NOT NULL OR day_number = 1;
