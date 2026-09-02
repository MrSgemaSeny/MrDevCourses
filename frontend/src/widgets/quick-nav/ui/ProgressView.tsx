import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/entities/progress/api/progressApi';
import { CountdownTimer } from '@/shared/ui/CountdownTimer';
import {
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
  CheckSquare,
  Layers,
} from 'lucide-react';

interface ProgressViewProps {
  courseId?: number | null;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ courseId }) => {
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

  // Single course detailed view
  if (courseId && courseProgress) {
    const isCompleted = courseProgress.progressPercentage === 100;

    return (
      <div className="space-y-5">
        {/* Header & Course Title */}
        <div className="p-4 rounded-sm bg-[#0e0e11] border border-white/5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Текущий курс
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {courseProgress.courseTitle}
              </h3>
            </div>
            {isCompleted ? (
              <span className="px-2.5 py-1 rounded-sm text-[10px] bg-white/10 border border-white/20 text-white font-mono flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Пройден
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-sm text-[10px] bg-[#141418] border border-white/10 text-zinc-300 font-mono shrink-0">
                Урок {courseProgress.currentDay}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono text-[11px]">Прогресс завершения</span>
              <span className="font-mono font-bold text-white">
                {courseProgress.progressPercentage}%
              </span>
            </div>

            <div className="w-full h-2 bg-zinc-900 rounded-sm overflow-hidden border border-white/5">
              <div
                className="h-full bg-white transition-all duration-500 rounded-sm"
                style={{ width: `${courseProgress.progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
              <span>Пройдено {courseProgress.completedCount} из {courseProgress.totalLessons} уроков</span>
              <span>Доступно: {courseProgress.totalUnlocked}</span>
            </div>
          </div>
        </div>

        {/* Learning Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-sm bg-[#0e0e11] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
              <CheckSquare className="w-3.5 h-3.5 text-zinc-300" />
              <span>Пройдено уроков</span>
            </div>
            <div className="text-sm font-bold font-mono text-white">
              {courseProgress.completedCount} / {courseProgress.totalLessons}
            </div>
            <p className="text-[10px] font-mono text-zinc-500">Уроков завершено</p>
          </div>

          <div className="p-3.5 rounded-sm bg-[#0e0e11] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
              <Layers className="w-3.5 h-3.5 text-zinc-300" />
              <span>Формат доступа</span>
            </div>
            <div className="text-sm font-bold font-mono text-white">
              Капельный контент
            </div>
            <p className="text-[10px] font-mono text-zinc-500">1 урок в сутки</p>
          </div>
        </div>

        {/* Next Lesson Countdown */}
        {courseProgress.nextUnlockAt && !isCompleted && (
          <div className="p-4 rounded-sm bg-[#0e0e11] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-white text-xs font-semibold font-mono">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Следующий урок откроется через:</span>
            </div>
            <div className="py-1">
              <CountdownTimer targetDate={courseProgress.nextUnlockAt} />
            </div>
            <p className="text-xs text-zinc-400 font-mono text-[11px]">
              Новые материалы открываются последовательно раз в сутки.
            </p>
          </div>
        )}

        {/* Completion Milestone Card */}
        {isCompleted && (
          <div className="p-4 rounded-sm bg-[#141418] border border-white/20 space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white font-mono">Курс успешно завершен!</h4>
            <p className="text-xs text-zinc-400">
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
      {/* Courses List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1 font-mono">
          Ваши курсы ({allProgress.length})
        </h4>

        {allProgress.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2 bg-[#0e0e11] rounded-sm border border-white/5 p-4">
            <BookOpen className="w-6 h-6 text-zinc-600" />
            <p>Вы пока не записаны на курсы.</p>
          </div>
        ) : (
          allProgress.map((item) => (
            <div
              key={item.courseId}
              className="p-3.5 rounded-sm bg-[#0e0e11] border border-white/5 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-xs font-bold text-white truncate">{item.courseTitle}</h5>
                <span className="text-xs font-mono text-white font-semibold">
                  {item.progressPercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-zinc-900 rounded-sm overflow-hidden border border-white/5">
                <div
                  className="h-full bg-white rounded-sm transition-all duration-300"
                  style={{ width: `${item.progressPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>{item.completedCount} / {item.totalLessons} уроков</span>
                {item.progressPercentage === 100 ? (
                  <span className="text-white flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-white" /> Завершен
                  </span>
                ) : (
                  <span>Урок {item.currentDay}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
