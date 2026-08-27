# Implementation Plan: MrDevCourses Enterprise Scaling & Expansion

## 1. Survey & Exploration (Phase 0)
- Dispatch 3 parallel Explorers:
  - Explorer 1: Backend architecture survey (build.gradle, security config, rate limiting patterns, database schema Flyway V1-V8).
  - Explorer 2: Frontend architecture survey (package.json, FSD layout, LessonViewer, Navigation, styling, components).
  - Explorer 3: Donor analysis (JF-1C Bucket4j & PDF certs & Quick-Nav; Valeur/MeDev AI tutor & Admin analytics).
- Synthesize findings into `PROJECT.md` (Architecture, Feature Inventory, Milestones, Interface Contracts, Code Layout).

## 2. Milestone Execution (Milestones 1 to 6)
- **M1 (R1)**: Bucket4j Rate Limiting (tiered policies for Auth, AI, General) + RLS / IDOR defense.
- **M2 (R2)**: Contextual Navigation Engine & Quick-Nav Drawer (GlossaryView, ProgressView, RoadmapView) without resetting video playback.
- **M3 (R3)**: Groq AI Lesson Tutor Engine (markdown grounded tutor, prompt injection defense, token accounting, streaming/chat UI).
- **M4 (R4)**: Automated PDF Certificate Generation (OpenHTMLtoPDF/Thymeleaf, UUID public verification endpoint `/api/v1/certificates/verify/{uuid}`).
- **M5 (R5)**: Admin Analytics & Cohort Retention Dashboard (completion funnel, drop-off, streaks, retention charts).
- **M6**: End-to-End Test Suite Execution (`./gradlew test jacocoTestReport`, `npm test -- --run`, `npm run build`), Flyway validation, Second Brain Journal & Status update.

## 3. Iteration Loop per Milestone
- Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate check.
