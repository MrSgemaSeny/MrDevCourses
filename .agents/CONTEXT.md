# Current Project Context — MrDevCourses

## Roadmap & Product Philosophy (Первоисточник)
- **Master Roadmap File**: `C:\Users\murat\Downloads\mrdevcourses_roadmap.md` (копия во Втором Мозге: `Brain's protocol - second brain/projects/mrdevcourses/mrdevcourses_roadmap.md`).
- **Ключевые принципы Mr Developer**:
  1. **Zero Friction Setup через сайт**: Все ссылки на софт, шаблоны, промпты и пошаговые чеклисты установки — прямо в карточке урока. Студент не ищет ничего в Discord.
  2. **Кнопка «Не получается / Сложно справляться» (Data-First RAG Dataset)**: SOS-сигнал на каждом шаге урока → **100% персист в базу данных (`student_help_requests`)** + мгновенный push ментору в Telegram с именем студента, уроком, шагом и описанием проблемы. Каждое нажатие — это сырые данные и живой датасет реальных затыков новичков для обучения будущего RAG.
  3. **Telegram Dashboard Ментора**: Уведомления о сданных ДЗ, SOS-тикеты, алерты о неактивности 3+ дней (`/stuck`), Telegram-команды `/hw`, `/status`, `/approve <id>`, `/reject <id> <комментарий>`.
  4. **Будущий AI с реальной RAG-системой (Vector Search по pgvector)**: Обучается и строит поиск не на синтетических FAQ, а на **накопленной базе реальных вопросов и решений ментора** из таблицы `student_help_requests`.
  5. **GitHub-Grade UX**: Максимально чистый, плотный, честный интерфейс (`#0d1117`, monochrome), фокус на реальном знании и первом задеплоенном онлайн веб-приложении.

## Status & Architecture
- **Project Stage**: Level 3 — Strong Educational MVP (Pre-Release Pilot with 2 live students).
- **Stack**: Java 17, Spring Boot 3.3.0, PostgreSQL 17 (pgvector, pg_trgm), Flyway (V1..V16), React 19, TypeScript, Vite, FSD Architecture, Tailwind CSS v4, TanStack React Query v5, Bucket4j.
- **Core Modules & Capabilities**:
  - `homework-pipeline`: Human-centric submission (GitHub Repo URL, Live Demo URL, notes) + Admin Review Triage Queue (`/admin/homeworks`) with instant 1-click approve (auto-complete lesson + early drip unlock) or revision feedback.
  - `onboarding`: `WelcomeOnboardingModal` on course entry (outcome goal, Discord invite, tools checklist).
  - `domain-hierarchy`: Deep course structure (`Course -> CourseModule -> Lesson -> Materials/Quizzes`), Lesson Types (`VIDEO`, `ARTICLE`, `PRACTICE`, `QUIZ`), cohorts, free preview gates.
  - `quiz-engine`: Interactive assessment subsystem with anti-cheat option masking, auto-scoring, explanation feedback.
  - `materials`: Per-lesson downloadable resources (`CHEAT_SHEET`, `SOURCE_CODE`, `REPO_LINK`, `PDF`).
  - `auth`: Google OAuth2 + Email/Password, JWT stateless session in httpOnly cookie (`MrDev_token`), custom rate limiting.
  - `ratelimit`: Token Bucket (Bucket4j + Caffeine) with 3 tiers: Auth (10 req/15m/IP), AI (5 req/min/user), General (60 req/min/user/IP).
  - `admin-suite`: Complete management console (Curriculum Tree, Drip schedule, Module reordering, Markdown authoring, Material manager, Quiz builder, Student triage & Role toggle, Cohort manager, Telemetry & Audit logs).
  - `b2c-discovery`: Modern B2C course catalog (`/courses`) with hover video preview; 2-column B2C landing (`/courses/:slug`) with Syllabus accordion, Sticky card, author badge, and FAQ.

## Test Verification & Quality Gates
- **Backend (JUnit)**: 215/215 tests PASSED (100% Green, clean `--rerun-tasks` and `:jacocoTestReport` verified).
- **Frontend (Vitest)**: 71/71 tests PASSED across 30 test suites (100% Green).
- **Security & IDOR Coverage**: IDOR guards on Homework and Help modules, Anti-Cheat option masking on Quizzes, Drip SQL calculation bounds, and Admin RBAC gates thoroughly verified.
- **Production Build**: `tsc -b && vite build` SUCCESSFUL (1795 modules transformed, 0 errors).
- **Phase 0 Status**: 100% COMPLETE (Operational Lesson Card, SOS Ticket persisting + Telegram alerts, Telegram Mentor Bot commands `/hw`, `/approve`, `/reject`, `/status`, `/stuck`, Student Focus Dashboard).
- **Phase 1 Status**: 100% COMPLETE (Automated Stuck Detection Engine, Public Graduation Project Showcase Wall `/projects` with likes and GitHub/Demo previews, Welcome Onboarding flow).

