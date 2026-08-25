# MrDevCourses — Платформа Практического Обучения Разработчиков

> **Автор**: Mr Developer  
> **Философия**: 1 день — 1 урок. Строгая серверная Drip-дисциплина. Никакого поверхностного проглатывания — только глубокое закрепление теории на боевом коде.  
> **Стек**: Java 17, Spring Boot 3.3.0, PostgreSQL 16, Flyway, React 19, TypeScript, Tailwind CSS v4 (Envie Dark Theme), FSD Architecture, TanStack React Query v5.

---

## 1. Бенчмарки и Инженерные Стандарты

Платформа **MrDevCourses** спроектирована и построена на базе лучших архитектурных решений флагманских проектов экосистемы:

1. **JF-1C (Топ 1 — Корпоративная Безопасность и Надежность)**:
   - Полный стек **Security Headers** (CSP, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
   - **Zero-Trust IDOR Protection**: строгая изоляция пользователей на уровне БД через `SecurityUtils.getCurrentUserId()`.
   - **Rate-Limiting**: защита эндпоинтов авторизации, записи на курсы и отправки завершения уроков.
   - 100% покрытие тестами безопасности и прав доступа.

2. **MeDev (Топ 2 — Конкурентность, Аудит и Устойчивость)**:
   - **Централизованный Audit Logging (`AuditService`)**: журналирование всех критических действий (входы, зачисления, прохождение уроков, действия админа).
   - **Concurrency Safety**: атомарные транзакции и идемпотентные мутации записей на курс.
   - Чистая модульная архитектура бэкенда (`auth`, `course`, `lesson`, `progress`, `audit`, `admin`).

3. **Valeur (Топ 3 — Инфраструктура и Observability)**:
   - Production-ready **Multi-stage Docker** контейнеризация для бэкенда и фронтенда.
   - `docker-compose.yml` для мгновенного развертывания локального окружения с PostgreSQL 16.
   - Мониторинг здоровья сервиса через Spring Actuator.

4. **Envie (Дизайн-эталон — Современная Темная Эстетика)**:
   - Палитра **Zinc-950**: базовый глубокий черный `#09090b`, полупрозрачные карточки `rgba(24, 24, 27, 0.8)` с `backdrop-blur-md`, границы `#27272a`, акцентный `#fafafa` контрастный цвет для кнопок со свечением при наведении.
   - **Интерактивный Visual Roadmap**: визуальный граф/таймлайн с соединенными узлами дней обучения, пульсирующим текущим активным днем и посекундным обратным отсчетом (`CountdownTimer`) для будущих уроков.
   - **Rich Markdown Reader**: подсветка блоков кода, кнопка копирования сниппетов, кастомные акцентные плашки `[!NOTE]`, `[!TIP]`, `[!WARNING]`.

---

## 2. Архитектура и Модули

```
backend/
└── com.mrdevcourses/
    ├── common/          # SecurityHeaders, SecurityUtils, Exceptions, GlobalExceptionHandler, ApiResponse
    ├── config/          # SecurityConfig, DataSeeder, WebMvcConfig
    └── modules/
        ├── auth/        # Google OAuth2, JWT в httpOnly cookie, User, UserRepository, CustomOAuth2UserService
        ├── course/      # Course, Enrollment, CourseService, CourseController
        ├── lesson/      # Lesson, LessonProgress, LessonService (Drip Engine), LessonController
        ├── progress/    # ProgressService (Streak Engine, Stats), ProgressController
        ├── audit/       # AuditLog, AuditLogRepository, AuditService
        └── admin/       # AdminService, AdminController (RBAC ROLE_ADMIN)

frontend/
└── src/
    ├── app/             # Router, Providers (AuthProvider, QueryProvider), Layout
    ├── pages/           # Landing, Courses, CourseDetail, LessonPlayer, Dashboard, Admin, Auth
    ├── widgets/         # Header, VisualRoadmap, LessonPlayer, CertificateModal
    ├── features/        # Auth (GoogleLoginButton, useAuth)
    ├── entities/        # Course, Lesson, Progress, Audit, Admin (Types & React Query Hooks)
    └── shared/          # UI Components (CountdownTimer, MarkdownViewer, Badges, Modals), API Base
```

---

## 3. Серверный Drip-Engine (Строгая Формула Доступа)

Доступность урока рассчитывается динамически на стороне сервера в момент запроса без фоновых cron-джобов:

$$\text{isAccessible} \iff (\text{NOW}() - \text{enrolled\_at}) \ge ((\text{day\_number} - 1) \times 1\text{ day})$$

- **День 1**: `(1 - 1) = 0` $\implies$ доступен моментально при записи.
- **День 2..N**: становятся доступны строго через $N-1$ суток с момента зачисления.
- **Безопасность**: при попытке запросить контент заблокированного урока бэкенд возвращает `HTTP 403 Forbidden` с точным таймстемпом `opensAt`.
- **Администратор**: роль `ADMIN` имеет сквозной доступ ко всем материалам для модерации и тестирования.

---

## 4. Геймификация и Дисциплина (Study Streak Engine)

1. **Стрики обучения (`currentStreak`, `longestStreak`, `lastActiveDate`)**:
   - Фиксация ежедневного входа и выполнения уроков.
   - При пропуске дня стрик сбрасывается до 1.
2. **Сертификаты о завершении**:
   - При завершении 100% уроков курса студент получает персонализированный верифицируемый сертификат в темном стиле Envie.

---

## 5. Дорожная Карта Релиза (Release Roadmap)

- [x] **Фаза 1 — Аутентификация & JWT**: Google OAuth2, stateless session в httpOnly cookie, SecurityUtils.
- [x] **Фаза 2 — Курсы & Серверный Drip Engine**: сущности, расчет времени доступа, YouTube плеер.
- [x] **Фаза 3 — Прогресс & Дашборд**: статистика, таймлайн, карточки курсов.
- [x] **Фаза 4 — Панель Администратора**: CRUD курсов и уроков, ростер студентов, ручное зачисление.
- [x] **Фаза 5 — Доведение до идеала (JF-1C + MeDev + Envie)**:
  - Security Headers Middleware & Rate Limiting.
  - Централизованный Audit Service.
  - Интерактивный Visual Roadmap с таймером обратного отсчета.
  - Markdown Reader с копированием кода и callout-блоками.
  - Docker Compose и multi-stage Dockerfile.
  - Стрик-движок и генерация сертификатов.
