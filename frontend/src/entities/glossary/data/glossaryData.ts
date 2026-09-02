import { GlossaryTerm, GlossaryFilterOptions } from '../model/types';

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // ==================== НЕДЕЛЯ 1: ВВЕДЕНИЕ, ИИ И GIT ====================
  {
    id: 'vibecoding',
    term: 'Вайбкодинг (Vibe Coding)',
    category: 'core',
    shortDefinition: 'Методология разработки программного обеспечения в синергии с AI-ассистентами и жесткими инженерными протоколами.',
    fullExplanation: 'Вайбкодинг — это не просто слепая генерация кода, а подход, где разработчик выступает в роли Tech Lead / Senior Architect, а AI — в роли высокопроизводительного исполнителя. Разработчик задает архитектурные границы, валидирует типы, запускает тесты и контролирует контекст через .agents/ правила.',
    codeSnippet: `// Вайбкодинг протокол:
// 1. Сформулировать точный Customer Problem Statement
// 2. Описать системную архитектуру и контракты (DTO / API)
// 3. Сгенерировать решение через AI с эталонным промптом
// 4. Провести Code Review и запустить тесты (Unit / E2E)`,
    relatedDayNumbers: [1],
    tags: ['Core', 'Vibecoding', 'AI', 'Methodology', 'Workflow'],
  },
  {
    id: 'prompt-engineering',
    term: 'Промпт-инжиниринг (Prompt Engineering)',
    category: 'ai',
    shortDefinition: 'Дисциплина составления точных, контекстно-насыщенных инструкций для больших языковых моделей (LLM).',
    fullExplanation: 'Включает задание четкой роли (Persona), дизайн-системы, точных CSS-переменных, функциональных требований к секциям, ограничений (No lorem ipsum, single-file output) и критериев приемки. Превращает непредсказуемый AI в детерминированный инструмент генерации production-ready кода.',
    codeSnippet: `/* Эталонная структура промпта */
// РОЛЬ: Senior Frontend Engineer & UI Designer
// ЗАДАЧА: Лендинг для бренда X в одном файле index.html
// ДИЗАЙН-СИСТЕМА: --bg: #191414, --green: #1DB954, Inter font
// СЕКЦИИ: Nav, Hero (100vh), Features (3 cards), CTA, Testimonials, Footer
// ТРЕБОВАНИЯ: Mobile-first, inline SVG, 0 внешних библиотек`,
    relatedDayNumbers: [2],
    tags: ['AI', 'PromptEngineering', 'LLM', 'BestPractices', 'Claude'],
  },
  {
    id: 'basic-vs-pro-prompt',
    term: 'Basic vs Pro Prompting',
    category: 'ai',
    shortDefinition: 'Разница между поверхностным запросом новичка и профессиональной спецификацией уровня Senior Engineer.',
    fullExplanation: 'Базовый промпт («Сделай сайт Spotify») приводит к абстрактному AI-мусору (generic иконки, lorem ipsum, плохие отступы). Профессиональный промпт описывает конкретные HEX-цвета, clamp() размеры шрифтов, clamp сетку max-width 1200px, hover-анимации translateY(-4px) и реальные продуктовые сценарии.',
    codeSnippet: `// Basic: "Сделай красивый сайт с кнопками" (Результат: 2/10)
// Pro: "Hero 100vh, заголовок clamp(48px, 7vw, 88px),
//       две pill-кнопки (--mocha и ghost),
//       мокап плеера через CSS div'ы, SVG паттерн зерен с opacity 0.04"
// (Результат: 10/10)`,
    relatedDayNumbers: [2],
    tags: ['AI', 'PromptEngineering', 'Spotify', 'Benchmark', 'UI'],
  },
  {
    id: 'system-prompt',
    term: 'Системный ролевой промпт (Senior Architect)',
    category: 'ai',
    shortDefinition: 'Базовая инструкция для нейросети, задающая правила мышления step-by-step, ограничения и менторский тон.',
    fullExplanation: 'Направляет AI рассуждать вслух, задавать уточняющие вопросы до проектирования, калибровать сложность под уровень разработчика (must-have vs over-engineering), изолировать AI-агентов от core-логики и давать прямой фидбек без воды и ложной похвалы.',
    codeSnippet: `# System Prompt Правила:
1. Сначала пойми (вопросы о масштабе и ограничениях), потом советуй
2. Рассуждай вслух (think step-by-step, trade-offs)
3. Must-have сейчас vs Можно отложить vs Over-engineering
4. Тон: прямо, без воды, отмечай реальный прогресс`,
    relatedDayNumbers: [2],
    tags: ['AI', 'SystemPrompt', 'Claude', 'Architecture', 'Mentoring'],
  },
  {
    id: 'git',
    term: 'Git (Система контроля версий)',
    category: 'devops',
    shortDefinition: 'Распределенная система контроля версий, сохраняющая полную историю изменений исходного кода.',
    fullExplanation: 'Git позволяет фиксировать состояния проекта (снимки/коммиты), перемещаться во времени между ревизиями, изолированно разрабатывать фичи в ветках и безопасно объединять код нескольких разработчиков без риска потери данных.',
    codeSnippet: `git init                    # инициализация локального репозитория
git status                  # просмотр измененных файлов
git add .                   # добавление изменений в staging area
git commit -m "feat: login" # фиксация коммита в истории
git log --oneline           # просмотр истории коммитов`,
    relatedDayNumbers: [3],
    tags: ['Git', 'DevOps', 'VCS', 'CLI', 'Basics'],
  },
  {
    id: 'repository',
    term: 'Репозиторий (Local & Remote Repo)',
    category: 'devops',
    shortDefinition: 'Папка с проектом, изменения в которой отслеживаются Git, и ее облачная копия на GitHub.',
    fullExplanation: 'Локальный репозиторий живет на вашем компьютере внутри скрытой директории `.git/`. Удаленный репозиторий (Remote, обычно называемый `origin`) размещается на GitHub/GitLab и служит центральным хабом для синхронизации, CI/CD пайплайнов и code review.',
    codeSnippet: `git remote add origin https://github.com/MrSgemaSeny/MrDeveloper.git
git push -u origin main     # отправка локальной ветки main на GitHub
git clone https://github.com/MrSgemaSeny/MrDeveloper.git # скачивание копии`,
    relatedDayNumbers: [3],
    tags: ['Git', 'GitHub', 'Repository', 'Remote', 'DevOps'],
  },
  {
    id: 'commit',
    term: 'Коммит (Commit & Git History)',
    category: 'devops',
    shortDefinition: 'Неизменяемый снимок (snapshot) состояния файлов проекта в конкретный момент времени с описанием.',
    fullExplanation: 'Хороший коммит атомарен (одна задача — один коммит) и следует стандарту Conventional Commits: `feat: add JWT refresh token rotation`, `fix: avatar not updating`, `chore: bump dependencies`. Плохие коммиты (`fix`, `asdf`, `changes`) засоряют историю и усложняют отладку.',
    codeSnippet: `// Conventional Commits формат:
// feat:     новая функциональность
// fix:      исправление бага
// refactor: изменение структуры без изменения поведения
// test:     добавление или правка тестов
// chore:    обновление конфигурации или зависимостей`,
    relatedDayNumbers: [3],
    tags: ['Git', 'Commit', 'History', 'BestPractices', 'DevOps'],
  },
  {
    id: 'branch',
    term: 'Ветка (Branch & GitFlow)',
    category: 'devops',
    shortDefinition: 'Параллельная изолированная линия разработки, позволяющая менять код без риска сломать main.',
    fullExplanation: 'Ветка `main` всегда содержит стабильный, готовый к деплою код. Новые фичи разрабатываются в отдельных ветках (`feature/auth`, `fix/login-bug`). После завершения работы и прохождения тестов ветка вливается в main через Pull Request.',
    codeSnippet: `git checkout -b feature/jwt-auth   # создать ветку и переключиться
# ... написание кода и коммиты ...
git push origin feature/jwt-auth   # отправить ветку на GitHub
git checkout main && git pull      # возврат в актуальный main`,
    relatedDayNumbers: [3],
    tags: ['Git', 'Branch', 'GitFlow', 'Collaboration', 'DevOps'],
  },
  {
    id: 'staging-area',
    term: 'Индекс (Staging Area git add)',
    category: 'devops',
    shortDefinition: 'Промежуточная буферная зона между рабочей директорией и историей коммитов.',
    fullExplanation: 'Позволяет выборочно формировать коммит: из 10 измененных файлов можно добавить командой `git add src/auth/` только файлы авторизации, оставив остальные изменения для следующего отдельного коммита.',
    codeSnippet: `Рабочая директория   ──(git add)──►   Индекс (Staging)   ──(git commit)──►   Коммит
 (измененные файлы)                     (выбранные файлы)                     (снимок в .git)`,
    relatedDayNumbers: [3],
    tags: ['Git', 'Staging', 'CLI', 'DevOps'],
  },
  {
    id: 'gitignore',
    term: '.gitignore (Исключения Git)',
    category: 'devops',
    shortDefinition: 'Специальный файл со списком путей и шаблонов, которые Git обязан игнорировать.',
    fullExplanation: 'Предотвращает попадание в репозиторий конфиденциальных данных (`.env`, пароли, секретные ключи), тяжелых зависимостей (`node_modules/`, `target/`, `dist/`), временных логов (`*.log`) и настроек IDE (`.idea/`, `.vscode/`). Секреты, попавшие в историю Git, остаются там навсегда.',
    codeSnippet: `# .gitignore пример:
node_modules/
dist/
.env
.env.local
target/
*.log
.idea/`,
    relatedDayNumbers: [3],
    tags: ['Git', 'Security', 'Config', 'Secrets', 'DevOps'],
  },
  {
    id: 'pull-request',
    term: 'Pull Request (PR & Code Review)',
    category: 'devops',
    shortDefinition: 'Предложение слить изменения из рабочей ветки в main с возможностью проверки кода и запуска автотестов.',
    fullExplanation: 'Pull Request — надстройка платформы GitHub над Git. При создании PR автоматически запускается CI-пайплайн (линтер, тесты, сборка), а ментор или коллеги проводят инспекцию архитектуры. Слияние (Merge) разрешается только при всех зеленых проверках.',
    codeSnippet: `1. Push ветки: git push origin feature/kanban
2. Открытие PR на GitHub: feature/kanban -> main
3. Запуск GitHub Actions: tests pass (зеленый статус)
4. Ревью ментора: Approve
5. Merge в main и автодеплой на сервер`,
    relatedDayNumbers: [3],
    tags: ['GitHub', 'PR', 'CodeReview', 'CI', 'DevOps'],
  },
  {
    id: 'merge-rebase',
    term: 'Merge vs Rebase (Слияние веток)',
    category: 'devops',
    shortDefinition: 'Два основных способа объединения истории изменений из разных веток Git.',
    fullExplanation: 'Merge создает специальный коммит слияния, сохраняя полную хронологическую ветвистую историю. Rebase переносит коммиты поверх целевой ветки, выстраивая абсолютно линейную и чистую историю коммитов. Для новичков Merge безопаснее, так как не переписывает хеши коммитов.',
    codeSnippet: `// Merge (сохраняет историю как есть):
git checkout main
git merge feature/auth

// Rebase (выстраивает линейную историю):
git checkout feature/auth
git rebase main`,
    relatedDayNumbers: [3],
    tags: ['Git', 'Merge', 'Rebase', 'Architecture', 'DevOps'],
  },
  {
    id: 'git-conflict',
    term: 'Конфликт слияния (Git Conflict Resolution)',
    category: 'devops',
    shortDefinition: 'Ситуация, когда Git не может автоматически объединить разные изменения одной и той же строки.',
    fullExplanation: 'Возникает при одновременном редактировании одного участка кода в разных ветках. Git проставляет маркеры `<<<<<<< HEAD` (текущая ветка) и `>>>>>>> branch` (вливаемая). Разработчик вручную оставляет правильный код, убирает маркеры и фиксирует коммит разрешения конфликта.',
    codeSnippet: `<<<<<<< HEAD (твои изменения)
  private String username;
=======
  private String login;
>>>>>>> feature/auth (чужие изменения)
// Решение: выбрать один вариант, удалить маркеры и сделать git commit`,
    relatedDayNumbers: [3],
    tags: ['Git', 'Conflict', 'Troubleshooting', 'DevOps'],
  },
  {
    id: 'github-pages',
    term: 'GitHub Pages (Деплой статики)',
    category: 'devops',
    shortDefinition: 'Бесплатный статический хостинг от GitHub для размещения HTML/CSS/JS сайтов и SPA-приложений.',
    fullExplanation: 'Идеален для публикации первого лендинга или фронтенд-клиента. Для корректной работы Single Page Application (SPA) с маршрутами на GitHub Pages применяется трюк копирования `index.html` в `404.html`, что позволяет React Router обрабатывать прямые переходы по ссылкам.',
    codeSnippet: `// В deploy.yml workflow:
- name: Build frontend
  run: npm run build
- name: SPA 404 fallback
  run: cp dist/index.html dist/404.html
- name: Deploy to GitHub Pages
  uses: actions/deploy-pages@v4`,
    relatedDayNumbers: [3, 4],
    tags: ['GitHub', 'Pages', 'Deploy', 'SPA', 'Hosting'],
  },
  {
    id: 'glassmorphism-rules',
    term: 'Glassmorphism UI (Правила матового стекла)',
    category: 'frontend',
    shortDefinition: 'Современный стиль визуального оформления с эффектом полупрозрачного размытого стекла.',
    fullExplanation: 'Строится на 4 CSS-свойствах: `background: rgba(255,255,255,0.55)`, `backdrop-filter: blur(16px) saturate(180%)`, тонкая полупрозрачная граница `border: 1px solid rgba(255,255,255,0.6)` и мягкая тень `box-shadow: 0 8px 32px rgba(61,43,31,0.10)`. Применяется точечно (карточки, навигация при скролле), а не на весь экран.',
    codeSnippet: `.glass-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(61, 43, 31, 0.10);
  border-radius: 16px;
}`,
    relatedDayNumbers: [4],
    tags: ['Frontend', 'CSS', 'Glassmorphism', 'DesignSystem', 'UI'],
  },
  {
    id: 'one-file-landing',
    term: 'Single-File Landing Architecture',
    category: 'frontend',
    shortDefinition: 'Паттерн верстки чистого лендинг-сайта в одном файле index.html со встроенными стилями и скриптами.',
    fullExplanation: 'Подход для MVP и быстрых прототипов без лишней тяжести сборщиков. Включает inline SVG иконки, CSS custom properties для дизайн-системы, семантические секции (NAV, HERO, FEATURES, CTA, FOOTER) и минимальный ванильный JS для sticky-меню и плавного скролла.',
    codeSnippet: `<!DOCTYPE html>
<html lang="ru">
<head>
  <style>
    :root { --bg: #191414; --green: #1DB954; --white: #fff; }
    /* CSS переменные и стили всех 6 секций */
  </style>
</head>
<body>
  <!-- NAV, HERO, FEATURES, TESTIMONIALS, FOOTER -->
  <script>/* Sticky header on scroll */</script>
</body>
</html>`,
    relatedDayNumbers: [4, 6],
    tags: ['Frontend', 'HTML', 'CSS', 'Landing', 'Architecture'],
  },

  // ==================== НЕДЕЛЯ 2: FRONTEND, REACT, TS, FSD ====================
  {
    id: 'js-vs-ts',
    term: 'JavaScript vs TypeScript (Статическая типизация)',
    category: 'frontend',
    shortDefinition: 'TypeScript — это JavaScript с надежной системой статической проверки типов на этапе компиляции.',
    fullExplanation: 'Браузер исполняет только JavaScript. TypeScript работает во время разработки в IDE, мгновенно подсвечивая несоответствия типов, опечатки в полях и пропущенные аргументы. Перед отправкой в браузер Vite компилирует TS в чистый, высокооптимизированный JS.',
    codeSnippet: `// TypeScript интерфейс — контракт формы данных:
interface CourseLesson {
  id: number;
  title: string;
  isCompleted: boolean;
  dayNumber: number;
}
// IDE не позволит ошибиться в названии полей`,
    relatedDayNumbers: [7],
    tags: ['TypeScript', 'JavaScript', 'Frontend', 'Types', 'Compiler'],
  },
  {
    id: 'vite',
    term: 'Vite (Сборщик и Dev-сервер)',
    category: 'frontend',
    shortDefinition: 'Сверхбыстрый инструмент сборки фронтенда нового поколения с нативной поддержкой ES-модулей.',
    fullExplanation: 'Vite компилирует TypeScript, объединяет стили и ассеты, обеспечивает мгновенный Hot Module Replacement (HMR без перезагрузки страницы при изменении кода) и собирает оптимизированный production-бандл в папку `dist/`.',
    codeSnippet: `npm run dev    # запуск локального dev-сервера (localhost:5173)
npm run build  # tsc -b && vite build -> создание продакшн папки dist/`,
    relatedDayNumbers: [7],
    tags: ['Vite', 'Build', 'HMR', 'Bundler', 'Frontend'],
  },
  {
    id: 'spa-vs-mpa',
    term: 'Single Page Application (SPA vs Multi-Page)',
    category: 'frontend',
    shortDefinition: 'Веб-приложение, загружающее одну HTML-страницу и динамически перерисовывающее контент без перезагрузок.',
    fullExplanation: 'В отличие от классических сайтов, где каждый переход загружает новую HTML-страницу с сервера, в React SPA браузер один раз загружает `index.html` и бандл JS. Дальше клиентский роутер (React Router) мгновенно меняет отображение, а данные запрашиваются через API в фоновом режиме.',
    codeSnippet: `// Переходы между /dashboard, /courses, /lessons происходят мгновенно
// без белого экрана и без повторной перезагрузки DOM`,
    relatedDayNumbers: [7, 8],
    tags: ['SPA', 'React', 'Router', 'Architecture', 'Frontend'],
  },
  {
    id: 'react-ui-data',
    term: 'React (UI = f(data) & Компоненты)',
    category: 'frontend',
    shortDefinition: 'Декларативная библиотека для создания пользовательских интерфейсов из переиспользуемых компонентов.',
    fullExplanation: 'Главный принцип React: интерфейс есть чистая функция от данных (`UI = f(state)`). Разработчик описывает, как экран должен выглядеть при определенном состоянии, а React сам вычисляет минимальный diff виртуального дерева (Virtual DOM) и точечно обновляет реальный DOM.',
    codeSnippet: `export const LessonStatusBadge: React.FC<{ completed: boolean }> = ({ completed }) => {
  return completed ? (
    <span className="bg-white/10 text-white px-2 py-0.5 text-xs font-mono">Пройден</span>
  ) : (
    <span className="text-zinc-500 text-xs font-mono">Не начат</span>
  );
};`,
    relatedDayNumbers: [7],
    tags: ['React', 'Frontend', 'Components', 'VirtualDOM', 'Declarative'],
  },
  {
    id: 'dto',
    term: 'DTO (Data Transfer Object)',
    category: 'core',
    shortDefinition: 'Строгий контракт формы данных, передаваемых по сети между фронтендом и бэкендом.',
    fullExplanation: 'DTO описывает точную структуру JSON-объекта запроса или ответа. Предотвращает утечку внутренних полей базы данных (пароли, хеши) наружу и гарантирует, что фронтенд и бэкенд говорят на одном строго согласованном языке типов.',
    codeSnippet: `// Backend DTO (Java Record):
public record LessonDetailDto(Long id, String title, Integer dayNumber, boolean completed) {}

// Frontend DTO (TypeScript Interface):
export interface LessonDetailDto {
  id: number;
  title: string;
  dayNumber: number;
  completed: boolean;
}`,
    relatedDayNumbers: [7, 13],
    tags: ['DTO', 'Contract', 'TypeScript', 'Java', 'API'],
  },
  {
    id: 'zod',
    term: 'Zod (Рантайм-валидация схем)',
    category: 'frontend',
    shortDefinition: 'TypeScript-first библиотека декларативной валидации данных в рантайме с автовыводом типов.',
    fullExplanation: 'TypeScript проверяет типы только во время компиляции. Когда в приложение приходят данные из формы или внешнего API, Zod проверяет их корректность в реальном времени и генерирует типизированные ошибки валидации.',
    codeSnippet: `import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;`,
    relatedDayNumbers: [7, 8],
    tags: ['Zod', 'Validation', 'TypeScript', 'Forms', 'Frontend'],
  },
  {
    id: 'shared-api',
    term: 'Shared API Layer (Централизованный клиент)',
    category: 'frontend',
    shortDefinition: 'Единая точка конфигурации всех сетевых HTTP-запросов приложения к бэкенду.',
    fullExplanation: 'Вместо разрозненных вызовов `fetch()` по компонентам, в `shared/api/apiClient.ts` настраивается базовый URL, передача cookie (`credentials: include`), глобальные заголовки и единый интерцептор обработки ошибок (401 Unauthorized -> редирект на логин).',
    codeSnippet: `// shared/api/apiClient.ts
export const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json();
};`,
    relatedDayNumbers: [7, 13],
    tags: ['API', 'HTTP', 'Fetch', 'Architecture', 'Frontend'],
  },
  {
    id: 'react-hooks',
    term: 'React Hooks (useState, useEffect, useRef)',
    category: 'frontend',
    shortDefinition: 'Специальные функции, позволяющие функциональным компонентам использовать состояние и жизненный цикл React.',
    fullExplanation: '`useState` управляет локальным состоянием, вызывая перерисовку при изменении. `useEffect` выполняет побочные эффекты (подписки, таймеры). `useRef` хранит мутабельное значение или ссылку на DOM-элемент без вызова ре-рендера.',
    codeSnippet: `const [isOpen, setIsOpen] = useState(false); // локальный стейт
const inputRef = useRef<HTMLInputElement>(null); // ссылка на DOM

useEffect(() => {
  if (isOpen) inputRef.current?.focus();
}, [isOpen]);`,
    relatedDayNumbers: [7, 8],
    tags: ['React', 'Hooks', 'State', 'Frontend', 'Lifecycle'],
  },
  {
    id: 'state-management',
    term: 'Управление состоянием (Local, Server, Global)',
    category: 'frontend',
    shortDefinition: 'Четкое разделение данных приложения по трем уровням ответственности.',
    fullExplanation: '1. Локальное (`useState`) — состояние внутри одного компонента (открыта ли модалка). 2. Серверное (`React Query`) — кешированные данные с API (список уроков, профиль). 3. Глобальное (`Zustand`) — синхронное клиентское состояние между разными ветками DOM (текущий пользователь, тема).',
    codeSnippet: `// 1. Локальный стейт: useState(false)
// 2. Серверный стейт: useQuery({ queryKey: ['lessons'], queryFn: fetchLessons })
// 3. Глобальный стейт: useAuthStore((state) => state.user)`,
    relatedDayNumbers: [7, 8],
    tags: ['StateManagement', 'Architecture', 'React', 'Zustand', 'ReactQuery'],
  },
  {
    id: 'zustand',
    term: 'Zustand (Минималистичный глобальный стейт)',
    category: 'frontend',
    shortDefinition: 'Быстрая, легковесная библиотека управления глобальным состоянием без громоздкого бойлерплейта Redux.',
    fullExplanation: 'Позволяет объявить хранилище (store) с данными и методами их мутации в одном файле. Любой компонент подписывается только на нужный срез данных (селектор), что предотвращает избыточные рендеры соседних компонентов.',
    codeSnippet: `import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));`,
    relatedDayNumbers: [7, 8],
    tags: ['Zustand', 'StateManagement', 'React', 'Store', 'Frontend'],
  },
  {
    id: 'fsd',
    term: 'Feature-Sliced Design (FSD)',
    category: 'frontend',
    shortDefinition: 'Архитектурная методология структурирования масштабируемых фронтенд-приложений по слоям.',
    fullExplanation: 'Кодовая база разбита на стандартизированные слои с однонаправленным потоком зависимостей: `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`. Модули верхних слоев могут импортировать только нижние слои, что полностью исключает циклические зависимости и спагетти-код.',
    codeSnippet: `// FSD Hierarchy:
// src/app/          -> Layouts, Providers, Router
// src/pages/        -> Compositional views (LessonPage, DocsPage)
// src/widgets/      -> Autonomous composite blocks (QuickNavDrawer, Header)
// src/features/     -> User interactions (auth, complete-lesson)
// src/entities/     -> Business domain models & APIs (course, lesson, glossary)
// src/shared/       -> Reusable UI primitives, helpers, types`,
    relatedDayNumbers: [1, 7, 11],
    tags: ['FSD', 'Architecture', 'CleanCode', 'Frontend', 'TypeScript'],
  },
  {
    id: 'tanstack-query',
    term: 'TanStack React Query v5',
    category: 'frontend',
    shortDefinition: 'Библиотека асинхронного управления серверным состоянием, кешированием и инвалидацией.',
    fullExplanation: 'Используется для декларативного получения данных с сервера (`useQuery`), оптимистичных мутаций (`useMutation`) и автоматической фоновой ревалидации. Позволяет избежать дублирования сетевых запросов и сохраняет кеш уроков без задержек.',
    codeSnippet: `const { data: progress, isLoading } = useQuery({
  queryKey: ['progress', courseId],
  queryFn: () => progressApi.getCourseProgress(courseId),
  staleTime: 5 * 60 * 1000, // 5 минут кеширования
});`,
    relatedDayNumbers: [7, 8],
    tags: ['React', 'Cache', 'Async', 'StateManagement', 'ReactQuery'],
  },
  {
    id: 'tailwind-v4',
    term: 'Tailwind CSS v4 (Утилитарные стили)',
    category: 'frontend',
    shortDefinition: 'Утилитарный CSS-фреймворк нового поколения на базе движка LightningCSS.',
    fullExplanation: 'Позволяет стилизовать компоненты прямо в JSX через утилитарные классы (`bg-[#0a0a0c]`, `border-white/10`, `text-zinc-300`, `rounded-sm`). Все неиспользуемые классы автоматически вычищаются из финальной сборки (zero-runtime CSS).',
    codeSnippet: `<button className="px-4 py-2 bg-white text-black font-semibold rounded-sm hover:bg-zinc-200 transition-colors font-mono text-xs">
  Начать обучение
</button>`,
    relatedDayNumbers: [2, 7],
    tags: ['Tailwind', 'CSS', 'DesignSystem', 'UI', 'Frontend'],
  },
  {
    id: 'lucide-icons',
    term: 'Lucide Icons (Векторные SVG-компоненты)',
    category: 'frontend',
    shortDefinition: 'Современная библиотека из 1500+ чистых геометрических векторных иконок в виде React-компонентов.',
    fullExplanation: 'Каждая иконка импортируется как независимый React-компонент (`<Check />`, `<FileText />`, `<Lock />`). Масштабируется без потери четкости через пропсы `className="w-4 h-4 text-zinc-400"`, поддерживая tree-shaking.',
    codeSnippet: `import { BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';

<CheckCircle2 className="w-4 h-4 text-white" />`,
    relatedDayNumbers: [7, 8],
    tags: ['Lucide', 'Icons', 'SVG', 'UI', 'Frontend'],
  },

  // ==================== НЕДЕЛЯ 3: HTTP, REST, BACKEND, SPRING BOOT ====================
  {
    id: 'http-protocol',
    term: 'Протокол HTTP (Клиент-серверный обмен)',
    category: 'backend',
    shortDefinition: 'Сетевой протокол прикладного уровня, определяющий правила передачи гипертекста и данных в вебе.',
    fullExplanation: 'Клиент (браузер) отправляет HTTP-запрос (Request), сервер обрабатывает бизнес-логику и возвращает HTTP-ответ (Response). Каждый цикл запроса содержит метод, заголовки (метаданные) и тело (данные).',
    codeSnippet: `Браузер (React) ─── HTTP-Request (GET /api/v1/courses) ───► Сервер (Spring Boot)
                ◄─── HTTP-Response (200 OK + JSON Body) ────`,
    relatedDayNumbers: [13],
    tags: ['HTTP', 'Network', 'REST', 'Backend', 'Basics'],
  },
  {
    id: 'http-request-anatomy',
    term: 'Анатомия HTTP-запроса (Method, Headers, Body)',
    category: 'backend',
    shortDefinition: 'Трехсоставная структура сетевого сообщения между клиентом и веб-сервером.',
    fullExplanation: '1. Стартовая строка (Метод + URL + Версия протокола). 2. Заголовки (Headers): `Authorization: Bearer ...`, `Content-Type: application/json`. 3. Тело (Body): полезная нагрузка в формате JSON при POST/PUT/PATCH запросах.',
    codeSnippet: `POST /api/v1/auth/login HTTP/1.1
Host: api.mrdeveloper.io
Content-Type: application/json
Authorization: Bearer eyJhbGci...

{
  "email": "student@mrdeveloper.io",
  "password": "secretPassword123"
}`,
    relatedDayNumbers: [13],
    tags: ['HTTP', 'Request', 'Headers', 'JSON', 'Backend'],
  },
  {
    id: 'http-methods',
    term: 'HTTP-методы (GET, POST, PUT, PATCH, DELETE)',
    category: 'backend',
    shortDefinition: 'Стандартизированные глаголы протокола HTTP, определяющие желаемое действие над ресурсом.',
    fullExplanation: 'GET — безопасное получение данных (ничего не меняет в БД). POST — создание нового ресурса. PUT — полная замена ресурса целиком. PATCH — частичное обновление отдельных полей. DELETE — удаление ресурса.',
    codeSnippet: `GET    /api/v1/courses/1/lessons     # получить список уроков
POST   /api/v1/auth/login            # аутентифицировать пользователя
PUT    /api/v1/profile               # обновить весь профиль целиком
PATCH  /api/v1/profile/avatar        # обновить только ссылку на аватар
DELETE /api/v1/admin/lessons/42      # удалить урок с ID 42`,
    relatedDayNumbers: [13],
    tags: ['HTTP', 'REST', 'Methods', 'API', 'Backend'],
  },
  {
    id: 'http-status-codes',
    term: 'HTTP Статус-коды (2xx, 3xx, 4xx, 5xx)',
    category: 'backend',
    shortDefinition: 'Трехзначный числовой код в ответе сервера, сообщающий результат обработки запроса.',
    fullExplanation: '2xx (Успех): 200 OK, 201 Created, 204 No Content. 3xx (Редирект): 301, 302. 4xx (Ошибка клиента): 400 Bad Request, 401 Unauthorized (нет токена), 403 Forbidden (нет прав), 404 Not Found, 409 Conflict (email занят), 429 Too Many Requests (Rate limit). 5xx (Ошибка сервера): 500 Internal Server Error, 502 Bad Gateway.',
    codeSnippet: `// GlobalExceptionHandler маппинг в Spring Boot:
ConflictException       -> 409 Conflict
UnauthorizedException   -> 401 Unauthorized
AccessDeniedException   -> 403 Forbidden
ResourceNotFoundException -> 404 Not Found
TooManyRequestsException-> 429 Too Many Requests`,
    relatedDayNumbers: [13],
    tags: ['HTTP', 'StatusCodes', 'REST', 'Exceptions', 'Backend'],
  },
  {
    id: 'rest-architecture',
    term: 'REST-архитектура (Stateless & Существительные в URL)',
    category: 'backend',
    shortDefinition: 'Архитектурный стиль проектирования предсказуемых, масштабируемых и понятных веб-API.',
    fullExplanation: 'Ключевые принципы REST: 1. URL описывает ресурс существительным во множественном числе (`/api/v1/courses`, а не `/createCourse`). 2. Действие выражается HTTP-методом. 3. Сервер stateless — не хранит сессий в оперативной памяти, каждый запрос несет в себе все данные для аутентификации (JWT).',
    codeSnippet: `// ПЛОХО (глаголы в URL):
// POST /api/v1/createUser
// GET  /api/v1/deleteLesson?id=5

// ХОРОШО (REST стандарт):
// POST   /api/v1/users
// DELETE /api/v1/lessons/5`,
    relatedDayNumbers: [13],
    tags: ['REST', 'Architecture', 'API', 'Stateless', 'Backend'],
  },
  {
    id: 'path-vs-query',
    term: 'Path Variables vs Query Parameters',
    category: 'backend',
    shortDefinition: 'Два основных способа передачи параметров в GET-запросах без тела сообщения.',
    fullExplanation: 'Path Variable (`/api/v1/lessons/{id}`) идентифицирует конкретный уникальный ресурс в иерархии. Query Parameters (`/api/v1/lessons?tag=Security&page=1`) применяются для фильтрации, сортировки, поиска и пагинации коллекций.',
    codeSnippet: `@GetMapping("/lessons/{id}") // Path Variable
public ResponseEntity<LessonDto> getLesson(@PathVariable Long id) { ... }

@GetMapping("/lessons") // Query Parameters
public ResponseEntity<List<LessonDto>> searchLessons(
    @RequestParam(required = false) String tag,
    @RequestParam(defaultValue = "0") int page) { ... }`,
    relatedDayNumbers: [13],
    tags: ['REST', 'Spring', 'HTTP', 'Backend'],
  },
  {
    id: 'cors-preflight',
    term: 'CORS & Preflight (OPTIONS Запросы)',
    category: 'security',
    shortDefinition: 'Механизм безопасности браузера, блокирующий несанкционированные запросы с других доменов.',
    fullExplanation: 'По умолчанию браузер блокирует запросы с `http://localhost:5173` на `http://localhost:8080` (Same-Origin Policy). Сервер обязан явно вернуть CORS-заголовки `Access-Control-Allow-Origin`. Перед сложными запросами браузер шлет предварительный `OPTIONS` preflight запрос для проверки разрешений.',
    codeSnippet: `// SecurityConfig.java
CorsConfiguration config = new CorsConfiguration();
config.setAllowedOrigins(List.of("http://localhost:5173", "https://mrdeveloper.io"));
config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
config.setAllowCredentials(true);`,
    relatedDayNumbers: [13, 14],
    tags: ['CORS', 'Security', 'HTTP', 'Browser', 'SpringSecurity'],
  },
  {
    id: 'spring-boot-3',
    term: 'Spring Boot 3 (Java Framework)',
    category: 'backend',
    shortDefinition: 'Индустриальный Java-фреймворк для создания надежных серверных приложений и микросервисов.',
    fullExplanation: 'Берет на себя всю рутинную инфраструктуру: встроенный HTTP-сервер Tomcat, автоконфигурацию бинов (Inversion of Control & Dependency Injection), интеграцию с БД через JPA/Hibernate и безопасность через Spring Security 6.',
    codeSnippet: `@SpringBootApplication
public class MrDevCoursesApplication {
    public static void main(String[] args) {
        SpringApplication.run(MrDevCoursesApplication.class, args);
    }
}`,
    relatedDayNumbers: [13, 14],
    tags: ['Java', 'SpringBoot', 'Backend', 'Framework', 'Architecture'],
  },
  {
    id: 'three-tier-architecture',
    term: 'Трехслойная архитектура (Controller - Service - Repository)',
    category: 'backend',
    shortDefinition: 'Стандарт разделения обязанностей бэкенда на транспортный, бизнес и персистентный слои.',
    fullExplanation: '1. `Controller` — принимает HTTP-запрос, валидирует входной DTO и вызывает сервис. 2. `Service` — содержит чистую бизнес-логику и правила. 3. `Repository` — выполняет запросы к PostgreSQL. Контроллер никогда не знает о БД, репозиторий не знает о HTTP.',
    codeSnippet: `HTTP Request
     │
     ▼
@RestController   (AuthController: принимает JSON, возвращает DTO)
     │
     ▼
@Service          (AuthService: проверяет пароль, генерирует JWT)
     │
     ▼
@Repository       (UserRepository: SELECT * FROM users WHERE email = ?)
     │
     ▼
PostgreSQL Database`,
    relatedDayNumbers: [13],
    tags: ['Architecture', 'LayeredArchitecture', 'SpringBoot', 'CleanCode', 'Backend'],
  },
  {
    id: 'jpa-entity',
    term: 'JPA Entity (Таблица БД в Java-коде)',
    category: 'backend',
    shortDefinition: 'Java-класс, отображаемый на конкретную таблицу реляционной базы данных PostgreSQL.',
    fullExplanation: 'Каждое поле класса соответствует колонке таблицы. Аннотации `@Id`, `@GeneratedValue`, `@Column`, `@CreationTimestamp` задают правила генерации первичных ключей, уникальности и таймстемпов.',
    codeSnippet: `@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;
}`,
    relatedDayNumbers: [13],
    tags: ['JPA', 'Hibernate', 'PostgreSQL', 'Entity', 'Backend'],
  },
  {
    id: 'table-relationships',
    term: 'Связи между таблицами (@OneToOne, @OneToMany, @ManyToOne)',
    category: 'backend',
    shortDefinition: 'Аннотации JPA, описывающие реляционные связи и внешние ключи (Foreign Keys) между таблицами.',
    fullExplanation: '`@OneToOne` (User <-> Profile: один пользователь — один профиль). `@OneToMany` (Course -> Lessons: один курс — много уроков). `@ManyToOne` (Lesson -> Course). Параметр `cascade = CascadeType.ALL` обеспечивает каскадное удаление зависимых записей.',
    codeSnippet: `@Entity
public class Course {
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Lesson> lessons = new ArrayList<>();
}`,
    relatedDayNumbers: [13],
    tags: ['JPA', 'Hibernate', 'Database', 'Relationships', 'Backend'],
  },
  {
    id: 'flyway',
    term: 'Flyway DB Migration',
    category: 'devops',
    shortDefinition: 'Инструмент версионирования и автоматической накатки миграций схемы базы данных PostgreSQL.',
    fullExplanation: 'Все изменения схемы базы данных оформляются как версионированные SQL-скрипты в папке `db/migration/` (V1__init.sql, V24__curriculum.sql, V27__materials.sql). При старте приложения Flyway выполняет новые миграции в транзакции и проверяет контрольные суммы (checksum). Примененные миграции запрещено изменять.',
    codeSnippet: `-- V27__attach_supplementary_materials_to_lessons.sql
INSERT INTO lesson_materials (lesson_id, title, material_type, url, file_size_bytes, sort_order, created_at)
VALUES (l_id, 'Неделя 1 Урок 3 — Словарь Git', 'CHEAT_SHEET', '/docs?tag=DevOps', 13400, 1, NOW());`,
    relatedDayNumbers: [1, 4, 13],
    tags: ['Flyway', 'Database', 'PostgreSQL', 'Migrations', 'DevOps'],
  },
  {
    id: 'jwt',
    term: 'JWT (JSON Web Token)',
    category: 'security',
    shortDefinition: 'Компактный формат передачи данных сессии в виде криптографически подписанного JSON-токена.',
    fullExplanation: 'В MrDeveloper используется связка: короткоживущий Access Token (15 мин) в защищенной httpOnly cookie (`mrdev_token`) и Refresh Token (30 дней) в защищенном хранилище Redis. Сервер проверяет подпись HMAC-SHA256 без обращения к БД на каждый запрос.',
    codeSnippet: `// Spring Security JWT Filter validation
String token = extractTokenFromCookie(request, "mrdev_token");
if (token != null && jwtProvider.validateToken(token)) {
    Long userId = jwtProvider.getUserId(token);
    UserPrincipal principal = new UserPrincipal(userId, email, role);
    UsernamePasswordAuthenticationToken auth = 
        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    SecurityContextHolder.getContext().setAuthentication(auth);
}`,
    relatedDayNumbers: [1, 2, 13, 15],
    tags: ['Auth', 'Security', 'JWT', 'Cookie', 'Stateless', 'OAuth2'],
  },
  {
    id: 'redis',
    term: 'Redis (In-Memory Cache & TTL Store)',
    category: 'backend',
    shortDefinition: 'Высокопроизводительное сетевое хранилище данных в оперативной памяти с поддержкой TTL.',
    fullExplanation: 'Используется для хранения временных refresh токенов сессий, распределенных счетчиков rate limiting (10 запросов в минуту), кеширования прав пользователей и одноразовых OAuth2 кодов.',
    codeSnippet: `// Сохранение refresh токена на 30 дней в Redis:
redisTemplate.opsForValue().set("refresh:" + userId, refreshToken, Duration.ofDays(30));`,
    relatedDayNumbers: [13, 15],
    tags: ['Redis', 'Cache', 'Performance', 'RateLimit', 'Backend'],
  },
  {
    id: 'bcrypt',
    term: 'BCrypt (Хеширование паролей с солью)',
    category: 'security',
    shortDefinition: 'Криптографическая функция одностороннего хеширования паролей со встроенной солью (salt).',
    fullExplanation: 'Пароли никогда не хранятся в открытом виде. BCrypt генерирует уникальную соль для каждого пароля и выполняет 12 раундов хеширования (`$2a$12$...`), делая перебор по радужным таблицам и brute-force атаки вычислительно невозможными.',
    codeSnippet: `// SecurityConfig.java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}`,
    relatedDayNumbers: [13, 15],
    tags: ['Security', 'BCrypt', 'Cryptography', 'Passwords', 'SpringSecurity'],
  },
  {
    id: 'spring-security',
    term: 'Spring Security & Цепочка фильтров',
    category: 'security',
    shortDefinition: 'Мощный фреймворк аутентификации и авторизации запросов на базе цепочки фильтров (Security Filter Chain).',
    fullExplanation: 'Каждый входящий HTTP-запрос проходит через фильтры безопасности до попадания в контроллер. `JwtFilter` извлекает cookie, проверяет валидность подписи и помещает `Authentication` в `SecurityContextHolder`. Публичные эндпоинты (`/api/v1/auth/**`) открыты для всех.',
    codeSnippet: `http.csrf(AbstractHttpConfigurer::disable)
    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .authorizeHttpRequests(auth -> auth
        .requestMatchers("/api/v1/auth/**", "/docs/**").permitAll()
        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
        .anyRequest().authenticated())
    .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);`,
    relatedDayNumbers: [1, 13, 15],
    tags: ['SpringSecurity', 'Auth', 'Filter', 'RBAC', 'Security'],
  },
  {
    id: 'global-exception-handler',
    term: 'GlobalExceptionHandler (@RestControllerAdvice)',
    category: 'backend',
    shortDefinition: 'Централизованный перехватчик всех ошибок и исключений бэкенда в единый JSON-формат.',
    fullExplanation: 'Предотвращает утечку внутренних Java stacktrace наружу пользователю. Преобразует доменные исключения (`ResourceNotFoundException`, `AccessDeniedException`, `MethodArgumentNotValidException`) в стандартизированные ответы с кодами 400, 401, 403, 404, 409, 429.',
    codeSnippet: `@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404).body(ApiResponse.error(ex.getMessage()));
    }
}`,
    relatedDayNumbers: [13],
    tags: ['Exceptions', 'SpringBoot', 'REST', 'ErrorHandling', 'Backend'],
  },
  {
    id: 'transactional',
    term: '@Transactional (Атомарность операций)',
    category: 'backend',
    shortDefinition: 'Аннотация Spring, гарантирующая выполнение группы операций с БД как единой неделимой транзакции (ACID).',
    fullExplanation: 'Если внутри метода, помеченного `@Transactional`, выбрасывается RuntimeException, все ранее выполненные SQL-запросы в рамках этой операции автоматически откатываются назад (Rollback), защищая базу данных от несогласованности.',
    codeSnippet: `@Transactional
public User registerUser(RegisterRequest request) {
    User savedUser = userRepository.save(user);
    profileRepository.save(Profile.forUser(savedUser)); // если здесь ошибка — User тоже отменится
    return savedUser;
}`,
    relatedDayNumbers: [13],
    tags: ['Database', 'Transactions', 'ACID', 'SpringBoot', 'Backend'],
  },
  {
    id: 'oauth2',
    term: 'OAuth 2.0 (Google Identity & GitHub)',
    category: 'security',
    shortDefinition: 'Протокол делегированной авторизации, позволяющий пользователю войти через сторонний аккаунт.',
    fullExplanation: 'Пользователь авторизуется на стороне Google/GitHub, не раскрывая пароль нашему приложению. Провайдер возвращает одноразовый `authorization_code`, который бэкенд обменивает на профиль пользователя и генерирует внутренний JWT сессии.',
    codeSnippet: `// Flow OAuth 2.0:
// 1. Redirect to: https://accounts.google.com/o/oauth2/v2/auth
// 2. User confirms permissions -> Google redirects to callback with ?code=XYZ
// 3. Backend exchanges code for Google ID & Email
// 4. Backend creates User in DB and returns httpOnly JWT cookie`,
    relatedDayNumbers: [1, 16],
    tags: ['OAuth2', 'Google', 'Auth', 'Security', 'SSO'],
  },

  // ==================== ТЕСТЫ, CI/CD И КАЧЕСТВО КОДА ====================
  {
    id: 'test-pyramid',
    term: 'Пирамида тестирования (Unit, Integration, E2E)',
    category: 'devops',
    shortDefinition: 'Инженерная модель распределения автоматических тестов по скорости, стоимости и охвату системы.',
    fullExplanation: 'Основа пирамиды — множество быстрых, изолированных Unit-тестов (миллисекунды). Средний уровень — интеграционные тесты нескольких слоев с тестовой БД. Вершина — небольшое количество сквозных E2E тестов полного сценария пользователя.',
    codeSnippet: `        /\\
       /E2E\\         <- Мало, проверяют весь UI и API (медленные)
      /──────\\
     /Integr. \\      <- Средне, поднимают Spring Context (@SpringBootTest)
    /──────────\\
   / Unit Tests \\    <- Много, изолированные функции с Mockito (быстрые)
  /──────────────\\`,
    relatedDayNumbers: [17],
    tags: ['Testing', 'Quality', 'TestPyramid', 'CI', 'DevOps'],
  },
  {
    id: 'unit-testing',
    term: 'Unit-тестирование (Модульные тесты)',
    category: 'devops',
    shortDefinition: 'Тестирование отдельных изолированных функций или классов без поднятия тяжелой инфраструктуры.',
    fullExplanation: 'Unit-тест проверяет чистую логику конкретного метода: граничные значения, обработку null, корректность математических формул и выброс исключений. Все внешние зависимости заменяются быстрыми заглушками (Mocks).',
    codeSnippet: `@Test
void shouldMaskEmailAndPhoneCorrectly() {
    PiiMasker masker = new PiiMasker();
    String raw = "Email me at john@gmail.com or call +77011112233";
    String result = masker.mask(raw);
    assertThat(result).isEqualTo("Email me at [EMAIL] or call [PHONE]");
}`,
    relatedDayNumbers: [17],
    tags: ['JUnit', 'Vitest', 'UnitTesting', 'TDD', 'DevOps'],
  },
  {
    id: 'mockito',
    term: 'Mockito (Тестовые заглушки и Mock-объекты)',
    category: 'devops',
    shortDefinition: 'Java-библиотека для создания фейковых объектов зависимостей и проверки вызовов их методов.',
    fullExplanation: 'Позволяет тестировать сервисы в полной изоляции от реальной базы данных и внешних API. С помощью `when(...).thenReturn(...)` задается поведение заглушки, а через `verify(...)` проверяется факт вызова метода.',
    codeSnippet: `@Mock private UserRepository userRepository;
@InjectMocks private AuthService authService;

@Test
void shouldThrowWhenEmailExists() {
    when(userRepository.existsByEmail("test@dev.io")).thenReturn(true);
    assertThrows(ConflictException.class, () -> authService.register(request));
}`,
    relatedDayNumbers: [17],
    tags: ['Mockito', 'Mocks', 'Java', 'JUnit', 'Testing'],
  },
  {
    id: 'integration-testing',
    term: 'Интеграционное тестирование (@SpringBootTest)',
    category: 'devops',
    shortDefinition: 'Тестирование совместной работы нескольких слоев приложения с реальным Spring-контекстом и тестовой БД.',
    fullExplanation: 'Проверяет цепочку «HTTP-запрос -> Controller -> Service -> Repository -> PostgreSQL». Ловит ошибки транзакций, маппинга JPA, работы фильтров безопасности и сериализации JSON, которые невозможно выявить в unit-тестах.',
    codeSnippet: `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class AuthControllerIntegrationTest extends AbstractIntegrationTest {
    @Autowired private MockMvc mockMvc;

    @Test
    void registerFlowCreatesUserAndSetsCookie() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\\"email\\":\\"new@dev.io\\",\\"password\\":\\"123456\\"}"))
            .andExpect(status().isCreated())
            .andExpect(cookie().exists("mrdev_token"));
    }
}`,
    relatedDayNumbers: [17],
    tags: ['IntegrationTesting', 'SpringBootTest', 'MockMvc', 'Testing', 'Backend'],
  },
  {
    id: 'ci-cd',
    term: 'CI/CD (Continuous Integration & Continuous Deployment)',
    category: 'devops',
    shortDefinition: 'Автоматизированный конвейер сборки, тестирования и непрерывной доставки кода на сервер при каждом пуше.',
    fullExplanation: 'CI автоматически собирает бэкенд и фронтенд, прогоняет 100% автотестов и линтеров в изолированном контейнере GitHub Actions. Если тесты зеленые, CD пайплайн автоматически деплоит приложение на хостинг без ручных манипуляций.',
    codeSnippet: `// Правило конвейера:
// git push -> GitHub Actions -> 80 тестов фронта + 250 тестов бэка
// Тест упал -> Деплой заблокирован, уведомление разработчику
// Все тесты зеленые -> Автоматический деплой на Vercel / Render / Pages`,
    relatedDayNumbers: [3, 17],
    tags: ['CI', 'CD', 'GitHubActions', 'Automation', 'DevOps'],
  },
  {
    id: 'pii-masker',
    term: 'PII Masker (Защита персональных данных перед AI)',
    category: 'security',
    shortDefinition: 'Модуль детекции и маскирования персональных данных (email, телефоны, ИИН) перед отправкой в LLM API.',
    fullExplanation: 'Гарантирует соблюдение требований GDPR и приватности пользователей. Регулярные выражения и NLP-детекторы заменяют реальные контакты на токены `[EMAIL]` и `[PHONE]` до вызова Groq/Claude API, исключая утечку данных в сторонние нейросети.',
    codeSnippet: `String userCodeWithComments = piiMasker.mask(rawSourceCode);
// "Author: alex@mail.com, tel: +77015554433"
// -> "Author: [EMAIL], tel: [PHONE]"
LlmResponse response = llmClient.complete(userCodeWithComments);`,
    relatedDayNumbers: [17, 28],
    tags: ['PII', 'Security', 'GDPR', 'AI', 'Privacy'],
  },
  {
    id: 'bucket4j',
    term: 'Bucket4j (Token Bucket Rate Limiting)',
    category: 'security',
    shortDefinition: 'Библиотека ограничения частоты запросов для защиты API от перегрузок и abuse.',
    fullExplanation: 'Многоуровневое ограничение частоты: строгий лимит для аутентификации (10 запросов / 15 минут на IP) и AI-эндпоинтов (5 запросов / минуту). При превышении возвращается HTTP 429 Too Many Requests.',
    codeSnippet: `ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
if (!probe.isConsumed()) {
    response.setStatus(429);
    response.setHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(probe.getNanosToWaitForRefill() / 1_000_000_000));
    return;
}`,
    relatedDayNumbers: [2, 13],
    tags: ['RateLimit', 'DDoS', 'Bucket4j', 'Security', 'Middleware'],
  },
  {
    id: 'rls',
    term: 'Row-Level Security & IDOR Defense',
    category: 'security',
    shortDefinition: 'Разграничение доступа к данным на уровне строк и предотвращение Insecure Direct Object Reference.',
    fullExplanation: 'Каждый запрос извлекает аутентифицированный userId из контекста безопасности и выполняет выборки строго `WHERE user_id = :userId`. Прямая передача userId из параметров запроса запрещена.',
    codeSnippet: `Long currentUserId = SecurityUtils.getCurrentUserId();
Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(currentUserId, courseId)
    .orElseThrow(() -> new AccessDeniedException("Not enrolled"));`,
    relatedDayNumbers: [1, 2, 13],
    tags: ['RLS', 'IDOR', 'PostgreSQL', 'SpringSecurity', 'Isolation'],
  },
  {
    id: 'drip-content',
    term: 'Drip-Content (Капельный контент)',
    category: 'backend',
    shortDefinition: 'Механика открытия уроков по расписанию относительно даты записи студента на курс.',
    fullExplanation: 'Уроки открываются по формуле: `(NOW() - enrolled_at) >= ((day_number - 1) * INTERVAL \'1 day\')`. Расчет выполняется динамически в SQL без фоновых cron-задач.',
    codeSnippet: `SELECT l.*,
       (NOW() >= (e.enrolled_at + ((l.day_number - 1) * INTERVAL '1 day'))) AS is_accessible
FROM lessons l
JOIN enrollments e ON e.course_id = l.course_id
WHERE e.user_id = :userId;`,
    relatedDayNumbers: [1, 3],
    tags: ['Drip', 'LMS', 'Scheduling', 'SQL', 'PostgreSQL'],
  },
  {
    id: 'groq-llama',
    term: 'Groq AI Llama 3.3 70B Engine',
    category: 'ai',
    shortDefinition: 'Ультрабыстрый инференс языковых моделей на процессорах LPU для интерактивного AI-тьютора.',
    fullExplanation: 'AI-ассистент использует модель Llama 3.3 70B через Groq API. Системный промпт жестко заземляет ответы на текущий markdown-контент урока и стримит токены по Server-Sent Events (SSE).',
    codeSnippet: `String systemPrompt = "Ты — AI-наставник курса MrDeveloper. Отвечай строго по контексту: " + lessonMarkdown;`,
    relatedDayNumbers: [26, 28],
    tags: ['AI', 'LLM', 'Groq', 'Llama3', 'PromptEngineering'],
  },
  {
    id: 'openhtmltopdf',
    term: 'OpenHTMLtoPDF & Thymeleaf Certificates',
    category: 'backend',
    shortDefinition: 'Движок серверной генерации векторных PDF-сертификатов на основе HTML/CSS шаблонов.',
    fullExplanation: 'При 100% завершении курса бэкенд рендерит темный премиальный сертификат через Thymeleaf и компилирует его в векторный PDF-файл (PDF/A) с криптографическим UUID для онлайн-верификации.',
    codeSnippet: `PdfRendererBuilder builder = new PdfRendererBuilder();
builder.useFastMode();
builder.withHtmlContent(renderedHtml, baseUrl);
builder.toStream(outputStream);
builder.run();`,
    relatedDayNumbers: [18, 30],
    tags: ['PDF', 'Certificate', 'Thymeleaf', 'OpenHTMLtoPDF', 'Backend'],
  },
  {
    id: 'sse-streaming',
    term: 'Server-Sent Events (SSE) Streaming',
    category: 'core',
    shortDefinition: 'Протокол передачи однонаправленного потока данных от сервера к клиенту поверх HTTP.',
    fullExplanation: 'Используется для стриминга токенов ответа AI-тьютора в реальном времени. На клиенте поток читается через `ReadableStream` и декодируется `TextDecoder` без ожидания полного ответа.',
    codeSnippet: `const response = await fetch('/api/v1/ai/tutor/stream', { method: 'POST', body: JSON.stringify(payload) });
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  appendChunkToMessage(decoder.decode(value));
}`,
    relatedDayNumbers: [27, 28],
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
