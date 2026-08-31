export const ROUTES = {
  HOME: '/',
  COURSES: '/courses',
  COURSE_DETAIL: (slug: string) => `/courses/${slug}`,
  LESSON: (courseId: number | string, lessonId: number | string) => `/courses/${courseId}/lessons/${lessonId}`,
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  LOGIN: '/login',
  ADMIN: '/admin',
  CERTIFICATES_VERIFY: '/certificates/verify',
  AUTH_CALLBACK: '/auth/callback',
} as const;
