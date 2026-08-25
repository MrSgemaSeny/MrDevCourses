export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  lessonsCount?: number;
  isEnrolled?: boolean;
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  content?: string;
  youtubeUrl?: string;
  dayNumber: number;
  sortOrder: number;
  createdAt: string;
  isAccessible?: boolean;
  opensAt?: string;
  isCompleted?: boolean;
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: string;
}

export interface CourseProgressSummary {
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  enrolledAt: string;
  currentDay: number;
  completedCount: number;
  totalUnlocked: number;
  totalLessons: number;
  nextUnlockAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
}
