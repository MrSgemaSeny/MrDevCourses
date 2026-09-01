# Epic-03: Уроки и Drip-логика (Lessons & Drip Engine)

## Статус
- **Статус:** Completed
- **Приоритет:** P0

## Цель
Реализовать механику drip-доступа к урокам: урок N доступен строго при `NOW() - enrolled_at >= (day_number - 1) days`. Встроенный просмотр видео (YouTube) и конспекта с материалами, граблями и SOS-сигналом.

## Задачи
- [x] Сущности `Lesson`, `CourseModule`, `LessonMaterial`, `LessonPitfall` и `LessonProgress`.
- [x] SQL/JPQL запросы расчета доступности уроков в UTC без фоновых планировщиков.
- [x] Эндпоинты `GET /api/v1/courses/{courseId}/lessons`, `GET /api/v1/courses/{courseId}/lessons/{lessonId}`.
- [x] Эндпоинт отметки завершения урока `POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete`.
- [x] Защита от прямого IDOR и обхода таймера на бэкенде.
- [x] Frontend: Плеер урока, Quick-Nav drawer, блокировка по дням, типичные грабли и SOS-модалка помощи.
