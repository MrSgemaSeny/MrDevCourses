# Технический анализ архитектуры бэкенда и базы данных MrDevCourses

**Дата:** 2026-08-25  
**Роль:** Backend Architecture & Database Explorer (Explorer 1)  
**Статус:** Анализ завершен  
**Проект:** MrDevCourses (LMS Платформа)  

---

## 1. Текущее состояние кодовой базы бэкенда

### 1.1 Структура и зависимости (`build.gradle`)
- **Стек:** Java 17, Spring Boot 3.3.0, Spring Dependency Management 1.1.4.
- **Ключевые зависимости:**
  - `org.springframework.boot:spring-boot-starter-web`
  - `org.springframework.boot:spring-boot-starter-security`
  - `org.springframework.boot:spring-boot-starter-data-jpa`
  - `org.springframework.boot:spring-boot-starter-validation`
  - `org.springframework.boot:spring-boot-starter-oauth2-client`
  - `org.postgresql:postgresql`
  - `org.flywaydb:flyway-core` + `org.flywaydb:flyway-database-postgresql`
  - `io.jsonwebtoken:jjwt-api:0.12.5` + `jjwt-impl` + `jjwt-jackson`
  - `org.projectlombok:lombok` + `org.mapstruct:mapstruct:1.5.5.Final`
  - `org.springframework.boot:spring-boot-starter-actuator`
  - `testImplementation`: `spring-boot-starter-test`, `spring-security-test`, H2 (`com.h2database:h2`)
- **Сборка и тесты:** `./gradlew test` выполняется успешно (1/1 тест `contextLoads` проходит).

### 1.2 Конфигурационные файлы
- `application.yml`:
  - `server.servlet.context-path: /api`
  - `spring.jpa.open-in-view: false`
  - `spring.jpa.properties.hibernate.jdbc.time_zone: UTC`
  - `app.jwt`: secret, expiration-ms (86400000 = 24h), cookie-name (`mrdevcourses_token`), cookie-secure (false/dev), cookie-same-site (`Lax`/`None`).
  - `app.cors`: allowed-origins, allowed-methods, allow-credentials (`true`).
- `application-dev.yml`:
  - PostgreSQL datasource (`localhost:5432/mrdevcourses_db`).
  - OAuth2 Google client registration placeholders.
- `application-prod.yml`:
  - Envs: `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
  - `app.jwt.cookie-secure: true`, `app.jwt.cookie-same-site: None`.
- `src/test/resources/application-test.yml`:
  - In-memory H2 database (`jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL`).
  - `flyway.enabled: false`, `ddl-auto: create-drop`.

### 1.3 Базовые классы
- `MrDevCoursesApplication.java`: явная установка `TimeZone.setDefault(TimeZone.getTimeZone("UTC"))`.
- `config/WebConfig.java`: настройка CORS на уровне Spring MVC.
- `common/dto/ApiResponse.java`: стандартная обертка ответов API (`success`, `message`, `data`, `timestamp`).
- `common/dto/ErrorResponse.java`: структурированный ответ ошибок (`status`, `error`, `message`, `path`, `timestamp`, `validationErrors`).
- `common/exception/GlobalExceptionHandler.java`: обработка `ApiException`, `MethodArgumentNotValidException`, `BadCredentialsException`, `Exception`.

---

## 2. Анализ схемы БД (Flyway V1..V5)

| Миграция | Таблица | Назначение | Ключевые ограничения и индексы |
|---|---|---|---|
| `V1__create_users.sql` | `users` | Пользователи (студенты и админы) | `email UNIQUE`, `google_id UNIQUE`, `role DEFAULT 'STUDENT'`, индексы по `email`, `google_id` |
| `V2__create_courses.sql` | `courses` | Каталог обучающих курсов | `slug UNIQUE`, `is_active DEFAULT TRUE`, индекс по `slug` |
| `V3__create_lessons.sql` | `lessons` | Уроки курса с днями и видео | `CONSTRAINT uk_lessons_course_day UNIQUE (course_id, day_number)`, `ON DELETE CASCADE`, индексы по `course_id`, `(course_id, sort_order)` |
| `V4__create_enrollments.sql` | `enrollments` | Записи студентов на курсы | `CONSTRAINT uk_enrollments_user_course UNIQUE (user_id, course_id)`, `enrolled_at TIMESTAMPTZ DEFAULT NOW()`, индексы по `user_id`, `course_id` |
| `V5__create_lesson_progress.sql` | `lesson_progress` | Завершенные уроки | `CONSTRAINT uk_lesson_progress_user_lesson UNIQUE (user_id, lesson_id)`, `completed_at TIMESTAMPTZ DEFAULT NOW()`, индексы по `user_id`, `lesson_id` |

**Оценка схемы:**  
Существующие миграции `V1..V5` полностью покрывают все требования R1–R5. Изменение примененных миграций запрещено правилами проекта. Любые потенциальные дополнения в будущем должны оформляться строго через `V6__...`. На текущий момент схема полностью готова к реализации сущностей.

---

## 3. Детальный разбор требований и Gap-анализ (R1..R5)

### R1. Authentication & Session Management
- **Что есть:** Зависимости JWT и OAuth2, конфигурация в `application.yml`, базовый GlobalExceptionHandler.
- **Что требуется реализовать:**
  1. `com.mrdevcourses.auth.entity.User` / `com.mrdevcourses.user.entity.User` (JPA Entity, `Role` enum: `STUDENT`, `ADMIN`).
  2. `UserRepository` (`findByEmail`, `findByGoogleId`).
  3. `CustomOAuth2UserService` (загрузка OAuth2User, сохранение/обновление пользователя в `users`).
  4. `OAuth2AuthenticationSuccessHandler`: генерация JWT, установка `httpOnly` cookie `mrdevcourses_token`, редирект на `${app.frontend-url}`.
  5. `OAuth2AuthenticationFailureHandler`: обработка ошибок и редирект с параметром `?error=...`.
  6. `JwtTokenProvider` (`JwtService`): генерация токена (jjwt 0.12.5), валидация, извлечение `userId`, `email`, `role`.
  7. `JwtAuthenticationFilter`: чтение cookie `mrdevcourses_token` (и поддержка заголовка `Authorization: Bearer` как fallback для тестов/API), установка `UserPrincipal` в `SecurityContextHolder`.
  8. `SecurityUtils`: методы `getCurrentUserId()`, `getCurrentUser()`, `isAdmin()`.
  9. `SecurityConfig`: Spring Security 6 `SecurityFilterChain` с stateless сессией, защитой маршрутов, CORS и обработкой исключений authentication entry point (401).
  10. `AuthController`:
      - `GET /v1/auth/me` (или `/api/v1/auth/me` в зависимости от context-path) -> данные текущего пользователя.
      - `POST /v1/auth/logout` -> очистка cookie (`Max-Age=0`).

### R2. Courses & Enrollment Engine
- **Что есть:** Таблицы `courses` и `enrollments` в V2 и V4.
- **Что требуется реализовать:**
  1. `Course` и `Enrollment` JPA Entities.
  2. `CourseRepository` (`findBySlug`, `findByIsActiveTrue`), `EnrollmentRepository` (`findByUserIdAndCourseId`, `findByUserId`, `existsByUserIdAndCourseId`).
  3. `CourseService`:
     - `getAllActiveCourses()` -> `List<CourseResponse>` (каталог курсов с количеством уроков).
     - `getCourseBySlug(String slug)` -> `CourseDetailResponse` (детальное описание курса, информация о записи пользователя, если авторизован).
  4. `EnrollmentService`:
     - `enrollStudent(Long userId, Long courseId)` -> `EnrollmentResponse` (сохранение записи с `enrolled_at = Instant.now()`, идемпотентность при повторной записи).
  5. `CourseController`:
     - `GET /v1/courses` (публичный)
     - `GET /v1/courses/{slug}` (публичный)
     - `POST /v1/courses/{courseId}/enroll` (требует авторизации студента)

### R3. Lesson Player & Strict Server-Side Drip Engine
- **Что есть:** Таблицы `lessons` и `lesson_progress` в V3 и V5.
- **Drip-формула:**
  - Урок `N` доступен тогда и только тогда, когда:
    $$\text{NOW()} - \text{enrolled\_at} \ge (N - 1) \times 1\text{ day}$$
  - Для Урока 1 (`day_number = 1`): `opensAt = enrolled_at` (доступен сразу после записи).
  - Для Урока $N$ (`day_number = N`): `opensAt = enrolled_at + (N - 1) * 24h`.
  - Если пользователь `ADMIN`, проверка drip игнорируется (полный доступ).
  - Если студент не записан на курс: доступ к уроку запрещен (403 Forbidden).
  - Если урок закрыт по времени: выброс `DripAccessDeniedException` с кодом 403 и полями `opensAt`, `dayNumber`.
- **Что требуется реализовать:**
  1. `Lesson` и `LessonProgress` JPA Entities.
  2. `LessonRepository` (`findByCourseIdOrderBySortOrderAscDayNumberAsc`, `findByCourseIdAndId`), `LessonProgressRepository` (`findByUserIdAndLessonId`, `findByUserIdAndLessonCourseId`).
  3. `LessonService`:
     - `getLessonsForCourse(Long userId, Long courseId)`: список уроков с флагами `isAccessible`, `opensAt`, `isCompleted`.
     - `getLessonDetails(Long userId, Long courseId, Long lessonId)`: проверка записи и drip-доступа, возврат контента и `youtubeUrl`.
     - `completeLesson(Long userId, Long courseId, Long lessonId)`: отметка завершения в `lesson_progress` (идемпотентно).
  4. `LessonController`:
     - `GET /v1/courses/{courseId}/lessons`
     - `GET /v1/courses/{courseId}/lessons/{lessonId}`
     - `POST /v1/courses/{courseId}/lessons/{lessonId}/complete`

### R4. Student Dashboard & Progress Tracking
- **Что есть:** База для расчета прогресса в `enrollments` и `lesson_progress`.
- **Что требуется реализовать:**
  1. `ProgressService`:
     - `getStudentOverview(Long userId)` -> сводка по всем курсам студента (`CourseProgressOverviewDto`):
       - `courseId`, `courseTitle`, `courseSlug`, `enrolledAt`
       - `totalLessons`, `completedCount`, `totalUnlocked`, `currentDay`
       - `nextUnlockAt` (время открытия следующего заблокированного урока или `null`)
       - `progressPercentage` (`completedCount * 100 / totalLessons`)
     - `getCourseProgress(Long userId, Long courseId)` -> детальный прогресс по курсу (`CourseProgressDetailDto`):
       - Полный список уроков с их статусом прохождения и временем открытия.
  2. `ProgressController`:
     - `GET /v1/progress`
     - `GET /v1/progress/{courseId}`

### R5. Admin Panel APIs
- **Что есть:** Роль `ADMIN` в `users` таблице.
- **Что требуется реализовать:**
  1. Guard `@PreAuthorize("hasRole('ADMIN')")` или `hasAuthority('ROLE_ADMIN')` на `/v1/admin/**`.
  2. `AdminCourseController`:
     - `GET /v1/admin/courses` (все курсы, включая неактивные)
     - `POST /v1/admin/courses` (создание курса)
     - `PUT /v1/admin/courses/{id}` (редактирование курса)
     - `DELETE /v1/admin/courses/{id}` (деактивация/удаление курса)
  3. `AdminLessonController`:
     - `GET /v1/admin/courses/{courseId}/lessons` (все уроки курса)
     - `POST /v1/admin/courses/{courseId}/lessons` (добавление урока)
     - `PUT /v1/admin/courses/{courseId}/lessons/{lessonId}` (обновление урока)
     - `DELETE /v1/admin/courses/{courseId}/lessons/{lessonId}` (удаление урока)
  4. `AdminStudentController`:
     - `GET /v1/admin/students` (список всех пользователей, их записи, дата регистрации)
     - `GET /v1/admin/students/{userId}/progress` (детальный прогресс конкретного студента)
     - `POST /v1/admin/students/enroll` (ручная запись студента на курс с опциональным указанием `enrolledAt`)
     - `PUT /v1/admin/students/{userId}/role` (смена роли пользователя)

---

## 4. Архитектурные нюансы и рекомендации

### 4.1 Префикс маршрутов и Context-Path
В `application.yml` задано:
```yaml
server:
  servlet:
    context-path: /api
```
**Важный нюанс:** Если `context-path` равен `/api`, то контроллеры с `@RequestMapping("/v1/...")` будут доступны по URL `/api/v1/...`.  
Если же в контроллере написать `@RequestMapping("/api/v1/...")`, то реальный путь станет `/api/api/v1/...`!  
**Рекомендация:** Либо убрать `server.servlet.context-path: /api` и явно писать `@RequestMapping("/api/v1/...")` в контроллерах, либо использовать `@RequestMapping("/v1/...")` при сохранении `context-path: /api`. Явное указание `@RequestMapping("/api/v1/...")` без context-path является более прозрачным и предотвращает ошибки в OAuth2 редиректах.

### 4.2 Совместимость H2 и PostgreSQL при тестировании
В H2 режиме PostgreSQL синтаксис `INTERVAL '1 day'` в кастомных нативных SQL-запросах может вызывать ошибки парсинга.  
**Рекомендация:** Выполнять расчет времени разблокировки (`opensAt`) в сервисном слое на `java.time.Instant` и `Duration.ofDays(...)`. Это обеспечивает 100% точность, независимость от диалекта СУБД и мгновенную работу тестов на H2.

### 4.3 Безопасность и защита от IDOR
- Все методы студента (`/v1/progress/**`, `/v1/courses/{id}/enroll`, `/v1/courses/{id}/lessons/{id}/complete`) должны извлекать идентификатор пользователя строго из `SecurityUtils.getCurrentUserId()`.
- Исключена передача `userId` через URL/Body в студенческих эндпоинтах.

---

## 5. План тестирования для бэкенда

1. **Unit & Slice Tests**:
   - `JwtTokenProviderTest`: создание, валидация, истечение срока действия, парсинг claims.
   - `LessonServiceDripTest`: проверка Drip-расчета:
     - Day 1: доступен сразу (`enrolled_at`).
     - Day 2: заблокирован до `enrolled_at + 24h`, доступен после.
     - Admin: доступен всегда.
     - 403 Forbidden при попытке доступа до наступления `opensAt`.
2. **Integration Tests (MockMvc / WebMvcTest)**:
   - `AuthControllerTest`: проверка `/api/v1/auth/me` и `/api/v1/auth/logout`.
   - `CourseControllerTest`: каталог курсов и запись на курс.
   - `LessonControllerTest`: проверка доступа к урокам и отметка завершения.
   - `ProgressControllerTest`: расчет текущего дня, количества завершенных и разблокированных уроков.
   - `AdminSecurityTest`: проверка запрета доступа для роли `STUDENT` к `/api/v1/admin/**` (403 Forbidden) и разрешения для `ADMIN`.
