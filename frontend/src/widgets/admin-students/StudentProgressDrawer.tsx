import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Flame,
  Trophy,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Code2,
  BookOpen,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { adminStudentApi } from '@/entities/adminStudentApi';
import { StudentProgressDetail } from '@/shared/types';

interface StudentProgressDrawerProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentProgressDrawer: React.FC<StudentProgressDrawerProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'lessons' | 'quizzes' | 'homework'>('courses');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const {
    data: progress,
    isLoading,
    isError,
    error,
  } = useQuery<StudentProgressDetail>({
    queryKey: ['admin', 'student-progress', userId],
    queryFn: () => adminStudentApi.getStudentProgress(userId!),
    enabled: isOpen && !!userId,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#0e0e11] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-white/5 bg-[#18181b] flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-base text-zinc-100 uppercase overflow-hidden shrink-0">
                {progress?.avatarUrl ? (
                  <img src={progress.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{(progress?.name || progress?.email || '?').charAt(0)}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-bold text-zinc-100">
                    {progress?.name || 'Профиль студента'}
                  </h2>
                  {progress && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        progress.role === 'ADMIN'
                          ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-white/5'
                      }`}
                    >
                      {progress.role}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-mono mb-2">{progress?.email}</p>

                {/* Telemetry Metrics */}
                {progress && (
                  <div className="flex items-center gap-3 text-xs">
                    <div
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium"
                      title="Текущая серия активности"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{progress.currentStreak} дн.</span>
                    </div>

                    <div
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 border border-white/5 text-zinc-300 text-[11px]"
                      title="Рекордная серия активности"
                    >
                      <Trophy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Макс: {progress.longestStreak} дн.</span>
                    </div>

                    {progress.lastActiveDate && (
                      <div className="inline-flex items-center gap-1 text-zinc-500 text-[10px]">
                        <Calendar className="w-3 h-3" />
                        <span>Активность: {progress.lastActiveDate}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/5 bg-[#121216] px-5">
            {[
              { id: 'courses', label: 'Курсы', icon: BookOpen, count: progress?.enrolledCourses?.length },
              { id: 'lessons', label: 'Уроки', icon: CheckCircle2, count: progress?.completedLessons?.length },
              { id: 'quizzes', label: 'Тесты', icon: HelpCircle, count: progress?.quizScores?.length },
              { id: 'homework', label: 'Домашки', icon: Code2, count: progress?.homeworkSubmissions?.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'border-white text-zinc-100'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-900 text-zinc-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                <span className="text-xs">Загрузка прогресса студента...</span>
              </div>
            )}

            {isError && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-0.5">Не удалось загрузить данные прогресса</div>
                  <div>{(error as any)?.message || 'Произошла непредвиденная ошибка'}</div>
                </div>
              </div>
            )}

            {!isLoading && !isError && progress && (
              <>
                {/* 1. Courses Tab */}
                {activeTab === 'courses' && (
                  <div className="space-y-3">
                    {progress.enrolledCourses.length === 0 ? (
                      <div className="p-8 text-center bg-[#18181b] border border-white/5 rounded-xl text-xs text-zinc-500">
                        Студент пока не записан ни на один курс.
                      </div>
                    ) : (
                      progress.enrolledCourses.map((c) => (
                        <div
                          key={c.courseId}
                          className="p-4 bg-[#18181b] border border-white/5 rounded-xl space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-semibold text-zinc-100">{c.courseTitle}</h4>
                              <p className="text-[10px] text-zinc-500 font-mono">
                                Зачислен: {new Date(c.enrolledAt).toLocaleDateString('ru-RU')} • Текущий
                                день: {c.currentDay}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-zinc-200">
                              {c.progressPercentage}%
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
                            <div
                              className="bg-zinc-200 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, c.progressPercentage)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                            <span>
                              Пройдено уроков: {c.completedCount} из {c.totalLessons}
                            </span>
                            <span>Доступно: {c.totalUnlocked}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 2. Lessons Tab */}
                {activeTab === 'lessons' && (
                  <div className="space-y-2">
                    {progress.completedLessons.length === 0 ? (
                      <div className="p-8 text-center bg-[#18181b] border border-white/5 rounded-xl text-xs text-zinc-500">
                        Нет завершенных уроков.
                      </div>
                    ) : (
                      progress.completedLessons.map((l) => (
                        <div
                          key={l.lessonId}
                          className="flex items-center justify-between p-3 bg-[#18181b] border border-white/5 rounded-xl text-xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-zinc-200">
                                День {l.dayNumber}: {l.lessonTitle}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono">
                                Курс: {l.courseTitle}
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono shrink-0">
                            {new Date(l.completedAt).toLocaleString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 3. Quizzes Tab */}
                {activeTab === 'quizzes' && (
                  <div className="space-y-2">
                    {progress.quizScores.length === 0 ? (
                      <div className="p-8 text-center bg-[#18181b] border border-white/5 rounded-xl text-xs text-zinc-500">
                        Нет попыток прохождения тестов.
                      </div>
                    ) : (
                      progress.quizScores.map((q) => (
                        <div
                          key={q.submissionId}
                          className="flex items-center justify-between p-3.5 bg-[#18181b] border border-white/5 rounded-xl text-xs"
                        >
                          <div>
                            <div className="font-semibold text-zinc-200">{q.quizTitle}</div>
                            {q.lessonTitle && (
                              <div className="text-[10px] text-zinc-500 font-mono">
                                Урок: {q.lessonTitle}
                              </div>
                            )}
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              Дата: {new Date(q.startedAt).toLocaleDateString('ru-RU')}
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                q.passed
                                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-red-950/50 text-red-300 border border-red-500/30'
                              }`}
                            >
                              {q.passed ? 'СДАН' : 'НЕ СДАН'} • {q.scorePercentage}%
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 4. Homework Tab */}
                {activeTab === 'homework' && (
                  <div className="space-y-3">
                    {progress.homeworkSubmissions.length === 0 ? (
                      <div className="p-8 text-center bg-[#18181b] border border-white/5 rounded-xl text-xs text-zinc-500">
                        Нет отправленных практических заданий.
                      </div>
                    ) : (
                      progress.homeworkSubmissions.map((hw) => (
                        <div
                          key={hw.submissionId}
                          className="p-4 bg-[#18181b] border border-white/5 rounded-xl space-y-2.5 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-zinc-200">{hw.lessonTitle}</div>
                              {hw.courseTitle && (
                                <div className="text-[10px] text-zinc-500 font-mono">
                                  Курс: {hw.courseTitle}
                                </div>
                              )}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                hw.status === 'PASSED'
                                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                                  : hw.status === 'NEEDS_IMPROVEMENT'
                                  ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {hw.status} • {hw.score} баллов
                            </span>
                          </div>

                          <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-4">
                            <span>
                              Тесты: {hw.passedTestsCount} / {hw.totalTestsCount}
                            </span>
                            <span>
                              Отправлено: {new Date(hw.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                          </div>

                          {hw.aiFeedback && (
                            <div className="p-2.5 rounded-lg bg-[#0a0a0c] border border-white/5 text-[11px] text-zinc-300 whitespace-pre-wrap font-mono">
                              {hw.aiFeedback}
                            </div>
                          )}

                          {hw.codeSnippet && (
                            <div className="p-2.5 rounded-lg bg-[#0a0a0c] border border-white/5 text-[10px] font-mono text-zinc-400 overflow-x-auto max-h-28">
                              {hw.codeSnippet}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 bg-[#18181b] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
