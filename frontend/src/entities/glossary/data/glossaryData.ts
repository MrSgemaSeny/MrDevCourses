import { GlossaryTerm, GlossaryFilterOptions } from '../model/types';

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'jwt',
    term: 'JWT (JSON Web Token)',
    category: 'security',
    shortDefinition: 'Компактный и самодостаточный формат безопасной передачи информации между сторонами в виде JSON-объекта.',
    fullExplanation: 'В архитектуре MrDev JWT генерируется после успешной Google OAuth2 авторизации и сохраняется в защищенную httpOnly cookie (`mrdev_token`). Содержит зашифрованный userId, email, роль и срок жизни (exp). Сервер проверяет подпись с помощью HMAC-SHA256 без обращения к базе данных на каждый запрос.',
    codeSnippet: `// Spring Security JWT Filter validation
String token = extractTokenFromCookie(request, "mrdev_token");
if (token != null && jwtProvider.validateToken(token)) {
    Long userId = jwtProvider.getUserId(token);
    UserPrincipal principal = new UserPrincipal(userId, email, role);
    UsernamePasswordAuthenticationToken auth = 
        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    SecurityContextHolder.getContext().setAuthentication(auth);
}`,
    relatedDayNumbers: [1, 2],
    tags: ['Auth', 'Security', 'Cookie', 'Stateless', 'OAuth2'],
  },
  {
    id: 'bucket4j',
    term: 'Bucket4j (Token Bucket Rate Limiting)',
    category: 'security',
    shortDefinition: 'Java-библиотека для реализации алгоритма Token Bucket для защиты API от DDoS и abuse.',
    fullExplanation: 'Используется для многоуровневого ограничения частоты запросов: строгий лимит для аутентификации (10 запросов / 15 минут на IP), AI-эндпоинтов (5 запросов / минуту на пользователя) и стандартный лимит (60 запросов / минуту). При превышении возвращается HTTP 429 Too Many Requests с заголовком X-Rate-Limit-Retry-After-Seconds.',
    codeSnippet: `// Bucket4j Configuration in Spring Filter
Bandwidth limit = Bandwidth.builder()
    .capacity(10)
    .refillGreedy(10, Duration.ofMinutes(15))
    .build();
Bucket bucket = Bucket.builder().addLimit(limit).build();

ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
if (!probe.isConsumed()) {
    response.setStatus(429);
    response.setHeader("X-Rate-Limit-Retry-After-Seconds", 
        String.valueOf(probe.getNanosToWaitForRefill() / 1_000_000_000));
    return;
}`,
    relatedDayNumbers: [2, 3],
    tags: ['RateLimit', 'DDoS', 'Bucket4j', 'Security', 'Middleware'],
  },
  {
    id: 'rls',
    term: 'Row-Level Security & IDOR Defense',
    category: 'security',
    shortDefinition: 'Разграничение доступа к данным на уровне отдельных строк и предотвращение уязвимостей Insecure Direct Object Reference.',
    fullExplanation: 'Защита от несанкционированного доступа к чужому прогрессу и данным курса. Каждый запрос извлекает аутентифицированный userId из SecurityUtils.getCurrentUserId() и выполняет выборки строго с фильтром `WHERE user_id = :userId`. Прямая передача userId из параметров запроса запрещена.',
    codeSnippet: `// Safe query enforcing Row-Level Security
@Transactional(readOnly = true)
public CourseProgressDto getProgress(Long courseId) {
    Long currentUserId = SecurityUtils.getCurrentUserId();
    Enrollment enrollment = enrollmentRepository
        .findByUserIdAndCourseId(currentUserId, courseId)
        .orElseThrow(() -> new AccessDeniedException("Not enrolled"));
    return progressMapper.toDto(enrollment);
}`,
    relatedDayNumbers: [1, 2, 4],
    tags: ['RLS', 'IDOR', 'PostgreSQL', 'Spring Security', 'Isolation'],
  },
  {
    id: 'drip-content',
    term: 'Drip-Content (Капельный контент)',
    category: 'backend',
    shortDefinition: 'Механика постепенного открытия уроков по расписанию относительно даты записи студента.',
    fullExplanation: 'В MrDev уроки открываются по строгой формуле: `(NOW() - enrolled_at) >= ((day_number - 1) * INTERVAL \'1 day\')`. Расчет выполняется динамически на уровне базы данных и бизнес-логики без фоновых cron-задач. Если урок еще заблокирован, выбрасывается LessonLockedException с датой opensAt.',
    codeSnippet: `-- Drip calculation in SQL query
SELECT l.*,
       (NOW() >= (e.enrolled_at + ((l.day_number - 1) * INTERVAL '1 day'))) AS is_accessible,
       (e.enrolled_at + ((l.day_number - 1) * INTERVAL '1 day')) AS opens_at
FROM lessons l
JOIN enrollments e ON e.course_id = l.course_id
WHERE e.user_id = :userId AND l.course_id = :courseId
ORDER BY l.day_number ASC;`,
    relatedDayNumbers: [1, 3],
    tags: ['Drip', 'LMS', 'Scheduling', 'SQL', 'PostgreSQL'],
  },
  {
    id: 'flyway',
    term: 'Flyway DB Migration',
    category: 'devops',
    shortDefinition: 'Инструмент версионирования и автоматической миграции схемы реляционной базы данных.',
    fullExplanation: 'Все изменения схемы PostgreSQL оформляются как версионированные SQL-скрипты в папке `db/migration/` (V1__init_schema.sql, V2__add_drip_columns.sql, ..., V8__add_performance_indexes.sql). При запуске приложения Flyway накатывает миграции в транзакции и проверяет контрольные суммы (checksum).',
    codeSnippet: `-- V8__add_performance_indexes.sql
CREATE INDEX IF NOT EXISTS idx_lessons_course_day 
ON lessons (course_id, day_number);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson 
ON lesson_progress (user_id, lesson_id);`,
    relatedDayNumbers: [1, 4],
    tags: ['Flyway', 'Database', 'PostgreSQL', 'Migrations', 'DevOps'],
  },
  {
    id: 'fsd',
    term: 'Feature-Sliced Design (FSD)',
    category: 'frontend',
    shortDefinition: 'Архитектурная методология для масштабируемых фронтенд-приложений.',
    fullExplanation: 'Кодовая база разбита на стандартизированные слои с однонаправленным потоком зависимостей: `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`. Модули верхних слоев могут импортировать только нижние слои, что предотвращает циклические зависимости и спагетти-код.',
    codeSnippet: `// FSD Layer Hierarchy:
// src/app/          -> Layouts, Providers, Router
// src/pages/        -> Compositional views (LessonPage, DashboardPage)
// src/widgets/      -> Autonomous composite blocks (QuickNavDrawer, VisualRoadmap)
// src/features/     -> User interactions (auth, complete-lesson)
// src/entities/     -> Business domain models & APIs (course, lesson, glossary)
// src/shared/       -> Reusable UI primitives, helpers, types`,
    relatedDayNumbers: [1, 2, 5],
    tags: ['Architecture', 'Frontend', 'FSD', 'CleanCode', 'TypeScript'],
  },
  {
    id: 'tanstack-query',
    term: 'TanStack React Query v5',
    category: 'frontend',
    shortDefinition: 'Библиотека асинхронного управления серверным состоянием, кешированием и инвалидацией.',
    fullExplanation: 'Используется для декларативного получения данных с сервера (`useQuery`), оптимистичных мутаций (`useMutation`) и автоматической фоновой ревалидации. Позволяет избежать дублирования запросов и сохраняет кеш уроков и прогресса без повторных сетевых вызовов.',
    codeSnippet: `const { data: progress, isLoading } = useQuery({
  queryKey: ['progress', courseId],
  queryFn: () => progressApi.getCourseProgress(courseId),
  staleTime: 5 * 60 * 1000, // 5 минут кеширования
});`,
    relatedDayNumbers: [1, 2, 3],
    tags: ['React', 'Cache', 'Async', 'StateManagement', 'ReactQuery'],
  },
  {
    id: 'tailwind-v4',
    term: 'Tailwind CSS v4 & Dark Aesthetic',
    category: 'frontend',
    shortDefinition: 'Утилитарный CSS-фреймворк нового поколения на базе LightningCSS с единой дизайн-системой.',
    fullExplanation: 'В MrDev используется строгая темная палитра: `#0a0a0c` (основной фон/сайдбар), `#18181b` (карточки и контейнеры), `#18181b`/`#27272a` (границы), `#e2b340` (акцентный золотой), `#10b981` (изумрудный статус завершения). Стили компилируются на лету через Vite плагин `@tailwindcss/vite`.',
    codeSnippet: `/* Modern Dark Palette in Tailwind v4 */
.custom-card {
  background-color: #18181b;
  border: 1px solid #27272a;
  color: #fafafa;
}`,
    relatedDayNumbers: [1, 2],
    tags: ['Tailwind', 'CSS', 'DesignSystem', 'DarkTheme', 'UI'],
  },
  {
    id: 'groq-llama',
    term: 'Groq AI Llama 3.3 70B Engine',
    category: 'ai',
    shortDefinition: 'Ультрабыстрый инференс больших языковых моделей на процессорах LPU для интерактивного AI-тьютора.',
    fullExplanation: 'AI-ассистент в уроках использует модель Llama 3.3 70B через Groq API. Системный промпт жестко заземляет ответы на текущий markdown-контент урока и фильтрует попытки prompt injection. Ответы стримятся по Server-Sent Events (SSE) в реальном времени.',
    codeSnippet: `// AI Tutor Prompt Grounding
String systemPrompt = """
Ты — AI-наставник курса MrDev.
Отвечай ТОЛЬКО на основе предоставленного контекста урока.
Контекст урока:
""" + sanitizedLessonMarkdown;`,
    relatedDayNumbers: [3, 4],
    tags: ['AI', 'LLM', 'Groq', 'Llama3', 'PromptEngineering'],
  },
  {
    id: 'openhtmltopdf',
    term: 'OpenHTMLtoPDF & Thymeleaf Certificates',
    category: 'backend',
    shortDefinition: 'Движок генерации векторных PDF-сертификатов на основе HTML/CSS шаблонов.',
    fullExplanation: 'При 100% завершении курса бэкенд рендерит темный премиальный сертификат с золотой рамкой через Thymeleaf и компилирует его в векторный PDF-файл (PDF/A). Каждому сертификату присваивается криптографический UUID для публичной онлайн-верификации.',
    codeSnippet: `// Server-side PDF generation
PdfRendererBuilder builder = new PdfRendererBuilder();
builder.useFastMode();
builder.withHtmlContent(renderedHtml, baseUrl);
builder.toStream(outputStream);
builder.run();`,
    relatedDayNumbers: [4, 5],
    tags: ['PDF', 'Certificate', 'Thymeleaf', 'OpenHTMLtoPDF', 'Backend'],
  },
  {
    id: 'oauth2-httponly',
    term: 'OAuth2 + httpOnly Cookie Security',
    category: 'security',
    shortDefinition: 'Защищенная схема аутентификации, исключающая доступ JavaScript к токенам сессии (XSS-defense).',
    fullExplanation: 'После авторизации через Google Identity провайдер перенаправляет на бэкенд, который генерирует JWT и устанавливает его в заголовок `Set-Cookie: mrdev_token=...; HttpOnly; Secure; SameSite=Lax; Path=/api/`. Фронтенд выполняет запросы с `withCredentials: true`, гарантируя иммунитет к краже токенов через XSS.',
    codeSnippet: `ResponseCookie cookie = ResponseCookie.from("mrdev_token", jwtToken)
    .httpOnly(true)
    .secure(true)
    .sameSite("Lax")
    .path("/api/")
    .maxAge(Duration.ofDays(7))
    .build();
response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());`,
    relatedDayNumbers: [1, 2],
    tags: ['OAuth2', 'Cookie', 'XSS', 'Security', 'SpringSecurity'],
  },
  {
    id: 'sse-streaming',
    term: 'Server-Sent Events (SSE) Streaming',
    category: 'core',
    shortDefinition: 'Протокол однонаправленной передачи потоковых данных от сервера к клиенту поверх HTTP.',
    fullExplanation: 'Используется для стриминга токенов ответа AI-тьютора в реальном времени. На клиенте поток читается через `fetch` с `ReadableStream` и декодируется `TextDecoder`, отображая текст по мере генерации без задержки полного ответа.',
    codeSnippet: `const response = await fetch('/api/v1/ai/tutor/stream', { method: 'POST', body: JSON.stringify(payload) });
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  appendChunkToMessage(chunk);
}`,
    relatedDayNumbers: [3, 4],
    tags: ['SSE', 'Streaming', 'HTTP', 'AI', 'Realtime'],
  }
];

export const getGlossaryTerms = (): GlossaryTerm[] => {
  return GLOSSARY_TERMS;
};

export const getGlossaryTermById = (id: string): GlossaryTerm | undefined => {
  const normalizedId = id.trim().toLowerCase();
  return GLOSSARY_TERMS.find(
    (t) => t.id.toLowerCase() === normalizedId || t.term.toLowerCase().includes(normalizedId)
  );
};

export const filterGlossaryTerms = (options: GlossaryFilterOptions): GlossaryTerm[] => {
  const { search, category, dayNumber } = options;
  const searchLower = search?.trim().toLowerCase() || '';

  return GLOSSARY_TERMS.filter((item) => {
    // Filter by Category
    if (category && category !== 'all' && item.category !== category) {
      return false;
    }

    // Filter by Day Number
    if (dayNumber !== undefined && item.relatedDayNumbers) {
      if (!item.relatedDayNumbers.includes(dayNumber)) {
        return false;
      }
    }

    // Filter by Search Query
    if (searchLower) {
      const matchTerm = item.term.toLowerCase().includes(searchLower);
      const matchShort = item.shortDefinition.toLowerCase().includes(searchLower);
      const matchFull = item.fullExplanation.toLowerCase().includes(searchLower);
      const matchTags = item.tags.some((tag) => tag.toLowerCase().includes(searchLower));
      const matchCategory = item.category.toLowerCase().includes(searchLower);
      return matchTerm || matchShort || matchFull || matchTags || matchCategory;
    }

    return true;
  });
};
