import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homeworkApi } from '@/entities/homework/api/homeworkApi';
import type { SubmissionStatus } from '@/shared/types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  GitBranch,
  Globe,
  BookOpen,
} from 'lucide-react';

export const AdminHomeworksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'ALL'>('ALL');
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});

  const { data: homeworks = [], isLoading } = useQuery({
    queryKey: ['admin-homeworks', statusFilter],
    queryFn: () =>
      homeworkApi.getAllHomeworks(statusFilter === 'ALL' ? undefined : statusFilter),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      submissionId,
      status,
      mentorFeedback,
    }: {
      submissionId: number;
      status: SubmissionStatus;
      mentorFeedback?: string;
    }) => homeworkApi.reviewHomework(submissionId, { status, mentorFeedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homeworks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
  });

  const handleFeedbackChange = (submissionId: number, text: string) => {
    setFeedbacks((prev) => ({ ...prev, [submissionId]: text }));
  };

  const handleReview = (submissionId: number, status: SubmissionStatus) => {
    const mentorFeedback = feedbacks[submissionId] || '';
    reviewMutation.mutate({ submissionId, status, mentorFeedback });
  };

  const pendingCount = homeworks.filter((h) => h.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Проверка практических заданий
            </h1>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                {pendingCount} ожидают
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Проверка ссылок на GitHub и живые демо-сайты студентов. Принятие работы досрочно открывает следующий урок.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#0e0e11] border border-white/5 p-1 rounded-sm">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Все ({homeworks.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-950/60 border border-amber-800/60 text-amber-300 font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>На проверке</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PASSED')}
            className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'PASSED'
                ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Принятые</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('NEEDS_IMPROVEMENT')}
            className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'NEEDS_IMPROVEMENT'
                ? 'bg-rose-950/60 border border-rose-800/60 text-rose-300 font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>На доработке</span>
          </button>
        </div>
      </div>

      {/* List of Submissions */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-zinc-500">Загрузка очереди заданий...</div>
      ) : homeworks.length === 0 ? (
        <div className="text-center py-20 bg-[#0e0e11] border border-white/5 rounded-sm p-8">
          <CheckCircle2 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-zinc-300">Очередь пуста</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Нет работ, соответствующих выбранному фильтру.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {homeworks.map((sub) => {
            const currentFeedback = feedbacks[sub.id] !== undefined ? feedbacks[sub.id] : (sub.mentorFeedback || '');
            const isSubPending = sub.status === 'PENDING';

            return (
              <div
                key={sub.id}
                className={`p-5 rounded-sm bg-[#0e0e11] border transition-all ${
                  isSubPending
                    ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                    : sub.status === 'PASSED'
                    ? 'border-emerald-500/20'
                    : 'border-white/5'
                }`}
              >
                {/* Card Top: Student & Lesson info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-300">
                      {(sub.studentName || sub.studentEmail || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {sub.studentName || (sub.studentEmail ? sub.studentEmail.split('@')[0] : 'Пользователь')}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {sub.studentEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                        <BookOpen className="w-3 h-3 text-zinc-500" />
                        <span>{sub.courseTitle || 'Курс'}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-300 font-medium">{sub.lessonTitle || `Урок #${sub.lessonId}`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        sub.status === 'PASSED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : sub.status === 'NEEDS_IMPROVEMENT'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {sub.status === 'PASSED'
                        ? 'Принято'
                        : sub.status === 'NEEDS_IMPROVEMENT'
                        ? 'На доработке'
                        : 'Ожидает проверки'}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(sub.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>

                {/* Card Middle: Clickable Links & Student Notes */}
                <div className="py-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {sub.liveDemoUrl && (
                      <a
                        href={sub.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Живой сайт (Демо)</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    )}
                    {sub.repositoryUrl && (
                      <a
                        href={sub.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-200 text-xs font-medium flex items-center gap-2 transition-colors"
                      >
                        <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Репозиторий GitHub</span>
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    )}
                  </div>

                  {sub.codeSnippet && (
                    <div className="p-3 rounded bg-[#0a0a0c] border border-white/5 text-xs font-mono text-zinc-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      <span className="text-zinc-500 block mb-1 font-sans font-semibold">Заметка / Код студента:</span>
                      {sub.codeSnippet}
                    </div>
                  )}
                </div>

                {/* Card Bottom: Mentor Review Actions */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Комментарий ментора студенту:
                    </label>
                    <textarea
                      value={currentFeedback}
                      onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                      placeholder="Оставьте обратную связь: что улучшить, что сделано отлично..."
                      rows={2}
                      className="w-full bg-[#0a0a0c] border border-white/5 rounded-sm p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleReview(sub.id, 'NEEDS_IMPROVEMENT')}
                      disabled={reviewMutation.isPending}
                      className="px-3.5 py-1.5 rounded-sm bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>На доработку</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReview(sub.id, 'PASSED')}
                      disabled={reviewMutation.isPending}
                      className="px-4 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Принять работу (Зачесть урок)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
