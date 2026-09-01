export interface ProjectShowcase {
  id: number;
  userId: number;
  courseId?: number;
  courseTitle?: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  liveDemoUrl: string;
  githubRepoUrl: string;
  authorName: string;
  authorAvatarUrl?: string;
  techStack: string;
  featured: boolean;
  likesCount: number;
  hasLiked?: boolean;
  createdAt: string;
}

export interface CreateProjectRequest {
  courseId?: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
  liveDemoUrl: string;
  githubRepoUrl: string;
  techStack?: string;
}
