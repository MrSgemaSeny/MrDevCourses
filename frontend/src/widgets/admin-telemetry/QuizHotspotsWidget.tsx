import React from 'react';
import { QuizHotspot } from '@/entities/adminAnalyticsApi';
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

interface QuizHotspotsWidgetProps {
  hotspots?: QuizHotspot[];
  isLoading?: boolean;
}

export const QuizHotspotsWidget: React.FC<QuizHotspotsWidgetProps> = ({
  hotspots = [],
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-sm bg-[#18181b] border border-white/5 text-center text-zinc-500 text-xs font-mono">
        Загрузка проблемных вопросов квизов...
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-sm bg-[#18181b] border border-white/5 space-y-4"
      data-testid="quiz-hotspots-widget"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-0.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Quiz Failure Hotspots</span>
          </div>
          <h3 className="text-sm font-bold text-white">Топ ошибок и неудачных попыток в квизах</h3>
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          {hotspots.length} вопросов с ошибками
        </span>
      </div>

      {hotspots.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900/40 border border-white/5 rounded text-zinc-400 text-xs flex flex-col items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-zinc-300" />
          <span>Все студенты успешно сдают вопросы квизов без выраженных точек отсева.</span>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {hotspots.map((h) => (
            <div
              key={h.questionId}
              className="p-3.5 rounded bg-zinc-900/60 border border-white/5 space-y-2 text-xs hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white leading-snug">{h.questionText}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Квиз: <span className="text-zinc-300 font-medium">{h.quizTitle}</span> • Урок: <span className="text-zinc-300">{h.lessonTitle}</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right font-mono">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-200 border border-white/10 font-semibold">
                    {h.failureRate}% ошибок
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400">
                <div className="flex items-center gap-3">
                  <span>
                    Попыток: <strong className="text-white font-mono">{h.totalAttempts}</strong>
                  </span>
                  <span>
                    Не сдано: <strong className="text-zinc-200 font-mono">{h.failureCount}</strong>
                  </span>
                  <span>
                    Pass Rate: <strong className="text-zinc-200 font-mono">{h.passRate}%</strong>
                  </span>
                </div>

                {h.mostCommonWrongOption && h.mostCommonWrongOption !== '—' && (
                  <div className="text-zinc-400 truncate max-w-sm">
                    Частый неверный ответ: <span className="text-zinc-200 font-mono">«{h.mostCommonWrongOption}»</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
