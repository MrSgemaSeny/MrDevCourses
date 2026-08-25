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
