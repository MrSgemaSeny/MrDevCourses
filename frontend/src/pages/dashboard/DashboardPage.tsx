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
  Terminal,
  Activity,
  Star,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: progressList = [], isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.getAllProgress,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-zinc-100">
      {/* User Welcome Banner with Streaks */}
      <div className="p-8 rounded-sm bg-[#18181b] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2 font-mono uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Личный кабинет</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Привет, {user?.name || user?.email}!
            </h1>
            <p className="text-xs text-zinc-400 mt-2">
              Дисциплина и регулярность: проходите по одному уроку в день.
            </p>
          </div>

          {/* Streak badges */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="px-4 py-2.5 rounded-sm bg-[#0a0a0c] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-white" />
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Текущий стрик</div>
                <div className="text-sm font-bold text-white font-mono">{user?.currentStreak || 0} дней</div>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-sm bg-[#0a0a0c] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] flex items-center gap-2">
              <Star className="w-4 h-4 text-white" />
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Рекорд</div>
                <div className="text-sm font-bold text-white font-mono">{user?.longestStreak || 0} дней</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Progress */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Мои курсы</h2>
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
          <div className="p-10 text-center rounded-sm bg-[#18181b] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
                className="p-6 rounded-sm bg-[#18181b] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/15 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-zinc-300">
                        День {item.currentDay}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        Пройдено {item.completedCount} из {item.totalLessons} уроков
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white">{item.courseTitle}</h3>
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
  );
};
