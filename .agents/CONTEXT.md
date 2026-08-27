# Current Project Context — MrDevCourses

## Status
- **Project Stage**: Level 4 — Hardened Enterprise-Scale Release (Hybrid RAG + pgvector + AI Code Grader + Transactional Outbox + Cohort Analytics)
- **Developer Level**: Senior Full-Stack / Tech Lead
- **Stack**: Java 17, Spring Boot 3.3.0, PostgreSQL 17 (pgvector, pg_trgm), Flyway (V1..V10), React 19, TypeScript, Vite, FSD Architecture, Tailwind CSS v4, TanStack React Query v5, Bucket4j, OpenHTMLtoPDF, Thymeleaf.
- **Enterprise Features**:
  - `rag`: Hybrid Search (pgvector HNSW Dense Cosine + Sparse FTS with Reciprocal Rank Fusion), MarkdownSemanticChunker (AST-aware chunking with code block preservation), EmbeddingService.
  - `grader`: Automated AI Code Grader & Reviewer (Static Security Scanner, LLM Rubric Evaluation, auto-completion of lessons on score >= 80, HomeworkSubmissionWidget).
  - `automation`: Transactional Outbox Engine (`outbox_events`, OutboxProcessor @Scheduled), SemanticLinkingService (automated glossary term extraction), StudentLifecycleService (drop-off prediction & re-engagement nudges).
  - `auth`: Google OAuth2 + Email/Password registration/login, JWT stateless session in httpOnly cookie (`mrdevcourses_token`), custom rate limiting.
  - `ratelimit`: Token Bucket (Bucket4j + Caffeine) with 3 tiers: Auth (10 req/15m/IP), AI (5 req/min/user), General (60 req/min/user/IP). Standardized `X-RateLimit-Remaining` and `Retry-After`.
  - `navigation`: Quick-Nav Drawer (Glossary, Progress, Roadmap) with in-lesson term cards and deep-linking without resetting video player iframe state.
  - `ai`: Senior AI Lesson Tutor module integrating Groq (Llama 3.3 70B), prompt injection sanitization, grounded lesson RAG citations, and frontend chat UI.
  - `certificate`: Automated PDF Certificate generator (Thymeleaf + OpenHTMLtoPDF) upon 100% completion with public verification by code (`/v1/certificates/verify/{code}`).
  - `analytics`: Enterprise Admin Cohort Analytics dashboard (Funnel by day, drop-off rates, streak distribution, time-to-complete retention).
- **Test Verification**:
  - Backend: 112/112 unit & integration tests PASSED (100% Green, `:jacocoTestReport` verified).
  - Frontend: 34/34 Vitest tests PASSED across 12 test suites (100% Green).
  - Production Build: `npm run build` SUCCESSFUL (0 errors, 0 warnings).
