# Original User Request

## 2026-08-27T04:42:36Z

# MrDevCourses: Enterprise Scaling, Security Hardening & Student Experience Expansion

Enterprise-grade scaling, security hardening, and comprehensive feature expansion for the MrDevCourses LMS platform, adopting proven architectural patterns from donor projects (JF-1C, Valeur, MeDev).

Working directory: c:\Users\murat\IdeaProjects\new_world\MrDevCourses
Integrity mode: development

## Requirements

### R1. Enterprise Security Hardening & Rate Limiting (Donor: JF-1C)
- Implement production-grade Token Bucket rate limiting via Bucket4j with tiered policies:
  - Auth endpoints (`/api/v1/auth/**`): 10 req/15m per IP.
  - AI endpoints (`/api/v1/ai/**`): 5 req/min per User.
  - General API endpoints: 60 req/min per IP/User.
- Enforce strict Row-Level Security (RLS) and IDOR defense across all course progress and student mutation endpoints.

### R2. Contextual Navigation Engine & Quick-Nav Drawer (Donor: JF-1C, architecture: navigation-architecture.md)
- Slide-over Quick-Nav Drawer with 3 distinct views without unmounting active components or resetting YouTube/video playback:
  - `GlossaryView`: Searchable domain glossary with deep-linking from in-lesson terms.
  - `ProgressView`: Real-time completion breakdown and next-lesson countdown.
  - `RoadmapView`: Course day-by-day milestone trajectory.
- In-lesson contextual term cards with 1-click focus inside the Quick-Nav drawer.

### R3. AI Lesson Tutor Engine (Donor: Valeur / MeDev)
- Backend AI Module integrating Groq (Llama 3.3 70B / compatible high-speed model) for interactive student assistance strictly grounded in current lesson markdown content.
- Context sanitizer (defense against prompt injection) and per-user token accounting/rate limiting.
- Frontend slide-in AI Chat interface with streaming / markdown rendering.

### R4. Automated PDF Certificate Generation (Donor: JF-1C)
- PDF Certificate Generator using Thymeleaf + OpenHTMLtoPDF upon 100% course completion.
- Unique certificate UUID verification endpoint (`/api/v1/certificates/verify/{uuid}`) with public verification badge.
- Printable/downloadable vector PDF certificate matching dark/gold aesthetic.

### R5. Admin Analytics & Cohort Retention Dashboard (Donor: Valeur)
- Admin analytics module computing:
  - Course completion funnel by Day number.
  - Drop-off rates and average time spent per lesson.
  - Active study streak distributions.
- Rich visualization dashboard in `AdminLayout` (Funnel charts, KPI metric cards, retention table).

## Acceptance Criteria

### Automated Backend Verification
- [ ] `./gradlew test jacocoTestReport` passes 100% green with 0 test failures.
- [ ] Bucket4j rate limiter unit and integration tests verify HTTP 429 throttling for auth, AI, and general tiers.
- [ ] Certificate generation unit test validates PDF byte stream creation and UUID integrity.
- [ ] AI Service unit test validates prompt grounding and sanitized response formatting.

### Automated Frontend Verification
- [ ] `npm test -- --run` passes 100% across all Vitest suites.
- [ ] `npm run build` succeeds with 0 TypeScript errors and 0 lint warnings.
- [ ] Quick-Nav Drawer toggle and AI Chat render smoothly without causing layout reflows or video iframe resets.

### System & Protocol Validation
- [ ] Flyway database migrations (new `V{N}__` scripts) apply cleanly and pass `ddl-auto: validate`.
- [ ] Second Brain protocol updated (`journal/YYYY-MM-DD/mrdevcourses.md`, `projects/mrdevcourses/_status.md`).
