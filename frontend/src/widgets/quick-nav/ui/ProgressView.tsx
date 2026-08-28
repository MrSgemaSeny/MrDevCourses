import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/entities/progress/api/progressApi';
import { useAuth } from '@/features/auth';
import { CountdownTimer } from '@/shared/ui/CountdownTimer';
import {
  Award,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  Zap,
  BookOpen,
} from 'lucide-react';

interface ProgressViewProps {
  courseId?: number | null;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ courseId }) => {
  const { user } = useAuth();

  const { data: courseProgress, isLoading: courseProgressLoading } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => (courseId ? progressApi.getCourseProgress(courseId) : null),
    enabled: !!courseId,
  });

  const { data: allProgress = [], isLoading: allProgressLoading } = useQuery({
    queryKey: ['progressOverview'],
    queryFn: () => progressApi.getAllProgress(),
    enabled: !courseId,
  });

  const isLoading = courseId ? courseProgressLoading : allProgressLoading;

  if (isLoading) {
    return (
      <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2">
        <div className="w-6 h-6 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
        <span>Загрузка прогресса...</span>
      </div>
    );
  }

  const currentStreak = user?.currentStreak || 0;
  const longestStreak = user?.longestStreak || 0;

  // Single course detailed view
  if (courseId && courseProgress) {
    const isCompleted = courseProgress.progressPercentage === 100;

    return (
      <div className="space-y-5">
        {/* Header & Course Title */}
        <div className="p-4 rounded-sm bg-[#18181b] border border-white/5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Текущий курс
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {courseProgress.courseTitle}
              </h3>
            </div>
            {isCompleted ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] bg-emerald-950/80 border border-emerald-700 text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                <Award className="w-3.5 h-3.5" />
                Пройден
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] bg-zinc-800 border border-white/5 text-zinc-300 font-mono shrink-0">
                День {courseProgress.currentDay}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Прогресс завершения</span>
              <span className="font-mono font-bold text-white">
                {courseProgress.progressPercentage}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-[#21262d]">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${courseProgress.progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
              <span>Пройдено {courseProgress.completedCount} из {courseProgress.totalLessons} уроков</span>
              <span>Доступно: {courseProgress.totalUnlocked}</span>
            </div>
          </div>
        </div>

        {/* Streak & Velocity KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-sm bg-[#18181b] border border-[#21262d] space-y-1">
            <div className="flex items-center gap-1.5 text-orange-400 text-xs">
              <Flame className="w-4 h-4" />
              <span className="font-semibold">Текущий стрик</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {currentStreak} {currentStreak === 1 ? 'день' : currentStreak > 1 && currentStreak < 5 ? 'дня' : 'дней'}
            </div>
            <p className="text-[10px] text-zinc-500">Рекорд: {longestStreak} дн.</p>
          </div>

          <div className="p-3.5 rounded-sm bg-[#18181b] border border-[#21262d] space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">Темп обучения</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {courseProgress.completedCount > 0 ? '1 у/день' : 'Старт'}
            </div>
            <p className="text-[10px] text-zinc-500">Капельный контент</p>
          </div>
        </div>

        {/* Next Lesson Countdown */}
        {courseProgress.nextUnlockAt && !isCompleted && (
          <div className="p-4 rounded-sm bg-[#18181b] border border-amber-900/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
              <Clock className="w-4 h-4" />
              <span>Следующий урок откроется через:</span>
            </div>
            <div className="py-1">
              <CountdownTimer targetDate={courseProgress.nextUnlockAt} />
            </div>
            <p className="text-[11px] text-zinc-400">
              Новые материалы открываются последовательно раз в сутки.
            </p>
          </div>
        )}

        {/* Completion Milestone Card */}
        {isCompleted && (
          <div className="p-4 rounded-sm bg-gradient-to-br from-emerald-950/40 to-[#161b22] border border-emerald-700/60 space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-600 text-emerald-400 flex items-center justify-center mx-auto">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Курс успешно завершен!</h4>
            <p className="text-[11px] text-zinc-400">
              Вы освоили все модули и можете получить верифицированный сертификат.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Multi-course summary or fallback view
  return (
    <div className="space-y-4">
      {/* Global Streak Card */}
      <div className="p-4 rounded-sm bg-[#18181b] border border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-orange-400 text-xs font-semibold">
            <Flame className="w-4 h-4" />
            <span>Учебный стрик</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {currentStreak} {currentStreak === 1 ? 'день' : currentStreak > 1 && currentStreak < 5 ? 'дня' : 'дней'}
          </div>
          <p className="text-[11px] text-zinc-400">Рекордный стрик: {longestStreak} дн.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#0d1117] border border-white/5 flex items-center justify-center text-orange-400">
          <Zap className="w-6 h-6" />
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
          Ваши курсы ({allProgress.length})
        </h4>

        {allProgress.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2 bg-[#18181b] rounded-sm border border-[#21262d] p-4">
            <BookOpen className="w-6 h-6 text-zinc-600" />
            <p>Вы пока не записаны на курсы.</p>
          </div>
        ) : (
          allProgress.map((item) => (
            <div
              key={item.courseId}
              className="p-3.5 rounded-sm bg-[#18181b] border border-[#21262d] space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-xs font-bold text-white truncate">{item.courseTitle}</h5>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  {item.progressPercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-[#21262d]">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${item.progressPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>{item.completedCount} / {item.totalLessons} уроков</span>
                {item.progressPercentage === 100 ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Завершен
                  </span>
                ) : (
                  <span>День {item.currentDay}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
