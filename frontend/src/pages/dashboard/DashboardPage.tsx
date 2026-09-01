import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/entities/progress/api/progressApi';
import { useAuth } from '@/features/auth';
import { CountdownTimer } from '@/shared/ui/CountdownTimer';
import {
  BookOpen,
  CheckCircle2,
  Play,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: progressList = [], isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.getAllProgress,
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 75% Main Column aligned to left */}
      <div className="w-full lg:w-[75%] max-w-[1080px] space-y-8">
        {/* User Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-sm bg-[#0e0e11] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div>
            <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-wider">
              Личный кабинет
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Привет, {user?.name || user?.email}!
            </h1>
            <p className="text-xs text-zinc-400 mt-2">
              Дисциплина и регулярность: проходите по одному уроку в день.
            </p>
          </div>
        </div>

      {/* Enrolled Courses Progress */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-white tracking-tight">Мои курсы</h2>
          <Link
            to="/courses"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono uppercase tracking-wider transition-colors"
          >
            <span>Все курсы</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-zinc-500 text-xs font-mono">Загрузка...</div>
        ) : progressList.length === 0 ? (
          <div className="p-10 text-center rounded-sm bg-[#0e0e11] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-white mb-2">Вы пока не записаны на курсы</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6 leading-relaxed">
              Выберите интересующий курс в каталоге и начните проходить первый урок прямо сейчас.
            </p>
            <Link
              to="/courses"
              className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-sm inline-flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0a0a0c]"
            >
              <span>Выбрать курс</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {progressList.map((item) => (
              <div
                key={item.courseId}
                className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/15 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-zinc-300">
                        Урок {item.currentDay}
                      </span>

                      <span className="text-xs text-zinc-400 font-mono">
                        Пройдено {item.completedCount} из {item.totalLessons} уроков
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white">{item.courseTitle}</h3>
                  </div>

                  <Link
                    to={`/courses/${item.courseSlug}`}
                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-sm flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0a0a0c] self-start sm:self-auto"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Продолжить</span>
                  </Link>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#0a0a0c] rounded-sm h-1.5 mb-5 overflow-hidden border border-white/5">
                  <div
                    className="bg-white h-1.5 rounded-sm transition-all duration-500"
                    style={{ width: `${Math.min(100, item.progressPercentage)}%` }}
                  />
                </div>

                {/* Stats Row */}
                <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2 font-mono">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />
                      {item.progressPercentage}% завершено
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                      Открыто уроков: {item.totalUnlocked}
                    </span>
                  </div>

                  {item.nextUnlockAt ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">До следующего урока:</span>
                      <CountdownTimer targetDate={item.nextUnlockAt} />
                    </div>
                  ) : (
                    <span className="text-[#10b981] font-medium tracking-wide">Все уроки курса открыты!</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
