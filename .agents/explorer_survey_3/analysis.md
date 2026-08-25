# Архитектурный анализ, спецификации API и Drip-движка MrDevCourses

**Версия документа:** 1.0.0  
**Дата:** 2026-08-25  
**Автор:** Explorer Survey 3 (Specs, API Contracts & Drip Engine Spec Miner)  
**Статус:** Утверждено для проектирования и реализации  

---

## 1. Архитектурный обзор и рамки системы

MrDevCourses представляет собой веб-платформу управления обучением (LMS) для бренда Mr Developer. Платформа построена по принципу модульного монолита на бэкенде (Spring Boot 3.3.0, Java 17, PostgreSQL, Flyway) и Feature-Sliced Design (FSD) на фронтенде (React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query v5).

### 1.1 Архитектурные принципы и границы
- **Stateless сессии:** Бэкенд не хранит состояние сессии в памяти. Аутентификация осуществляется через подписанный HMAC-SHA256 JWT, передаваемый в защищенной `httpOnly` cookie `mrdevcourses_token`.
- **Строгий UTC таймлайн:** Все даты (`enrolled_at`, `completed_at`, `created_at`) хранятся и обрабатываются исключительно в UTC (`TIMESTAMP WITH TIME ZONE`, `Instant`).
- **Детерминированный Drip-движок:** Доступность уроков вычисляется строго на стороне сервера в рантайме по математической формуле без использования периодических задач (Cron/Scheduled jobs).
- **IDOR & RBAC Defense:** Идентификатор пользователя `userId` извлекается исключительно из криптографически верифицированного `SecurityContext` (`SecurityUtils.getCurrentUserId()`). Запрещена передача `userId` студента в URL или теле клиентских запросов для студенческих операций.

---

## 2. Декомпозиция требований R1 – R6

### R1. Аутентификация и управление сессиями
- **Google OAuth2 Login:** Интеграция со Spring Security 6 `oauth2Login()`. Пользователь перенаправляется на `/api/oauth2/authorization/google`. По завершении провайдер возвращает код авторизации на `/api/login/oauth2/code/google`.
- **Авто-провижининг пользователей (`CustomOAuth2UserService`):**
  - При первом входе: поиск по `google_id` или `email`. Если пользователь отсутствует, создается новая запись в `users` с ролью `STUDENT`.
  - При повторном входе: обновление `name` и `avatar_url` (если изменились), сохранение актуального профиля.
- **JWT Cookie Generation (`JwtAuthenticationSuccessHandler`):**
  - Генерация JWT токена со сроком жизни 24 часа (`app.jwt.expiration-ms=86400000`).
  - Установка заголовка `Set-Cookie`: `mrdevcourses_token=<jwt>; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax; [Secure in prod]`.
  - Редирект пользователя на `${app.frontend-url}/courses` или страницу возврата.
- **Сессионный фильтр (`JwtAuthenticationFilter`):**
  - Перехват запросов к `/api/v1/**`. Извлечение cookie `mrdevcourses_token`.
  - Валидация подписи и срока действия токена через `JwtService`.
  - Установка `UsernamePasswordAuthenticationToken` в `SecurityContextHolder`.
- **Эндпоинты профиля:**
  - `GET /api/v1/auth/me`: Возвращает DTO текущего пользователя (`id`, `email`, `name`, `avatarUrl`, `role`, `createdAt`). При отсутствии сессии возвращает `401 Unauthorized`.
  - `POST /api/v1/auth/logout`: Очистка cookie (`Set-Cookie: mrdevcourses_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`).

### R2. Курсы и движок записи (Enrollment)
- **Каталог курсов:**
  - `GET /api/v1/courses`: Публичный список активных курсов (`is_active = true`). Для авторизованного пользователя дополняется флагом `isEnrolled`.
  - `GET /api/v1/courses/{slug}`: Детальная информация о курсе по его уникальному `slug` (включая общее количество уроков, описание).
- **Запись на курс:**
  - `POST /api/v1/courses/{courseId}/enroll`: Создает запись в таблице `enrollments` (`user_id`, `course_id`, `enrolled_at = NOW()`).
  - **Идемпотентность:** Защищена уникальным индексом `uk_enrollments_user_course`. Повторный запрос возвращает успешный статус существующей записи без перезаписи `enrolled_at`.

### R3. Плеер уроков и строгий серверный Drip-движок
- **Drip-доступность:**
  - Урок 1 (`day_number = 1`) доступен немедленно в момент записи (`opensAt = enrolled_at`).
  - Урок $N$ ($N \ge 2$) доступен строго при выполнении условия:
    $$\text{Instant.now()} \ge \text{enrolled\_at} + (N - 1) \times 24\text{ hours}$$
- **Контроль доступа:**
  - `GET /api/v1/courses/{courseId}/lessons`: Возвращает облегченный список уроков со статусами (`id`, `title`, `dayNumber`, `sortOrder`, `isAccessible`, `opensAt`, `isCompleted`). Контент и видеоссылки для заблокированных уроков не возвращаются.
  - `GET /api/v1/courses/{courseId}/lessons/{lessonId}`: Возвращает полный контент урока (`content`, `youtubeUrl`). Если студент не записан — `403 Forbidden`. Если урок заблокирован по Drip-таймеру — `403 Forbidden` со структурированным телом, содержащим `opensAt` (ISO-8601 UTC) и локализованное сообщение.
- **Завершение урока:**
  - `POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete`: Фиксирует прогресс в таблице `lesson_progress`. Завершить можно только открытый урок (`isAccessible == true`). Защита от дублей через `uk_lesson_progress_user_lesson`.
- **YouTube Embed & Markdown:**
  - Бэкенд хранит оригинальный URL (например, `https://www.youtube.com/watch?v=dQw4w9WgXcQ` или `https://youtu.be/dQw4w9WgXcQ`).
  - Фронтенд-компонент парсит видео-идентификатор и рендерит iframe `https://www.youtube-nocookie.com/embed/{id}`.
  - Текстовый контент рендерится через Markdown-парсер с подсветкой синтаксиса кода.

### R4. Студенческий дашборд и трекинг прогресса
- **Сводка по всем курсам:**
  - `GET /api/v1/progress`: Список всех активных подписок студента с агрегированными метриками.
- **Детальный прогресс курса:**
  - `GET /api/v1/progress/{courseId}`:
    - `currentDay`: $\lfloor \frac{\text{NOW()} - \text{enrolled\_at}}{24\text{ hours}} \rfloor + 1$.
    - `completedCount`: Количество записей в `lesson_progress` для данного курса и пользователя.
    - `totalUnlocked`: Количество уроков с `day_number <= currentDay`.
    - `totalLessons`: Общее количество уроков в курсе.
    - `nextUnlockAt`: Точное время разблокировки следующего закрытого урока (`day_number = currentDay + 1`), либо `null`, если все уроки открыты.

### R5. Панель администратора
- **Авторизация:** Все маршруты `/api/v1/admin/**` защищены проверкой `hasRole('ADMIN')`. Попытка доступа студента возвращает `403 Forbidden`.
- **CRUD курсов:** `POST /api/v1/admin/courses`, `PUT /api/v1/admin/courses/{id}`, `DELETE /api/v1/admin/courses/{id}`.
- **CRUD уроков:** `POST /api/v1/admin/courses/{courseId}/lessons`, `PUT /api/v1/admin/lessons/{id}`, `DELETE /api/v1/admin/lessons/{id}`.
- **Управление студентами:**
  - `GET /api/v1/admin/courses/{courseId}/students`: Список записанных студентов с датами записи и количеством пройденных уроков.
  - `POST /api/v1/admin/courses/{courseId}/enroll`: Ручная запись студента по `email` или `userId` администратором.

### R6. UI/UX Стилизация и FSD Архитектура (Envie Dark Aesthetic)
- **Цветовая палитра:**
  - Фоны: Base `#09090b`, Card `rgba(24, 24, 27, 0.8)` с backdrop blur `12px`, Elevated Card `#18181b`.
  - Границы: Border `#27272a`, Focus ring `#3f3f46`.
  - Текст: Primary `#fafafa`, Muted `#a1a1aa`, Subtle `#71717a`.
  - Акценты: Primary Button `#fafafa` с черным текстом `#09090b`, Success `#22c55e`, Warning/Lock `#eab308`, Error `#ef4444`.
- **FSD Структура:**
  - `app/`: Провайдеры (QueryProvider, AuthProvider), роутер, глобальные стили.
  - `pages/`: CatalogPage, CourseDetailPage, LessonViewPage, DashboardPage, AdminCoursesPage, AdminCourseEditPage, AdminStudentsPage.
  - `widgets/`: Header, Sidebar, VideoPlayer, LessonNavigation, ProgressSummaryWidget, AdminCourseTable.
  - `features/`: auth-by-google, enroll-course, complete-lesson, edit-lesson-form.
  - `entities/`: user, course, lesson, progress, enrollment.
  - `shared/`: ui (Button, Card, Input, Modal, Badge, Skeleton, ProgressBar), api (apiClient, endpoints), types, lib (date formatting, youtube parser).

---

## 3. Спецификация Drip-движка (Drip Engine Formal Spec)

### 3.1 Математическая модель расчета
Пусть:
- $T_{enrolled} \in \text{Instant (UTC)}$ — временная метка записи студента на курс.
- $N \in \mathbb{N}_{\ge 1}$ (`day_number`) — порядковый номер дня урока.
- $T_{now} \in \text{Instant (UTC)}$ — текущая временная метка сервера.
- $\Delta = 86400\text{ секунд}$ (точно 24 часа).

Время разблокировки урока $N$:
$$T_{unlock}(N) = T_{enrolled} + (N - 1) \times \Delta$$

Предикат доступности $A(N)$:
$$A(N) = \begin{cases} 
\text{true}, & \text{если } N = 1 \\
\text{true}, & \text{если } N > 1 \land T_{now} \ge T_{unlock}(N) \\
\text{false}, & \text{если } N > 1 \land T_{now} < T_{unlock}(N)
\end{cases}$$

Текущий расчетный день студента $D_{current}$:
$$D_{current} = \left\lfloor \frac{T_{now} - T_{enrolled}}{\Delta} \right\rfloor + 1$$

### 3.2 Обработка исключений Drip Lock (403 Payload)
При попытке вызова `GET /api/v1/courses/{courseId}/lessons/{lessonId}` для заблокированного урока сервер генерирует исключение `LessonLockedException` (наследник `ApiException` с `HttpStatus.FORBIDDEN`), которое форматируется `GlobalExceptionHandler`:

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Урок заблокирован. Доступ откроется через 14 ч 22 мин",
  "path": "/api/v1/courses/1/lessons/5",
  "timestamp": "2026-08-25T14:40:00Z",
  "opensAt": "2026-08-26T05:02:00Z"
}
```

---

## 4. Спецификация REST API контрактов

Базовый путь сервера: `/api` (`server.servlet.context-path: /api`).  
Все контроллеры используют маппинг `/v1/...`. Итоговый клиентский путь: `/api/v1/...`.

### 4.1 Общий конверт ответов

#### Стандартный успешный ответ (`ApiResponse<T>`)
```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "timestamp": "2026-08-25T14:40:00Z"
}
```

#### Стандартный ответ об ошибке (`ErrorResponse`)
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Описание ошибки",
  "path": "/api/v1/courses/1/enroll",
  "timestamp": "2026-08-25T14:40:00Z",
  "validationErrors": {
    "field": "Текст ошибки валидации"
  }
}
```

---

### 4.2 Модуль Auth (`/api/v1/auth`)

#### 1. `GET /api/v1/auth/me`
- **Назначение:** Получение профиля текущего аутентифицированного пользователя.
- **Доступ:** Любой аутентифицированный пользователь (`STUDENT`, `ADMIN`).
- **Заголовки / Cookies:** `Cookie: mrdevcourses_token=<jwt>`
- **HTTP 200 Success Body:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "student@example.com",
    "name": "Мурат Орынбасар",
    "avatarUrl": "https://lh3.googleusercontent.com/a/...",
    "role": "STUDENT",
    "createdAt": "2026-08-25T10:00:00Z"
  },
  "timestamp": "2026-08-25T14:40:00Z"
}
```
- **HTTP 401 Unauthorized Body:**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Пользователь не аутентифицирован",
  "path": "/api/v1/auth/me",
  "timestamp": "2026-08-25T14:40:00Z"
}
```

#### 2. `POST /api/v1/auth/logout`
- **Назначение:** Завершение сессии и удаление JWT cookie.
- **Доступ:** Public.
- **Response Headers:** `Set-Cookie: mrdevcourses_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
- **HTTP 200 Success Body:**
```json
{
  "success": true,
  "message": "Успешный выход из системы",
  "data": null,
  "timestamp": "2026-08-25T14:40:00Z"
}
```

#### 3. OAuth2 Callback & Cookie Specification
- **Flow:**
  1. Frontend редиректит на: `GET /api/oauth2/authorization/google`.
  2. Google производит аутентификацию и возвращает на: `GET /api/login/oauth2/code/google?code=...&state=...`.
  3. `CustomOAuth2UserService` извлекает `sub` (как `google_id`), `email`, `name`, `picture` (как `avatar_url`).
  4. Сохранение в БД (`users`).
  5. `OAuth2AuthenticationSuccessHandler` генерирует JWT и устанавливает cookie:
     - **Name:** `mrdevcourses_token`
     - **Value:** `<JWT token string>`
     - **HttpOnly:** `true`
     - **Secure:** `true` в prod profile / `false` в dev
     - **SameSite:** `Lax`
     - **Path:** `/`
     - **Max-Age:** `86400` (24 часа)
  6. Редирект на: `${app.frontend-url}/courses`.

---

### 4.3 Модуль Courses (`/api/v1/courses`)

#### 1. `GET /api/v1/courses`
- **Назначение:** Список всех активных курсов.
- **Доступ:** Public. Если передан валидный JWT, поле `isEnrolled` рассчитывается для текущего пользователя.
- **HTTP 200 Success Body:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Java & Spring Boot с нуля",
      "description": "Интенсивный практический курс по созданию production-ready сервисов.",
      "slug": "java-spring-boot-zero",
      "isActive": true,
      "lessonsCount": 14,
      "isEnrolled": true,
      "createdAt": "2026-08-20T08:00:00Z"
    },
    {
      "id": 2,
      "title": "React 19 & TypeScript: FSD Архитектура",
      "description": "Построение масштабируемых фронтенд приложений.",
      "slug": "react-fsd-architecture",
      "isActive": true,
      "lessonsCount": 10,
      "isEnrolled": false,
      "createdAt": "2026-08-21T08:00:00Z"
    }
  ],
  "timestamp": "2026-08-25T14:40:00Z"
}
```

#### 2. `GET /api/v1/courses/{slug}`
- **Назначение:** Получение детальной карточки курса по slug.
- **Доступ:** Public (с обогащением `isEnrolled` при наличии сессии).
- **HTTP 200 Success Body:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Java & Spring Boot с нуля",
    "description": "Полное руководство: от основ до развертывания на Fly.io.",
    "slug": "java-spring-boot-zero",
    "isActive": true,
    "lessonsCount": 14,
    "isEnrolled": true,
    "enrolledAt": "2026-08-25T10:00:00Z",
    "createdAt": "2026-08-20T08:00:00Z"
  },
  "timestamp": "2026-08-25T14:40:00Z"
}
```
- **HTTP 404 Not Found:**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Курс с указанным slug не найден",
  "path": "/api/v1/courses/unknown-slug",
  "timestamp": "2026-08-25T14:40:00Z"
}
```

#### 3. `POST /api/v1/courses/{courseId}/enroll`
- **Назначение:** Запись авторизованного студента на курс.
- **Доступ:** `STUDENT`, `ADMIN`. `userId` извлекается из `SecurityContext`.
- **HTTP 200 / 201 Success Body:**
```json
{
  "success": true,
  "message": "Вы успешно записались на курс",
  "data": {
    "id": 42,
    "userId": 1,
    "courseId": 1,
    "enrolledAt": "2026-08-25T14:40:00Z"
  },
  "timestamp": "2026-08-25T14:40:00Z"
}
```
- **HTTP 404 Not Found:** Курс с `courseId` не существует.
- **HTTP 401 Unauthorized:** Пользователь не вошел в систему.

---

### 4.4 Модуль Lessons & Drip Engine (`/api/v1/courses/{courseId}/lessons`)

#### 1. `GET /api/v1/courses/{courseId}/lessons`
- **Назначение:** Получение плана уроков с индивидуальными статусами доступности и прогресса.
- **Доступ:** `STUDENT`, `ADMIN`.
- **HTTP 200 Success Body:**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "courseId": 1,
      "title": "День 1: Введение и окружение",
      "dayNumber": 1,
      "sortOrder": 1,
      "isAccessible": true,
      "opensAt": "2026-08-25T10:00:00Z",
      "isCompleted": true,
      "createdAt": "2026-08-20T08:00:00Z"
    },
    {
      "id": 102,
      "courseId": 1,
      "title": "День 2: Dependency Injection и Bean Lifecycle",
      "dayNumber": 2,
      "sortOrder": 2,
      "isAccessible": false,
      "opensAt": "2026-08-26T10:00:00Z",
      "isCompleted": false,
      "createdAt": "2026-08-20T08:00:00Z"
    }
  ],
  "timestamp": "2026-08-25T14:40:00Z"
}
```

#### 2. `GET /api/v1/courses/{courseId}/lessons/{lessonId}`
- **Назначение:** Получение контента урока для просмотра.
- **Доступ:** `STUDENT`, `ADMIN`.
- **HTTP 200 Success Body (если открыт):**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "courseId": 1,
    "title": "День 1: Введение и окружение",
    "content": "# День 1. Архитектура\nДобро пожаловать на курс...",
    "youtubeUrl": "https://www.youtube.com/watch?v=example123",
    "dayNumber": 1,
    "sortOrder": 1,
    "isAccessible": true,
    "opensAt": "2026-08-25T10:00:00Z",
    "isCompleted": true,
    "createdAt": "2026-08-20T08:00:00Z"
  },
  "timestamp": "2026-08-25T14:40:00Z"
}
```
- **HTTP 403 Forbidden Body (если заблокирован Drip-таймером):**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Урок заблокирован. Доступ откроется через 19 ч 20 мин",
  "path": "/api/v1/courses/1/lessons/102",
  "timestamp": "2026-08-25T14:40:00Z",
  "opensAt": "2026-08-26T10:00:00Z"
}
```
- **HTTP 403 Forbidden Body (если пользователь не записан на курс):**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Вы не записаны на данный курс",
  "path": "/api/v1/courses/1/lessons/101",
  "timestamp": "2026-08-25T14:40:00Z"
}
```

#### 3. `POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete`
- **Назначение:** Отметка урока как выполненного студентом.
- **Доступ:** `STUDENT`, `ADMIN`.
- **Логика:** Проверяется, что урок доступен (`isAccessible == true`). Записывается в `lesson_progress`. Идемпотентно.
- **HTTP 200 Success Body:**
```json
{
  "success": true,
  "message": "Урок успешно отмечен как выполненный",
  "data": {
    "id": 55,
    "userId": 1,
    "lessonId": 101,
    "completedAt": "2026-08-25T14:40:00Z"
  },
  "timestamp": "2026-08-25T14:40:00Z"
}
```
- **HTTP 403 Forbidden:** Попытка завершить заблокированный урок.

---

### 4.5 Модуль Progress (`/api/v1/progress`)

#### 1. `GET /api/v1/progress`
- **Назначение:** Сводный прогресс по всем курсам студента.
- **Доступ:** `STUDENT`, `ADMIN`.
- **HTTP 200 Success Body:**
```json
{
  "success": true,
  "data": [
    {
      "courseId": 1,
      "courseTitle": "Java & Spring Boot с нуля",
      "courseSlug": "java-spring-boot-zero",
      "enrolledAt": "2026-08-25T10:00:00Z",
      "currentDay": 1,
      "completedCount": 1,
      "totalUnlocked": 1,
      "totalLessons": 14,
      "nextUnlockAt": "2026-08-26T10:00:00Z"
    }
  ],
  "timestamp": "2026-08-25T14:40:00Z"
}
```

#### 2. `GET /api/v1/progress/{courseId}`
- **Назначение:** Детальный прогресс по конкретному курсу.
- **Доступ:** `STUDENT`, `ADMIN`.
- **HTTP 200 Success Body:**
```json
{
  "success": true,
  "data": {
    "courseId": 1,
    "courseTitle": "Java & Spring Boot с нуля",
    "courseSlug": "java-spring-boot-zero",
    "enrolledAt": "2026-08-25T10:00:00Z",
    "currentDay": 1,
    "completedCount": 1,
    "totalUnlocked": 1,
    "totalLessons": 14,
    "nextUnlockAt": "2026-08-26T10:00:00Z"
  },
  "timestamp": "2026-08-25T14:40:00Z"
}
```

---

### 4.6 Модуль Admin (`/api/v1/admin`)

Все эндпоинты требуют роли `ADMIN`. При обращении студента возвращается `403 Forbidden`.

#### 1. `POST /api/v1/admin/courses`
- **Назначение:** Создание нового курса.
- **Request Body JSON:**
```json
{
  "title": "Spring Security 6 & OAuth2",
  "description": "Практическое руководство по защите микросервисов и веб-приложений.",
  "slug": "spring-security-6-oauth2",
  "isActive": true
}
```
- **Validation Rules:**
  - `title`: `@NotBlank`, `@Size(min = 3, max = 255)`
  - `slug`: `@NotBlank`, `@Pattern(regexp = "^[a-z0-9-]+$")`, `@Size(max = 255)`
  - `isActive`: `@NotNull`
- **HTTP 201 Created Body:**
```json
{
  "success": true,
  "message": "Курс успешно создан",
  "data": {
    "id": 3,
    "title": "Spring Security 6 & OAuth2",
    "description": "Практическое руководство по защите микросервисов и веб-приложений.",
    "slug": "spring-security-6-oauth2",
    "isActive": true,
    "createdAt": "2026-08-25T14:40:00Z"
  },
  "timestamp": "2026-08-25T14:40:00Z"
}
```
- **HTTP 409 Conflict:** Курс с таким `slug` уже существует.

#### 2. `PUT /api/v1/admin/courses/{id}`
- **Назначение:** Обновление курса.
- **Request Body JSON:**
```json
{
  "title": "Spring Security 6 & OAuth2 Deep Dive",
  "description": "Обновленное руководство...",
  "slug": "spring-security-6-oauth2",
  "isActive": true
}
```
- **HTTP 200 Success Body:** `ApiResponse<CourseDto>`

#### 3. `POST /api/v1/admin/courses/{courseId}/lessons`
- **Назначение:** Добавление урока в курс.
- **Request Body JSON:**
```json
{
  "title": "День 1: Архитектура фильтров Spring Security",
  "content": "# Архитектура фильтров\nРазбираем SecurityFilterChain...",
  "youtubeUrl": "https://www.youtube.com/watch?v=sec123",
  "dayNumber": 1,
  "sortOrder": 1
}
```
- **Validation Rules:**
  - `title`: `@NotBlank`, `@Size(max = 255)`
  - `dayNumber`: `@NotNull`, `@Min(1)`
  - `sortOrder`: `@NotNull`, `@Min(0)`
  - `youtubeUrl`: `@Size(max = 500)`
- **HTTP 201 Created Body:** `ApiResponse<LessonDto>`
- **HTTP 409 Conflict:** Урок с таким `day_number` уже существует в данном курсе (`uk_lessons_course_day`).

#### 4. `PUT /api/v1/admin/lessons/{id}`
- **Назначение:** Редактирование урока.
- **Request Body JSON:** Аналогично созданию урока.
- **HTTP 200 Success Body:** `ApiResponse<LessonDto>`

#### 5. `GET /api/v1/admin/courses/{courseId}/students`
- **Назначение:** Просмотр списка студентов курса и их прогресса.
- **HTTP 200 Success Body:**
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "email": "student@example.com",
      "name": "Мурат Орынбасар",
      "avatarUrl": "https://lh3.googleusercontent.com/...",
      "enrolledAt": "2026-08-25T10:00:00Z",
      "currentDay": 1,
      "completedLessonsCount": 1,
      "totalLessons": 14
    }
  ],
  "timestamp": "2026-08-25T14:40:00Z"
}
```

#### 6. `POST /api/v1/admin/courses/{courseId}/enroll`
- **Назначение:** Ручная запись студента на курс администратором.
- **Request Body JSON:**
```json
{
  "userId": 1,
  "enrolledAt": "2026-08-20T00:00:00Z"
}
```
*(Опциональное поле `enrolledAt` позволяет администратору скорректировать точку отсчета Drip-таймера при ручном трансфере студента).*
- **HTTP 200 / 201 Success Body:** `ApiResponse<EnrollmentDto>`

---

## 5. Полный реестр функционала (Feature Inventory)

| № | Название функции | Описание | Модуль | Майлстоун / Эпик | Приоритет | Источник / Контракт |
|---|---|---|---|---|---|---|
| **F-01** | Google OAuth2 Authentication | Авторизация через Google OAuth2 с получением данных профиля | `auth` | Epic-01 (Фаза 1) | P0 | R1 / SecurityConfig |
| **F-02** | User Auto-Provisioning & Sync | Автоматическое создание/обновление пользователя в `users` | `auth` | Epic-01 (Фаза 1) | P0 | R1 / CustomOAuth2UserService |
| **F-03** | Stateless JWT in httpOnly Cookie | Выпуск и валидация JWT токена в безопасной cookie | `auth` | Epic-01 (Фаза 1) | P0 | R1 / JwtService, JwtFilter |
| **F-04** | User Profile & Session Status | Эндпоинт `/api/v1/auth/me` для проверки текущей сессии | `auth` | Epic-01 (Фаза 1) | P0 | R1 / AuthController |
| **F-05** | Secure Logout | Завершение сессии с инвалидацией cookie | `auth` | Epic-01 (Фаза 1) | P0 | R1 / AuthController |
| **F-06** | Public Courses Catalog | Просмотр каталога активных курсов (`GET /courses`) | `course` | Epic-02 (Фаза 2) | P0 | R2 / CourseController |
| **F-07** | Course Details by Slug | Просмотр карточки курса по slug (`GET /courses/{slug}`) | `course` | Epic-02 (Фаза 2) | P0 | R2 / CourseController |
| **F-08** | Student Self-Enrollment | Запись авторизованного студента на курс с фиксацией UTC | `course` | Epic-02 (Фаза 2) | P0 | R2 / EnrollmentController |
| **F-09** | Course Lessons Plan with Drip State | Получение списка уроков со статусами `isAccessible` и `opensAt` | `lesson` | Epic-03 (Фаза 2) | P0 | R3 / LessonController |
| **F-10** | Strict Drip Access Enforcement | Серверная блокировка (403) контента заблокированного урока | `lesson` | Epic-03 (Фаза 2) | P0 | R3 / LessonService |
| **F-11** | Lesson Content & Video Player | Просмотр видео (YouTube embed) и Markdown-контента урока | `lesson` | Epic-03 (Фаза 2) | P0 | R3 / LessonController |
| **F-12** | Lesson Completion Tracking | Фиксация завершения урока в `lesson_progress` | `lesson` | Epic-03 (Фаза 2) | P0 | R3 / LessonController |
| **F-13** | Student Dashboard Summary | Сводка прогресса по всем курсам (`GET /progress`) | `progress` | Epic-04 (Фаза 3) | P1 | R4 / ProgressController |
| **F-14** | Detailed Course Progress Metrics | Расчет `currentDay`, `totalUnlocked`, `nextUnlockAt` | `progress` | Epic-04 (Фаза 3) | P1 | R4 / ProgressController |
| **F-15** | Admin Course CRUD | Создание, редактирование и удаление курсов | `admin` | Epic-05 (Фаза 4) | P1 | R5 / AdminCourseController |
| **F-16** | Admin Lesson CRUD | Создание, редактирование и удаление уроков в курсе | `admin` | Epic-05 (Фаза 4) | P1 | R5 / AdminLessonController |
| **F-17** | Admin Student Roster & Progress | Просмотр списка студентов курса и их прогресса | `admin` | Epic-05 (Фаза 4) | P1 | R5 / AdminStudentController |
| **F-18** | Admin Manual Enrollment | Ручная запись студента на курс администратором | `admin` | Epic-05 (Фаза 4) | P1 | R5 / AdminEnrollmentController |

---

## 6. Матрица безопасности, RBAC и защиты от IDOR

| Роль | Ресурс / Эндпоинт | Метод | Авторизация | Механизм защиты |
|---|---|---|---|---|
| Все (Гость) | `/api/v1/courses`, `/courses/{slug}` | GET | `permitAll()` | Публичный доступ, контент уроков скрыт |
| Все (Гость) | `/api/oauth2/**`, `/api/login/oauth2/**` | GET | `permitAll()` | Стандартный OAuth2 handshake |
| Гость / Студент | `/api/v1/auth/logout` | POST | `permitAll()` | Очистка cookie на клиенте |
| STUDENT / ADMIN | `/api/v1/auth/me` | GET | `authenticated()` | JWT из cookie -> `SecurityContext` |
| STUDENT / ADMIN | `/api/v1/courses/{id}/enroll` | POST | `authenticated()` | `userId` берется ТОЛЬКО из токена |
| STUDENT / ADMIN | `/api/v1/courses/{id}/lessons` | GET | `authenticated()` | Проверка записи на курс + расчет Drip |
| STUDENT / ADMIN | `/api/v1/courses/{id}/lessons/{lessonId}` | GET | `authenticated()` | 403 при преждевременном доступе |
| STUDENT / ADMIN | `/api/v1/courses/{id}/lessons/{lessonId}/complete` | POST | `authenticated()` | `userId` из токена + проверка открытости |
| STUDENT / ADMIN | `/api/v1/progress/**` | GET | `authenticated()` | Запрос данных ТОЛЬКО своего `userId` |
| ADMIN ONLY | `/api/v1/admin/**` | ANY | `hasRole('ADMIN')` | Проверка `Role.ADMIN`, студенту 403 Forbidden |

---

## 7. План и структура E2E Test Suite (Tiers 1–4)

Тестовый набор разделен на 4 уровня строгости. Для уровней Tier 1 и Tier 2 сформировано не менее 5 конкретных тест-кейсов на каждую функцию.

### 7.1 Tier 1: Покрытие базового функционала (Feature Coverage $\ge 5$ на функцию)

#### F-01 / F-02: Google OAuth2 & User Provisioning
1. `test_oauth2_new_user_created_as_student`: Новый пользователь создает запись в `users` с ролью `STUDENT`.
2. `test_oauth2_existing_user_updated`: Существующий пользователь обновляет `name` и `avatar_url`.
3. `test_oauth2_matching_by_email`: Если `email` уже зарегистрирован, привязывается `google_id`.
4. `test_oauth2_missing_name_fallback`: Если в токене отсутствует имя, используется email prefix.
5. `test_oauth2_success_redirect`: Проверка редиректа на фронтенд URL после успешной авторизации.

#### F-03 / F-04 / F-05: JWT, Auth Me & Logout
1. `test_jwt_cookie_issued_with_httponly`: Проверка атрибутов `HttpOnly`, `Path=/`, `Max-Age=86400`.
2. `test_auth_me_returns_profile`: `GET /api/v1/auth/me` возвращает профиль авторизованного пользователя.
3. `test_auth_me_unauthenticated_returns_401`: Запрос без cookie возвращает `401 Unauthorized`.
4. `test_jwt_expired_returns_401`: Истекший токен возвращает `401 Unauthorized`.
5. `test_logout_clears_cookie`: `POST /api/v1/auth/logout` возвращает cookie с `Max-Age=0`.

#### F-06 / F-07 / F-08: Courses & Enrollment
1. `test_get_courses_returns_active_only`: Возвращаются только курсы с `is_active = true`.
2. `test_get_courses_with_auth_marks_enrolled`: Для авторизованного пользователя `isEnrolled = true`.
3. `test_get_course_by_slug_success`: Получение детальной информации по корректному slug.
4. `test_get_course_by_invalid_slug_returns_404`: Неверный slug возвращает `404 Not Found`.
5. `test_enroll_course_creates_enrollment`: Успешная запись на курс, `enrolled_at` равен текущему UTC времени.

#### F-09 / F-10 / F-11 / F-12: Lessons & Drip Engine
1. `test_get_lessons_day1_is_accessible`: Урок 1 доступен сразу после записи (`isAccessible = true`).
2. `test_get_lessons_day2_is_locked_initially`: Урок 2 заблокирован в момент записи (`isAccessible = false`).
3. `test_get_lesson_content_day1_success`: `GET /lessons/{id}` для дня 1 возвращает контент и `youtubeUrl`.
4. `test_get_lesson_content_day2_locked_returns_403`: `GET /lessons/{id}` для дня 2 возвращает 403 и `opensAt`.
5. `test_complete_accessible_lesson_success`: Завершение доступного урока фиксируется в `lesson_progress`.

#### F-13 / F-14: Progress Dashboard
1. `test_get_progress_summary_all_courses`: Возвращает список всех курсов студента с прогрессом.
2. `test_get_progress_by_course_day1_metrics`: Для нового студента `currentDay = 1`, `completedCount = 0`.
3. `test_get_progress_after_completion`: После завершения урока `completedCount` увеличивается на 1.
4. `test_progress_next_unlock_at_calculation`: `nextUnlockAt` точно указывает на `enrolled_at + 24h`.
5. `test_progress_not_enrolled_returns_404_or_empty`: Запрос прогресса по незаписанному курсу.

#### F-15 / F-16 / F-17 / F-18: Admin Panel
1. `test_admin_create_course_success`: Администратор успешно создает курс (`201 Created`).
2. `test_admin_create_lesson_success`: Администратор добавляет урок с `day_number = 1`.
3. `test_admin_student_roster_shows_enrolled`: Список студентов отображает записанного пользователя.
4. `test_admin_manual_enroll_success`: Администратор вручную записывает пользователя на курс.
5. `test_student_access_to_admin_returns_403`: Студент получает `403 Forbidden` на `/api/v1/admin/**`.

---

### 7.2 Tier 2: Граничные и исключительные ситуации (Boundary / Corner Cases $\ge 5$ на функцию)

#### B-01: Drip Engine Time Boundaries & Precision
1. `test_drip_boundary_minus_1_second`: В момент `enrolled_at + 23h 59m 59s` урок 2 СТРОГО заблокирован (403).
2. `test_drip_boundary_exact_second`: В момент `enrolled_at + 24h 00m 00s` урок 2 СТРОГО открыт (200).
3. `test_drip_boundary_plus_1_second`: В момент `enrolled_at + 24h 00m 01s` урок 2 открыт (200).
4. `test_drip_day_gap_handling`: Курс с уроками Day 1 и Day 5 (без дней 2, 3, 4) — Day 5 открывается ровно через 4 суток.
5. `test_drip_multi_day_batch_unlock`: Студент зашел через 10 дней — уроки с 1 по 10 открыты, 11 закрыт.

#### B-02: Идемпотентность и конкурентный доступ
1. `test_duplicate_enrollment_idempotent`: Двойной параллельный POST `/enroll` не создает дубликат и не меняет `enrolled_at`.
2. `test_duplicate_lesson_complete_idempotent`: Повторный POST `/complete` возвращает 200 без изменения `completed_at`.
3. `test_concurrent_complete_requests`: 5 параллельных запросов `/complete` на один урок отрабатывают без ошибок 500/Lock deadlock.
4. `test_complete_premature_lesson_rejected`: Попытка отправить `/complete` для заблокированного урока возвращает 403.
5. `test_complete_lesson_when_not_enrolled`: Попытка отправить `/complete` без записи на курс возвращает 403.

#### B-03: Валидация и граничные значения ввода
1. `test_create_course_empty_title_fails`: Создание курса с пустым заголовком возвращает 400 и ошибку валидации.
2. `test_create_course_duplicate_slug_fails`: Создание курса с существующим slug возвращает 409 Conflict.
3. `test_create_lesson_negative_day_fails`: Создание урока с `dayNumber = -1` или `0` возвращает 400.
4. `test_create_lesson_duplicate_day_in_course_fails`: Создание двух уроков с `day_number = 1` в одном курсе возвращает 409.
5. `test_create_lesson_long_youtube_url_validation`: URL длиннее 500 символов возвращает 400.

#### B-04: Безопасность, токены и IDOR
1. `test_jwt_tampered_signature_rejected`: Подделка полезной нагрузки токена возвращает 401.
2. `test_jwt_malformed_token_rejected`: Невалидная строка токена возвращает 401.
3. `test_student_cannot_view_another_student_progress`: Студент не может получить прогресс другого пользователя.
4. `test_student_cannot_enroll_another_user`: Попытка подставить чужой `userId` игнорируется.
5. `test_admin_endpoint_no_token_returns_401`: Запрос к `/admin/**` без токена возвращает 401.

---

### 7.3 Tier 3: Кросс-функциональные сценарии (Cross-Feature Combinations)

1. **Сценарий C-01: Полный цикл студента с временной симуляцией:**
   - Студент логинится через Google -> Просматривает каталог -> Записывается на курс -> Проходит Урок 1 -> Отмечает Урок 1 завершенным -> Проверяет дашборд (100% дня 1) -> Пытается открыть Урок 2 (получает 403 с датой) -> Происходит сдвиг времени на 24 часа -> Урок 2 открывается -> Завершает Урок 2 -> Дашборд обновляется.
2. **Сценарий C-02: Админское изменение курса и влияние на студентов:**
   - Администратор создает курс -> Добавляет уроки (дни 1, 2, 3) -> Студент записывается -> Администратор обновляет контент урока 1 -> Студент видит обновленный контент без сброса статуса завершения.
3. **Сценарий C-03: Сессионная инвалидация и восстановление:**
   - Студент авторизован -> Вызывает `POST /auth/logout` -> Cookie очищается -> Попытка запроса `/courses/1/lessons` возвращает 401 -> Повторный логин восстанавливает весь прогресс.
4. **Сценарий C-04: Многокурсовая активность:**
   - Студент записывается на Курс A в День 0 и на Курс B в День 3 -> На Курсе A открыто 4 урока, на Курсе B открыт только 1 урок -> Дашборд корректно агрегирует прогресс по каждому курсу независимо.

---

### 7.4 Tier 4: Реальные сценарии использования (Real-World User Journeys)

1. **User Journey J-01: Новый студент «Первый день обучения»:**
   - Заходит на главную страницу -> Авторизуется через Google в 1 клик -> Видит карточки курсов -> Нажимает «Записаться» на курс Java -> Мгновенный переход к плееру Урока 1 -> Просмотр видео YouTube -> Чтение конспекта -> Нажатие кнопки «Урок пройден» -> Появление сообщения: «Отличная работа! День 2 откроется завтра в 10:00».
2. **User Journey J-02: Возвращающийся студент «Пропущенная неделя»:**
   - Студент записался 7 дней назад, но не заходил -> Входит в дашборд -> Видит, что ему доступны уроки с Дня 1 по День 7 -> Может последовательно изучать открытые уроки, при этом Урок 8 остается закрытым.
3. **User Journey J-03: Tech Lead / Администратор «Запуск нового потока»:**
   - Вход под аккаунтом с ролью `ADMIN` -> Переход в `/admin` -> Создание курса «Spring Boot Production» -> Наполнение 14 уроками с видеоссылками и конспектами -> Ручная запись тестового студента со смещением даты записи на 3 дня назад для проверки корректности отображения -> Проверка таблицы успеваемости студентов.

---

## 8. Архитектурная интеграция фронтенда (FSD Mapping)

```
frontend/src/
├── app/
│   ├── providers/ (QueryProvider, AuthProvider)
│   └── router/ (AppRoutes with ProtectedRoute & AdminRoute)
├── pages/
│   ├── catalog/ (CatalogPage)
│   ├── course-detail/ (CourseDetailPage)
│   ├── lesson-view/ (LessonViewPage)
│   ├── dashboard/ (DashboardPage)
│   └── admin/ (AdminCoursesPage, AdminCourseEditPage, AdminStudentsPage)
├── widgets/
│   ├── header/ (Header with user avatar & logout)
│   ├── video-player/ (YouTubeEmbedPlayer)
│   ├── lesson-sidebar/ (LessonTimelineSidebar with Lock badges)
│   └── progress-card/ (CourseProgressCard)
├── features/
│   ├── auth/ (GoogleLoginButton, LogoutButton)
│   ├── enroll/ (EnrollButton)
│   └── complete-lesson/ (CompleteLessonButton)
├── entities/
│   ├── user/ (api/userApi, model/useUser)
│   ├── course/ (api/courseApi, ui/CourseCard)
│   ├── lesson/ (api/lessonApi, ui/LessonItem)
│   └── progress/ (api/progressApi, model/useProgress)
└── shared/
    ├── api/ (apiClient axios instance with credentials)
    ├── types/ (User, Course, Lesson, Progress DTOs)
    ├── ui/ (Button, Card, Badge, ProgressBar, Modal)
    └── lib/ (formatTimeRemaining, parseYouTubeEmbedUrl)
```

---

## 9. Заключение

Настоящий документ полностью специфицирует архитектурные требования R1–R6, математическую модель Drip-движка, контракты всех REST API эндпоинтов, форматы ответов об ошибках и детальную пирамиду тестирования Tiers 1–4. Все спецификации готовы для непосредственной имплементации разработчиками.
