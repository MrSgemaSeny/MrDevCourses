# Project: MrDevCourses Admin Suite & Management Console

## Architecture
- **Backend Architecture**: Spring Boot 3.3.0, Java 17, PostgreSQL 17 (pgvector, pg_trgm), Flyway (V1..V15), Spring Security 6 (stateless JWT in httpOnly cookie `MrDev_token` / `mrdevcourses_token`, RBAC with STUDENT and ADMIN roles).
- **Frontend Architecture**: React 19, TypeScript, Vite, Feature-Sliced Design (FSD: `app`, `pages`, `widgets`, `features`, `entities`, `shared`), Tailwind CSS v4, TanStack React Query v5.
- **Design System**: Strict modern dark monochrome aesthetic (`#0a0a0c` base background, `#18181b` cards/surfaces, `rgba(255, 255, 255, 0.08)` / `border-white/5` borders, 4 font sizes: `text-2xl`, `text-sm`, `text-xs`, `text-[10px]`, zero blue noise, zero emojis).
- **Scope Limit**: Level 3 — Educational MVP (учебная LMS-платформа; локальный запуск, чистая архитектура без избыточного оверинжиниринга).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Course Management CRUD | Create, read, update, delete courses; instant draft/publish toggling | M1 | ORIGINAL_REQUEST §R1 |
| 2 | CourseModule Management & Reorder | Create, edit, delete modules, sort order, free preview flag, batch reorder | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Lesson Authoring Suite | Create, edit, delete lessons with module binding, type, duration, content | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Batch Drag-and-Drop Reordering | Visual DnD reordering of modules and lessons with atomic two-phase update and drip recalculation | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Live Markdown Preview & Video Embed | Split-screen Markdown editing with live preview and YouTube video URL validation/embed | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Lesson Materials Attachment | Attach, edit, remove cheat sheets, source code links, PDFs, and repository URLs | M1 | ORIGINAL_REQUEST §R1 |
| 7 | Quiz Builder & Question Editor | Bind quizzes to lessons, configure passing score (80%), attempts, questions, and options | M1 | ORIGINAL_REQUEST §R1 |
| 8 | Student Search & Filter | Server-side and client-side real-time student search by name/email, filter by role/course | M2 | ORIGINAL_REQUEST §R2 |
| 9 | Instant RBAC Role Switch | Toggle user role between STUDENT and ADMIN with Self-Demotion and Last-Admin protection | M2 | ORIGINAL_REQUEST §R2 |
| 10 | Manual Enrollment & Unenrollment | Enroll/unenroll students with audit logging and immediate UI state synchronization | M2 | ORIGINAL_REQUEST §R2 |
| 11 | Student Progress & Streak Inspector | Slide-over drawer with detailed lesson completion history, streak metrics, quiz scores | M2 | ORIGINAL_REQUEST §R2 |
| 12 | Cohort Management & Unlock Schedules | Create and manage cohorts with start/end dates, max capacity, and student assignments | M2 | ORIGINAL_REQUEST §R2 |
| 13 | Overview KPI Dashboard | Real-time platform KPI metrics (total students, enrollments, completions, average streak) | M3 | ORIGINAL_REQUEST §R3 |
| 14 | Course Step-by-Step Funnel | Interactive course funnel chart with conversion rates and drop-off percentages per lesson | M3 | ORIGINAL_REQUEST §R3 |
| 15 | Streak Distribution Histogram | Student activity distribution across streak buckets (0, 1-3, 4-7, 8-14, 15+ days) | M3 | ORIGINAL_REQUEST §R3 |
| 16 | Granular Lesson Retention Matrix | Lesson retention table showing drop-offs, completion rates, and average time to complete | M3 | ORIGINAL_REQUEST §R3 |
| 17 | AI Tutor Telemetry Summary | Query volume, token usage, rate-limit throttling counts, and top question topics | M3 | ORIGINAL_REQUEST §R3 |
| 18 | Quiz Failure Hotspots | Top problematic quiz questions with highest failure rates and common wrong options | M3 | ORIGINAL_REQUEST §R3 |
| 19 | CSV/JSON Analytics Export | Export aggregated course, funnel, and student analytics to CSV or JSON format | M3 | ORIGINAL_REQUEST §R3 |
| 20 | Immutable Audit Log Viewer | Paginated audit log table with filter by actor, action, entity, dates, and diff modal | M4 | ORIGINAL_REQUEST §R4 |
| 21 | Rate Limit Real-time Telemetry | Live monitor for Bucket4j token bucket cache tiers (AUTH, AI, GENERAL) and throttled events | M4 | ORIGINAL_REQUEST §R4 |
| 22 | System & DB Health Telemetry | Telemetry for HikariCP connection pool, PostgreSQL uptime, Flyway version, Outbox queue | M4 | ORIGINAL_REQUEST §R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Suite Track | Requirement-driven opaque-box test suite across Tiers 1-4 | none | IN_PROGRESS (2346a98e) |
| M1 | Course & Curriculum Authoring (R1) | Backend Module/Lesson/Material/Quiz APIs + Frontend Visual DnD Curriculum Editor & Markdown Preview | none | IN_PROGRESS (d5c630c5) |
| M2 | Student & Cohort Management (R2) | Backend Student search, RBAC toggle, Cohorts APIs + Frontend Student Console & Progress Drawer | M1 | IN_PROGRESS (cddef211) |
| M3 | Platform Analytics & Telemetry (R3) | Backend Analytics, AI Telemetry, Quiz Hotspots, Export + Frontend Charts & Dashboard | M1 | IN_PROGRESS (ee6161a4) |
| M4 | Security, Audit Logs & Health (R4) | Backend Audit Log REST API, Rate Limit & DB Health + Frontend Audit Viewer & Health Monitor | M2 | IN_PROGRESS (ca53c59b) |
| M5 | Final E2E Pass & Hardening | 100% E2E test pass (Tiers 1-4), Tier 5 Adversarial hardening, Forensic Integrity Audit | E2E, M1-M4 | PLANNED |

## Code Layout
### Backend (`backend/src/main/java/com/mrdev/`)
- `modules/admin/controller/`: `AdminController.java`, `AdminModuleController.java`, `AdminCurriculumController.java`, `AdminMaterialController.java`, `AdminQuizController.java`, `AdminStudentController.java`, `AdminCohortController.java`, `AdminAnalyticsController.java`, `AdminAuditController.java`, `AdminSystemController.java`.
- `modules/admin/service/`: `AdminService.java`, `AdminCurriculumService.java`, `AdminStudentService.java`, `AdminAnalyticsService.java`, `AdminAuditQueryService.java`, `AdminSystemService.java`.
- `modules/admin/dto/`: DTO classes for requests and responses across R1-R4.
- `modules/audit/service/`: `AuditService.java`.
- `db/migration/`: `V15__admin_suite_schema_extensions.sql`.

### Frontend (`frontend/src/`)
- `app/layout/`: `AdminLayout.tsx` (Admin Shell with sidebar navigation).
- `app/router/`: `index.tsx`, `ProtectedRoute.tsx`.
- `pages/admin/`: `AdminPage.tsx`, `AdminCurriculumPage.tsx`, `AdminStudentsPage.tsx`, `AdminAnalyticsPage.tsx`, `AdminAuditPage.tsx`, `AdminSystemPage.tsx`.
- `widgets/admin-curriculum/`: Visual curriculum tree, module block, lesson item, drag-and-drop reorder, Live Markdown preview modal, YouTube validator, quiz editor.
- `widgets/admin-students/`: Student search/filter table, RBAC role toggle, student progress drawer, cohort management modal.
- `widgets/admin-telemetry/`: Overview KPI cards, Funnel chart, Streak distribution, AI tutor telemetry, Quiz hotspots, CSV/JSON export.
- `widgets/admin-audit/`: Audit log table, filter toolbar, JSON change diff modal, Rate limit monitor, DB health status card.
- `entities/`: `adminApi.ts`, `adminAnalyticsApi.ts`, `adminAuditApi.ts`, `adminSystemApi.ts`.

## Interface Contracts
### Admin Curriculum API ↔ Frontend Curriculum Editor
- `GET /api/v1/admin/courses` -> `ApiResponse<List<CourseDto>>`
- `POST /api/v1/admin/courses` -> `ApiResponse<CourseDto>`
- `PUT /api/v1/admin/courses/{id}` -> `ApiResponse<CourseDto>`
- `DELETE /api/v1/admin/courses/{id}` -> `ApiResponse<Void>`
- `GET /api/v1/admin/courses/{courseId}/modules` -> `ApiResponse<List<CourseModuleDto>>`
- `POST /api/v1/admin/courses/{courseId}/modules` -> `ApiResponse<CourseModuleDto>`
- `PUT /api/v1/admin/modules/{moduleId}` -> `ApiResponse<CourseModuleDto>`
- `DELETE /api/v1/admin/modules/{moduleId}` -> `ApiResponse<Void>`
- `PUT /api/v1/admin/courses/{courseId}/modules/reorder` -> `ApiResponse<List<CourseModuleDto>>`
- `POST /api/v1/admin/courses/{courseId}/lessons` -> `ApiResponse<LessonDetailDto>`
- `PUT /api/v1/admin/lessons/{lessonId}` -> `ApiResponse<LessonDetailDto>`
- `DELETE /api/v1/admin/lessons/{lessonId}` -> `ApiResponse<Void>`
- `PUT /api/v1/admin/courses/{courseId}/lessons/reorder` -> `ApiResponse<List<LessonDetailDto>>`
- `POST /api/v1/admin/lessons/{lessonId}/materials` -> `ApiResponse<LessonMaterialDto>`
- `DELETE /api/v1/admin/materials/{materialId}` -> `ApiResponse<Void>`
- `POST /api/v1/admin/lessons/{lessonId}/quiz` -> `ApiResponse<QuizDto>`
- `DELETE /api/v1/admin/quizzes/{quizId}` -> `ApiResponse<Void>`

### Admin Student & Cohort API ↔ Frontend Student Console
- `GET /api/v1/admin/students?q={}&role={}&courseId={}&page={}&size={}` -> `ApiResponse<PageResponse<StudentDto>>`
- `PATCH /api/v1/admin/students/{userId}/role` (body: `{"role": "ADMIN"|"STUDENT"}`) -> `ApiResponse<StudentDto>`
- `POST /api/v1/admin/students/{userId}/enroll/{courseId}` -> `ApiResponse<EnrollmentDto>`
- `DELETE /api/v1/admin/students/{userId}/enroll/{courseId}` -> `ApiResponse<Void>`
- `GET /api/v1/admin/students/{userId}/progress` -> `ApiResponse<StudentProgressDetailDto>`
- `GET /api/v1/admin/courses/{courseId}/cohorts` -> `ApiResponse<List<CohortDto>>`
- `POST /api/v1/admin/courses/{courseId}/cohorts` -> `ApiResponse<CohortDto>`

### Admin Analytics & Audit API ↔ Frontend Telemetry & Security
- `GET /api/v1/admin/analytics/overview` -> `ApiResponse<AdminOverviewMetricsDto>`
- `GET /api/v1/admin/analytics/courses/{courseId}/funnel` -> `ApiResponse<List<CourseFunnelStepDto>>`
- `GET /api/v1/admin/analytics/streaks` -> `ApiResponse<List<StreakDistributionDto>>`
- `GET /api/v1/admin/analytics/courses/{courseId}/retention` -> `ApiResponse<CourseRetentionDto>`
- `GET /api/v1/admin/analytics/ai-tutor/summary` -> `ApiResponse<AiTutorTelemetryDto>`
- `GET /api/v1/admin/analytics/quizzes/hotspots` -> `ApiResponse<List<QuizHotspotDto>>`
- `GET /api/v1/admin/analytics/export?courseId={}&format={csv|json}` -> File stream / JSON
- `GET /api/v1/admin/audit-logs?userId={}&action={}&entityType={}&from={}&to={}&page={}&size={}` -> `ApiResponse<PageResponse<AuditLogDto>>`
- `GET /api/v1/admin/system/rate-limits` -> `ApiResponse<RateLimitTelemetryDto>`
- `GET /api/v1/admin/system/health` -> `ApiResponse<SystemHealthDto>`
