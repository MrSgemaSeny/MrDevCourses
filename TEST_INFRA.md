# E2E Test Infra: MrDevCourses Admin Suite

## Test Philosophy
- Opaque-box, requirement-driven testing. Derived strictly from `ORIGINAL_REQUEST.md`.
- No reliance on internal implementation details; exercise endpoints and UI workflows as real administrators and students.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workloads.

## Feature Inventory & Test Coverage Goals
| # | Feature | Requirement Source | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|-------------------|:------:|:------:|:------:|:------:|
| 1 | Course Management CRUD | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 2 | Module Authoring & Reorder | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 3 | Lesson Authoring Suite | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 4 | Batch Drag-and-Drop Reorder | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 5 | Live Markdown Preview & Video | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 6 | Lesson Materials Attachment | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 7 | Quiz Builder & Question Editor | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 8 | Student Search & Filter | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 9 | Instant RBAC Role Switch | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 10 | Manual Enrollment & Unenrollment | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 11 | Student Progress Drawer | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 12 | Cohort Unlock Schedules | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 13 | Overview KPI Dashboard | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 14 | Course Step-by-Step Funnel | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 15 | Streak Distribution Histogram | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 16 | Granular Lesson Retention | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 17 | AI Tutor Telemetry | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 18 | Quiz Failure Hotspots | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 19 | CSV/JSON Analytics Export | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 20 | Immutable Audit Log Viewer | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| 21 | Rate Limit Real-time Telemetry | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| 22 | System & DB Health Telemetry | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Backend Test Runner**: Gradle with JUnit 5, MockMvc, `@SpringBootTest`, `@AutoConfigureMockMvc`, `@WithMockUser(roles = "ADMIN")`.
  - Command: `cd backend && .\gradlew.bat test`
- **Frontend Test Runner**: Vitest with React Testing Library and jsdom.
  - Command: `cd frontend && npm test`
- **Directory Layout**:
  - Backend: `backend/src/test/java/com/mrdev/modules/admin/` (Controllers, Services, RBAC, Integration tests).
  - Frontend: `frontend/src/widgets/admin-*/ui/*.test.tsx`, `frontend/src/pages/admin/*.test.tsx`.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full Course Authoring & Publishing Lifecycle | F1, F2, F3, F4, F5, F6, F7 | High |
| 2 | Student Support & Cohort Triage Journey | F8, F9, F10, F11, F12, F20 | High |
| 3 | Platform Health, Rate Limit & Audit Inspection | F19, F20, F21, F22 | Medium |
| 4 | Student Learning to Admin Telemetry Flow | F7, F13, F14, F15, F16, F18 | High |
| 5 | AI Tutor Interaction to Analytics Aggregation | F17, F21, F22 | Medium |

## Pass/Fail Criteria
- All tests must pass with 0 failures and 0 errors.
- 100% compliant with Spring Security RBAC and FSD architecture.
