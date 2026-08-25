# Current Project Context — MrDevCourses

## Status
- **Project Stage**: Level 4 — Hardened, Full-Scale Release with Benchmarks Excellence (JF-1C + MeDev + Valeur + Envie)
- **Developer Level**: Senior / Tech Lead
- **Stack**: Java 17, Spring Boot 3.3.0, PostgreSQL 16, Flyway (V1..V7), React 19, TypeScript, Vite, FSD, Tailwind CSS v4 (Envie Dark Theme), TanStack React Query v5
- **Modules**:
  - `auth`: Google OAuth2, stateless JWT in `httpOnly` cookie (`mrdevcourses_token`), `SecurityUtils.getCurrentUserId()`, `/api/v1/auth/me`, `/api/v1/auth/logout`. [DONE]
  - `course`: Course catalog `GET /api/v1/courses`, slug routing `GET /api/v1/courses/{slug}`, enrollment `POST /api/v1/courses/{courseId}/enroll`. [DONE]
  - `lesson`: Drip-content engine `(NOW() - enrolled_at) >= ((day_number - 1) * INTERVAL '1 day')`, lesson list with lock/unlock status `GET /api/v1/courses/{courseId}/lessons`, lesson detail `GET /api/v1/courses/{courseId}/lessons/{lessonId}`, completion `POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete`, YouTube embed player. [DONE]
  - `progress`: Overview `GET /api/v1/progress`, detailed course progress `GET /api/v1/progress/{courseId}`, personal student dashboard, streaks calculation. [DONE]
  - `audit`: `AuditLog` entity, `AuditLogRepository`, `AuditService` logging auth, enrollments, completions, admin actions. [DONE]
  - `admin`: Role-based admin panel (`ADMIN` role guard), CRUD courses, CRUD lessons, student roster and manual enrollment. [DONE]
  - `security`: `SecurityHeadersFilter` (CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy). [DONE]
  - `ui/widgets`: `VisualRoadmap`, `MarkdownViewer` with code highlighting/copy, `CountdownTimer`, `CertificateModal`. [DONE]
  - `infra`: `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`. [DONE]
- **Test Baseline**: 100% green (57 backend tests passing, 21 frontend Vitest tests passing, `npm run build` production bundle built with 0 errors).
