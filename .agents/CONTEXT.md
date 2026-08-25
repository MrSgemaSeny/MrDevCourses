# Current Project Context — MrDevCourses

## Status
- **Project Stage**: Level 4 — Hardened, Full-Scale Release with Benchmarks Excellence (JF-1C + MeDev + Valeur + Envie)
- **Developer Level**: Senior / Tech Lead
- **Stack**: Java 17, Spring Boot 3.3.0, PostgreSQL 16, Flyway (V1..V8), React 19, TypeScript, Vite, FSD, Tailwind CSS v4 (Envie Dark Theme), TanStack React Query v5
- **Modules**:
  - `auth`: Google OAuth2, stateless JWT in `httpOnly` cookie (`mrdevcourses_token`), `SecurityUtils.getCurrentUserId()`, `/api/v1/auth/me`, `/api/v1/auth/logout`. Clean FSD `authContext` export. [DONE]
  - `course`: Course catalog `GET /api/v1/courses`, slug routing `GET /api/v1/courses/{slug}`, enrollment `POST /api/v1/courses/{courseId}/enroll`. Zero N+1 batch query optimizations. [DONE]
  - `lesson`: Drip-content engine `(NOW() - enrolled_at) >= ((day_number - 1) * INTERVAL '1 day')`, `LessonLockedException` HTTP 403 with `opensAt` metadata, lesson list `GET /api/v1/courses/{courseId}/lessons`, lesson detail `GET /api/v1/courses/{courseId}/lessons/{lessonId}`, completion `POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete`, YouTube embed player. [DONE]
  - `progress`: Overview `GET /api/v1/progress`, detailed course progress `GET /api/v1/progress/{courseId}`, personal student dashboard, study streak calculation. Zero N+1 batch queries. [DONE]
  - `audit`: `AuditLog` entity, `AuditLogRepository`, `AuditService` logging auth, enrollments, completions, admin actions. [DONE]
  - `admin`: Role-based admin panel (`ADMIN` role guard), CRUD courses, CRUD lessons, student roster and manual enrollment. Batch sort order & duplicate validation. [DONE]
  - `security`: `SecurityHeadersFilter` (CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy). [DONE]
  - `db/perf`: Flyway `V8__add_performance_indexes.sql` with compound indices on `lessons`, `enrollments`, `lesson_progress`, and `certificates`. [DONE]
  - `ui/widgets`: `VisualRoadmap`, `MarkdownViewer` with code highlighting/copy, `CountdownTimer`, `CertificateModal`. Full a11y ARIA semantics. [DONE]
  - `infra`: `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`, `React.lazy`/`Suspense` route-splitting (137.65 kB total gzip bundle). [DONE]
- **Test Baseline**: 100% green (58 backend tests passing, 21 frontend Vitest tests passing, `npm run build` production bundle built with 0 errors). Forensic audit 100% CLEAN.

