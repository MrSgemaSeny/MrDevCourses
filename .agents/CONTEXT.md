# Current Project Context — MrDevCourses

## Status
- **Project Stage**: Level 4 — Hardened Enterprise-Scale Release (JF-1C + MeDev + Valeur + Envie Architectural Integration)
- **Developer Level**: Senior Full-Stack / Tech Lead
- **Stack**: Java 17, Spring Boot 3.3.0, PostgreSQL 17, Flyway (V1..V9), React 19, TypeScript, Vite, FSD Architecture, Tailwind CSS v4, TanStack React Query v5, Bucket4j, OpenHTMLtoPDF, Thymeleaf.
- **Enterprise Features**:
  - `auth`: Google OAuth2 + Email/Password registration/login, JWT stateless session in httpOnly cookie (`mrdevcourses_token`), custom rate limiting.
  - `ratelimit`: Token Bucket (Bucket4j + Caffeine) with 3 tiers: Auth (10 req/15m/IP), AI (5 req/min/user), General (60 req/min/user/IP). Standardized `X-RateLimit-Remaining` and `Retry-After`.
  - `navigation`: Quick-Nav Drawer (Glossary, Progress, Roadmap) with in-lesson term cards and deep-linking without resetting video player iframe state.
  - `ai`: Senior AI Lesson Tutor module integrating Groq (Llama 3.3 70B), prompt injection sanitization, grounded lesson context, and frontend chat UI.
  - `certificate`: Automated PDF Certificate generator (Thymeleaf + OpenHTMLtoPDF) upon 100% completion with public verification by code (`/v1/certificates/verify/{code}`).
  - `analytics`: Enterprise Admin Cohort Analytics dashboard (Funnel by day, drop-off rates, streak distribution, time-to-complete retention).
  - `layouts`: StudentLayout & AdminLayout persistent sidebars with streak indicators and role guards.
- **Test Verification**:
  - Backend: 98/98 unit & integration tests PASSED (100% Green, `:jacocoTestReport` verified).
  - Frontend: 33/33 Vitest tests PASSED across 11 test suites (100% Green).
  - Production Build: `npm run build` SUCCESSFUL (0 errors, 0 warnings).
