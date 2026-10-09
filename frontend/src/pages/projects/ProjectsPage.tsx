import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '@/entities/project/api/projectApi';
import { DEFAULT_STUDENT_PROJECTS } from '@/entities/project/model/defaultProjects';
import { AddProjectModal } from '@/features/project-showcase/ui/AddProjectModal';
import {
  ExternalLink,
  Github,
  Plus,
  Rocket,
  Layers,
} from 'lucide-react';

const getDomain = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const getGithubHandle = (url: string, authorName: string): string => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length > 0) return `@${parts[0]}`;
  } catch {
    // fallback
  }
  return authorName;
};

export const ProjectsPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: apiProjects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.getAllProjects,
  });

  const projects = apiProjects && apiProjects.length > 0 ? apiProjects : DEFAULT_STUDENT_PROJECTS;

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

        {/* Projects Count Subheader */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Все проекты ({projects.length})
          </span>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-24 text-zinc-500 text-xs font-mono">Загрузка проектов...</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center rounded-sm bg-[#0e0e11] border border-white/5 space-y-3">
            <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">В этой категории пока нет проектов</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Завершите 5-й день курса и станьте первым, кто опубликует свой проект на стене выпускников!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-sm bg-[#0e0e11] border border-white/5 hover:border-white/15 transition-all duration-150 flex flex-col justify-between overflow-hidden group shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <div className="p-6 space-y-4">
                  {/* Author Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {project.authorAvatarUrl ? (
                        <img
                          src={project.authorAvatarUrl}
                          alt={project.authorName}
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="w-8 h-8 rounded-full border border-white/10 bg-zinc-900 object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
                          {project.authorName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-semibold text-white tracking-tight">
                          {project.authorName}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500">
                          {getGithubHandle(project.githubRepoUrl, project.authorName)}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[130px]">
                      {getDomain(project.liveDemoUrl)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors tracking-tight">
                      {project.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
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
                <div className="p-4 bg-[#0a0a0c] border-t border-white/5 flex items-center gap-2">
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-sm bg-white hover:bg-zinc-200 text-black text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={project.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-sm bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Исходный код на GitHub"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
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
