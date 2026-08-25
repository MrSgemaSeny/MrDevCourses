# Original User Request

## 2026-08-25T09:38:52Z

Build and deliver the complete, production-ready MrDevCourses Learning Management System (LMS) platform with Google OAuth2 authentication, a deterministic SQL/Service drip-content engine, student progress tracking, an admin management panel, and a modern minimalist dark UI styled in the Envie design aesthetic.

Working directory: c:\Users\murat\IdeaProjects\new_world\MrDevCourses
Integrity mode: development

---

## Architecture & Tech Stack

- **Backend**: Java 17, Spring Boot 3.3.0, PostgreSQL, Flyway (V1..V5 migrations), Spring Security 6 (Google OAuth2 Client + JWT in `httpOnly` cookie `mrdevcourses_token`). Stateless architecture with UTC timestamp enforcement (`spring.jpa.properties.hibernate.jdbc.time_zone=UTC`).
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Feature-Sliced Design (FSD), TanStack React Query v5, Vitest.
- **Design System**: Envie minimalist dark palette (`#09090b` bg, `rgba(24, 24, 27, 0.8)` cards with backdrop-blur, `#27272a` borders, `#fafafa` foreground, `#a1a1aa` muted text, crisp high-contrast actions, zero visual clutter/AI gimmicks).

---

## Requirements

### R1. Authentication & Session Management
- Implement Google OAuth2 login via Spring Security 6 with `OAuth2UserService` to auto-provision or update users in PostgreSQL (`users` table).
- Issue stateless JWT stored securely in an `httpOnly` cookie (`mrdevcourses_token`, `SameSite=Lax/None`, `Secure` in prod).
- Implement `SecurityUtils.getCurrentUserId()` for extracting authenticated student identity from `SecurityContext`.
- Expose `/api/v1/auth/me` (current authenticated user profile) and `/api/v1/auth/logout` (clearing cookie).
- Frontend: Auth provider, login modal/page with Google button, automatic session restore, and protected routes.

### R2. Courses & Enrollment Engine
- Expose public course catalog `GET /api/v1/courses` and course details `GET /api/v1/courses/{slug}`.
- Expose `POST /api/v1/courses/{courseId}/enroll` allowing authenticated students to enroll, setting `enrolled_at = NOW()` (idempotent / protected by UNIQUE constraint).

### R3. Lesson Player & Strict Server-Side Drip Engine
- Implement drip calculation in `LessonService`: Lesson `N` is accessible if and only if `(NOW() - enrolled_at) >= ((day_number - 1) * INTERVAL '1 day')`. Day 1 (`day_number = 1`) is unlocked immediately on enrollment.
- Expose `GET /api/v1/courses/{courseId}/lessons` returning lesson list with availability status (`isAccessible`, `opensAt`, `isCompleted`).
- Expose `GET /api/v1/courses/{courseId}/lessons/{lessonId}` returning content; returns `403 Forbidden` with exact unlock time if accessed prematurely (server-side security barrier).
- Expose `POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete` to record completion in `lesson_progress`.
- Frontend: Video player widget supporting YouTube embed conversions, structured markdown lesson viewer, and lesson navigation sidebar.

### R4. Student Dashboard & Progress Tracking
- Expose `GET /api/v1/progress` (student overview across enrolled courses) and `GET /api/v1/progress/{courseId}` (detailed course progress).
- Calculate: `currentDay`, `completedCount`, `totalUnlocked`, `totalLessons`, and `nextUnlockAt`.
- Frontend: Personal student dashboard displaying progress bar, timeline of unlocked/locked days with countdown timers, and quick resumption.

### R5. Admin Management Panel
- Role-based authorization (`ADMIN` role guard on `/api/v1/admin/**`).
- CRUD operations for courses and lessons (title, description, YouTube URL, content, day number, sort order).
- View student roster, enrollment dates, individual student lesson completion status, and manual student enrollment endpoint.
- Frontend: Clean administrative views with data tables, course/lesson creation/edit modals.

### R6. UI/UX Styling & FSD Architecture (Envie Aesthetic)
- Strict dark theme matching Envie: background `#09090b`, cards `rgba(24, 24, 27, 0.8)` with backdrop blur, borders `#27272a`, crisp white primary buttons `#fafafa` with dark text, subtle hover glows.
- Strict Feature-Sliced Design compliance (`app`, `pages`, `widgets`, `features`, `entities`, `shared`).
- Responsive, clean, accessible typography (Geist/Inter style), zero decorative noise.

---

## Acceptance Criteria

### Automated Backend Verification
- [ ] `./gradlew test` passes 100% green with zero failures.
- [ ] Integration and unit tests covering:
  - JWT generation, extraction, and validation filter.
  - Drip calculation correctness for Day 1 (immediate), Day 2+ (locked before threshold, unlocked after).
  - Premature lesson access returns `403 Forbidden` with accurate `opensAt` timestamp.
  - IDOR protection: students cannot complete lessons or view progress for other users.
  - Admin endpoint security: `STUDENT` receives `403` on `/api/v1/admin/**`.

### Automated Frontend Verification
- [ ] `npm test -- --run` passes 100% with zero failing Vitest tests.
- [ ] `npm run build` compiles with zero TypeScript errors, zero lint errors, and generates optimized production bundle.
- [ ] FSD architecture is strictly maintained with clean layer separation.

### System & Security Validation
- [ ] No secrets hardcoded in source files (all injected via environment variables).
- [ ] All database timestamps strictly stored and calculated in UTC.
- [ ] Applied Flyway migrations `V1..V5` remain untouched; any new schema changes use new `V{N}__` scripts.
- [ ] Second Brain protocol updated (`journal/YYYY-MM-DD/mrdevcourses.md`) and all work pushed to `main`.
