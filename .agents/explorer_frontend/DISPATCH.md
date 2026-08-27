# Dispatch to Frontend Explorer

## 2026-08-27T04:43:52Z
Read ORIGINAL_REQUEST.md at c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\ORIGINAL_REQUEST.md.
Also read c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\AGENTS.md.

Your mission:
1. Thoroughly explore the frontend codebase in c:\Users\murat\IdeaProjects\new_world\MrDevCourses\frontend.
2. Analyze package.json (dependencies, scripts, test runner, lucide-react, styling).
3. Analyze FSD layers: app, pages, widgets, features, entities, shared.
4. Analyze LessonViewer, MarkdownViewer, CountdownTimer, VisualRoadmap, Header, AdminLayout, routing.
5. Identify exact implementation requirements, existing gaps, and UI/UX design for:
   - R2: Contextual Navigation Engine & Quick-Nav Drawer (slide-over drawer with 3 tabs: GlossaryView with deep-links, ProgressView, RoadmapView; in-lesson clickable term cards; NO unmounting of video player / iframe).
   - R3: AI Lesson Tutor frontend (slide-in chat panel, streaming / markdown message rendering, prompt input, grounding context from current lesson).
   - R4: Certificate verification page / modal updates (`/certificates/verify/:uuid`, dark/gold badge, download trigger).
   - R5: Admin Analytics & Retention Dashboard (Funnel charts, KPI metric cards, retention table in AdminLayout).
6. Write a comprehensive, structured exploration report to c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\explorer_frontend\handoff.md.
7. Send a message to parent when complete.
Do NOT modify any source code files.
