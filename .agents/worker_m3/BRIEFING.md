# BRIEFING — 2026-08-27T07:44:00Z

## Mission
Реализация модуля AI Lesson Tutor Engine & Chat (Backend: com.mrdevcourses.modules.ai.*, GroqClient, PromptSanitizer, PiiMasker, TokenAccountingService, AiUsage, RateLimiting Tier AI 5 req/min, Flyway V10; Frontend: FSD entities/ai, features/ai-tutor, UI интеграция в LessonPage, тесты).

## 🔒 My Identity
- Archetype: implementer, qa, specialist
- Roles: implementer, qa, specialist
- Working directory: c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\worker_m3
- Original parent: 7583575c-b02d-43db-92ae-a25364d1ea2a
- Milestone: M3 (AI Lesson Tutor Engine & Chat)

## 🔒 Key Constraints
- Без эмодзи в коде, комментариях, отчетах, коммитах, сообщениях.
- Язык: Русский. Тон: Senior Architect.
- Flyway: новая миграция V10__create_ai_usage.sql (не модифицировать V1..V9).
- Строго FSD на фронтенде.
- Никаких фиктивных / захардкоженных реализаций (real state and logic).
- Проверка: ./gradlew test jacocoTestReport (100% green), npm test -- --run (100% green), npm run build (0 ошибок).

## Current Parent
- Conversation ID: 7583575c-b02d-43db-92ae-a25364d1ea2a
- Updated: not yet

## Task Summary
- **What to build**: AI Lesson Tutor с защитой от XML Prompt Injection, PII-маскированием, контекстным заземлением на урок, Rate Limiting (5 req/min/user), учетом токенов Groq (Llama 3.3 70B / configurable), историей диалога в рамках сессии/урока, FSD UI компонентами и тестами.
- **Success criteria**: Все тесты бэкенда и фронтенда зеленые, билд без ошибок, строгая архитектурная чистота.
- **Interface contracts**: PROJECT.md, handoff.md от explorer_donors.
- **Code layout**: Backend src/main/java/com/mrdevcourses/modules/ai/..., Frontend src/entities/ai/..., src/features/ai-tutor/...

## Key Decisions Made
- [TBD]

## Artifact Index
- .agents/worker_m3/DISPATCH.md — поручение оркестратора
- .agents/worker_m3/BRIEFING.md — текущий контекст
- .agents/worker_m3/progress.md — журнал прогресса

## Change Tracker
- **Files modified**: [None yet]
- **Build status**: [TBD]
- **Pending issues**: [None]

## Quality Status
- **Build/test result**: [TBD]
- **Lint status**: [TBD]
- **Tests added/modified**: [TBD]

## Loaded Skills
- None explicitly requested, using standard roles.
