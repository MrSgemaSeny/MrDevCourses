import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { homeworkApi } from '@/entities/homework/api/homeworkApi';
import type { HomeworkSubmission } from '@/shared/types';
import { ExternalLink, GitBranch, Globe, CheckCircle2, Clock, AlertTriangle, Send } from 'lucide-react';

interface HomeworkSubmissionWidgetProps {
  courseId: number;
  lessonId: number;
  onLessonCompleted?: () => void;
}

export const HomeworkSubmissionWidget: React.FC<HomeworkSubmissionWidgetProps> = ({
  courseId,
  lessonId,
  onLessonCompleted,
}) => {
  const queryClient = useQueryClient();
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  const { data: submissions = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['homework-submissions', courseId, lessonId],
    queryFn: () => homeworkApi.getSubmissions(courseId, lessonId),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      homeworkApi.submitHomework(courseId, lessonId, {
        repositoryUrl: repositoryUrl.trim() || undefined,
        liveDemoUrl: liveDemoUrl.trim() || undefined,
        codeSnippet: codeSnippet.trim() || undefined,
      }),
    onSuccess: (newSubmission) => {
      queryClient.invalidateQueries({ queryKey: ['homework-submissions', courseId, lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lesson', courseId, lessonId] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      if (newSubmission.status === 'PASSED' && onLessonCompleted) {
        onLessonCompleted();
      }
    },
  });

  const latestSubmission: HomeworkSubmission | undefined = submissions[0];
  const canSubmit = repositoryUrl.trim().length > 0 || liveDemoUrl.trim().length > 0 || codeSnippet.trim().length > 0;

  return (
    <div className="bg-[#0e0e11] border border-white/5 rounded-sm overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0a0a0c] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/80" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white">
            Практика & Сдача ДЗ ментору
          </span>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeTab === 'form'
                ? 'bg-zinc-900 text-white border border-white/5'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            Форма сдачи
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-zinc-900 text-white border border-white/5'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            История ({submissions.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {activeTab === 'form' ? (
          <>
            {/* Status Banner for Latest Submission */}
            {latestSubmission && (
              <div
                className={`p-4 rounded-sm border ${
                  latestSubmission.status === 'PASSED'
                    ? 'bg-white/10 border-white/20 text-white'
                    : latestSubmission.status === 'NEEDS_IMPROVEMENT'
                    ? 'bg-zinc-900 border-white/20 text-zinc-300'
                    : 'bg-zinc-900 border-white/10 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {latestSubmission.status === 'PASSED' ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : latestSubmission.status === 'NEEDS_IMPROVEMENT' ? (
                      <AlertTriangle className="w-4 h-4 text-zinc-300" />
                    ) : (
                      <Clock className="w-4 h-4 text-zinc-400 animate-pulse" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      {latestSubmission.status === 'PASSED'
                        ? 'Работа принята ментором'
                        : latestSubmission.status === 'NEEDS_IMPROVEMENT'
                        ? 'Требуется доработка'
                        : 'На проверке у ментора (Mr Developer)'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {new Date(latestSubmission.createdAt).toLocaleString('ru-RU')}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  {latestSubmission.status === 'PASSED' && (
                    <p className="text-zinc-200 text-xs">
                      Отличная работа! Урок зачтён, доступ к следующему материалу разблокирован.
                    </p>
                  )}
                  {latestSubmission.status === 'PENDING' && (
                    <p className="text-zinc-400 text-xs">
                      Ваша ссылка и решение успешно отправлены. Ментор проверит репозиторий и живой сайт в ближайшее время.
                    </p>
                  )}
                  {latestSubmission.mentorFeedback && (
                    <div className="mt-2.5 p-3 rounded-sm bg-black/60 border border-white/10 text-xs text-zinc-200 font-mono">
                      <span className="font-semibold text-zinc-400 block mb-1">Комментарий ментора:</span>
                      <p className="whitespace-pre-wrap">{latestSubmission.mentorFeedback}</p>
                    </div>
                  )}
                </div>

                {/* Attached Links preview */}
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5 text-xs font-mono">
                  {latestSubmission.repositoryUrl && (
                    <a
                      href={latestSubmission.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-zinc-300 hover:text-white underline underline-offset-2"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Репозиторий GitHub</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </a>
                  )}
                  {latestSubmission.liveDemoUrl && (
                    <a
                      href={latestSubmission.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-zinc-300 hover:text-white underline underline-offset-2"
                    >
                      <Globe className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Демо-сайт онлайн</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Submission Form */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Ссылка на GitHub репозиторий:</span>
                </label>
                <input
                  type="url"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/your-username/my-vibe-project"
                  className="w-full bg-[#0a0a0c] border border-white/5 rounded-sm px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Ссылка на живой сайт (GitHub Pages / Vercel):</span>
                </label>
                <input
                  type="url"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  placeholder="https://your-username.github.io/my-vibe-project или https://my-app.vercel.app"
                  className="w-full bg-[#0a0a0c] border border-white/5 rounded-sm px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Комментарий, вопросы или код решения (опционально):
                </label>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Опишите, что было реализовано, с какими сложностями столкнулись..."
                  rows={4}
                  className="w-full bg-[#0a0a0c] border border-white/5 rounded-sm p-3 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-500">
                  {latestSubmission
                    ? 'Вы можете отправить обновлённую версию решения'
                    : 'Ментор лично проверит вашу работу и даст обратную связь'}
                </span>
                <button
                  type="button"
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending || !canSubmit}
                  className="px-5 py-2 rounded-sm bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-black transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  {submitMutation.isPending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Отправка...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-black" />
                      <span>Отправить ментору</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* History View */
          <div className="space-y-3">
            {isLoadingHistory ? (
              <div className="text-center py-6 text-xs text-zinc-500 font-mono">Загрузка истории...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500 font-mono">
                Вы еще не отправляли решений по этому уроку
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-sm bg-[#0a0a0c] border border-white/5 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          sub.status === 'PASSED'
                            ? 'bg-white/10 text-white border border-white/20'
                            : sub.status === 'NEEDS_IMPROVEMENT'
                            ? 'bg-zinc-800 text-zinc-300 border border-white/10'
                            : 'bg-zinc-800 text-zinc-400 border border-white/10'
                        }`}
                      >
                        {sub.status === 'PASSED' ? 'ПРИНЯТО' : sub.status === 'NEEDS_IMPROVEMENT' ? 'ДОРАБОТКА' : 'НА ПРОВЕРКЕ'}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(sub.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  {sub.liveDemoUrl && (
                    <div className="text-xs text-zinc-300 flex items-center gap-1 font-mono">
                      <Globe className="w-3 h-3 text-zinc-400" />
                      <span>{sub.liveDemoUrl}</span>
                    </div>
                  )}
                  {sub.repositoryUrl && (
                    <div className="text-xs text-zinc-400 flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      <span>{sub.repositoryUrl}</span>
                    </div>
                  )}
                  {sub.mentorFeedback && (
                    <div className="p-2 rounded bg-zinc-900 border border-white/5 text-xs text-zinc-300">
                      <span className="text-zinc-500 font-semibold block mb-0.5">Отзыв ментора:</span>
                      {sub.mentorFeedback}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
