-- MrDevCourses: Migration V68 - Update default YouTube URL to official Mr Developer course video
UPDATE lessons
SET youtube_url = 'https://youtu.be/WSVQ4Qqh7uo?si=LbMmX-OpnDsZ4bUZ'
WHERE youtube_url = 'https://youtu.be/qnYl2ibf-rQ?si=_3UjIZihZ-z_MC6_'
   OR youtube_url LIKE '%qnYl2ibf-rQ%'
   OR day_number = 1;
