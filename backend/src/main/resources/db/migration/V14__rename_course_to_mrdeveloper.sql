-- Migration V14: Rename Course to MrDeveloper and slug to mrdeveloper
UPDATE courses 
SET title = 'MrDeveloper',
    slug = 'mrdeveloper',
    description = 'Практический курс по разработке современных веб-приложений с использованием ИИ, архитектурных протоколов и лучших инженерных практик. 5 модулей, 30 уроков.'
WHERE id > 0;
