import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsApi } from '@/entities/admin/api/adminAnalyticsApi';
import { adminApi } from '@/entities/admin/api/adminApi';
import { CourseFunnelChart } from './CourseFunnelChart';
import { StreakDistributionChart } from './StreakDistributionChart';
import { LessonRetentionTable } from './LessonRetentionTable';
import { Users, CheckCircle2, Flame, TrendingUp, BookOpen, Award, BarChart3 } from 'lucide-react';

export const AdminAnalyticsDashboard: React.FC = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  // Queries
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: adminAnalyticsApi.getOverviewMetrics,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: adminApi.getCourses,
  });

  const effectiveCourseId = selectedCourseId || courses[0]?.id || null;

  const { data: funnel = [], isLoading: funnelLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'funnel', effectiveCourseId],
    queryFn: () => adminAnalyticsApi.getCourseFunnel(effectiveCourseId!),
    enabled: !!effectiveCourseId,
  });

  const { data: streaks = [], isLoading: streaksLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'streaks'],
    queryFn: adminAnalyticsApi.getStreakDistribution,
  });

  const { data: retention, isLoading: retentionLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'retention', effectiveCourseId],
    queryFn: () => adminAnalyticsApi.getCourseRetention(effectiveCourseId!),
    enabled: !!effectiveCourseId,
  });

  if (overviewLoading || coursesLoading) {
    return (
      <div className="py-16 text-center text-zinc-500 text-xs font-mono">
        Загрузка аналитических данных платформы...
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="admin-analytics-dashboard">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Students */}
        <div className="p-4 rounded-sm bg-[#18181b] border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs">Студентов</span>
            <Users className="w-4 h-4 text-zinc-100" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {overview?.totalStudents ?? 0}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            {overview?.activeStudents ?? 0} активных за 7 дн.
          </p>
        </div>

        {/* Total Enrollments */}
        <div className="p-4 rounded-sm bg-[#18181b] border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs">Записей</span>
            <BookOpen className="w-4 h-4 text-zinc-100" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {overview?.totalEnrollments ?? 0}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Всего на курсах</p>
        </div>

        {/* Total Lessons Completed */}
        <div className="p-4 rounded-sm bg-[#18181b] border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs">Уроков пройдено</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {overview?.totalLessonsCompleted ?? 0}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Все отметки о сдаче</p>
        </div>

        {/* Course Completions */}
        <div className="p-4 rounded-sm bg-[#18181b] border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs">Завершений</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {overview?.totalCompletions ?? 0}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">100% прохождение</p>
        </div>

        {/* Completion Rate */}
        <div className="p-4 rounded-sm bg-[#18181b] border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs">Конверсия</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {overview?.completionRate ?? 0}%
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Доля завершивших</p>
        </div>

        {/* Average Streak */}
        <div className="p-4 rounded-sm bg-[#18181b] border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs">Ср. Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {overview?.averageStreak ?? 0} <span className="text-xs font-normal text-zinc-400">дн.</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Ударный темп</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Course Funnel */}
        <div className="lg:col-span-2 p-6 rounded-sm bg-[#18181b] border border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-100 mb-0.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Воронка курса (Drop-off Rate)</span>
              </div>
              <h3 className="text-base font-bold text-white">Прохождение по дням</h3>
            </div>

            {/* Course Selector */}
            {courses.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="funnelCourseSelect" className="text-xs text-zinc-400">Курс:</label>
                <select
                  id="funnelCourseSelect"
                  value={effectiveCourseId || ''}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-md text-xs text-white focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {funnelLoading ? (
            <div className="text-center py-12 text-zinc-500 text-xs font-mono">Загрузка воронки...</div>
          ) : (
            <CourseFunnelChart steps={funnel} />
          )}
        </div>

        {/* Right 1 Col: Streak Distribution */}
        <div className="p-6 rounded-sm bg-[#18181b] border border-white/5 space-y-4">
          <div className="pb-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-0.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Ударный режим</span>
            </div>
            <h3 className="text-base font-bold text-white">Распределение Streak</h3>
          </div>

          {streaksLoading ? (
            <div className="text-center py-12 text-zinc-500 text-xs font-mono">Загрузка распределения...</div>
          ) : (
            <StreakDistributionChart distributions={streaks} />
          )}
        </div>
      </div>

      {/* Cohort Lesson Retention Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Когортное удержание по урокам</h3>
            <p className="text-xs text-zinc-400">
              Конверсия и время прохождения каждого дня выбранного курса
            </p>
          </div>
          {retention && (
            <div className="text-xs font-mono text-zinc-400">
              Всего записано: <span className="text-white font-semibold">{retention.totalEnrolled}</span> | Завершили курс: <span className="text-emerald-400 font-semibold">{retention.completedCount} ({retention.overallCompletionRate}%)</span>
            </div>
          )}
        </div>

        {retentionLoading ? (
          <div className="text-center py-12 text-zinc-500 text-xs font-mono">Загрузка таблицы удержания...</div>
        ) : retention ? (
          <LessonRetentionTable retention={retention} />
        ) : (
          <div className="p-8 text-center bg-zinc-900/60 border border-white/5 rounded-sm text-zinc-400 text-xs">
            Выберите курс для просмотра аналитики удержания.
          </div>
        )}
      </div>
    </div>
  );
};
