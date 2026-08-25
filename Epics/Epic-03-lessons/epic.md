# Epic-03: Уроки и Drip-логика (Lessons & Drip Engine)

## Статус
- **Статус:** Planned
- **Приоритет:** P0

## Цель
Реализовать механику drip-доступа к урокам: урок N доступен строго при `NOW() - enrolled_at >= (day_number - 1) days`. Встроенный просмотр видео (YouTube) и текста.

## Задачи
- [ ] Сущности `Lesson` и `LessonProgress`, репозитории и сервисы.
- [ ] SQL/JPQL запросы расчета доступности уроков в UTC.
- [ ] Эндпоинты `GET /api/v1/courses/{courseId}/lessons`, `GET /api/v1/courses/{courseId}/lessons/{lessonId}`.
- [ ] Эндпоинт отметки завершения урока `POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete`.
- [ ] Защита от прямого IDOR и обхода таймера на бэкенде.
- [ ] Frontend: Плеер урока, блокировка по дням, отображение даты открытия заблокированных уроков.
