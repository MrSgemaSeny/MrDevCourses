import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsApi } from '@/entities/adminAnalyticsApi';
import { adminApi } from '@/entities/admin/api/adminApi';
import { CourseFunnelChart } from './CourseFunnelChart';
import { StreakDistributionChart } from './StreakDistributionChart';
import { LessonRetentionTable } from './LessonRetentionTable';
import { AiTutorTelemetryWidget } from './AiTutorTelemetryWidget';
import { QuizHotspotsWidget } from './QuizHotspotsWidget';
import { ExportReportModal } from './ExportReportModal';
import {
  Users,
  CheckCircle2,
  Flame,
  TrendingUp,
  BookOpen,
  Award,
  BarChart3,
  Download,
} from 'lucide-react';

export const AdminAnalyticsDashboard: React.FC = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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

  const { data: aiTutorSummary, isLoading: aiTutorLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'ai-tutor'],
    queryFn: adminAnalyticsApi.getAiTutorSummary,
  });

  const { data: quizHotspots = [], isLoading: quizHotspotsLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'quizzes', 'hotspots'],
    queryFn: adminAnalyticsApi.getQuizHotspots,
  });

  if (overviewLoading || coursesLoading) {
    return (
      <div className="py-16 text-center text-zinc-500 text-xs font-mono" data-testid="analytics-loading">
        Загрузка аналитических данных платформы...
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="admin-analytics-dashboard">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-sm font-bold text-white">Платформенная аналитика и когорты</h2>
          <p className="text-xs text-zinc-400">
            Метрики вовлеченности, отсева, ударного режима и AI-наставника
          </p>
        </div>

        <div className="flex items-center gap-3">
          {courses.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="dashboardCourseSelect" className="text-xs text-zinc-400">
                Курс:
              </label>
              <select
                id="dashboardCourseSelect"
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

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs text-white font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-300" />
            <span>Экспорт отчета</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Students */}
        <div className="p-4 rounded-sm bg-[#18181b] border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs">Студентов</span>
            <Users className="w-4 h-4 text-zinc-400" />
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
            <BookOpen className="w-4 h-4 text-zinc-400" />
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
            <CheckCircle2 className="w-4 h-4 text-zinc-400" />
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
            <Award className="w-4 h-4 text-zinc-400" />
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
            <TrendingUp className="w-4 h-4 text-zinc-400" />
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
            <Flame className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {overview?.averageStreak ?? 0} <span className="text-xs font-normal text-zinc-400 font-sans">дн.</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Ударный темп</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Course Funnel */}
        <div className="lg:col-span-2 p-6 rounded-sm bg-[#18181b] border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-0.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Воронка курса (Drop-off Rate)</span>
              </div>
              <h3 className="text-sm font-bold text-white">Пошаговое прохождение курса</h3>
            </div>
            {effectiveCourseId && (
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/5">
                {courses.find((c) => c.id === effectiveCourseId)?.title || 'Курс'}
              </span>
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
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-0.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Ударный режим</span>
            </div>
            <h3 className="text-sm font-bold text-white">Распределение Streak</h3>
          </div>

          {streaksLoading ? (
            <div className="text-center py-12 text-zinc-500 text-xs font-mono">Загрузка распределения...</div>
          ) : (
            <StreakDistributionChart distributions={streaks} />
          )}
        </div>
      </div>

      {/* Row 2: AI Tutor Telemetry + Quiz Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AiTutorTelemetryWidget telemetry={aiTutorSummary} isLoading={aiTutorLoading} />
        <QuizHotspotsWidget hotspots={quizHotspots} isLoading={quizHotspotsLoading} />
      </div>

      {/* Row 3: Cohort Lesson Retention Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Когортное удержание по урокам</h3>
            <p className="text-xs text-zinc-400">
              Конверсия, точки отсева и среднее время прохождения каждого дня
            </p>
          </div>
          {retention && (
            <div className="text-xs font-mono text-zinc-400 bg-zinc-900/60 px-3 py-1 rounded border border-white/5 self-start sm:self-auto">
              Записано: <span className="text-white font-semibold">{retention.totalEnrolled}</span> • Завершили: <span className="text-zinc-200 font-semibold">{retention.completedCount} ({retention.overallCompletionRate}%)</span>
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

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        selectedCourseId={effectiveCourseId}
        courses={courses}
      />
    </div>
  );
};
