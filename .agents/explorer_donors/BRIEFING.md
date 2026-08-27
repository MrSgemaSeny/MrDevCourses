# BRIEFING — 2026-08-27T04:46:20Z

## Mission
Investigate donor implementations across sibling projects (JF-1C, MeDev, Valeur) and extract exact reusable patterns, code snippets, dependencies, and algorithms for MrDevCourses R1-R5.

## 🔒 My Identity
- Archetype: explorer
- Roles: Donor Pattern Explorer
- Working directory: c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\explorer_donors
- Original parent: cbf61a6d-9da6-4d06-a50b-f6e63b52315d
- Milestone: Donors Pattern Investigation (R1-R5)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Russian language in reports, Senior Architect tone, NO emojis
- Focus on exact reusable code, algorithms, config, and templates

## Current Parent
- Conversation ID: cbf61a6d-9da6-4d06-a50b-f6e63b52315d
- Updated: 2026-08-27T04:46:20Z

## Investigation State
- **Explored paths**: 
  - `JF-1C` (Second Brain project notes, `navigation-architecture.md`, `04_4._модули_бэкенда.md`, `21_приложение_б_примеры_кода.md`)
  - `MeDev` (`GroqClient.java`, `AiRateLimiter.java`, `PiiMasker.java`, `PromptLoader.java`, `PdfGeneratorService.java`, `build.gradle`)
  - `Valeur` (`RateLimitingService.java`, `GroqClient.java`, `ApplicationAnalyticsService.java`, `ApplicationAnalyticsController.java`, `build.gradle`)
  - `Second Brain Knowledge` (`backend-rate-limiting-bucket4j.md`, `pdf-flying-saucer-constraints.md`, `sec-prompt-injection-xml.md`, `ats-funnel-analytics-and-talent-pool.md`)
- **Key findings**:
  - R1: Bucket4j `bucket4j-core:8.10.1` Token Bucket in-memory tiered policies (Auth: 10/15m, AI: 5/1m, General: 60/1m).
  - R2: Quick-Nav slide-over drawer with 3 views (`GlossaryView`, `ProgressView`, `RoadmapView`) without unmounting `<Outlet />` / iframe.
  - R3: Groq client (Llama 3.3 70B) with XML tag prompt isolation (`<lesson_content>`, `<student_question>`), `PiiMasker`, and strict grounding.
  - R4: OpenHTMLtoPDF + Thymeleaf vector PDF certificate with dark/gold styling and `/api/v1/certificates/verify/{uuid}` endpoint.
  - R5: SQL day-funnel aggregation queries and drop-off analytics adapted from Valeur's `ApplicationAnalyticsService`.
- **Unexplored areas**: None. All donor requirements R1-R5 explored and extracted.

## Key Decisions Made
- Extracted lean, zero-bloat patterns directly applicable to MrDevCourses stack.
- Structured report written to `.agents/explorer_donors/handoff.md`.

## Artifact Index
- handoff.md — Comprehensive Donors Exploration Report (5-component protocol)
- progress.md — Real-time investigation progress
