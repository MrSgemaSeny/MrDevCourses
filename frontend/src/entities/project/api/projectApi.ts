import { apiClient } from '@/shared/api/base';
import { ProjectShowcase, CreateProjectRequest } from '../model/types';

export const projectApi = {
  getAllProjects: async (): Promise<ProjectShowcase[]> => {
    const res = await apiClient.get<{ success: boolean; data: ProjectShowcase[] }>('/v1/projects');
    return res.data.data;
  },

  createProject: async (request: CreateProjectRequest): Promise<ProjectShowcase> => {
    const res = await apiClient.post<{ success: boolean; data: ProjectShowcase }>('/v1/projects', request);
    return res.data.data;
  },

  likeProject: async (projectId: number): Promise<void> => {
    await apiClient.post(`/v1/projects/${projectId}/like`);
  },
};
