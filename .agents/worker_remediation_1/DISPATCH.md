## 2026-08-25T11:11:52Z
Remediation Worker task dispatch:
Execute remediation and optimization on backend and frontend:
1. Backend Remediation & Optimization:
   - Drip Contract & Structured Exception (LessonLockedException, ErrorResponse opensAt, GlobalExceptionHandler, LessonService).
   - Eliminate N+1 DB Queries (AdminService, CourseService, ProgressService, batch queries in repositories).
   - Flyway Migration V8__add_performance_indexes.sql.
   - Security & Audit hardening (AdminService audit log active admin ID, SecurityConfig tighten requestMatchers).
   - Tests update/addition.
2. Frontend UI, Accessibility & Bundle Optimization:
   - FSD layer hierarchy fix for AuthContext/useAuth.
   - Bundle budget & lazy route splitting with React.lazy/Suspense and Vite manualChunks.
   - Accessibility & widget hardening (VisualRoadmap, CertificateModal, Header, MarkdownViewer, CountdownTimer, AdminPage modal UI, QueryProvider gcTime).
3. Verification:
   - Backend gradle tests & jacoco.
   - Frontend vitest tests & vite build.
