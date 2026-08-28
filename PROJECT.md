# Project: MrDevCourses (Educational LMS Platform MVP)

## Architecture
- **Backend Architecture**: Spring Boot 3.3.0, Java 17, PostgreSQL 16, Spring Security 6 (Stateless JWT in httpOnly cookie + Google OAuth2), Flyway (V1..V12), Bucket4j (Rate Limiting), OpenHTMLtoPDF + Thymeleaf (PDF Certificates), Groq API / Llama 3.3 70B (AI Tutor).
- **Frontend Architecture**: React 19, TypeScript, Vite, FSD (Feature-Sliced Design), Tailwind CSS v4, TanStack React Query v5, Lucide Icons.
- **Design System**: Strict dark aesthetic (`#0a0a0c` base, `#18181b` cards, `rgba(255,255,255,0.08)` borders, 4-level typography). No emojis.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Bucket4j Rate Limiting | Tiered Token Bucket policies (Auth: 10/15m per IP, AI: 5/1m per User, General: 60/1m per IP/User) | M1 | ORIGINAL_REQUEST §R1 |
| 2 | RLS & IDOR Defense | Strict Row-Level Security & IDOR checks via SecurityUtils.getCurrentUserId() | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Quick-Nav Slide-over Drawer | 3-tab drawer (GlossaryView, ProgressView, RoadmapView) without resetting video | M2 | ORIGINAL_REQUEST §R2 |
| 4 | In-Lesson Contextual Term Cards | Clickable term chips with 1-click focus into Quick-Nav Drawer | M2 | ORIGINAL_REQUEST §R2 |
| 5 | AI Lesson Tutor Backend Module | Groq API (Llama 3.3 70B), prompt grounding in lesson markdown, XML prompt injection defense | M3 | ORIGINAL_REQUEST §R3 |
| 6 | AI Lesson Tutor Frontend Chat | Slide-in chat widget with streaming/markdown rendering, quick prompts, 429 cooldown | M3 | ORIGINAL_REQUEST §R3 |
| 7 | Automated PDF Certificate Generator | OpenHTMLtoPDF + Thymeleaf vector PDF certificate upon 100% course completion | M4 | ORIGINAL_REQUEST §R4 |
| 8 | Certificate Verification Endpoint & UI | Public verify endpoint GET /api/v1/certificates/verify/{uuid} & /certificates/verify/:uuid page | M4 | ORIGINAL_REQUEST §R4 |
| 9 | Admin Analytics Backend Engine | Day completion funnel, drop-off rates, average time per lesson, streak distributions | M5 | ORIGINAL_REQUEST §R5 |
| 10 | Admin Analytics Dashboard UI | KPI cards, pure SVG Funnel Chart, Streak Distribution bars, Lesson Retention table | M5 | ORIGINAL_REQUEST §R5 |
| 11 | Full Verification & Second Brain | 100% green tests, production build, Flyway validation, Second Brain journal & status update | M6 | ORIGINAL_REQUEST §AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Security & Rate Limiting | Bucket4j service & filter (Auth, AI, General tiers), RLS/IDOR verification, unit/integration tests | none | COMPLETED |

| M2 | Quick-Nav Drawer & Navigation Engine | QuickNavDrawer (GlossaryView, ProgressView, RoadmapView), LessonContextPanel, video preservation | none | IN_PROGRESS |
| M3 | AI Lesson Tutor Engine & Chat | Groq client, prompt grounding, XML sanitizer, V10 Flyway migration, frontend AI Chat widget | M1 | PLANNED |
| M4 | Automated PDF Certificate & Verification | Certificate entity, OpenHTMLtoPDF+Thymeleaf template, verify endpoint & page, PDF download | none | PLANNED |
| M5 | Admin Analytics & Retention Dashboard | AdminAnalyticsService, repository aggregations, SVG Funnel, Streak & Retention table | none | PLANNED |
| M6 | Full E2E Verification & Second Brain Sync | ./gradlew test jacocoTestReport, npm test, npm run build, Second Brain journal & projects update | M1, M2, M3, M4, M5 | PLANNED |

## Interface Contracts

### M1: Rate Limiting & RLS
- **Service**: `RateLimiterService.resolveBucket(String key, RateLimitTier tier) -> Bucket`
- **Filter**: `RateLimitingFilter extends OncePerRequestFilter` returning HTTP 429 Too Many Requests with JSON `ErrorResponse` and `Retry-After` header.
- **Tiers**: `AUTH` (10 req/15 min/IP), `AI` (5 req/1 min/User), `GENERAL` (60 req/1 min/IP/User).

### M2: Quick-Nav Drawer
- **Context**: `QuickNavContext` (`isOpen`, `activeTab: 'glossary'|'progress'|'roadmap'`, `selectedTerm?: string`, `openQuickNav(tab, term)`, `closeQuickNav()`).
- **DOM**: Overlay fixed slide-over without unmounting parent components or resetting video playback.

### M3: AI Lesson Tutor
- **API**: `POST /api/v1/ai/tutor/chat` (Payload: `{ courseId, lessonId, prompt, history }` -> Response: `{ message, groundedLessonId, tokensUsed }` or SSE stream).
- **Security**: System prompt XML-isolation `<lesson_content>`, `<student_question>`, PII masking.
- **Flyway**: `V10__create_ai_usage.sql` table `ai_usage`.

### M4: Certificate Generation & Verification
- **API**:
  - `GET /api/v1/certificates/courses/{courseId}/download` (returns `application/pdf`).
  - `GET /api/v1/certificates/verify/{certificateCode}` (Public permitAll -> returns `{ uuid, studentName, courseTitle, issuedAt, valid: true }`).
- **Engine**: OpenHTMLtoPDF `PdfRendererBuilder` with Thymeleaf template `templates/certificate.html`.

### M5: Admin Analytics
- **API**:
  - `GET /api/v1/admin/analytics/overview` -> `AdminOverviewMetricsDto`
  - `GET /api/v1/admin/analytics/courses/{courseId}/funnel` -> `List<FunnelStageDto>`
  - `GET /api/v1/admin/analytics/streaks` -> `List<StreakDistributionDto>`
- **Security**: `@PreAuthorize("hasRole('ADMIN')")`.

## Code Layout
### Backend (`backend/src/main/java/com/mrdevcourses/`)
- `common/ratelimit/`: `RateLimiterService`, `RateLimitingFilter`, `RateLimitTier`, `IpResolver`
- `modules/ai/`: `controller/AiTutorController`, `service/AiTutorService`, `service/GroqClient`, `service/ContextSanitizer`, `service/TokenAccountingService`, `entity/AiUsage`, `repository/AiUsageRepository`
- `modules/certificate/`: `controller/CertificateController`, `service/CertificateService`, `service/PdfCertificateGenerator`, `entity/Certificate`, `repository/CertificateRepository`
- `modules/admin/`: `controller/AdminAnalyticsController`, `service/AdminAnalyticsService`
- `resources/db/migration/`: `V10__create_ai_usage.sql`
- `resources/templates/`: `certificate.html`
- `resources/fonts/`: embedded font files for PDF rendering

### Frontend (`frontend/src/`)
- `entities/ai/api/aiTutorApi.ts`
- `entities/certificate/api/certificateApi.ts`
- `entities/admin/api/adminAnalyticsApi.ts`
- `entities/glossary/`: `model/types.ts`, `data/glossaryData.ts`
- `features/ai-tutor/`: `ui/AiLessonTutor.tsx`, `model/useAiTutor.ts`
- `features/admin-analytics/`: `ui/AdminAnalyticsDashboard.tsx`, `ui/CourseFunnelChart.tsx`, `ui/StreakDistributionChart.tsx`, `ui/LessonRetentionTable.tsx`
- `widgets/quick-nav/`: `ui/QuickNavDrawer.tsx`, `ui/GlossaryView.tsx`, `ui/ProgressView.tsx`, `ui/RoadmapView.tsx`, `model/QuickNavContext.tsx`
- `widgets/lesson/ui/LessonContextPanel.tsx`
- `pages/certificate/CertificateVerifyPage.tsx`
