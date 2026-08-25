# Current Project Context — MrDevCourses

## Status
- **Project Stage**: Level 3 — Production-Ready MVP Implementation Complete
- **Developer Level**: Senior / Tech Lead
- **Stack**: Java 17, Spring Boot 3.3.0, PostgreSQL, Flyway (V1..V5), React 19, TypeScript, Vite, FSD, Tailwind CSS v4 (Envie Dark Theme), TanStack React Query v5
- **Modules**:
  - `auth`: Google OAuth2, stateless JWT in `httpOnly` cookie (`mrdevcourses_token`), `SecurityUtils.getCurrentUserId()`, `/api/v1/auth/me`, `/api/v1/auth/logout`. [DONE]
  - `course`: Course catalog `GET /api/v1/courses`, slug routing `GET /api/v1/courses/{slug}`, enrollment `POST /api/v1/courses/{courseId}/enroll`. [DONE]
  - `lesson`: Drip-content engine `(NOW() - enrolled_at) >= ((day_number - 1) * INTERVAL '1 day')`, lesson list with lock/unlock status `GET /api/v1/courses/{courseId}/lessons`, lesson detail `GET /api/v1/courses/{courseId}/lessons/{lessonId}`, completion `POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete`, YouTube embed player. [DONE]
  - `progress`: Overview `GET /api/v1/progress`, detailed course progress `GET /api/v1/progress/{courseId}`, personal student dashboard. [DONE]
  - `admin`: Role-based admin panel (`ADMIN` role guard), CRUD courses, CRUD lessons, student roster and manual enrollment. [DONE]
- **Test Baseline**: 100% green (All Backend SpringBoot & Service unit/integration tests passing, Frontend 8/8 test files 21/21 Vitest tests passing, `npm run build` passing with zero errors).

## Active Backlog (Roadmap)
- [x] **Фаза 0 — Инициализация**: Монорепо (`backend/` + `frontend/`), Spring Boot 3, React + Vite + FSD, Flyway V1-V5, configs. [DONE]
- [x] **Фаза 1 — Auth**: Google OAuth2 через Spring Security, JWT в httpOnly cookie, SecurityUtils, AuthProvider, Login UI. [DONE]
- [x] **Фаза 2 — Курсы и уроки**: Drip-логика в `LessonService`, YouTube embed плеер, страницы каталога, курса и урока. [DONE]
- [x] **Фаза 3 — Прогресс и дашборд**: Личный кабинет студента, прогресс-бар, таймлайн дней, countdown до открытия. [DONE]
- [x] **Фаза 4 — Админка**: Управление курсами/уроками, список студентов, ручное зачисление. [DONE]
- [ ] **Фаза 5 — Деплой и полировка**: Dockerfile, fly.toml, CI/CD GitHub Actions.
