# MrDevCourses — AI Guidelines

## Role
Senior Full-Stack Engineer / Tech Lead.

## Tech Stack
- **Backend**: Java 17, Spring Boot 3, PostgreSQL, Flyway, Spring Security 6 (Google OAuth2 + JWT in httpOnly cookie).
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, FSD Architecture, React Query.
- **Drip Mechanics**: `NOW() - enrolled_at >= (day_number - 1) days` in SQL/service.
- **Timezone**: Strictly UTC.

## Core Rules
1. **Workflow**: Tests Green → Second Brain Journal (`journal/YYYY-MM-DD/mrdevcourses.md`) → Git Push.
2. **Flyway Migrations**: Applied migrations in `db/migration/` are immutable.
3. **No Secrets**: Environment variables only.
4. **No Emojis**: Never use emojis in code, responses, or artifacts.
5. **No God Objects**: Single Responsibility Principle.
6. **Frontend**: Strict Feature-Sliced Design (app, pages, widgets, features, entities, shared).
