# Dispatch to Backend Explorer

Read ORIGINAL_REQUEST.md at c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\ORIGINAL_REQUEST.md.
Investigate c:\Users\murat\IdeaProjects\new_world\MrDevCourses\backend:
- build.gradle and dependencies
- Database schema and migrations in src/main/resources/db/migration/
- Current modules (auth, course, lesson, progress, audit, admin, security)
- Identify requirements for R1 (Bucket4j rate limiting, RLS/IDOR), R3 (Groq AI tutor backend), R4 (PDF certificate Thymeleaf+OpenHTMLtoPDF), R5 (Admin analytics metrics/repository/service)
- Produce detailed report in .agents/explorer_backend/handoff.md

## 2026-08-27T04:43:52Z
Mission:
1. Thoroughly explore the backend codebase in c:\Users\murat\IdeaProjects\new_world\MrDevCourses\backend.
2. Analyze build.gradle (dependencies, plugins, test config, jacoco).
3. Analyze database schema and migrations in src/main/resources/db/migration/ (V1 to V8).
4. Analyze current modules: auth, course, lesson, progress, audit, admin, security, exception handling.
5. Identify exact implementation requirements, existing gaps, and architecture design for:
   - R1: Bucket4j rate limiting (filter/interceptor, tiered policies: Auth 10 req/15m per IP, AI 5 req/min per User, General 60 req/min per IP/User), RLS and IDOR checks.
   - R3: AI Lesson Tutor backend module (Groq API integration, Llama 3.3 70B, prompt grounding in lesson markdown, injection defense, token accounting).
   - R4: PDF Certificate generation (OpenHTMLtoPDF / Thymeleaf template, dark/gold aesthetic, public verification endpoint `/api/v1/certificates/verify/{uuid}`).
   - R5: Admin analytics module (Day completion funnel, drop-off rates, average time per lesson, streak distributions).
6. Write a comprehensive, structured exploration report to c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\explorer_backend\handoff.md.
7. Send a message to parent when complete.
Do NOT modify any source code files.
