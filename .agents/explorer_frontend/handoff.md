# Frontend Architecture Exploration Report — MrDevCourses

**Exploration Area**: Frontend LMS Platform (`c:\Users\murat\IdeaProjects\new_world\MrDevCourses\frontend`)  
**Target Capabilities**: R2 (Quick-Nav Drawer & Contextual Navigation), R3 (AI Lesson Tutor Frontend), R4 (Certificate Verification & Download), R5 (Admin Analytics & Retention Dashboard)  
**Author**: Frontend Architecture Explorer  
**Date**: 2026-08-27  

---

## 1. Observation

### 1.1 Project Baseline & Stack Configuration
- **Root Directory**: `c:\Users\murat\IdeaProjects\new_world\MrDevCourses\frontend`
- **Core Dependencies (`package.json`)**:
  - `react`: `^19.0.0`, `react-dom`: `^19.0.0`
  - `react-router-dom`: `^7.1.5` (using `createBrowserRouter` in `app/router/index.tsx`)
  - `@tanstack/react-query`: `^5.66.0` (React Query v5)
  - `axios`: `^1.7.9` (base client configured in `shared/api/base.ts` with credentials support)
  - `tailwindcss`: `^4.0.0` with `@tailwindcss/vite: ^4.0.0` (modern CSS theme defined in `index.css`)
  - `lucide-react`: `^0.475.0` (standard SVG icons suite)
  - `sonner`: `^2.0.1` (toast notification engine)
  - `clsx`: `^2.1.1`, `tailwind-merge`: `^3.0.1`
- **Testing & Tooling**:
  - `vitest`: `^3.0.5`, `@testing-library/react`: `^16.2.0`, `jsdom`: `^26.0.0`
  - Current Vitest run: **8 test suites, 21 tests passing (100% green)**
  - Current Production Build (`tsc -b && vite build`): **0 TypeScript errors, 0 lint warnings, gzip bundle 137.65 kB total chunks**

### 1.2 Existing FSD Architecture & Component Inventory
The frontend strictly complies with Feature-Sliced Design (FSD):
- **`app/`**:
  - `App.tsx` (lines 1–23): Root public layout with `<Header />`, `<Outlet />`, and footer.
  - `layout/StudentLayout.tsx` (lines 1–118): Fixed sidebar (`w-60`, `#0d1117`), user avatar, streak badge, navigation links (`/dashboard`, `/courses`), and logout button.
  - `layout/AdminLayout.tsx` (lines 1–133): Dedicated admin sidebar (`w-60`), admin badge, links (`/admin`, `/admin/courses`, `/admin/students`).
  - `providers/AuthProvider.tsx`, `providers/QueryProvider.tsx`.
  - `router/index.tsx` (lines 1–79): Lazy loaded routes with `Suspense` and `ProtectedRoute` guards.
- **`pages/`**:
  - `pages/landing/LandingPage.tsx`: Public marketing landing page.
  - `pages/LoginPage.tsx`, `pages/AuthCallbackPage.tsx`.
  - `pages/courses/CoursesPage.tsx`: Course catalog.
  - `pages/course/CourseDetailPage.tsx` (lines 1–183): Course hero, enrollment mutation, syllabus roadmap, and certificate trigger.
  - `pages/lesson/LessonPage.tsx` (lines 1–229): Main lesson learning view with YouTube iframe (`lines 108–117`), Markdown viewer (`line 146`), completion trigger (`lines 130–142`), and lesson syllabus sidebar (`lines 179–224`).
  - `pages/dashboard/DashboardPage.tsx` (lines 1–160): Student dashboard with streak counter (`lines 43–60`), progress list, and countdown timers.
  - `pages/admin/AdminPage.tsx` (lines 1–748): Tabbed admin management (Courses, Lessons, Students).
- **`widgets/`**:
  - `widgets/header/Header.tsx` (lines 1–88): Sticky top navigation with branding, links, auth state.
  - `widgets/roadmap/VisualRoadmap.tsx` (lines 1–142): Connected node roadmap with status badges (Completed, Current, Locked with countdown timer).
  - `widgets/certificate/CertificateModal.tsx` (lines 1–116): Certificate modal dialog with print/PDF trigger.
- **`features/`**:
  - `features/auth/`: Google OAuth2 and Email/Password authentication forms and hooks.
- **`entities/`**:
  - `entities/user/`: User types and auth APIs.
  - `entities/course/`: Course APIs (`/api/v1/courses`).
  - `entities/lesson/`: Lesson APIs (`/api/v1/courses/{courseId}/lessons`).
  - `entities/progress/`: Progress APIs (`/api/v1/progress`).
  - `entities/admin/`: Admin course/lesson/student APIs.
- **`shared/`**:
  - `shared/ui/MarkdownViewer.tsx` (lines 1–193): Custom markdown renderer handling headings, lists, callout alert blocks (`[!NOTE]`, `[!TIP]`, `[!WARNING]`, `[!IMPORTANT]`), code blocks with copy-to-clipboard.
  - `shared/ui/CountdownTimer.tsx` (lines 1–88): Real-time countdown timer computing days/hours/minutes/seconds.
  - `shared/api/base.ts`: Axios client.
  - `shared/types/index.ts`: TypeScript contracts for User, Course, Lesson, Enrollment, Progress, ApiResponse.

### 1.3 Observations on Target Requirement Gaps
1. **R2 (Quick-Nav Drawer & Contextual Engine)**:
   - `navigation-architecture.md` documents the 3-engine navigation pattern from JF-1C.
   - Currently, no slide-over drawer exists in `widgets/`. When on `LessonPage`, there is no slide-over panel to view glossary terms, progress, or roadmap without navigating away.
   - `LessonPage` does not have contextual term chips or connection to a glossary store.
   - YouTube iframe player in `LessonPage.tsx:109-117` needs an overlay drawer structure so that drawer open/close operations do not trigger parent layout unmounts.
2. **R3 (AI Lesson Tutor Frontend)**:
   - Donor implementation in `MeDev/frontend/src/features/ai-assistant/ui/AiChatWidget.tsx` demonstrates SSE stream reading with `fetch` + `ReadableStream` + `TextDecoder` + `data:` parsing, prompt suggestions, and rate limit handling (HTTP 429).
   - In MrDevCourses, there is currently no AI chat widget, no AI state store, and no AI API client for lesson tutoring grounded in current lesson markdown.
3. **R4 (Certificate Verification Page & Download)**:
   - `CertificateModal.tsx:19` uses a placeholder random code (`'MRDEV-' + Math.random()`) and `window.print()`.
   - There is no public verification route `/certificates/verify/:uuid` in `app/router/index.tsx`.
   - There is no dedicated `CertificateVerifyPage.tsx` page to display the verified certificate badge with gold/dark styling and trigger the backend PDF binary download (`GET /api/v1/certificates/{uuid}/download` or `/api/v1/courses/{courseId}/certificate/download`).
4. **R5 (Admin Analytics & Retention Dashboard)**:
   - Donor implementation in `Valeur/frontend/src/features/CompanyAnalytics/ui/DashboardCharts.tsx` demonstrates funnel conversion stages, drop-off rates, time in stages, and comparison tables.
   - `AdminPage.tsx` currently only has 3 tabs: Courses, Lessons, Students. It lacks an Analytics & Retention tab/widget to visualize completion funnels, drop-off percentages per day number, active streak distributions, and average lesson engagement times.

---

## 2. Logic Chain

### 2.1 R2: Contextual Navigation Engine & Quick-Nav Drawer Architecture
1. **Preserving Video Playback**:
   - In `LessonPage.tsx`, the YouTube `<iframe>` re-initializes and stops playing if its component tree is unmounted or if the browser route changes.
   - Therefore, the Quick-Nav Drawer must be rendered as a **fixed slide-over overlay** (`fixed inset-y-0 right-0 z-50 transform transition-transform`) inside the page/layout DOM without changing React Router URL or unmounting `LessonPage`.
2. **Quick-Nav Context & State**:
   - A lightweight React Context (`QuickNavContext`) will provide `isOpen: boolean`, `activeTab: 'glossary' | 'progress' | 'roadmap'`, `selectedTerm?: string`, `openQuickNav(tab, term)`, `closeQuickNav()`.
3. **Three Drawer Tab Views**:
   - **`GlossaryView`**: Domain-specific glossary terms (`src/shared/data/glossary.json` or `entities/glossary`). Features real-time search input, category filters (Frontend, Backend, DevOps, Security, AI), term definitions, code snippets, and related lesson day badges. Deep-linking / auto-filtering activates when `selectedTerm` is passed from the lesson.
   - **`ProgressView`**: Reuses data from `useQuery(['progress', courseId])`. Renders circular/bar progress, completed lesson counter (`completedCount / totalLessons`), current streak flame badge, and next lesson unlock countdown (`CountdownTimer`).
   - **`RoadmapView`**: Embeds or adapts `VisualRoadmap` inside the drawer, allowing students to inspect all course milestones, locked days, and upcoming topics without leaving their current video/markdown.
4. **In-Lesson Contextual Term Cards**:
   - Component `LessonContextPanel.tsx` placed below the lesson content in `LessonPage.tsx`.
   - Reads `lesson.glossaryTerms` or parses `[!TERM: name]` callouts from markdown.
   - Renders interactive term chips (e.g. `[# JWT]`, `[# Flyway]`, `[# RLS]`, `[# Drip-Content]`).
   - Clicking a chip executes `openQuickNav('glossary', 'JWT')`, smoothly sliding open the drawer with the glossary pre-filtered and focused on that term.

### 2.2 R3: AI Lesson Tutor Frontend Architecture
1. **Design & Placement**:
   - Placed in `src/features/ai-tutor/ui/AiLessonTutor.tsx` and triggered via a floating action button on `LessonPage` (or in the lesson header toolbar).
   - Styled strictly in Envie dark theme: `#0d1117` header, `#161b22` chat container, `#21262d` borders, `#fafafa` text.
2. **Grounding Context Protocol**:
   - When the student sends a question, the request payload includes:
     ```json
     {
       "courseId": 1,
       "lessonId": 2,
       "prompt": "Как работает Bucket4j фильтр?",
       "lessonTitle": "День 2: Token Bucket Rate Limiting",
       "history": [ ...last 6 messages... ]
     }
     ```
   - This ensures the backend Groq AI engine grounds its answers strictly on the current lesson content.
3. **Streaming & Markdown Rendering**:
   - Supports both SSE Streaming (`fetch` with `ReadableStream` & `TextDecoder`) and standard JSON response.
   - Assistant responses render formatted markdown: syntax-highlighted code blocks with copy buttons, bullet points, and callout tips.
   - Pre-configured quick-prompt suggestions:
     - "Объясни код из урока простыми словами"
     - "Приведи аналогию из реальной жизни"
     - "Проверь моё понимание (задай вопрос)"
     - "В чем разница между X и Y в этом уроке?"
4. **Rate Limit Throttling (HTTP 429)**:
   - When receiving HTTP 429 (5 requests/minute per user limit), the UI displays a clean amber warning card with countdown timer instead of a generic crash, informing the student when their token bucket refills.

### 2.3 R4: Certificate Verification Page & Download Architecture
1. **Public Route**:
   - Add `{ path: 'certificates/verify/:uuid', element: wrap(<CertificateVerifyPage />) }` under public routes in `src/app/router/index.tsx`.
2. **Verification View (`CertificateVerifyPage.tsx`)**:
   - Fetches certificate metadata via `GET /api/v1/certificates/verify/{uuid}`.
   - If valid: Renders official verification badge with gold/dark border (`#e2b340` / `#09090b`), emerald checkmark icon, student name, course title, completion timestamp in UTC formatted to locale, and cryptographic verification hash.
   - If invalid/not found: Renders an error shield indicating the certificate UUID is unverified or revoked.
   - Direct PDF Download button: Initiates binary download from `/api/v1/certificates/{uuid}/download` (or `/api/v1/courses/{courseId}/certificate/download`) with Content-Disposition `attachment; filename="certificate-{uuid}.pdf"`.
3. **CertificateModal Integration**:
   - `CertificateModal.tsx` receives real `certificateUuid` from course progress/certificate API.
   - Includes a direct hyperlink "Верифицировать онлайн: `/certificates/verify/{uuid}`" and "Скачать PDF (векторный)" button.

### 2.4 R5: Admin Analytics & Retention Dashboard Architecture
1. **Analytics Data Ingestion**:
   - API entity: `src/entities/admin/api/adminAnalyticsApi.ts` with `GET /api/v1/admin/analytics/courses/{courseId}` and `GET /api/v1/admin/analytics/overview`.
2. **Chart Strategy (Dependency-Free Pure SVG vs Recharts)**:
   - MrDevCourses does not currently have `recharts` installed.
   - Pure React + Tailwind + SVG components provide:
     - Zero external dependencies (no bundle bloat).
     - 100% Vitest / JSDOM test compatibility with 0 mocking issues.
     - Pixel-perfect dark theme aesthetics (`#0d1117`, `#161b22`, `#30363d`, `#10b981`, `#6366f1`, `#e2b340`).
3. **Dashboard Components**:
   - **KPI Metric Grid**: Total enrolled students, overall 100% completion rate, active study streak average, drop-off rate between Day 1 and final Day.
   - **Course Funnel Chart (`CourseFunnelChart.tsx`)**: Step-by-step visual funnel for Day 1 -> Day 2 -> ... -> Day N. Shows active students, completion percentage, and drop-off percentage at each milestone.
   - **Streak Distribution Bar Chart (`StreakDistributionChart.tsx`)**: Distribution of active streaks (1–2 days, 3–5 days, 6–10 days, 10+ days).
   - **Lesson Retention & Engagement Table (`LessonRetentionTable.tsx`)**: Tabular breakdown listing Day number, lesson title, total completions, average time spent, drop-off rate with color-coded severity badges.
4. **AdminPage Integration**:
   - Add a 4th tab in `AdminPage.tsx`: `analytics` ("Аналитика и воронка").

---

## 3. Caveats

1. **Video Player Preservation During Navigation**:
   - Quick-Nav Drawer and AI Chat Drawer MUST be implemented as slide-overs (`fixed` position, CSS `transform: translateX` animation) inside the active page view. Changing the browser route (e.g. `/courses/1/lessons/2` to `/glossary`) will unmount the YouTube `<iframe>`. In-lesson drawer access solves this completely.
2. **Rate Limit Handling on AI Chat**:
   - Groq AI endpoints are rate-limited to 5 req/min per user. Frontend must handle HTTP 429 by extracting the `Retry-After` header or applying a default 60s cooldown timer so students understand the limit.
3. **Certificate UUID Integrity**:
   - Certificate UUIDs must be retrieved from backend `CertificateResponse` DTO rather than generated on the client. For legacy completed courses without pre-existing certificates, calling the download or complete endpoint will automatically generate and persist the unique UUID in PostgreSQL.
4. **Bundle Size & Chunking**:
   - All newly created pages (`CertificateVerifyPage`) must be lazy-loaded in `router/index.tsx` via `React.lazy()` to maintain the lean 137 kB initial gzip bundle size.

---

## 4. Conclusion & Implementation Blueprints

### 4.1 File Hierarchy for New Modules

```
frontend/src/
├── app/
│   └── router/
│       └── index.tsx                       # Add /certificates/verify/:uuid route
├── entities/
│   ├── admin/
│   │   └── api/
│   │       └── adminAnalyticsApi.ts        # Admin analytics endpoints
│   ├── ai/
│   │   └── api/
│   │       └── aiTutorApi.ts               # AI Tutor chat & streaming API
│   ├── certificate/
│   │   └── api/
│   │       └── certificateApi.ts           # Verification & PDF download API
│   └── glossary/
│       ├── model/
│       │   └── types.ts                    # Glossary term types
│       └── data/
│           └── glossaryData.ts             # Domain glossary knowledge base
├── features/
│   ├── ai-tutor/
│   │   ├── model/
│   │   │   └── useAiTutor.ts               # Chat state, SSE streaming, history
│   │   └── ui/
│   │       ├── AiLessonTutor.tsx           # Slide-in AI chat panel
│   │       └── AiChatBubble.tsx            # Formatted message bubble
│   └── admin-analytics/
│       ├── ui/
│       │   ├── AdminAnalyticsDashboard.tsx # Overview dashboard container
│       │   ├── CourseFunnelChart.tsx       # SVG Funnel visualization
│       │   ├── StreakDistributionChart.tsx # SVG Streak distribution chart
│       │   └── LessonRetentionTable.tsx    # Retention & drop-off table
├── widgets/
│   ├── quick-nav/
│   │   ├── model/
│   │   │   └── QuickNavContext.tsx         # Quick-Nav context & provider
│   │   └── ui/
│   │       ├── QuickNavDrawer.tsx          # 3-Tab slide-over drawer
│   │       ├── GlossaryView.tsx            # Searchable glossary tab
│   │       ├── ProgressView.tsx            # Real-time progress tab
│   │       └── RoadmapView.tsx             # Interactive roadmap tab
│   ├── lesson/
│   │   └── ui/
│   │       └── LessonContextPanel.tsx      # In-lesson clickable term cards
│   └── certificate/
│       └── CertificateModal.tsx            # Updated with real UUID & PDF download
├── pages/
│   ├── certificate/
│   │   └── CertificateVerifyPage.tsx       # Public certificate verification page
│   └── admin/
│       └── AdminPage.tsx                   # Add Analytics & Retention tab
└── shared/
    └── types/
        └── index.ts                        # Update with Analytics & AI DTO contracts
```

### 4.2 Detailed TypeScript Type Contracts

```typescript
// src/shared/types/index.ts additions

// ── R2: Glossary Contracts ───────────────────────────────────────────
export interface GlossaryTerm {
  id: string;
  term: string;
  category: 'core' | 'backend' | 'frontend' | 'security' | 'ai' | 'devops';
  shortDefinition: string;
  fullExplanation: string;
  codeSnippet?: string;
  relatedDayNumbers?: number[];
  tags: string[];
}

// ── R3: AI Tutor Contracts ───────────────────────────────────────────
export interface AiTutorMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AiTutorRequest {
  courseId: number;
  lessonId: number;
  lessonTitle?: string;
  prompt: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AiTutorResponse {
  message: string;
  groundedLessonId: number;
  tokensUsed?: number;
  remainingQuota?: number;
}

// ── R4: Certificate Contracts ────────────────────────────────────────
export interface CertificateVerification {
  uuid: string;
  studentName: string;
  studentEmail?: string;
  courseTitle: string;
  courseSlug: string;
  issuedAt: string;
  valid: boolean;
  completionDays?: number;
  certificateCode: string;
}

// ── R5: Admin Analytics Contracts ────────────────────────────────────
export interface FunnelStageData {
  dayNumber: number;
  lessonTitle: string;
  enrolledCount: number;
  completedCount: number;
  dropOffCount: number;
  dropOffRate: number;        // percentage e.g. 12.5
  conversionRate: number;     // percentage e.g. 87.5
}

export interface StreakDistributionRange {
  range: string;              // "1-2 дн", "3-5 дн", "6-10 дн", "11+ дн"
  count: number;
  percentage: number;
}

export interface LessonEngagementStat {
  lessonId: number;
  dayNumber: number;
  title: string;
  completions: number;
  avgTimeMinutes: number;
  dropOffRate: number;
}

export interface AdminAnalyticsSummary {
  courseId: number;
  courseTitle: string;
  totalEnrolledStudents: number;
  activeStudents: number;
  graduatedStudents: number;
  overallCompletionRate: number;
  avgDaysToGraduate: number;
  activeStreaksCount: number;
  streakDistribution: StreakDistributionRange[];
  funnelStages: FunnelStageData[];
  lessonEngagement: LessonEngagementStat[];
}
```

### 4.3 Component Architectural Specifications

#### 1. QuickNavDrawer (`src/widgets/quick-nav/ui/QuickNavDrawer.tsx`)
- **Overlay Pattern**: Fixed at `top-0 right-0 h-full w-full sm:w-[480px] bg-[#0d1117] border-l border-[#21262d] z-50`.
- **Transitions**: Smooth slide-in via `transform transition-transform duration-300 ease-in-out` (`translate-x-0` when open, `translate-x-full` when closed).
- **Tabs**:
  - `Glossary`: Search bar with instant filtering, category pills, accordion term definitions with syntax-highlighted code.
  - `Progress`: Radial progress indicator, streak flame count, breakdown of completed lessons, and next day countdown timer.
  - `Roadmap`: Compact connected node milestone list with lock/unlock status indicators.
- **Backdrop**: Semi-transparent dark overlay (`bg-black/60 backdrop-blur-sm`) with click-outside to close.

#### 2. AiLessonTutor (`src/features/ai-tutor/ui/AiLessonTutor.tsx`)
- **Trigger**: Sleek floating pill button on `LessonPage` (`bg-[#161b22] border border-[#30363d] hover:border-emerald-500/50`).
- **Drawer**: Slide-in drawer or panel (`w-full sm:w-[460px] h-full sm:h-[620px]`).
- **Header**: Bot avatar, Llama 3.3 70B indicator with pulsing green dot, current lesson context chip, clear chat button, close button.
- **Message Feed**: Auto-scrolling container with pre-wrap markdown formatting, copyable code snippets, and typing loader.
- **Input Area**: Multiline auto-expanding textarea, quick prompt buttons, submit on Enter.

#### 3. CertificateVerifyPage (`src/pages/certificate/CertificateVerifyPage.tsx`)
- **Aesthetic**: Premium dark & gold theme (`#09090b` canvas, `#161b22` certificate card, gold badge border `#e2b340/60`, emerald verified checkmark).
- **Public Access**: Zero authentication requirement.
- **Verification Details**: Verified student name, course title, issuance date, UUID hash badge.
- **PDF Download**: Direct trigger for vector PDF generation from backend.

#### 4. AdminAnalyticsDashboard (`src/features/admin-analytics/ui/AdminAnalyticsDashboard.tsx`)
- **Metric Cards**: 4 summary cards (`Total Students`, `Graduation Rate`, `Active Streaks`, `Avg Time to Complete`).
- **Funnel Visualization**: Pure SVG interactive funnel steps with step conversions and drop-off indicators (`TrendingDown` in red/amber).
- **Streak Distribution**: CSS/SVG bar chart showing user engagement cohorts.
- **Retention Table**: Sortable table identifying potential learning bottlenecks.

---

## 5. Verification Method

To verify the implementation of all frontend components, execute the following protocol:

### 5.1 Automated Unit & Integration Tests
Run Vitest across the newly created test suites:
```bash
cd frontend
npm test -- --run
```
**Test Suites to Implement**:
1. `src/widgets/quick-nav/ui/QuickNavDrawer.test.tsx`:
   - Validates drawer open/close without unmounting parent components.
   - Validates switching between Glossary, Progress, and Roadmap tabs.
   - Validates term search filter and deep-linking from term chip clicks.
2. `src/features/ai-tutor/ui/AiLessonTutor.test.tsx`:
   - Validates sending user messages with grounding context (`courseId`, `lessonId`).
   - Validates markdown response rendering and code copy button.
   - Validates HTTP 429 rate limit error state and retry handling.
3. `src/pages/certificate/CertificateVerifyPage.test.tsx`:
   - Validates rendering verified certificate data for valid UUID.
   - Validates invalid certificate state for non-existent UUID.
   - Validates PDF download trigger.
4. `src/features/admin-analytics/ui/AdminAnalyticsDashboard.test.tsx`:
   - Validates funnel calculation percentages and drop-off values.
   - Validates streak distribution rendering.
   - Validates lesson engagement table sorting.

### 5.2 Production Build Verification
Verify TypeScript typing and production bundling:
```bash
cd frontend
npm run build
```
**Criteria**:
- 0 TypeScript compilation errors (`tsc -b`).
- 0 Rollup / Vite chunking warnings.
- Total gzip bundle size remains under 200 kB.

### 5.3 Manual Video Playback & Interaction Checklist
1. Open `http://localhost:5173/courses/1/lessons/1`.
2. Start YouTube video playback.
3. Click "Не понял термин? [# JWT]" or open Quick-Nav Drawer -> verify drawer slides in smoothly, video continues playing uninterrupted without reload/reset.
4. Open AI Tutor chat, ask a question -> verify streaming response arrives without stuttering video playback.
5. Navigate to `/certificates/verify/123e4567-e89b-12d3-a456-426614174000` -> verify gold badge renders and PDF download initiates.
6. Open `/admin` -> switch to "Аналитика" tab -> verify funnel charts, KPI metric cards, and retention table render properly in dark theme.
