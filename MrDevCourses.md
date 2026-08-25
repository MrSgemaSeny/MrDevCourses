# MrDevCourses — Полное руководство по проекту

**Репо:** github.com/MrSgemaSeny/MrDevCourses
**Деплой:** (планируется: Fly.io / GitHub Pages)
**API:** /api/v1/**
**Старт:** 2026-08-25
**Срок MVP:** ~3-4 недели
**Уровень:** 3 (Production-Ready LMS, без оплаты на старте)

---

## Содержание

- [1. Введение и обзор](#1-введение-и-обзор)
- [2. Технологический стек](#2-технологический-стек)
- [3. Архитектура системы](#3-архитектура-системы)
- [4. Схема БД](#4-схема-бд)
- [5. Модули системы](#5-модули-системы)
- [6. Ролевая модель и безопасность](#6-ролевая-модель-и-безопасность)
- [7. Roadmap (Фазы)](#7-roadmap-фазы)
- [8. Структура репозитория](#8-структура-репозитория)
- [9. Риски и подводные камни](#9-риски-и-подводные-камни)
- [10. Связи с MeDev (что переиспользовать)](#10-связи-с-medev-что-переиспользовать)

---

## 1. Введение и обзор

### 1.1 Что это такое

MrDevCourses — обучающая платформа для бренда Mr Developer.
Студент регистрируется через Google, получает доступ к курсу и проходит его по одному уроку в день.
Ключевая механика: **drip-контент** — урок N доступен только если прошло N-1 дней с момента записи на курс.
Студент физически не может ускорить прохождение — это защита от "проглатывания" без усвоения.

### 1.2 Основные возможности

- Google OAuth — вход без пароля
- Каталог курсов (3 базовых на старте)
- Drip-доступ к урокам: один урок в день, строго по дате записи
- Просмотр урока: YouTube embed + текстовый контент
- Личный кабинет: прогресс студента, какой сейчас день, что открыто
- Админка: управление курсами, уроками, студентами

### 1.3 Целевая аудитория

Студенты Mr Developer — люди без IT-базы, 16-40 лет, русскоязычные.
Масштаб на старте: 2-5 студентов. Целевой горизонт: 50-200.
Монетизация: отсутствует в MVP, возможна в итерации 2-3.

---

## 2. Технологический стек

### 2.1 Бэкенд

- **Java 17 + Spring Boot 3** — надёжность, знакомый стек, production-ready из коробки
- **Spring Security + OAuth2 Client** — Google OAuth; переиспользуется паттерн из MeDev (V14__add_google_id.sql)
- **PostgreSQL** — реляционная БД; drip-логика реализуется чистым SQL без крона
- **Flyway** — строгий контроль схемы, никаких `ddl-auto=create`
- **Нет Redis** — на MVP не нужен; нет refresh-токенов (используем stateless сессию через httpOnly cookie или JWT), нет кэширования

### 2.2 Фронтенд

- **React 19 + TypeScript + Vite** — знакомый стек
- **Feature-Sliced Design (FSD)** — та же архитектура что в MeDev; слои переиспользуются
- **React Query** — серверный стейт, кэш запросов
- **Tailwind v4** — стилизация

### 2.3 Инфраструктура

- **Fly.io** — деплой бэкенда (конфиг из MeDev адаптируется)
- **GitHub Pages** — деплой фронтенда
- **GitHub Actions** — CI/CD; адаптация пайплайна из MeDev

### 2.4 Что сознательно НЕ берём на MVP

| Что | Почему отложено |
|-----|----------------|
| Redis | Нет refresh-токенов, нет тяжёлого кэша |
| Оплата (Stripe/Kaspi) | Явно вне скоупа MVP |
| YouTube Data API | Нужен только embed — iframe достаточно |
| Email-уведомления | Студентов мало, ручное управление |
| Тесты/квизы | Итерация 2 |

---

## 3. Архитектура системы

```
[Browser]
    |
    |  HTTPS
    v
[React + FSD]              [GitHub Pages]
    |
    |  /api/v1/*
    v
[Spring Boot 3]            [Fly.io]
    |            \
    v             v
[PostgreSQL]   [Google OAuth2]
[Flyway]       (внешний провайдер)
```

**Тип:** модульный монолит. Никаких микросервисов — один разработчик, мало студентов.

**Auth flow:**
1. Студент нажимает "Войти через Google"
2. Spring Security редиректит на Google
3. Google возвращает code → Spring обменивает на токен → сохраняет/обновляет `users`
4. Выдаётся httpOnly cookie с JWT — фронт не хранит токен в localStorage

**Drip flow:**
```
GET /api/v1/courses/{courseId}/lessons/{lessonId}
    → LessonService.isAccessible(userId, lessonId)
        → enrollments.enrolled_at
        → lessons.day_number
        → NOW() - enrolled_at >= (day_number - 1) days ?
            true  → вернуть урок
            false → 403 + дата открытия
```

Никакого крона. Никакого джоба. Чистая арифметика на каждый запрос.

---

## 4. Схема БД

### Миграции (Flyway)

```sql
-- V1__create_users.sql
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    name       VARCHAR(255),
    avatar_url VARCHAR(500),
    google_id  VARCHAR(255) UNIQUE,
    role       VARCHAR(50)  NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- V2__create_courses.sql
CREATE TABLE courses (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- V3__create_lessons.sql
CREATE TABLE lessons (
    id           BIGSERIAL PRIMARY KEY,
    course_id    BIGINT       NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    content      TEXT,
    youtube_url  VARCHAR(500),
    day_number   INT          NOT NULL,
    sort_order   INT          NOT NULL DEFAULT 0,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (course_id, day_number)
);

-- V4__create_enrollments.sql
CREATE TABLE enrollments (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT    NOT NULL REFERENCES users(id),
    course_id   BIGINT    NOT NULL REFERENCES courses(id),
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);

-- V5__create_lesson_progress.sql
CREATE TABLE lesson_progress (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT    NOT NULL REFERENCES users(id),
    lesson_id     BIGINT    NOT NULL REFERENCES lessons(id),
    completed_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, lesson_id)
);
```

---

## 5. Модули системы

### 5.1 Auth Module

- **Функционал:** Google OAuth2 вход, автосоздание пользователя при первом логине, logout
- **Сущности:** `users`
- **Особенности:**
  - Если `google_id` уже есть → обновить `name`, `avatar_url`, вернуть существующего пользователя
  - Если нет → создать нового с ролью `STUDENT`
  - JWT кладётся в httpOnly cookie (не в localStorage — защита от XSS)
  - Переиспользуется паттерн из MeDev: `OAuth2UserService`, `SecurityUtils.getCurrentUserId()`

### 5.2 Course Module

- **Функционал:** список курсов, детальная страница курса, запись на курс
- **Сущности:** `courses`, `enrollments`
- **API:**
  - `GET /api/v1/courses` — публичный список активных курсов
  - `GET /api/v1/courses/{slug}` — детали курса
  - `POST /api/v1/courses/{courseId}/enroll` — записаться (создаёт `enrollment` с `enrolled_at = NOW()`)
- **Особенности:** повторная запись игнорируется (UNIQUE constraint)

### 5.3 Lesson Module

- **Функционал:** список уроков курса с доступностью, просмотр урока, отметка как просмотренного
- **Сущности:** `lessons`, `lesson_progress`
- **API:**
  - `GET /api/v1/courses/{courseId}/lessons` — список уроков со статусом (доступен/заблокирован/пройден)
  - `GET /api/v1/courses/{courseId}/lessons/{lessonId}` — контент урока (403 если заблокирован)
  - `POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete` — отметить как пройденный
- **YouTube embed:** `youtube_url` хранится как полная ссылка (`https://youtube.com/watch?v=xxx`). Фронт конвертирует в embed URL (`https://youtube.com/embed/xxx`) на клиенте. Бэкенд URL не трогает.

### 5.4 Progress Module

- **Функционал:** дашборд студента — текущий день, сколько пройдено, что открыто сегодня
- **Сущности:** `enrollments`, `lesson_progress`
- **API:**
  - `GET /api/v1/progress` — сводка по всем курсам студента
  - `GET /api/v1/progress/{courseId}` — детальный прогресс по курсу

### 5.5 Admin Module

- **Функционал:** CRUD курсов и уроков, список студентов, ручная запись студента на курс
- **Доступ:** только роль `ADMIN`
- **API:**
  - `POST /api/v1/admin/courses` — создать курс
  - `PUT /api/v1/admin/courses/{id}` — обновить курс
  - `POST /api/v1/admin/courses/{courseId}/lessons` — добавить урок
  - `PUT /api/v1/admin/lessons/{id}` — обновить урок
  - `GET /api/v1/admin/students` — список всех студентов
  - `POST /api/v1/admin/students/{userId}/enroll/{courseId}` — записать вручную

---

## 6. Ролевая модель и безопасность

### Роли

| Роль | Права |
|------|-------|
| `STUDENT` | Просмотр курсов, запись, просмотр доступных уроков, отметка прогресса |
| `ADMIN` | Всё + управление контентом, просмотр всех студентов |

### Защита

- **IDOR:** `userId` извлекается только из JWT, никогда из URL-параметра
- **Drip enforcement на бэкенде:** проверка доступа к уроку — только на сервере; фронт показывает статус, но не является источником правды
- **httpOnly cookie:** JWT не доступен из JS → защита от XSS-кражи токена
- **GlobalExceptionHandler:** клиент никогда не видит stacktrace
- **Секреты:** Google Client ID/Secret строго в env переменных

---

## 7. Roadmap (Фазы)

### Фаза 0 — Инициализация (день 1-2)
- [x] Создать репозиторий `MrDevCourses` (монорепо: `backend/` + `frontend/`)
- [x] Инициализировать Spring Boot 3
- [x] Инициализировать React + Vite + FSD структуру
- [x] Написать V1-V5 миграции Flyway
- [x] Настроить `application.yml`, `application-dev.yml`, `application-prod.yml`
- [x] Добавить `CLAUDE.md` и `.agents/AGENTS.md`

### Фаза 1 — Auth (день 3-5)
- [ ] Google OAuth2 через Spring Security
- [ ] `OAuth2UserService` — сохранение/обновление пользователя
- [ ] JWT в httpOnly cookie
- [ ] `SecurityUtils.getCurrentUserId()`
- [ ] `GET /api/v1/auth/me` — текущий пользователь
- [ ] `POST /api/v1/auth/logout`
- [ ] Фронт: страница логина, Google кнопка, редирект после входа

### Фаза 2 — Курсы и уроки (день 6-10)
- [ ] `CourseController` — список и детали курса
- [ ] `EnrollmentController` — запись на курс
- [ ] `LessonController` — список уроков со статусом, получение урока
- [ ] `LessonService.isAccessible()` — drip-логика
- [ ] YouTube embed на фронте
- [ ] Фронт: страница каталога, страница курса, страница урока

### Фаза 3 — Прогресс и дашборд (день 11-14)
- [ ] `ProgressController` — сводка и детальный прогресс
- [ ] `POST /lessons/{id}/complete` — отметить урок
- [ ] Фронт: личный кабинет, прогресс-бар, текущий день, следующий unlock
- [ ] Блокировка недоступных уроков на UI (замок + дата открытия)

### Фаза 4 — Админка (день 15-18)
- [ ] CRUD курсов и уроков
- [ ] Список студентов и их прогресс
- [ ] Ручная запись студента на курс
- [ ] Фронт: простая админка (таблицы, формы)

### Фаза 5 — Деплой и полировка (день 19-21)
- [ ] `Dockerfile`
- [ ] `fly.toml`
- [ ] GitHub Actions: тесты → деплой на Fly.io
- [ ] GitHub Pages деплой фронта
- [ ] Базовые integration тесты (auth flow, drip-логика)

---

## 8. Структура репозитория

```
MrDevCourses/
├── CLAUDE.md
├── .agents/
│   ├── AGENTS.md
│   └── CONTEXT.md
├── Epics/
│   ├── Epic-01-auth/epic.md
│   ├── Epic-02-courses/epic.md
│   ├── Epic-03-lessons/epic.md
│   ├── Epic-04-progress/epic.md
│   └── Epic-05-admin/epic.md
├── backend/
│   ├── build.gradle
│   ├── settings.gradle
│   └── src/main/
│       ├── java/com/mrdevcourses/
│       │   ├── MrDevCoursesApplication.java
│       │   ├── config/
│       │   └── modules/
│       └── resources/
│           ├── application.yml
│           └── db/migration/
└── frontend/
    └── src/
        ├── app/
        ├── pages/
        ├── widgets/
        ├── features/
        ├── entities/
        └── shared/
```
