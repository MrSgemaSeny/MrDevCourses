import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from '../App';
import { LandingPage } from '@/pages/landing/LandingPage';
import { CoursesPage } from '@/pages/courses/CoursesPage';
import { CourseDetailPage } from '@/pages/course/CourseDetailPage';
import { LessonPage } from '@/pages/lesson/LessonPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { LoginPage } from '@/pages/LoginPage';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'auth',
        element: <LoginPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'auth/callback',
        element: <AuthCallbackPage />,
      },
      {
        path: 'courses',
        element: <CoursesPage />,
      },
      {
        path: 'courses/:slug',
        element: <CourseDetailPage />,
      },
      {
        path: 'courses/:courseId/lessons/:lessonId',
        element: (
          <ProtectedRoute>
            <LessonPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute adminOnly>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
