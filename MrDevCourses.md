# MrDevCourses — Платформа Практического Обучения Разработчиков (Educational MVP)

> **Автор**: Mr Developer  
> **Философия**: 1 день — 1 урок. Строгая серверная Drip-дисциплина. Никакого поверхностного проглатывания — только глубокое закрепление теории на боевом коде.  
> **Стек**: Java 17, Spring Boot 3.3.0, PostgreSQL 16, Flyway, React 19, TypeScript, Tailwind CSS v4, FSD Architecture, TanStack React Query v5.
> **Уровень проекта**: Level 3 (Educational MVP, локальная учебная база).

---

## 1. Архитектурные Принципы и Стандарты

1. **Безопасность и Надежность**:
   - Полный стек **Security Headers** (CSP, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
   - **Zero-Trust IDOR Protection**: строгая изоляция пользователей на уровне БД через `SecurityUtils.getCurrentUserId()`.
   - **Rate-Limiting (Bucket4j)**: защита эндпоинтов авторизации, AI и общих запросов.
   - 100% покрытие ключевых сценариев тестами.

2. **Аудит и Устойчивость**:
   - **Централизованный Audit Logging (`AuditService`)**: журналирование всех ключевых действий (входы, зачисления, прохождение уроков, действия админа).
   - **Concurrency Safety**: атомарные транзакции и идемпотентные мутации записей на курс.
   - Чистая модульная архитектура бэкенда (`auth`, `course`, `lesson`, `progress`, `audit`, `admin`).

3. **Дизайн-система (DESIGN.md)**:
   - Палитра: базовый глубокий фон `#0a0a0c`, карточки `#18181b`, границы `rgba(255, 255, 255, 0.08)`.
   - Строгая 4-уровневая типографика (`text-2xl`, `text-sm`, `text-xs`, `text-[10px]`).
   - **Rich Markdown Reader**: подсветка блоков кода, кнопка копирования сниппетов, кастомные акцентные плашки `[!NOTE]`, `[!TIP]`, `[!WARNING]`.
   - **Quick-Nav Drawer**: контекстная навигация по терминам, прогрессу и дорожной карте.


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
