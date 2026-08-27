# Progress — Worker M4

Last visited: 2026-08-27T07:45:00Z

## Status
Initializing and inspecting current project files.

## Plan
1. [ ] Inspect existing backend dependencies in `backend/build.gradle` and backend database schema / entities for certificates.
2. [ ] Check existing `Certificate` entity, `CertificateRepository`, `CertificateController`, `CertificateService`, `LessonService`, `SecurityConfig`.
3. [ ] Check existing frontend components for certificates (`CertificateModal`, `certificateApi`, etc.).
4. [ ] Check font assets in `backend/src/main/resources/fonts/` or donor projects.
5. [ ] Implement PDF generator with Thymeleaf and OpenHTMLtoPDF.
6. [ ] Implement / enhance `CertificateService`, `CertificateController`, `CertificateResponseDto`, `CertificateVerificationDto`.
7. [ ] Ensure `completeLesson` in `LessonService` issues certificate on 100% course completion.
8. [ ] Implement frontend `certificateApi.ts`, `CertificateVerifyPage.tsx`, verify routing `/certificates/verify/:code`, download flow.
9. [ ] Write unit & integration tests for backend and frontend.
10. [ ] Run `./gradlew test jacocoTestReport`, `npm test -- --run`, `npm run build`.
11. [ ] Prepare `handoff.md` and report to orchestrator.
