# Original User Request

## Initial Request — 2026-08-30T13:28:16Z

Build a comprehensive, enterprise-grade Admin Suite and Management Console for MrDeveloper, featuring rich course/curriculum authoring, student progress tracking, live cohorts and telemetry, system audit logs, and secure RBAC operations in a strict monolithic dark theme.

Working directory: C:\Users\murat\IdeaProjects\new_world\MrDevCourses
Integrity mode: development

## Requirements

### R1. Course & Curriculum Authoring Suite
Provide a complete visual curriculum editor for courses, modules, lessons, quizzes, and external materials with drag-and-drop reordering, markdown preview, video embed verification, and instant draft/publish toggling.

### R2. Student & Cohort Management Console
Provide granular student administration: search, role management (STUDENT / ADMIN), manual enrollment, individual streak & progress inspection, and cohort unlock schedules.

### R3. Advanced Platform Analytics & Telemetry
Implement interactive analytics visualizing drop-off funnels, streak distributions, completion cohorts, AI Tutor question frequency, and quiz failure hotspots with exportable summaries.

### R4. Security, Audit Logs & System Health
Expose an immutable audit log viewer for all administrative actions, real-time rate limit monitoring, and database health metrics adhering strictly to `#0a0a0c` dark aesthetic and FSD architecture.

## Acceptance Criteria

### Curriculum Management
- [ ] Admins can create, edit, reorder (drag & drop), and delete courses, modules, and lessons without page reloads
- [ ] Lesson editor supports live Markdown preview, material attachments, and quiz binding
- [ ] Drip-content timing and sort orders automatically recalculate on module updates

### Student & RBAC Controls
- [ ] Real-time search and filter across all students with instant role toggles (STUDENT <-> ADMIN)
- [ ] Manual enrollment/unenrollment with immediate UI synchronization and audit log entry
- [ ] Non-admin users are strictly blocked via both Spring Security `@PreAuthorize("hasRole('ADMIN')")` and frontend `ProtectedRoute`

### Analytics & Audit Dashboard
- [ ] Cohort retention, completion rate, and streak charts render with interactive tooltips and course filtering
- [ ] System audit logs display actor, action type, target entity, timestamp in UTC, and change diffs
- [ ] Entire admin UI conforms strictly to monochrome black palette (`#0a0a0c` / `#0e0e11`, `border-white/5`), zero blue clutter
