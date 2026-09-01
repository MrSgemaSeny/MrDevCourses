import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/entities/project/api/projectApi';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';
import { AddProjectModal } from '@/features/project-showcase/ui/AddProjectModal';
import {
  ExternalLink,
  Github,
  Heart,
  Plus,
  Rocket,
  Star,
  Sparkles,
  Layers,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'featured' | 'popular'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.getAllProjects,
  });

  const likeMutation = useMutation({
    mutationFn: (projectId: number) => projectApi.likeProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const filteredProjects = projects.filter((p) => {
    if (filter === 'featured') return p.featured;
    return true;
  }).sort((a, b) => {
    if (filter === 'popular') return b.likesCount - a.likesCount;
    return 0;
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 75% Main Column aligned to left */}
      <div className="w-full lg:w-[75%] max-w-[1080px] space-y-8">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-sm bg-[#0e0e11] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono uppercase tracking-wider font-bold">
                <Rocket className="w-3.5 h-3.5 text-zinc-400" />
                <span>Стена проектов выпускников</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Работающие веб-сервисы студентов
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Каждый проект в этой галерее написан с нуля и задеплоен онлайн студентами MrDevCourses за 5 дней обучения вайбкодингу.
              </p>
            </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-sm bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto shrink-0 shadow-lg shadow-black/40"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Добавить свой проект</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-black font-semibold'
                : 'text-zinc-400 hover:text-white bg-[#0e0e11] border border-white/5'
            }`}
          >
            Все проекты ({projects.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('featured')}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
              filter === 'featured'
                ? 'bg-white text-black font-semibold'
                : 'text-zinc-400 hover:text-white bg-[#0e0e11] border border-white/5'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Избранные</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('popular')}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
              filter === 'popular'
                ? 'bg-white text-black font-semibold'
                : 'text-zinc-400 hover:text-white bg-[#0e0e11] border border-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>Популярные</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-24 text-zinc-500 text-xs font-mono">Загрузка проектов...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-sm bg-[#0e0e11] border border-white/5 space-y-3">
          <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">В этой категории пока нет проектов</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Завершите 5-й день курса и станьте первым, кто опубликует свой проект на стене выпускников!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-sm bg-[#0e0e11] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between overflow-hidden group shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <div className="p-5 space-y-3">
                {/* Author & Badge Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {project.authorAvatarUrl ? (
                      <img
                        src={project.authorAvatarUrl}
                        alt={project.authorName}
                        className="w-6 h-6 rounded-full border border-white/10"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                        {project.authorName.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-zinc-300">{project.authorName}</span>
                  </div>

                  {project.featured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950/60 border border-amber-800/60 text-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>TOP</span>
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tech Stack */}
                {project.techStack && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.techStack.split(',').map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0a0a0c] border border-white/5 text-zinc-400"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-[#0a0a0c] border-t border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-sm bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href={project.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-sm text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    title="Исходный код на GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>

                {/* Like Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      navigate(ROUTES.LOGIN);
                      return;
                    }
                    likeMutation.mutate(project.id);
                  }}
                  className={`flex items-center gap-1.5 text-xs transition-colors px-2 py-1 rounded cursor-pointer ${
                    project.hasLiked
                      ? 'text-rose-400 bg-rose-950/40 border border-rose-800/60 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                      : 'text-zinc-400 hover:text-rose-400 bg-white/5 hover:bg-white/10'
                  }`}
                  aria-label={project.hasLiked ? 'Убрать лайк' : 'Поставить лайк'}
                >
                  <Heart className={`w-3.5 h-3.5 ${project.hasLiked ? 'fill-rose-400 text-rose-400' : 'fill-none text-zinc-400'}`} />
                  <span className="font-mono">{project.likesCount}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      </div>
    </div>
  );
};
