import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { homeworkApi } from '@/entities/homework/api/homeworkApi';
import type { HomeworkSubmission } from '@/shared/types';
import { MarkdownViewer } from '@/shared/ui/MarkdownViewer';

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
  const [codeSnippet, setCodeSnippet] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

  const { data: submissions = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['homework-submissions', courseId, lessonId],
    queryFn: () => homeworkApi.getSubmissions(courseId, lessonId),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      homeworkApi.submitHomework(courseId, lessonId, {
        codeSnippet,
        repositoryUrl: repositoryUrl.trim() || undefined,
      }),
    onSuccess: (newSubmission) => {
      queryClient.invalidateQueries({ queryKey: ['homework-submissions', courseId, lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lesson', courseId, lessonId] });
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      if (newSubmission.status === 'PASSED' && onLessonCompleted) {
        onLessonCompleted();
      }
    },
  });

  const latestSubmission: HomeworkSubmission | undefined = submissions[0];

  return (
    <div className="bg-[#18181b] border border-white/5 rounded-sm overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0d1117] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#58a6ff]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#fafafa]">
            AI Code Review & Auto-Grader
          </span>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-[#21262d] text-white border border-white/5'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            Редактор
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#21262d] text-white border border-white/5'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            История ({submissions.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'editor' ? (
          <>
            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1.5">
                Код вашего решения (TypeScript / Java / SQL):
              </label>
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="// Вставьте код решения для проверки ИИ-грейдером..."
                rows={8}
                className="w-full bg-[#0d1117] border border-white/5 rounded-sm p-3 text-xs font-mono text-[#fafafa] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1.5">
                Ссылка на GitHub репозиторий (опционально):
              </label>
              <input
                type="url"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/username/project"
                className="w-full bg-[#0d1117] border border-white/5 rounded-sm px-3 py-2 text-xs text-[#fafafa] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#8b949e]">
                Проверка безопасности, FSD-архитектуры и авто-зачет урока (при балле &ge; 80)
              </span>
              <button
                type="button"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending || !codeSnippet.trim()}
                className="px-5 py-2 rounded-sm bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2"
              >
                {submitMutation.isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Анализ решения...</span>
                  </>
                ) : (
                  <span>Отправить на проверку</span>
                )}
              </button>
            </div>

            {/* Latest Result Banner */}
            {latestSubmission && (
              <div
                className={`mt-4 p-4 rounded-sm border ${
                  latestSubmission.status === 'PASSED'
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                    : 'bg-[#0d1117] border-white/5 text-[#c9d1d9]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        latestSubmission.status === 'PASSED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {latestSubmission.status === 'PASSED'
                        ? 'Зачтено'
                        : 'Требует доработки'}
                    </span>
                    <span className="text-xs font-semibold">
                      Балл: {latestSubmission.score} / 100
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8b949e]">
                    {new Date(latestSubmission.createdAt).toLocaleString()}
                  </span>
                </div>

                {latestSubmission.securityFlags && (
                  <div className="p-2 mb-2 rounded bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs">
                    {latestSubmission.securityFlags}
                  </div>
                )}

                {latestSubmission.aiFeedback && (
                  <div className="text-xs mt-2 border-t border-white/5 pt-2">
                    <MarkdownViewer content={latestSubmission.aiFeedback} />
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* History View */
          <div className="space-y-3">
            {isLoadingHistory ? (
              <div className="text-center py-6 text-xs text-[#8b949e]">Загрузка истории...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#8b949e]">
                Вы еще не отправляли решений по этому уроку
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-sm bg-[#0d1117] border border-white/5 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          sub.status === 'PASSED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {sub.status}
                      </span>
                      <span className="font-semibold text-[#fafafa]">Балл: {sub.score}</span>
                    </div>
                    <span className="text-[10px] text-[#8b949e]">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {sub.aiFeedback && (
                    <div className="text-[11px] text-[#8b949e] line-clamp-3">
                      {sub.aiFeedback}
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
