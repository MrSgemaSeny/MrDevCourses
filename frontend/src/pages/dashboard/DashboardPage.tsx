import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/entities/progress/api/progressApi';
import { useAuth } from '@/app/providers/AuthProvider';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: progressList = [], isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.getAllProgress,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* User Welcome Banner */}
      <div className="p-8 rounded-xl bg-[rgba(24,24,27,0.85)] border border-[#27272a] mb-8 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span>Личный кабинет студента</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Привет, {user?.name || user?.email}!
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Дисциплина и регулярность: проходите по одному уроку в день.
            </p>
          </div>

          <Link
            to="/courses"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Каталог курсов</span>
          </Link>
        </div>
      </div>

      {/* Enrolled Courses Progress */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Мои курсы</h2>

        {isLoading ? (
          <div className="text-center py-16 text-zinc-500 text-xs">Загрузка вашего прогресса...</div>
        ) : progressList.length === 0 ? (
          <div className="p-10 text-center rounded-xl bg-[rgba(24,24,27,0.6)] border border-[#27272a] backdrop-blur-md">
            <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-2">Вы пока не записаны на курсы</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
              Выберите интересующий курс в каталоге и начните проходить первый урок прямо сейчас.
            </p>
            <Link
              to="/courses"
              className="px-5 py-2.5 bg-[#fafafa] hover:bg-white text-[#09090b] text-xs font-semibold rounded-md inline-flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <span>Выбрать курс</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {progressList.map((item) => {
              const formattedNextUnlock = item.nextUnlockAt
                ? new Date(item.nextUnlockAt).toLocaleDateString('ru-RU', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null;

              return (
                <div
                  key={item.courseId}
                  className="p-6 rounded-xl bg-[rgba(24,24,27,0.85)] border border-[#27272a] hover:border-zinc-700 transition-all backdrop-blur-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 border border-zinc-700 text-zinc-300">
                          День {item.currentDay}
                        </span>
                        <span className="text-xs text-zinc-400">
                          Пройдено {item.completedCount} из {item.totalLessons} уроков
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{item.courseTitle}</h3>
                    </div>

                    <Link
                      to={`/courses/${item.courseSlug}`}
                      className="px-4 py-2 bg-[#fafafa] hover:bg-white text-[#09090b] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] self-start sm:self-auto"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Продолжить</span>
                    </Link>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-900 rounded-full h-2 mb-4 overflow-hidden border border-zinc-800">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, item.progressPercentage)}%` }}
                    />
                  </div>

                  {/* Stats Row */}
                  <div className="pt-3 border-t border-[#27272a] flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {item.progressPercentage}% завершено
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                        Открыто уроков: {item.totalUnlocked}
                      </span>
                    </div>

                    {formattedNextUnlock ? (
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        Следующий урок: {formattedNextUnlock}
                      </span>
                    ) : (
                      <span className="text-emerald-400">Все уроки курса открыты!</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
