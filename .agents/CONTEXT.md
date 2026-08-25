# Current Project Context — MrDevCourses

## Status
- **Project Stage**: Level 3 Target (Phase 0 Complete — Project Scaffolding & Flyway V1..V5)
- **Developer Level**: Senior / Tech Lead
- **Stack**: Java 17, Spring Boot 3.3.0, PostgreSQL, Flyway (V1..V5), React 19, TypeScript, Vite, FSD, Tailwind CSS v4, React Query
- **Modules**:
  - `auth`: Google OAuth2, httpOnly cookie JWT, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout` (Next: Phase 1)
  - `course`: `GET /api/v1/courses`, `GET /api/v1/courses/{slug}`, `POST /api/v1/courses/{courseId}/enroll` (Planned)
  - `lesson`: Drip-content logic, `GET /api/v1/courses/{courseId}/lessons`, `GET /api/v1/courses/{courseId}/lessons/{lessonId}`, `POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete` (Planned)
  - `progress`: `GET /api/v1/progress`, `GET /api/v1/progress/{courseId}` (Planned)
  - `admin`: CRUD courses/lessons, students list, manual enrollment (Planned)
- **Test Baseline**: 100% green (Backend 1/1 SpringBootTest, Frontend 1/1 Vitest, `npm run build` passing)

## Active Backlog (Roadmap)
- [x] **Фаза 0 — Инициализация**: Монорепо (`backend/` + `frontend/`), Spring Boot 3, React + Vite + FSD, Flyway V1-V5, configs. [DONE]
- [ ] **Фаза 1 — Auth**: Google OAuth2 через Spring Security, JWT в httpOnly cookie, SecurityUtils, фронтенд auth. [NEXT]
- [ ] **Фаза 2 — Курсы и уроки**: Drip-логика в `LessonService`, YouTube embed, страницы каталога, курса и урока.
- [ ] **Фаза 3 — Прогресс и дашборд**: Личный кабинет студента, прогресс-бар, lock/unlock UI.
- [ ] **Фаза 4 — Админка**: Управление курсами/уроками, список студентов.
- [ ] **Фаза 5 — Деплой и полировка**: Dockerfile, fly.toml, CI/CD GitHub Actions, интеграционные тесты.
