# E2E Test Infra: MrDevCourses

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation internals.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinations + Real-World Workloads.
- Execution: Full backend `./gradlew test` and frontend `npm test -- --run`.

## Feature Inventory
| # | Feature | Source | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Workload) |
|---|---------|--------|:----------------:|:-----------------:|:----------------------:|:-----------------:|
| 1 | F-01: Google OAuth2 & Auto-provisioning | R1 | 5 | 5 | ✓ | ✓ |
| 2 | F-02: Stateless JWT in httpOnly Cookie | R1 | 5 | 5 | ✓ | ✓ |
| 3 | F-03: SecurityUtils & IDOR Protection | R1 | 5 | 5 | ✓ | ✓ |
| 4 | F-04: User Profile & Logout | R1 | 5 | 5 | ✓ | ✓ |
| 5 | F-05: Frontend Auth Provider & Guards | R1 | 5 | 5 | ✓ | ✓ |
| 6 | F-06: Course Catalog API | R2 | 5 | 5 | ✓ | ✓ |
| 7 | F-07: Course Slug Detail API | R2 | 5 | 5 | ✓ | ✓ |
| 8 | F-08: Student Enrollment Engine | R2 | 5 | 5 | ✓ | ✓ |
| 9 | F-09: Course Catalog & Details UI | R2 | 5 | 5 | ✓ | ✓ |
| 10| F-10: Server-Side Drip Engine | R3 | 5 | 5 | ✓ | ✓ |
| 11| F-11: Guarded Lesson Content & 403 lock | R3 | 5 | 5 | ✓ | ✓ |
| 12| F-12: Lesson Completion API | R3 | 5 | 5 | ✓ | ✓ |
| 13| F-13: Lesson Player UI | R3 | 5 | 5 | ✓ | ✓ |
| 14| F-14: Student Progress Metrics Engine | R4 | 5 | 5 | ✓ | ✓ |
| 15| F-15: Student Dashboard UI | R4 | 5 | 5 | ✓ | ✓ |
| 16| F-16: Admin RBAC & Course/Lesson CRUD | R5 | 5 | 5 | ✓ | ✓ |
| 17| F-17: Admin Student Management | R5 | 5 | 5 | ✓ | ✓ |
| 18| F-18: Admin Management UI | R5 | 5 | 5 | ✓ | ✓ |
| 19| F-19: Envie Dark Theme & FSD Compliance | R6 | 5 | 5 | ✓ | ✓ |
| 20| F-20: E2E Verification & Second Brain | Quality | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Backend Test Runner: `./gradlew test` (JUnit 5, MockMvc, SpringBootTest, Mockito)
- Frontend Test Runner: `npm test -- --run` (Vitest, React Testing Library)
- Coverage Thresholds:
  - Tier 1: ≥5 per feature (Total ≥ 100 tests across backend & frontend)
  - Tier 2: ≥5 boundary cases per feature (Total ≥ 100 boundary tests)
  - Tier 3: Pairwise feature combinations (Auth + Drip, Enroll + Progress, Admin + Student view)
  - Tier 4: Real-world user lifecycles (Sign up -> Enroll -> Day 1 complete -> Wait Day 2 -> Admin inspection)
