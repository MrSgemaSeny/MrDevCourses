-- Migration V70: Remove featured flags and reset likes on student project showcases
UPDATE project_showcases
SET featured = FALSE,
    likes_count = 0;
