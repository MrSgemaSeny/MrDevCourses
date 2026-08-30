import React from 'react';
import { AiTutorTelemetry } from '@/entities/adminAnalyticsApi';
import { Bot, Zap, ShieldAlert, Users, MessageSquare } from 'lucide-react';

interface AiTutorTelemetryWidgetProps {
  telemetry?: AiTutorTelemetry | null;
  isLoading?: boolean;
}

export const AiTutorTelemetryWidget: React.FC<AiTutorTelemetryWidgetProps> = ({
  telemetry,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-sm bg-[#18181b] border border-white/5 text-center text-zinc-500 text-xs font-mono">
        Загрузка телеметрии AI-наставника...
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-sm bg-[#18181b] border border-white/5 space-y-5"
      data-testid="ai-tutor-telemetry-widget"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-0.5">
            <Bot className="w-3.5 h-3.5" />
            <span>Телеметрия AI Tutor</span>
          </div>
          <h3 className="text-sm font-bold text-white">Активность AI-наставника</h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-white/5">
          RAG Hybrid Search
        </span>
      </div>

      {/* Mini KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded bg-zinc-900/80 border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px]">Всего вопросов</span>
            <MessageSquare className="w-3 h-3 text-zinc-300" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {telemetry?.totalQuestions ?? 0}
          </div>
        </div>

        <div className="p-3 rounded bg-zinc-900/80 border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px]">Токены (расчёт)</span>
            <Zap className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {telemetry?.estimatedTokensUsed ? telemetry.estimatedTokensUsed.toLocaleString() : 0}
          </div>
        </div>

        <div className="p-3 rounded bg-zinc-900/80 border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px]">Троттлинг (лимит)</span>
            <ShieldAlert className="w-3 h-3 text-red-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {telemetry?.throttledCount ?? 0}
          </div>
        </div>

        <div className="p-3 rounded bg-zinc-900/80 border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px]">Студентов / ср.</span>
            <Users className="w-3 h-3 text-zinc-300" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {telemetry?.activeUsersCount ?? 0} <span className="text-xs font-normal text-zinc-400 font-sans">({telemetry?.avgQuestionsPerUser ?? 0})</span>
          </div>
        </div>
      </div>

      {/* Top Question Topics / Lessons */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-zinc-300">
          Топ тем и уроков по числу обращений к AI:
        </h4>

        {!telemetry?.topLessonTopics || telemetry.topLessonTopics.length === 0 ? (
          <div className="p-4 text-center rounded bg-zinc-900/40 border border-white/5 text-xs text-zinc-500">
            Вопросов к AI наставнику пока не зафиксировано.
          </div>
        ) : (
          <div className="space-y-2">
            {telemetry.topLessonTopics.map((topic) => (
              <div
                key={topic.lessonId}
                className="p-2.5 rounded bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{topic.lessonTitle}</span>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      ({topic.courseTitle})
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, topic.percentage))}%` }}
                    />
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <span className="text-white font-semibold">{topic.questionCount}</span>
                  <span className="text-zinc-500 text-[10px] ml-1">({topic.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
