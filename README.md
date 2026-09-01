# MrDevCourses — Educational LMS & Vibe-Coding Platform

[![Backend](https://img.shields.io/badge/Spring_Boot-3.3.0-6DB33F?logo=springboot&logoColor=white)](backend)
[![Frontend](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](frontend)
[![Database](https://img.shields.io/badge/PostgreSQL-17_%2B_pgvector-4169E1?logo=postgresql&logoColor=white)](backend)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows)
[![Hosting](https://img.shields.io/badge/Deploy-Render_%2B_Vercel-black?logo=vercel&logoColor=white)](README.md#развертывание-в-production-render--vercel)
[![Tests](https://img.shields.io/badge/Tests-100%25_Green_(73_Vitest_%2B_241_JUnit)-brightgreen)](README.md#-тестирование-и-контроль-качества)

**MrDevCourses** — современная учебная LMS-платформа (Educational MVP, Level 3) для обучения промышленной backend- и fullstack-разработке, архитектурным паттернам и вайбкодингу.

Платформа сочетает строгую монолитную модульность на Spring Boot 3, клиентский интерфейс по методологии Feature-Sliced Design (FSD), систему проверки домашних заданий с Telegram-пультом ментора, контекстного AI-тьютора на базе гибридного RAG (pgvector + FTS), автоматического AI-грейдера кода, защиту от списывания в квизах, расчёт drip-контента на уровне СУБД и изолированную административную консоль управления.

---

## Линейка Курсов по Уровням Сложности

Линейка учебных программ платформы разделена на 3 уровня сложности курсов ([`mr-developer-curriculum.md`](mr-developer-curriculum.md)):

* **Курсы Уровня 1 (Базовый уровень)**:
  * Введение в вайбкодинг, профессиональный тулинг (Cursor, Antigravity, Claude, ChatGPT, Gemini), Git и GitHub с нуля.
  * MVP-мышление, структура проекта, FSD-архитектура интерфейсов, публикация статики на GitHub Pages.
  * *Финальный проект курса*: Лендинг стартапа и полнофункциональный клиентский Маркетплейс.
* **Курс Уровня 2 (ОСНОВНОЙ КУРС / Флагман Mr Developer)**:
  * Системная архитектура: монолитная модульность, реляционная БД PostgreSQL, миграции схемы (Flyway).
  * Безопасность: RBAC, stateless JWT в httpOnly cookie, Google OAuth 2.0, Row-Level Security.
  * 3D-графика (Three.js), Second Brain инженера.
  * Создание CRM: Kanban-доска, интеграция Telegram Bot (вебхуки, алерты), CI/CD пайплайн на GitHub Actions (деплой на Vercel + Render).
  * *Финальные проекты курса*: Трекер финансов с 3D + Полноценная CRM Kanban система.
* **Курсы Уровня 3 (Продвинутый AI SaaS)**:
  * Архитектура сложных AI-систем: LLM API, стриминг ответов (SSE), контекстное окно.
  * Гибридный RAG: векторный поиск Dense HNSW + FTS RRF, реактивный WebClient, PII-маскирование данных, транзакционная почта (Google SMTP).
  * *Финальный проект курса*: Мультимодальный AI SaaS Pensee.

---

## Архитектурные Решения (ADR) и Документация

Вся ключевая архитектурная история зафиксирована в виде Architecture Decision Records:

* **[ADR-001: Модульный монолит на Spring Boot 3 и React 19 FSD](docs/decisions/ADR-001-modular-monolith-architecture.md)**: Доменная декомпозиция, строгие границы слоёв и отсутствие накладных расходов микросервисов.
* **[ADR-002: Разделение лейаутов и двухуровневая изоляция ролей (RBAC)](docs/decisions/ADR-002-dual-layout-and-rbac-isolation.md)**: Изолированный `AdminLayout` (`#0a0a0c`) против клиентской витрины курсов.
* **[ADR-003: Stateless аутентификация через Google OAuth2 + JWT в httpOnly Cookies](docs/decisions/ADR-003-stateless-jwt-and-cookie-security.md)**: Защита от XSS/CSRF, Token Bucket Rate Limiting (Bucket4j + Caffeine).
* **[ADR-004: Расчёт Drip-контента на уровне базы данных без фоновых планировщиков](docs/decisions/ADR-004-drip-content-database-time-calculation.md)**: Мгновенное вычисление доступности уроков в UTC.
* **[ADR-005: Telegram Bot Polling Runner и диспетчеризация команд ментора/студента](docs/decisions/ADR-005-telegram-bot-and-mentor-dispatching.md)**: Полнофункциональный мобильный пульт проверки ДЗ, SOS-алерты и отвязка от входящих вебхуков.

---

## Архитектура и Технологический Стек

### Backend (Spring Boot 3)
- **Core Platform**: Java 17, Spring Boot 3.3.0, Spring Data JPA, Spring Security 6.
- **Database & Migrations**: PostgreSQL 17 с расширениями `pgvector` (векторный поиск) и `pg_trgm` (триграммный поиск), Flyway (цепочка миграций `V1..V12`).
- **AI & RAG Subsystem**: Groq API (Llama 3.3 70B), гибридный поиск Dense Vector HNSW + Sparse FTS через алгоритм Reciprocal Rank Fusion (RRF), AST-aware Markdown Chunker.
- **Security & RBAC**: Stateless JWT сессии в `httpOnly` + `SameSite=Lax` cookies, Row-Level Security через `SecurityUtils.getCurrentUserId()`, метод-левел авторизация `@PreAuthorize("hasRole('ADMIN')")`.
- **Rate Limiting**: 3-уровневый Token Bucket (Bucket4j + Caffeine Cache):
  - *Auth Tier*: 10 req / 15 min / IP (защита от brute-force).
  - *AI Tier*: 5 req / min / user (защита лимитов LLM).
  - *General Tier*: 60 req / min / user / IP.
- **Document & PDF Generation**: Thymeleaf + OpenHTMLtoPDF (векторные сертификаты с кириллицей и шрифтом DejaVu Sans).
- **Automation**: Transactional Outbox Pattern (`outbox_events` + `@Scheduled` OutboxProcessor).

### Frontend (React 19)
- **Core Stack**: React 19, TypeScript 5.8+, Vite 6.
- **Architecture**: Feature-Sliced Design (FSD) (`app` → `pages` → `widgets` → `features` → `entities` → `shared`).
- **Styling**: Tailwind CSS v4, темная монохромная эстетика (`#0a0a0c` / `#0e0e11`, `border-white/5`), адаптивная сетка.
- **State & Data Fetching**: TanStack React Query v5 с оптимистичными апдейтами и автоматической инвалидацией кэша.
- **Routing & Guards**: React Router v6, ленивая загрузка чанков (`React.lazy`), `<ProtectedRoute>` с ролевым гвардом (`adminOnly`).

---

## Ключевые Модули Системы

1. **B2C Course Discovery & Product Landing**:
   - Минималистичный фильтр-бар (`[Поиск по названию...] [Уровень ▾] [Формат ▾]`).
   - Компактные карточки в формате рекламного баннера с hover-анимацией видео-трейлера.
   - Двухколоночный лендинг курса (`/courses/:slug`): Hero с плашкой автора (**Mr Developer**), блоки «Чему вы научитесь», «Требования», аккордеон модулей с расчётом времени и плавающий `CourseStickyCard`.

2. **Drip-Content & Learning Player**:
   - Вычисление доступа по формуле: `(NOW() - enrolled_at) >= ((day_number - 1) * INTERVAL '1 day')`.
   - Интерактивный плеер: YouTube embed, конспект урока (Markdown с подсветкой синтаксиса), материалы (`CHEAT_SHEET`, `SOURCE_CODE`, `PDF`, `REPO_LINK`).
   - Контекстный Quick-Nav Drawer (глоссарий терминов, дорожная карта, прогресс) без сброса состояния видеоплеера.

3. **Interactive Quiz Assessment Engine**:
   - Анти-чит защита: флаги `isCorrect` и `explanation` вырезаны из публичного API до завершения попытки.
   - Серверная проверка ответов, подсчёт баллов и авто-завершение урока при прохождении порога (`passingScore >= 70%`).

4. **AI Code Grader & Reviewer**:
   - Двухуровневый пайплайн: статический AST-сканер безопасности (блокировка `Runtime.exec`, `ProcessBuilder`, `System.exit`, `Unsafe`) + LLM-оценка по рубрикам.
   - Автоматическое завершение урока при оценке `>= 80/100`.

5. **AI RAG Contextual Tutor**:
   - Заземление ответов в реальный конспект урока (Grounding).
   - Защита от Prompt Injection через XML-экранирование и системные директивы.

6. **PDF Certificates & Public Verification**:
   - Автоматическая векторная генерация сертификата при 100% прохождении курса.
   - Публичная страница верификации по уникальному 12-значному коду (`/certificates/verify/:code`).

7. **Admin Suite & Platform Telemetry**:
   - Изолированная панель управления `AdminLayout` со своим сайдбаром.
   - Конструктор учебного плана (Curriculum Tree с Drag-and-Drop, Markdown-редактор, валидатор видео, менеджер квизов).
   - Консоль студентов (мгновенный поиск, переключение ролей `STUDENT <-> ADMIN`, ручное зачисление, шторка сданных ДЗ).
   - Аналитический дашборд (воронки по дням, retention когорт, топ запросов к AI, неизменяемый журнал системного аудита).

---

## Структура Проекта

```
MrDevCourses/
├── backend/                          # Spring Boot 3.3.0 приложение
│   ├── src/main/java/com/mrdev/
│   │   ├── common/                   # Общие утилиты, RLS SecurityUtils, ошибки
│   │   ├── config/                   # Spring Security, CORS, RateLimiter, Async
│   │   └── modules/                  # Доменные модули монолита
│   │       ├── admin/                # Admin Suite (Curriculum, Students, Telemetry)
│   │       ├── ai/                   # AI Tutor RAG & Groq Client
│   │       ├── audit/                # Audit Log Repository & Service
│   │       ├── auth/                 # Google OAuth2, JWT, User Entity
│   │       ├── certificate/          # PDF Generator & Public Verification
│   │       ├── course/               # Course & CourseModule Entities, DTOs
│   │       ├── grader/               # AI Code Grader & AST Security Scanner
│   │       ├── lesson/               # Lesson, Materials, Drip Logic
│   │       ├── outbox/               # Transactional Outbox Processor
│   │       ├── progress/             # Student Progress & Streak Calculation
│   │       └── quiz/                 # Quiz Engine & Submissions
│   ├── src/main/resources/
│   │   ├── db/migration/             # Flyway миграции (V1..V12)
│   │   └── templates/                # Thymeleaf HTML-шаблоны сертификатов
│   └── src/test/java/com/mrdev/      # JUnit 5 & MockMvc E2E тесты
├── frontend/                         # React 19 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── app/                      # Роутер, провайдеры (React Query, Auth)
│   │   ├── pages/                    # Маршрутизируемые страницы (Courses, Detail, Admin, Lesson)
│   │   ├── widgets/                  # Композитные блоки (CurriculumAccordion, StickyCard, Telemetry)
│   │   ├── features/                 # Фичи с поведением (Auth, Homework, Quiz, QuickNav)
│   │   ├── entities/                 # Доменные модели и API клиенты
│   │   └── shared/                   # UI Kit, типы, базовый HTTP клиент
├── docs/                             # Архитектурная документация и ADR
│   └── decisions/                    # Architecture Decision Records (ADR-001..ADR-004)
└── .agents/                          # Системный контекст и правила агентов
```

---

## Запуск в Локальном Окружении

### Требования
- Java 17 JDK
- Node.js 20+
- PostgreSQL 17 с расширением `pgvector`

### 1. Запуск Backend

```bash
cd backend
./gradlew bootRun
```
*API сервер запустится на `http://localhost:8080` (базовый путь `/api/v1`).*

### 2. Запуск Frontend

```bash
cd frontend
npm install
npm run dev
```
*Клиентское приложение откроется на `http://localhost:5173`.*

---

## Статус Зрелости Продукта: Level 3 (Strong Educational MVP / Pilot Pre-Release)

> [!IMPORTANT]
> Проект позиционируется как **Сильный Учебный MVP (Level 3)**, полностью готовый к боевому пилотному запуску на реальную аудиторию студентов.
> Платформа **НЕ является перегруженным Enterprise-решением**: в ней сознательно исключен избыточный оверинжиниринг (внешние брокеры Kafka, сложные мульти-тенантные схемы, распределённые микросервисы). Все критические функции реализованы надёжно, локально и ресурсоэффективно в рамках модульного монолита.

### Что входит в Strong MVP (Готово к пилоту):
- [x] **Полный цикл студента**: Авторизация (Google OAuth2 / Email), витрина B2C, запись на курс, drip-открытие уроков, просмотр видео и материалов.
- [x] **Интерактивная практика**: AI-грейдер кода с защитой AST, движок квизов с anti-cheat маскировкой, контекстный AI-тьютор на гибридном RAG (pgvector + FTS).
- [x] **Аттестация и геймификация**: Стрики активности, автоматическая генерация PDF-сертификатов с онлайн-верификацией.
- [x] **Административный контур**: Изолированная консоль `AdminLayout` с Drag-and-Drop редактором программ, управлением студентами и когортной аналитикой.
- [x] **Отказоустойчивость**: 3-уровневый Rate Limiting (Bucket4j), Transactional Outbox для фоновых событий, 100% зеленые тесты.

---

## Развертывание в Production (Render + Vercel)

Платформа спроектирована для надежного и экономичного деплоя в связке **Render (Backend & PostgreSQL)** + **Vercel (Frontend SPA)** после прохождения CI/CD проверок в GitHub Actions:

```
[Пользователь / Браузер]
         |
    +----+-----------------------------+
    |                                  | (HTTPS)
    v                                  v
[Vercel Edge Network]           [Render Web Service]
(React 19 SPA / Static CDN)     (Spring Boot 3 App)
                                       |
                                       v
                                [Render PostgreSQL 17] (pgvector + pg_trgm)
```

### GitHub Actions CI/CD Pipeline
Пайплайн в `.github/workflows/ci.yml` автоматически запускается на каждый push/PR в ветку `main`:
1. **Backend Job**: запуск JUnit 5 тестов (`./gradlew test`), валидация схемы БД, проверка сборки JAR.
2. **Frontend Job**: проверка типов (`tsc -b`), запуск Vitest тестов (`npm run test`), сборка production бандла (`npm run build`).
3. **Deploy Trigger**: автоматический триггер деплоя в Vercel и Render только при 100% прохождении тестов.

### Конфигурация Переменных Окружения (Production Secrets)

| Переменная | Назначение | Пример значения |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | Подключение к Render PostgreSQL | `jdbc:postgresql://dpg-xxx.render.com/mrdevcourses_db` |
| `SPRING_DATASOURCE_USERNAME` | Пользователь БД | `mrdev_user` |
| `SPRING_DATASOURCE_PASSWORD` | Пароль к БД | `${DATABASE_PASSWORD}` |
| `JWT_SECRET` | 256-битный ключ подписи токенов | `${RANDOM_HEX_64_CHARS}` |
| `GOOGLE_CLIENT_ID` | OAuth2 Google Client ID | `*.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth2 Google Secret | `${GOOGLE_CLIENT_SECRET}` |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram-бота платформы | `${TELEGRAM_BOT_TOKEN}` |
| `TELEGRAM_CHAT_ID` | Chat ID ментора для алертов и пульта | `${TELEGRAM_CHAT_ID}` |
| `CORS_ALLOWED_ORIGINS` | Разрешенные фронтенд-домены | `https://mrdevcourses.vercel.app` |
| `FRONTEND_URL` | URL фронтенда для редиректов OAuth2 | `https://mrdevcourses.vercel.app` |

---

## Тестирование и Контроль Качества

### Запуск тестов Backend (JUnit 5 Suite):
```bash
cd backend
./gradlew test
```
*Результат: **241/241 тестов успешно пройдены (100% Green)**.*

### Запуск тестов Frontend (Vitest):
```bash
cd frontend
npm test -- --run
```
*Результат: **31/31 сьютов успешно пройдены (73/73 теста green)**.*

### Проверка сборки Frontend (TypeScript + Vite):
```bash
cd frontend
npm run build
```
*Результат: **1802 модуля собрано без единой ошибки (0 warnings, 0 errors)**.*

---

## Стандарты Безопасности и Производительности

* **Zero N+1 Queries**: Все запросы к связанным сущностям (`Course -> Modules -> Lessons`, `User -> Enrollments`, `LessonProgress`) выполняются пакетами с использованием `@EntityGraph`, JOIN FETCH и `IN (...)` предикатов.
* **Row-Level Security**: IDOR-защита на уровне сервисов через `SecurityUtils.getCurrentUserId()`.
* **Stateless Cookies**: Токены хранятся исключительно в защищённых `httpOnly`, `SameSite=Lax` cookies с поддержкой Remember-Me и черного списка отозванных токенов (`JwtBlacklistService`).
* **Идемпотентность миграций**: Все изменения схемы базы данных версионируются через Flyway (`V1..V24`), ручное редактирование применённых скриптов строго запрещено.
* **UTC Time Standard**: Строгое хранение всех меток времени в UTC для детерминированного расчёта drip-контента.
