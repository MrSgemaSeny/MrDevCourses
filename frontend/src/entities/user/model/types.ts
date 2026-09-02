export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
  lastActiveDate?: string;
  telegramUsername?: string;
  telegramChatId?: number;
  emailNotificationsEnabled?: boolean;
  telegramNotificationsEnabled?: boolean;
  githubUsername?: string;
  bio?: string;
  goal?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  enrolledCoursesCount: number;
  completedLessonsCount: number;
  certificatesCount: number;
  timeSpentMinutes?: number;
  completedProjectsCount?: number;
}

export interface UpdateUserProfilePayload {
  name?: string;
  avatarUrl?: string;
  telegramUsername?: string;
  githubUsername?: string;
  bio?: string;
  goal?: string;
}
