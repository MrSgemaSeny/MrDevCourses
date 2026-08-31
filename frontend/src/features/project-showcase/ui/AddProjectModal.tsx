import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/entities/project/api/projectApi';
import { X, Rocket, AlertCircle, Globe, Github } from 'lucide-react';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [techStack, setTechStack] = useState('React 19, Vite, Tailwind CSS');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
      setTitle('');
      setDescription('');
      setLiveDemoUrl('');
      setGithubRepoUrl('');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Не удалось опубликовать проект. Проверьте данные.');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !liveDemoUrl.trim() || !githubRepoUrl.trim()) {
      setError('Заполните все обязательные поля');
      return;
    }
    setError(null);
    mutation.mutate({
      title: title.trim(),
      description: description.trim(),
      liveDemoUrl: liveDemoUrl.trim(),
      githubRepoUrl: githubRepoUrl.trim(),
      techStack: techStack.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-white/10 rounded-sm shadow-2xl p-6 space-y-5 text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] uppercase tracking-wider font-bold">
            <Rocket className="w-3.5 h-3.5 text-zinc-400" />
            <span>Стена выпускников</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Опубликовать свой проект</h2>
          <p className="text-xs text-zinc-400">
            Поделитесь работающим веб-приложением с комьюнити и добавьте его в портфолио.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-sm bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              Название проекта *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: SaaS Dashboard или Трекер Привычек"
              className="w-full px-3 py-2 text-xs bg-[#0a0a0c] border border-white/10 rounded-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              Описание (что делает сайт) *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Кратко расскажите какую проблему решает ваш проект..."
              className="w-full px-3 py-2 text-xs bg-[#0a0a0c] border border-white/10 rounded-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-500" />
                <span>Live Demo URL *</span>
              </label>
              <input
                type="url"
                required
                value={liveDemoUrl}
                onChange={(e) => setLiveDemoUrl(e.target.value)}
                placeholder="https://my-app.vercel.app"
                className="w-full px-3 py-2 text-xs bg-[#0a0a0c] border border-white/10 rounded-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Github className="w-3 h-3 text-zinc-500" />
                <span>GitHub Repo *</span>
              </label>
              <input
                type="url"
                required
                value={githubRepoUrl}
                onChange={(e) => setGithubRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="w-full px-3 py-2 text-xs bg-[#0a0a0c] border border-white/10 rounded-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              Стек технологий
            </label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="React 19, TypeScript, Tailwind CSS"
              className="w-full px-3 py-2 text-xs bg-[#0a0a0c] border border-white/10 rounded-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-sm text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-xs font-semibold rounded-sm bg-white hover:bg-zinc-200 text-black transition-colors cursor-pointer disabled:opacity-50"
            >
              {mutation.isPending ? 'Публикация...' : 'Опубликовать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
