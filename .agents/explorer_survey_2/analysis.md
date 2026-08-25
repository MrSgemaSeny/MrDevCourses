# Технический анализ фронтенд-архитектуры и интерфейсов (MrDevCourses)

Дата анализа: 2026-08-25
Автор: Explorer 2 (Frontend Architecture & UI Explorer)
Проект: MrDevCourses (Learning Management System)
Стек: React 19, TypeScript 5.7, Vite 6, Tailwind CSS v4, TanStack Query v5, React Router v7, Vitest 3

---

## 1. Текущее состояние кодовой базы и инфраструктуры

### 1.1 Анализ конфигурационных файлов
- **`package.json`**:
  - Установлены ключевые библиотеки: `react` (v19.0.0), `react-dom` (v19.0.0), `react-router-dom` (v7.1.5), `@tanstack/react-query` (v5.66.0), `tailwindcss` (v4.0.0), `@tailwindcss/vite` (v4.0.0), `lucide-react` (v0.475.0), `sonner` (v2.0.1), `clsx` (v2.1.1), `tailwind-merge` (v3.0.1).
  - Dev-зависимости: `vitest` (v3.0.5), `@testing-library/react` (v16.2.0), `@testing-library/jest-dom` (v6.6.3), `jsdom` (v26.0.0), `typescript` (~5.7.2), `vite` (v6.1.0).
  - Выявленный дефект конфигурации: в `src/shared/api/base.ts` импортируется библиотека `axios`, однако в секции `dependencies` файла `package.json` она отсутствует. Для воспроизводимости сборки на чистых CI/CD окружениях необходимо либо явно зафиксировать `axios` в `package.json`, либо перевести базовый клиент на нативный типизированный `fetch`.
- **`vite.config.ts`**:
  - Настроен плагин React и Tailwind CSS v4 (`@tailwindcss/vite`).
  - Настроен path alias `@` -> `./src`.
  - Настроен dev proxy: запросы на `/api` проксируются на `http://localhost:8080`.
  - Настроен тестовый запуск Vitest с окружением `jsdom` и setup-файлом `./src/test/setup.ts`.
- **`tsconfig.app.json` / `tsconfig.json`**:
  - Включен строгий режим (`strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`).
  - Path mapping `@/*` корректно указывает на `src/*`.

### 1.2 Статус сборки и тестов
- **Сборка (`npm run build`)**: Успешно компилируется (`tsc -b && vite build`), формируя бандл (HTML 0.62 kB, CSS 11.8 kB, JS 319.4 kB).
- **Тесты (`npm test -- --run`)**: Успешно выполняется тестовый набор Vitest (1 из 1 тест проходит: `src/app/App.test.tsx`).

---

## 2. Анализ соответствия FSD (Feature-Sliced Design)

### 2.1 Текущая структура слоев
В директории `frontend/src` на текущий момент развернут только базовый скелет:
- `app/`: Содержит `App.tsx`, `App.test.tsx`, `providers/QueryProvider.tsx`, `router/index.tsx`.
- `pages/`: Отсутствует (страницы описаны инлайн-компонентами в `app/router/index.tsx`).
- `widgets/`: Отсутствует.
- `features/`: Отсутствует.
- `entities/`: Отсутствует.
- `shared/`: Содержит `api/base.ts` и `types/index.ts`.
- `test/`: Содержит `setup.ts`.

### 2.2 Целевая FSD-архитектура
Для соблюдения правил проекта и масштабируемости платформы сформирована следующая иерархия:

```
src/
├── app/
│   ├── App.tsx                      # Корневой лейаут, Header, Toaster, Router Outlet
│   ├── App.test.tsx                 # Тесты корневого компонента
│   ├── providers/
│   │   ├── QueryProvider.tsx        # TanStack Query Client
│   │   └── AuthProvider.tsx         # Провайдер сессии и контекста текущего пользователя
│   └── router/
│       ├── index.tsx                # Декларация маршрутов
│       └── ProtectedRoute.tsx       # Route guard для STUDENT и ADMIN
├── pages/
│   ├── home/
│   │   └── ui/HomePage.tsx          # Главная страница (промо, выгоды, CTA)
│   ├── auth/
│   │   └── ui/AuthPage.tsx          # Страница входа с кнопкой Google OAuth2
│   ├── courses/
│   │   └── ui/CoursesPage.tsx       # Каталог доступных курсов
│   ├── course-details/
│   │   └── ui/CourseDetailsPage.tsx # Страница курса (программа, таймлайн дней, кнопка записи)
│   ├── lesson-player/
│   │   └── ui/LessonPlayerPage.tsx  # Плеер урока (видео, контент, таймер блокировки, боковая панель)
│   ├── dashboard/
│   │   └── ui/DashboardPage.tsx     # Личный кабинет студента (прогресс, активные курсы, следующий разблок)
│   └── admin/
│       ├── courses/
│       │   └── ui/AdminCoursesPage.tsx  # Таблица курсов и создание/редактирование
│       ├── lessons/
│       │   └── ui/AdminLessonsPage.tsx  # Управление уроками конкретного курса
│       └── students/
│           └── ui/AdminStudentsPage.tsx # Список студентов, прогресс, ручная запись
├── widgets/
│   ├── header/
│   │   └── ui/Header.tsx            # Шапка сайта с навигацией, профилем и выходом
│   ├── footer/
│   │   └── ui/Footer.tsx            # Минималистичный темный подвал
│   ├── course-list/
│   │   └── ui/CourseList.tsx        # Сетка карточек курсов с фильтрацией
│   ├── lesson-sidebar/
│   │   └── ui/LessonSidebar.tsx     # Навигация по урокам дня с бейджами и таймерами
│   ├── progress-card/
│   │   └── ui/ProgressCard.tsx      # Виджет сводки прогресса по курсу
│   └── admin-nav/
│       └── ui/AdminNav.tsx          # Вкладки навигации админ-панели
├── features/
│   ├── auth/
│   │   ├── api/authApi.ts           # getMe(), logout()
│   │   ├── model/useAuth.ts         # Хук авторизации и состояния пользователя
│   │   └── ui/GoogleLoginButton.tsx # Кнопка входа Google OAuth2
│   ├── enroll-course/
│   │   ├── api/enrollApi.ts         # enrollCourse(courseId)
│   │   └── ui/EnrollButton.tsx      # Кнопка записи на курс
│   ├── complete-lesson/
│   │   ├── api/completeApi.ts       # completeLesson(courseId, lessonId)
│   │   └── ui/CompleteLessonButton.tsx # Кнопка завершения урока
│   ├── youtube-player/
│   │   ├── lib/youtubeUtils.ts      # Парсинг ID видео из любых форматов ссылок YouTube
│   │   └── ui/YouTubePlayer.tsx     # Адаптивный 16:9 плеер
│   ├── markdown-viewer/
│   │   └── ui/MarkdownViewer.tsx    # Безопасный рендерер Markdown-контента уроков
│   ├── countdown-timer/
│   │   ├── lib/timeUtils.ts         # Расчет оставшегося времени до opensAt / nextUnlockAt
│   │   └── ui/CountdownTimer.tsx    # Живой таймер обратного отсчета
│   ├── admin-course-form/
│   │   └── ui/CourseModal.tsx       # Модалка создания/редактирования курса
│   ├── admin-lesson-form/
│   │   └── ui/LessonModal.tsx       # Модалка создания/редактирования урока
│   └── admin-student-enroll/
│       └── ui/ManualEnrollModal.tsx # Модалка ручной записи студента
├── entities/
│   ├── user/
│   │   ├── model/types.ts           # User, UserRole
│   │   └── ui/UserAvatar.tsx        # Аватар и бейдж роли
│   ├── course/
│   │   ├── api/courseApi.ts         # getCourses(), getCourseBySlug()
│   │   ├── model/types.ts           # Course
│   │   └── ui/CourseCard.tsx        # Карточка курса
│   ├── lesson/
│   │   ├── api/lessonApi.ts         # getLessons(), getLesson()
│   │   ├── model/types.ts           # Lesson
│   │   └── ui/LessonStatusBadge.tsx # Бейджи статусов (Открыт, Закрыт, Завершен)
│   └── progress/
│       ├── api/progressApi.ts       # getProgress(), getCourseProgress()
│       ├── model/types.ts           # CourseProgressSummary
│       └── ui/ProgressBar.tsx       # Индикатор прогресса
└── shared/
    ├── api/
    │   └── base.ts                  # Axios клиент с интерцепторами и unwrap утилитой
    ├── config/
    │   └── routes.ts                # Константы путей приложения
    ├── lib/
    │   └── utils.ts                 # Хелперы стилей cn() и форматирования дат
    ├── types/
    │   └── index.ts                 # Общие TypeScript интерфейсы и DTO
    └── ui/
        ├── Button.tsx               # Кнопка дизайн-системы Envie
        ├── Card.tsx                 # Карточка со стеклянным фоном (backdrop-blur)
        ├── Modal.tsx                # Модальное окно
        ├── Input.tsx                # Темное поле ввода
        ├── Textarea.tsx             # Темное текстовое поле
        ├── Badge.tsx                # Бейдж статуса
        └── Spinner.tsx              # Индикатор загрузки
```

---

## 3. Детальный аудит требований R1–R6 и Gap-анализ

### R1. Authentication & Session Management (Авторизация и сессии)
- **Текущее состояние**:
  - Реализована заглушка `/auth` с жестко заданной ссылкой на `/api/oauth2/authorization/google`.
  - В шапке сайта (`App.tsx`) находится статическая кнопка "Войти".
  - Отсутствуют контекст/хранилище пользователя, автоматическое восстановление сессии при загрузке через `GET /api/v1/auth/me`, обработка `POST /api/v1/auth/logout` и защищенные роуты.
- **Необходимая реализация**:
  1. `entities/user/api/userApi.ts`: Вызовы `GET /api/v1/auth/me` и `POST /api/v1/auth/logout`.
  2. `app/providers/AuthProvider.tsx` и `features/auth/model/useAuth.ts`: Реактивное состояние пользователя через TanStack Query (`queryKey: ['currentUser']`), методы `loginWithGoogle()`, `logout()`, флаги `isAuthenticated`, `isAdmin`, `isLoading`.
  3. `app/router/ProtectedRoute.tsx`: Защита приватных маршрутов (`/dashboard`, `/courses/:slug/lessons/:lessonId`, `/admin/**`). Перенаправление неавторизованных пользователей на `/auth`, а студентов без прав `ADMIN` на `/dashboard` с уведомлением об отказе в доступе.
  4. Обновление `widgets/header/ui/Header.tsx`: Отображение имени/аватара, ссылки на Дашборд и Админку (при роли `ADMIN`), и кнопки выхода.

### R2. Courses & Enrollment Engine (Каталог курсов и запись)
- **Текущее состояние**:
  - Страница `/courses` содержит статический текст-заглушку "Курсы загружаются...".
  - Нет маршрута детальной страницы курса (`/courses/:slug`).
  - Нет механизма записи (`POST /api/v1/courses/{courseId}/enroll`).
- **Необходимая реализация**:
  1. `entities/course/api/courseApi.ts`: Получение списка курсов (`GET /api/v1/courses`) и курса по slug (`GET /api/v1/courses/{slug}`).
  2. `entities/course/ui/CourseCard.tsx`: Карточка с названием, описанием, бейджем количества уроков и статусом записи.
  3. `features/enroll-course/ui/EnrollButton.tsx`: Интерактивная кнопка записи с обработкой состояния загрузки, вызовом мутации React Query, показом тоста через `sonner` и автоматической инвалидацией кэша курсов/прогресса.
  4. `pages/courses/ui/CoursesPage.tsx`: Каталог курсов с разделением на доступные и уже начатые.
  5. `pages/course-details/ui/CourseDetailsPage.tsx`: Полная программа курса, план по дням, CTA-блок ("Начать обучение" или "Продолжить урок N").

### R3. Lesson Player & Strict Drip Engine (Плеер уроков и Drip-механика)
- **Текущее состояние**:
  - Полностью отсутствует логика плеера, страницы урока и сайдбара.
- **Необходимая реализация**:
  1. `features/youtube-player/lib/youtubeUtils.ts`: Надежная функция извлечения ID видео из YouTube ссылок (`watch?v=`, `youtu.be/`, `embed/`, мобильные ссылки).
  2. `features/youtube-player/ui/YouTubePlayer.tsx`: Компонент с соотношением сторон 16:9, темным контейнером и обработкой отсутствия видео.
  3. `features/markdown-viewer/ui/MarkdownViewer.tsx`: Рендерер структурированного контента урока с поддержкой заголовков, списков, кода, цитат и ссылок в темной стилистике.
  4. `features/countdown-timer/lib/timeUtils.ts` и `ui/CountdownTimer.tsx`: Динамический таймер, отображающий оставшееся время до `opensAt` в формате `ЧЧ:ММ:СС` (или дней/часов).
  5. `features/complete-lesson/ui/CompleteLessonButton.tsx`: Кнопка отметки урока как выполненного (`POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete`) с мгновенным обновлением статуса в сайдбаре.
  6. `widgets/lesson-sidebar/ui/LessonSidebar.tsx`: Панель навигации по урокам с индикацией текущего дня, иконками статуса (галочка / воспроизведение / замок) и отображением таймеров для заблокированных уроков.
  7. `pages/lesson-player/ui/LessonPlayerPage.tsx`: Главный лейаут урока с обработкой серверной ошибки `403 Forbidden` (если студент пытается открыть урок раньше времени — отображение экрана блокировки с таймером и кнопкой возврата к доступным материалам).

### R4. Student Dashboard & Progress Tracking (Дашборд студента)
- **Текущее состояние**:
  - Маршрут `/dashboard` не зарегистрирован.
- **Необходимая реализация**:
  1. `entities/progress/api/progressApi.ts`: Запросы `GET /api/v1/progress` (общий прогресс по всем курсам) и `GET /api/v1/progress/{courseId}`.
  2. `entities/progress/ui/ProgressBar.tsx`: Графический индикатор выполнения с процентом завершения.
  3. `widgets/progress-card/ui/ProgressCard.tsx`: Карточка курса с текущим днем (`currentDay`), счетчиком завершенных уроков (`completedCount` из `totalLessons`), бейджем разблокированных уроков и таймером до `nextUnlockAt`.
  4. `pages/dashboard/ui/DashboardPage.tsx`: Страница дашборда со списком курсов в процессе прохождения, кнопками быстрого перехода к текущему уроку и общей статистикой.

### R5. Admin Management Panel (Админ-панель)
- **Текущее состояние**:
  - Маршруты и интерфейсы администрирования отсутствуют.
- **Необходимая реализация**:
  1. `entities/admin/api/adminApi.ts`: API методы для управления курсами (CRUD), уроками (CRUD), получения списка студентов и их прогресса, а также ручной записи студентов.
  2. `features/admin-course-form/ui/CourseModal.tsx`: Форма создания/редактирования курса (title, slug, description, is_active).
  3. `features/admin-lesson-form/ui/LessonModal.tsx`: Форма создания/редактирования урока (title, dayNumber, sortOrder, youtubeUrl, content).
  4. `features/admin-student-enroll/ui/ManualEnrollModal.tsx`: Форма добавления студента на курс администратором.
  5. `pages/admin/courses/ui/AdminCoursesPage.tsx`: Таблица курсов со счетчиками уроков, статусами и действиями.
  6. `pages/admin/lessons/ui/AdminLessonsPage.tsx`: Управление уроками выбранного курса с возможностью предпросмотра и изменения порядка.
  7. `pages/admin/students/ui/AdminStudentsPage.tsx`: Реестр студентов с датами регистрации, активными курсами и прогрессом.
  8. Защита маршрутов `/admin/**` через `ProtectedRoute` с проверкой роли `ADMIN`.

### R6. Envie Dark Theme & Дизайн-система
- **Текущее состояние**:
  - В `src/index.css` используются переменные темы GitHub Dark (`#0d1117`, `#161b22`, `#30363d`, `#238636`, `#58a6ff`).
  - В `App.tsx` прописаны жесткие значения цветов.
- **Необходимая реализация (соответствие Envie)**:
  - Фоновый цвет страницы: `#09090b` (`bg-zinc-950` / `bg-[#09090b]`).
  - Карточки и контейнеры: `rgba(24, 24, 27, 0.8)` (`bg-zinc-900/80`) с эффектом `backdrop-blur-md` и тонкой рамкой `border border-zinc-800`.
  - Границы: `#27272a` (`border-zinc-800`).
  - Основной текст: `#fafafa` (`text-zinc-50`).
  - Второстепенный текст: `#a1a1aa` (`text-zinc-400`), `#71717a` (`text-zinc-500`).
  - Акцентные кнопки: Контрастный белый цвет `#fafafa` с темным текстом `#09090b` (`bg-zinc-100 text-zinc-900 hover:bg-white`).
  - Второстепенные кнопки: Темный цинковый фон с рамкой (`bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700`).
  - Статусные индикаторы: Изумрудный для открытых/завершенных (`text-emerald-400 bg-emerald-500/10 border-emerald-500/20`), нейтральный серый для заблокированных уроков.
  - Моноширинные цифры для счетчиков и таймеров: `font-mono tabular-nums`.

---

## 4. План тестирования и критерии приемки фронтенда

1. **Модульные тесты**:
   - `extractYoutubeId`: Корректный парсинг всех вариантов YouTube URL (стандартные, короткие, embed, с таймкодами, некорректные строки).
   - `timeUtils`: Корректный расчет оставшегося времени и форматирование строк обратного отсчета.
   - `ProgressBar`: Расчет процента и доступность (ARIA-атрибуты).
2. **Компонентные и интеграционные тесты**:
   - `App.test.tsx`: Рендеринг шапки, динамическая смена состояния для гостя и авторизованного пользователя.
   - `ProtectedRoute.test.tsx`: Блокировка неавторизованных пользователей и проверка прав роли `ADMIN`.
   - `CourseCard.test.tsx` и `CourseList.test.tsx`: Отображение курсов и вызов действия записи.
   - `LessonSidebar.test.tsx`: Отображение открытых и заблокированных уроков с таймерами.
3. **Критерии прохождения сборки**:
   - `npm test -- --run` завершается с кодом 0 (100% зеленых тестов).
   - `npm run build` проходит без предупреждений TypeScript и генерирует оптимизированный бандл.
