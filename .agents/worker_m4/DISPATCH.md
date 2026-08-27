## 2026-08-27T07:44:06Z

Вы являетесь Worker M4 (Automated PDF Certificate Generation & Public Verification).

Рабочая директория: c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\worker_m4
Корневая директория проекта: c:\Users\murat\IdeaProjects\new_world\MrDevCourses
ID оркестратора: 7583575c-b02d-43db-92ae-a25364d1ea2a

ОБЯЗАТЕЛЬНО ПРОЧИТАЙТЕ:
- c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\ORIGINAL_REQUEST.md
- c:\Users\murat\IdeaProjects\new_world\MrDevCourses\PROJECT.md
- c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\CONTEXT.md
- c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\explorer_donors\handoff.md (секция 1.2 и 2.3 — OpenHTMLtoPDF, Thymeleaf dark/gold template, шрифты, UUID верификация).

КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

СТРОГИЕ ПРАВИЛА:
- Никаких эмодзи в коде, комментариях, отчетах и сообщениях.
- Язык отчетов: Русский. Тон: Senior Architect.
- Сертификат генерируется при 100% завершении курса в LessonService.completeLesson() или CertificateService.
- Эстетика сертификата: Dark & Gold (#0d1117 фон, #d97706 / #f59e0b рамка, кириллические шрифты TTF).
- Публичный эндпоинт верификации: GET /api/v1/certificates/verify/{certificateCode} (доступен permitAll в SecurityConfig).
- Скачивание PDF: GET /api/v1/certificates/courses/{courseId}/download (application/pdf).

ОБЛАСТЬ РАБОТЫ (Исключительное владение файлами):
Backend:
- com.mrdevcourses.modules.certificate.* (CertificateController, CertificateService, PdfCertificateGenerator, Certificate entity, CertificateRepository, DTOs).
- resources/templates/certificate/certificate.html (или templates/certificate.html)
- resources/fonts/ (встраивание шрифтов Roboto/Inter TTF)
- Добавление зависимостей openhtmltopdf-pdfbox, openhtmltopdf-core в backend/build.gradle если требуется.
- Тесты: CertificateServiceTest, CertificateControllerTest, PdfCertificateGeneratorTest (проверка генерации байтов PDF, валидности UUID, публичной верификации).

Frontend:
- entities/certificate/api/certificateApi.ts
- pages/certificate/CertificateVerifyPage.tsx (с валидацией UUID, отображением статуса, имени, названия курса, даты)
- Регистрация маршрута /certificates/verify/:code в AppRouter.
- Кнопка/модалка скачивания сертификата на дашборде / странице курса при 100% прогрессе.
- Vitest тесты: CertificateVerifyPage.test.tsx.

ПРОВЕРКА:
1. ./gradlew test jacocoTestReport (все тесты бэкенда 100% green)
2. npm test -- --run (все тесты фронтенда 100% green)
3. npm run build (0 ошибок TypeScript, 0 ошибок сборки)

Создайте handoff.md в вашей рабочей директории и отправьте отчет оркестратору через send_message.
