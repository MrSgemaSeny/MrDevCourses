# Архитектурный отчет исследования бэкенда (MrDevCourses)

## 1. Observation (Прямые наблюдения)

### 1.1 Сборка и зависимости (`backend/build.gradle`)
- **Базовый стек**: Java 17, Spring Boot 3.3.0, Gradle 8.7, Spring Security 6, Spring Data JPA, Flyway.
- **Текущие зависимости**:
  - `org.springframework.boot:spring-boot-starter-web`
  - `org.springframework.boot:spring-boot-starter-security`
  - `org.springframework.boot:spring-boot-starter-data-jpa`
  - `org.springframework.boot:spring-boot-starter-validation`
  - `org.springframework.boot:spring-boot-starter-oauth2-client`
  - `org.flywaydb:flyway-core` + `org.flywaydb:flyway-database-postgresql`
  - `io.jsonwebtoken:jjwt-api:0.12.5` (+ `jjwt-impl`, `jjwt-jackson`)
  - `org.springframework.boot:spring-boot-starter-actuator`
  - `org.projectlombok:lombok`, `org.mapstruct:mapstruct:1.5.5.Final`
  - `testImplementation`: `spring-boot-starter-test`, `spring-security-test`, H2 database runtime.
- **Результаты выполнения тестов**:
  - Команда: `./gradlew test jacocoTestReport`
  - Результат: `BUILD SUCCESSFUL`, 58 unit/integration тестов прошли 100% успешно (0 failures, 0 errors).

### 1.2 База данных и миграции Flyway (`backend/src/main/resources/db/migration/`)
- `V1__create_users.sql`: таблица `users` (id, email, name, avatar_url, google_id, role, created_at) с индексами по `email` и `google_id`.
- `V2__create_courses.sql`: таблица `courses` (id, title, description, slug, is_active, created_at) с уникальным индексом по `slug`.
- `V3__create_lessons.sql`: таблица `lessons` (id, course_id, title, content, youtube_url, day_number, sort_order, created_at; UK `(course_id, day_number)`).
- `V4__create_enrollments.sql`: таблица `enrollments` (id, user_id, course_id, enrolled_at; UK `(user_id, course_id)`).
- `V5__create_lesson_progress.sql`: таблица `lesson_progress` (id, user_id, lesson_id, completed_at; UK `(user_id, lesson_id)`).
- `V6__create_audit_logs.sql`: таблица `audit_logs` (id, user_id, action, entity_type, entity_id, details, ip_address, created_at).
- `V7__add_streaks_and_certificates.sql`:
  - `ALTER TABLE users ADD COLUMN current_streak INT NOT NULL DEFAULT 0, ADD COLUMN longest_streak INT NOT NULL DEFAULT 0, ADD COLUMN last_active_date DATE;`
  - `CREATE TABLE certificates (id BIGSERIAL PRIMARY KEY, certificate_code VARCHAR(64) NOT NULL UNIQUE, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE, issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT uk_user_course_certificate UNIQUE (user_id, course_id));`
- `V8__add_performance_indexes.sql`: составные индексы `idx_courses_active_created (is_active, created_at DESC)` и `idx_enrollments_user_enrolled (user_id, enrolled_at DESC)`.
- `V9__add_password_hash_to_users.sql`: `ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);`.

### 1.3 Текущие модули и пробелы реализации
- **Auth**: `AuthController`, `JwtAuthenticationFilter`, `EmailAuthService`, `CustomOAuth2UserService`, `JwtCookieHelper`.
  - *Наблюдение*: `AuthRateLimiter.java:22-55` содержит наивный in-memory `ConcurrentHashMap<String, Deque<Instant>>` без Token Bucket и без лимитов для других эндпоинтов.
- **Course**: `CourseController`, `CourseService`, `EnrollmentService`. Пакетные запросы оптимизированы (отсутствует N+1).
- **Lesson**: `LessonController`, `LessonService`. Drip-логика строго вычисляется в `calculateUnlockTime(Instant enrolledAt, int dayNumber)`: `enrolledAt.plus(Duration.ofDays(dayNumber - 1L))`.
- **Progress**: `ProgressController`, `ProgressService`. Прогресс агрегируется по пользователю через `SecurityUtils.getCurrentUserId()`.
- **Audit**: `AuditService`, `AuditLogRepository`. Логирование выполняется в отдельной транзакции (`REQUIRES_NEW`).
- **Admin**: `AdminController`, `AdminService`. Защищен `PreAuthorize("hasRole('ADMIN')")`.
- **Security & Exceptions**: `SecurityConfig` настраивает stateless сессии, CORS, JWT-фильтр, security headers (`SecurityHeadersFilter`). `GlobalExceptionHandler` перехватывает `LessonLockedException`, `ApiException`, `AccessDeniedException`, `AuthenticationException`, `MethodArgumentNotValidException`.

---

## 2. Logic Chain (Пошаговый анализ и архитектурное проектирование)

### 2.1 Анализ R1: Bucket4j Rate Limiting и защита от IDOR / RLS
1. **Текущее состояние**:
   - `AuthRateLimiter` привязан только к контроллеру `AuthController` (`/register` и `/login`).
   - Отсутствует глобальный rate limiting фильтр. При росте нагрузки IP накапливаются в памяти без ограничения максимального размера структуры.
2. **Архитектурные требования R1**:
   - **Auth Tier**: `/api/v1/auth/**` — 10 req / 15 min per IP.
   - **AI Tier**: `/api/v1/ai/**` — 5 req / 1 min per User ID (с fallback на IP для анонимных).
   - **General Tier**: `/api/v1/**` — 60 req / 1 min per IP / User ID.
3. **Необходимые зависимости**:
   - `com.bucket4j:bucket4j-core:8.10.1` (или в связке с Caffeine `com.github.ben-manes.caffeine:caffeine:3.1.8` для автоматической очистки неактивных корзин по LRU/TTL).
4. **Проектирование компонентов**:
   - `RateLimitingService`: фабрика и реестр `Bucket` с использованием Caffeine Cache (`expireAfterAccess(1, TimeUnit.HOURS)`, `maximumSize(50_000)`).
   - `RateLimitingFilter`: `OncePerRequestFilter`, размещаемый в цепочке `SecurityConfig` **после** `JwtAuthenticationFilter`.
     - Извлекает `SecurityUtils.getCurrentUserIdOptional()` и IP-клиента (с учетом `X-Forwarded-For`).
     - Определяет тир по URI запроса (`/v1/auth/**`, `/v1/ai/**`, `/v1/**`).
     - Вызывает `bucket.tryConsume(1)`. При нехватке токенов формирует HTTP 429 с JSON `ErrorResponse` и заголовками `Retry-After`, `X-RateLimit-Remaining`.
5. **RLS и IDOR защита**:
   - Во всех существующих контроллерах (`LessonController`, `ProgressController`, `CourseController`) `userId` не принимается из параметров запроса, а извлекается исключительно через `SecurityUtils.getCurrentUserId()`.
   - В сервисах `LessonService`, `ProgressService`, `EnrollmentService` все выборки и обновления жестко фильтруются по `userId`.
   - Новые модули (AI, Certificates) должны строго следовать этому контракту.

### 2.2 Анализ R3: AI Lesson Tutor Backend Module (Groq + Llama 3.3 70B)
1. **Текущее состояние**:
   - Модуль AI отсутствует. Таблицы для учета токенов отсутствуют.
2. **Архитектурные требования R3**:
   - Интеграция с Groq API (`https://api.groq.com/openai/v1/chat/completions`).
   - Модель: `llama-3.3-70b-versatile`.
   - Контекстное заземление (grounding) системного промпта на Markdown-контент текущего урока.
   - Защита от Prompt Injection через XML-изоляцию (`<lesson_context>`, `<student_query>`).
   - Учет расхода токенов на пользователя (`TokenAccountingService`).
   - Поддержка стриминга ответов через Server-Sent Events (SSE).
3. **Необходимые зависимости**:
   - `org.springframework.boot:spring-boot-starter-webflux` (для реактивного `WebClient` и SSE потока `Flux<ServerSentEvent<String>>`).
4. **Проектирование схемы БД (`V10__create_ai_usage.sql`)**:
   - `ai_usage`: `id`, `user_id` (FK users), `lesson_id` (FK lessons), `model`, `prompt_tokens`, `completion_tokens`, `total_tokens`, `endpoint`, `created_at`.
   - Индексы: `idx_ai_usage_user (user_id, created_at DESC)`, `idx_ai_usage_lesson (lesson_id)`.
5. **Проектирование компонентов**:
   - `GroqClient`: HTTP-клиент на базе `WebClient`, инжектирующий API-ключ `GROQ_API_KEY`, модель `llama-3.3-70b-versatile`, таймауты (30с) и retry-политику на 429/5xx.
   - `ContextSanitizer`: фильтрация управляющих символов, ограничение длины пользовательского сообщения (макс. 2000 символов), структурирование системного промпта с изоляцией контента урока и вопроса студента в XML-тегах.
   - `AiTutorService`: оркестрация проверки доступа к уроку (урок должен быть доступен и разблокирован по drip-логике), подготовка контекста, вызов `GroqClient.streamCompletion()`, асинхронный вызов `TokenAccountingService.recordUsageAsync()`.
   - `AiTutorController`: эндпоинты `POST /v1/ai/tutor/chat` (SSE поток), `GET /v1/ai/quota` (остаток дневных запросов/токенов).

### 2.3 Анализ R4: PDF Certificate Generation (OpenHTMLtoPDF + Thymeleaf)
1. **Текущее состояние**:
   - Таблица `certificates` создана в миграции `V7__add_streaks_and_certificates.sql`.
   - Java-сущность `Certificate`, репозиторий, сервис и контроллер отсутствуют.
2. **Архитектурные требования R4**:
   - Генерация векторного PDF при 100% завершении курса.
   - Использование шаблонизатора Thymeleaf и рендерера OpenHTMLtoPDF.
   - Темно-золотая эстетика (`#0d1117` фон, `#d4af37` золотые акценты, поддержка кириллицы через встроенные шрифты Roboto/Inter).
   - Публичный эндпоинт верификации `/api/v1/certificates/verify/{certificateCode}`.
   - Скачивание PDF по эндпоинту `/api/v1/certificates/courses/{courseId}/download`.
3. **Необходимые зависимости**:
   - `org.springframework.boot:spring-boot-starter-thymeleaf`
   - `com.openhtmltopdf:openhtmltopdf-core:1.0.10`
   - `com.openhtmltopdf:openhtmltopdf-pdfbox:1.0.10`
   - `com.openhtmltopdf:openhtmltopdf-slf4j:1.0.10`
4. **Проектирование компонентов**:
   - `Certificate` (Entity): маппинг на таблицу `certificates`.
   - `CertificateRepository`: `findByUserIdAndCourseId`, `findByCertificateCode`, `existsByUserIdAndCourseId`.
   - `CertificateService`:
     - Проверка завершения курса: `lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(userId, courseId) == lessonRepository.countByCourseId(courseId)`.
     - Создание записи сертификата с UUID (`certificate_code = UUID.randomUUID().toString()`).
     - Рендеринг HTML через `SpringTemplateEngine` (`templates/certificate.html`).
     - Конвертация в PDF байты через `PdfRendererBuilder`.
   - `CertificateController`:
     - `GET /v1/certificates/courses/{courseId}/status`: статус и код сертификата.
     - `GET /v1/certificates/courses/{courseId}/download`: выдача PDF с `Content-Type: application/pdf`.
     - `GET /v1/certificates/verify/{certificateCode}`: публичная верификация (добавить в `permitAll` в `SecurityConfig`).

### 2.4 Анализ R5: Admin Analytics Module
1. **Текущее состояние**:
   - В `AdminService` реализовано базовое управление курсами, уроками и ручная запись студентов. Аналитические агрегаты отсутствуют.
2. **Архитектурные требования R5**:
   - Воронка прохождения курса по дням (`Day completion funnel`).
   - Расчет коэффициента отсева (`Drop-off rates`): процент студентов, остановившихся на каждом дне.
   - Среднее время на прохождение урока (`Average time spent per lesson`).
   - Распределение серий активности (`Study streak distributions`).
   - Сводные KPI метрики.
3. **Проектирование компонентов**:
   - `AdminAnalyticsService`:
     - `getOverviewMetrics()`: агрегация общего числа студентов, активных за 7 дней, процента завершения курсов, выданных сертификатов.
     - `getCourseFunnel(Long courseId)`: группировка завершений по `day_number` с расчетом конверсий и drop-off относительно общего числа записанных на курс.
     - `getStreakDistribution()`: агрегация пользователей по бакетам серий (`0`, `1-3`, `4-7`, `8-14`, `15-30`, `30+` дней).
   - Оптимизированные запросы в репозиториях:
     - В `LessonProgressRepository`: подсчет завершений по дням курса через JPQL `SELECT l.dayNumber, l.title, COUNT(DISTINCT lp.user.id) FROM LessonProgress lp JOIN lp.lesson l WHERE l.course.id = :courseId GROUP BY l.dayNumber, l.title ORDER BY l.dayNumber ASC`.
     - В `UserRepository`: подсчет распределения `currentStreak`.
   - `AdminAnalyticsController`: эндпоинты под маппингом `/v1/admin/analytics/**` с защитой `@PreAuthorize("hasRole('ADMIN')")`.

---

## 3. Caveats (Ограничения и допущения)

- **Groq API Key**: При отсутствии внешнего ключа `GROQ_API_KEY` в окружении, AI-модуль должен корректно обрабатывать ситуацию (graceful degradation, предупреждение в логах, mock-режим в тестах).
- **Стриминг в тестах**: Тестирование SSE эндпоинтов требует использования `WebTestClient` или мокирования `GroqClient`.
- **Шрифты в OpenHTMLtoPDF**: Для корректного рендеринга кириллицы в PDF необходимо подключить TTF-шрифт через classpath (`/fonts/Roboto-Regular.ttf` или Web Safe Font).
- **In-Memory Rate Limiter**: В рамках текущей архитектуры (один инстанс Fly.io) Bucket4j с Caffeine Cache полностью закрывает потребности. При будущем горизонтальном масштабировании на несколько реплик потребуется бакенд `bucket4j-redis`.

---

## 4. Conclusion (Итоговая архитектурная оценка)

Бэкенд `MrDevCourses` находится в стабильном состоянии (100% покрытие базовых тестов, чистая модульная структура, строгая Drip-логика и защита от IDOR). 

Для реализации требований R1, R3, R4, R5 определен четкий план интеграции:
1. **Зависимости в `build.gradle`**: добавление Bucket4j, Caffeine, Spring WebFlux, Thymeleaf, OpenHTMLtoPDF.
2. **Миграция БД**: добавление `V10__create_ai_usage.sql`.
3. **Безопасность**: расширение `SecurityConfig` (RateLimitingFilter после JWT-фильтра, permitAll для `/v1/certificates/verify/**`).
4. **Новые модули**:
   - `com.mrdevcourses.common.ratelimit` (R1)
   - `com.mrdevcourses.modules.ai` (R3)
   - `com.mrdevcourses.modules.certificate` (R4)
   - `com.mrdevcourses.modules.admin.analytics` (R5)

Все планируемые изменения полностью изолированы по SRP, не ломают существующие контракты и обратно совместимы.

---

## 5. Verification Method (Метод независимой верификации)

1. **Команда сборки и запуска тестов**:
   ```bash
   ./gradlew test jacocoTestReport
   ```
2. **Критерии успешности**:
   - Сборка завершается со статусом `BUILD SUCCESSFUL`.
   - 0 упавших тестов.
   - Jacoco генерирует отчет в `build/reports/jacoco/test/html/index.html`.
3. **Файлы для аудита**:
   - `backend/build.gradle`
   - `backend/src/main/resources/db/migration/`
   - `backend/src/main/java/com/mrdevcourses/config/SecurityConfig.java`
   - `backend/src/main/java/com/mrdevcourses/modules/`
