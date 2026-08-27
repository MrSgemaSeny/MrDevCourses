# BRIEFING — 2026-08-27T07:45:00Z

## Mission
Реализация модуля автоматической генерации векторных PDF-сертификатов (Thymeleaf + OpenHTMLtoPDF) с эстетикой Dark & Gold и публичной верификацией по UUID для платформы MrDevCourses.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\worker_m4
- Original parent: 7583575c-b02d-43db-92ae-a25364d1ea2a
- Milestone: M4 (Automated PDF Certificate Generation & Public Verification)

## 🔒 Key Constraints
- Никаких эмодзи в коде, комментариях, отчетах и сообщениях.
- Язык отчетов: Русский. Тон: Senior Architect.
- Сертификат генерируется при 100% завершении курса в LessonService.completeLesson() или CertificateService.
- Эстетика сертификата: Dark & Gold (#0d1117 фон, #d97706 / #f59e0b рамка, кириллические шрифты TTF).
- Публичный эндпоинт верификации: GET /api/v1/certificates/verify/{certificateCode} (permitAll).
- Скачивание PDF: GET /api/v1/certificates/courses/{courseId}/download (application/pdf).
- Zero cheats: честная и полная реализация всех сервисов, шаблонов и контроллеров.
- 100% green backend tests (./gradlew test jacocoTestReport) + frontend tests (npm test -- --run) + npm run build.

## Current Parent
- Conversation ID: 7583575c-b02d-43db-92ae-a25364d1ea2a
- Updated: 2026-08-27T07:45:00Z

## Task Summary
- **What to build**: Модуль сертификатов (Entity, Repo, DTOs, Service, PdfGenerator, Controller, Thymeleaf template, TTF fonts, frontend API, CertificateVerifyPage, Download button/modal).
- **Success criteria**: Успешная генерация валидного PDF, работающая публичная верификация UUID, 100% прохождение всех тестов и чистая сборка.
- **Interface contracts**: PROJECT.md § M4
- **Code layout**: PROJECT.md § Code Layout

## Key Decisions Made
- [TBD]

## Artifact Index
- `.agents/worker_m4/DISPATCH.md` — Assignment and requirements
- `.agents/worker_m4/BRIEFING.md` — Agent state and memory
- `.agents/worker_m4/progress.md` — Execution steps and liveness heartbeat
- `.agents/worker_m4/handoff.md` — Final 5-component handoff report

## Change Tracker
- **Files modified**: None yet
- **Build status**: Pending
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pending
- **Lint status**: Clean
- **Tests added/modified**: Pending

## Loaded Skills
- None
