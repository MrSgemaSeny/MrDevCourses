import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from '../App';
import { StudentLayout } from '../layout/StudentLayout';
import { AdminLayout } from '../layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]" data-testid="page-loader">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-[#27272a] border-t-[#fafafa] rounded-full animate-spin" />
      <span className="text-xs text-zinc-500 font-mono">Загрузка...</span>
    </div>
  </div>
);

// Lazy Loaded Pages
const LandingPage = React.lazy(() => import('@/pages/landing/LandingPage').then((m) => ({ default: m.LandingPage })));
const CoursesPage = React.lazy(() => import('@/pages/courses/CoursesPage').then((m) => ({ default: m.CoursesPage })));
const CourseDetailPage = React.lazy(() => import('@/pages/course/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })));
const LessonPage = React.lazy(() => import('@/pages/lesson/LessonPage').then((m) => ({ default: m.LessonPage })));
const DashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AdminPage = React.lazy(() => import('@/pages/admin/AdminPage').then((m) => ({ default: m.AdminPage })));
const LoginPage = React.lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const AuthCallbackPage = React.lazy(() => import('@/pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })));
const CertificateVerifyPage = React.lazy(() => import('@/pages/certificate/CertificateVerifyPage').then((m) => ({ default: m.CertificateVerifyPage })));

const wrap = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  // ── Public layout (Header + Footer) ──────────────────────────────
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: wrap(<LandingPage />) },
      { path: 'auth', element: wrap(<LoginPage />) },
      { path: 'login', element: wrap(<LoginPage />) },
      { path: 'auth/callback', element: wrap(<AuthCallbackPage />) },
      { path: 'courses', element: wrap(<CoursesPage />) },
      { path: 'courses/:slug', element: wrap(<CourseDetailPage />) },
      { path: 'certificates/verify/:code', element: wrap(<CertificateVerifyPage />) },
    ],
  },

  // ── Student layout (Sidebar) ──────────────────────────────────────
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: wrap(<DashboardPage />) },
      {
        path: 'courses/:courseId/lessons/:lessonId',
        element: wrap(<LessonPage />),
      },
    ],
  },

  // ── Admin layout (Sidebar) ────────────────────────────────────────
  {
    path: '/',
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'admin', element: wrap(<AdminPage />) },
    ],
  },

  // ── Fallback ──────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
]);
