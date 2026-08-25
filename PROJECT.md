# Project: MrDevCourses LMS Platform

## Architecture

MrDevCourses is a production-ready Learning Management System designed around a deterministic server-side drip-content engine, Google OAuth2 authentication with stateless JWT in `httpOnly` cookies, student progress tracking, an administrative control panel, and a modern minimalist dark UI styled in the Envie design aesthetic.

### System Overview & Data Flow
```
[Browser / React 19 + Vite + FSD]
   │ (httpOnly Cookie: mrdevcourses_token, SameSite=Lax, Secure)
   ▼
[Reverse Proxy / Spring Boot 3.3.0 Backend: Context Path /api]
   ├── JwtAuthenticationFilter (Cookie & Bearer extractor)
   ├── SecurityUtils (Thread-local IDOR-safe current user ID)
   ├── REST Controllers (/api/v1/**)
   │     ├── AuthController (/api/v1/auth/**)
   │     ├── CourseController (/api/v1/courses/**)
   │     ├── LessonController (/api/v1/courses/{courseId}/lessons/**)
   │     ├── ProgressController (/api/v1/progress/**)
   │     └── AdminController (/api/v1/admin/**)
   ├── Domain Services (Drip Calculation Engine, Enrollment, Progress Aggregation)
   └── PostgreSQL / H2 (Flyway Migrations V1..V5, strict UTC timestamps)
```

### Module Boundaries
1. **`auth`**: Google OAuth2 User Service, JWT Provider, Security Filter, Session Cookie Management, SecurityUtils, `/api/v1/auth/me`, `/api/v1/auth/logout` [DONE].
2. **`course`**: Course catalog, Course details by slug, Student enrollment (`POST /api/v1/courses/{courseId}/enroll` with `NOW()` timestamp and unique constraint) [IN_PROGRESS].
3. **`lesson`**: Lesson player APIs, strict deterministic SQL/Service Drip Engine (`(NOW() - enrolled_at) >= ((day_number - 1) * INTERVAL '1 day')`), 403 Forbidden with exact `opensAt` timestamp, Lesson completion tracking (`POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete`).
4. **`progress`**: Aggregated student progress metrics (`currentDay`, `completedCount`, `totalUnlocked`, `totalLessons`, `nextUnlockAt`), overview across courses and per-course details.
5. **`admin`**: Role-based access control (`ROLE_ADMIN`), CRUD for courses and lessons, student roster & progress inspection, manual enrollment.
6. **`frontend`**: Strict Feature-Sliced Design (FSD: `app`, `pages`, `widgets`, `features`, `entities`, `shared`), Envie Dark Theme (`#09090b` bg, `rgba(24, 24, 27, 0.8)` cards, `#27272a` borders, `#fafafa` text/actions).

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | F-01: Google OAuth2 Login & User Provisioning | OAuth2UserService for auto-provisioning/updating user record on Google login | M1 | ORIGINAL_REQUEST §R1 |
| 2 | F-02: Stateless JWT in httpOnly Cookie | Issue `mrdevcourses_token` httpOnly cookie with expiration and SameSite config | M1 | ORIGINAL_REQUEST §R1 |
| 3 | F-03: SecurityUtils & Auth Filter | JWT extraction filter and `SecurityUtils.getCurrentUserId()` IDOR protection | M1 | ORIGINAL_REQUEST §R1 |
| 4 | F-04: User Profile & Logout Endpoints | `GET /api/v1/auth/me` and `POST /api/v1/auth/logout` | M1 | ORIGINAL_REQUEST §R1 |
| 5 | F-05: Frontend Auth Provider & Guards | React Auth Context, Google login modal, protected route wrapper | M1 | ORIGINAL_REQUEST §R1 |
| 6 | F-06: Course Catalog API | `GET /api/v1/courses` with public active courses | M2 | ORIGINAL_REQUEST §R2 |
| 7 | F-07: Course Slug Detail API | `GET /api/v1/courses/{slug}` with course overview and lesson count | M2 | ORIGINAL_REQUEST §R2 |
| 8 | F-08: Student Enrollment Engine | `POST /api/v1/courses/{courseId}/enroll` recording `enrolled_at = NOW()` | M2 | ORIGINAL_REQUEST §R2 |
| 9 | F-09: Course Catalog & Details UI | Courses list page, course landing page with slug routing & enroll action | M2 | ORIGINAL_REQUEST §R2 |
| 10| F-10: Server-Side Drip Engine & Lesson Listing | `GET /api/v1/courses/{courseId}/lessons` with `isAccessible`, `opensAt`, `isCompleted` | M3 | ORIGINAL_REQUEST §R3 |
| 11| F-11: Guarded Lesson Content API | `GET /api/v1/courses/{courseId}/lessons/{lessonId}` returning 403 with `opensAt` if premature | M3 | ORIGINAL_REQUEST §R3 |
| 12| F-12: Lesson Completion API | `POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete` idempotent progress tracking | M3 | ORIGINAL_REQUEST §R3 |
| 13| F-13: Lesson Player UI | YouTube player embed converter, markdown viewer, lesson navigation sidebar | M3 | ORIGINAL_REQUEST §R3 |
| 14| F-14: Student Progress Metrics Engine | `GET /api/v1/progress` and `GET /api/v1/progress/{courseId}` metrics calculation | M4 | ORIGINAL_REQUEST §R4 |
| 15| F-15: Student Dashboard UI | Dashboard view with overall stats, course progress bar, timeline & unlock countdown | M4 | ORIGINAL_REQUEST §R4 |
| 16| F-16: Admin RBAC & Course/Lesson CRUD | `/api/v1/admin/**` protected endpoints for course and lesson management | M5 | ORIGINAL_REQUEST §R5 |
| 17| F-17: Admin Student Management | Student roster, enrollment records, completion status inspection, manual enrollment | M5 | ORIGINAL_REQUEST §R5 |
| 18| F-18: Admin Management UI | Admin dashboard with data tables, course/lesson edit modals, student roster | M5 | ORIGINAL_REQUEST §R5 |
| 19| F-19: Envie Dark Theme & FSD Compliance | Modern dark palette (#09090b, rgba(24,24,27,0.8), #27272a, #fafafa), clean FSD layers | M6 | ORIGINAL_REQUEST §R6 |
| 20| F-20: E2E Verification & Second Brain Sync | 100% backend & frontend test pass, Tiers 1-5 pass, Second Brain journal & git sync | M6 | ORIGINAL_REQUEST §Quality |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Auth & Session Management | F-01..F-05 | None | DONE |
| M2 | Courses & Enrollment Engine | F-06..F-09 | M1 | IN_PROGRESS |
| M3 | Lesson Player & Drip Engine | F-10..F-13 | M1, M2 | PLANNED |
| M4 | Student Dashboard & Progress | F-14, F-15 | M1, M2, M3 | PLANNED |
| M5 | Admin Management Panel | F-16..F-18 | M1, M2, M3 | PLANNED |
| M6 | UI/UX Hardening, E2E Verification & Second Brain | F-19, F-20 | M1..M5 | PLANNED |

---

## Interface Contracts

### 1. HTTP Response Envelopes
- **Success (`ApiResponse<T>`)**:
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": { ... },
    "timestamp": "2026-08-25T14:45:00Z"
  }
  ```
- **Error (`ErrorResponse`)**:
  ```json
  {
    "status": 403,
    "error": "Forbidden",
    "message": "Lesson is locked. Opens at 2026-08-26T14:45:00Z",
    "path": "/api/v1/courses/1/lessons/2",
    "timestamp": "2026-08-25T14:45:00Z",
    "opensAt": "2026-08-26T14:45:00Z",
    "validationErrors": null
  }
  ```

### 2. Auth Endpoints [DONE]
- `GET /api/v1/auth/me` -> returns current authenticated `UserDto { id, email, name, avatarUrl, role }`. Returns 401 if unauthenticated.
- `POST /api/v1/auth/logout` -> clears `mrdevcourses_token` cookie (Max-Age=0, Path=/).
- Cookie format: `mrdevcourses_token=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`.

### 3. Courses & Enrollment Endpoints [IN_PROGRESS]
- `GET /api/v1/courses` -> returns `List<CourseDto> { id, title, description, slug, isActive, lessonCount, createdAt }`.
- `GET /api/v1/courses/{slug}` -> returns `CourseDetailDto { id, title, description, slug, isActive, totalLessons, isEnrolled, enrolledAt }`.
- `POST /api/v1/courses/{courseId}/enroll` -> returns `EnrollmentDto { id, userId, courseId, enrolledAt }`.

### 4. Lessons & Strict Drip Endpoints
- `GET /api/v1/courses/{courseId}/lessons` -> returns `List<LessonSummaryDto> { id, dayNumber, title, sortOrder, isAccessible, opensAt, isCompleted }`.
- `GET /api/v1/courses/{courseId}/lessons/{lessonId}` -> returns `LessonDetailDto { id, courseId, dayNumber, title, content, youtubeUrl, sortOrder, isAccessible, isCompleted }`.
  - If locked (`now < opensAt`), returns HTTP `403 Forbidden` with body `{ ..., "opensAt": "..." }`.
- `POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete` -> returns `LessonProgressDto { id, userId, lessonId, completedAt }`.

### 5. Progress Endpoints
- `GET /api/v1/progress` -> returns `List<CourseProgressSummaryDto> { courseId, courseTitle, slug, currentDay, completedCount, totalUnlocked, totalLessons, nextUnlockAt, percentComplete }`.
- `GET /api/v1/progress/{courseId}` -> returns `DetailedProgressDto { courseId, currentDay, completedCount, totalUnlocked, totalLessons, nextUnlockAt, lessons: List<LessonProgressStatusDto> }`.

### 6. Admin Endpoints (`hasRole('ADMIN')`)
- `GET /api/v1/admin/courses`
- `POST /api/v1/admin/courses` (Create Course)
- `PUT /api/v1/admin/courses/{id}` (Update Course)
- `DELETE /api/v1/admin/courses/{id}` (Deactivate Course)
- `GET /api/v1/admin/courses/{courseId}/lessons`
- `POST /api/v1/admin/courses/{courseId}/lessons` (Create Lesson)
- `PUT /api/v1/admin/lessons/{id}` (Update Lesson)
- `DELETE /api/v1/admin/lessons/{id}` (Delete Lesson)
- `GET /api/v1/admin/courses/{courseId}/students` (Roster with enrollment date & completed lessons)
- `POST /api/v1/admin/courses/{courseId}/enroll` (Manual student enrollment by user email/id)
