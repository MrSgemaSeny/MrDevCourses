export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export interface UserDto {
  id: number;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}
