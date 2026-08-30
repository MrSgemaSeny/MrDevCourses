# Execution Plan: MrDevCourses Admin Suite

## Architectural Objectives
Deliver a complete, high-quality Admin Suite for MrDevCourses adhering to Level 3 (Educational MVP) scope, strictly implementing R1-R4 requirements:
1. R1: Course & Curriculum Authoring Suite (Visual drag-and-drop hierarchy, live markdown preview, video verification, draft/publish toggle, drip timing calculator).
2. R2: Student & Cohort Management Console (Search/filter, STUDENT <-> ADMIN RBAC toggle, manual enrollment/unenrollment, streak/progress inspector, cohort schedules).
3. R3: Advanced Platform Analytics & Telemetry (Retention curves, drop-off funnel, completion cohorts, AI tutor queries, quiz failure hotspots, exportable summaries).
4. R4: Security, Audit Logs & System Health (Immutable audit logs, rate limit monitoring, DB health telemetry, monochrome #0a0a0c dark theme, strict FSD layout).

## Execution Strategy (Project Pattern)
1. **Survey (Phase 0)**:
   - Explorer 1: Backend architecture, Spring Security RBAC, Flyway migrations, admin endpoints, AuditService, AnalyticsService, HealthMetrics.
   - Explorer 2: Frontend FSD structure, Admin pages/widgets/features, drag-and-drop integration, markdown editor, theme consistency.
   - Explorer 3 / Spec Miner: Requirements inventory, existing test suites, gap analysis, API contract specifications.
2. **Decomposition & Contracts (Phase 1)**:
   - Build `PROJECT.md` and feature inventory mapping.
   - Setup `TEST_INFRA.md` for requirement-driven opaque-box testing.
3. **Dual-Track Execution (Phase 2)**:
   - E2E Testing Track: independent test suite across Tiers 1-4.
   - Implementation Track: Sub-orchestrators for M1, M2, M3, M4.
4. **Final Verification & Hardening (Phase 3-4)**:
   - 100% E2E tests passing.
   - Tier 5 adversarial tests and forensic integrity audit.
5. **Reporting**: Final handoff to Sentinel.
