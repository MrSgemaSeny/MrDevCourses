export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
  currentStreak?: number;
  longestStreak?: number;
  lastActiveDate?: string;
  createdAt: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  slug: string;
  active: boolean;
  createdAt: string;
  enrolled?: boolean;
  enrolledAt?: string;
  totalLessons?: number;
}

export interface LessonSummary {
  id: number;
  courseId: number;
  title: string;
  dayNumber: number;
  sortOrder: number;
  accessible: boolean;
  opensAt: string;
  completed: boolean;
  completedAt?: string;
}

export interface LessonDetail {
  id: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  title: string;
  content?: string;
  youtubeUrl?: string;
  dayNumber: number;
  sortOrder: number;
  accessible: boolean;
  opensAt: string;
  completed: boolean;
  completedAt?: string;
  prevLessonId?: number;
  nextLessonId?: number;
}

export interface Enrollment {
  id: number;
  userId: number;
  userEmail: string;
  userName?: string;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  enrolledAt: string;
}

export interface CourseProgress {
  courseId: number;
  courseTitle: string;
  courseDescription?: string;
  courseSlug: string;
  enrolledAt: string;
  currentDay: number;
  completedCount: number;
  totalUnlocked: number;
  totalLessons: number;
  progressPercentage: number;
  nextUnlockAt?: string;
}

export interface Student {
  id: number;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  enrollments: Enrollment[];
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

export type GlossaryCategory = 'core' | 'backend' | 'frontend' | 'security' | 'ai' | 'devops';

export interface GlossaryTerm {
  id: string;
  term: string;
  category: GlossaryCategory;
  shortDefinition: string;
  fullExplanation: string;
  codeSnippet?: string;
  relatedDayNumbers?: number[];
  tags: string[];
}
export interface Certificate {
  id: number;
  certificateCode: string;
  userId: number;
  userName: string;
  userEmail: string;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  issuedAt: string;
  verificationUrl: string;
}

export interface AiTutorRequest {
  courseId: number;
  lessonId: number;
  question: string;
}

export interface AiTutorResponse {
  answer: string;
  lessonTitle: string;
  suggestedFollowUps: string[];
  fallbackMode: boolean;
}

export interface LessonFunnelItem {
  lessonId: number;
  dayNumber: number;
  title: string;
  completedCount: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface AdminAnalytics {
  totalStudents: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalCertificates: number;
  averageStreak: number;
  overallCompletionRate: number;
  funnel: LessonFunnelItem[];
}
