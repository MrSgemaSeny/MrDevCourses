import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LessonSummary } from '@/shared/types';
import { CountdownTimer } from '@/shared/ui/CountdownTimer';
import { CheckCircle2, Play, Lock } from 'lucide-react';

interface VisualRoadmapProps {
  courseId: number;
  lessons: LessonSummary[];
  currentLessonId?: number;
}

export const VisualRoadmap: React.FC<VisualRoadmapProps> = ({
  courseId,
  lessons,
  currentLessonId,
}) => {
  const navigate = useNavigate();

  if (!lessons || lessons.length === 0) {
    return null;
  }

  const handleLessonClick = (lesson: LessonSummary) => {
    if (lesson.accessible) {
      navigate(`/courses/${courseId}/lessons/${lesson.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, lesson: LessonSummary) => {
    if ((e.key === 'Enter' || e.key === ' ') && lesson.accessible) {
      e.preventDefault();
      handleLessonClick(lesson);
    }
  };

  return (
    <div className="py-6 px-4 rounded-sm bg-[#0e0e11] border border-white/5">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Интерактивный Roadmap курса</h3>
          <p className="text-xs text-zinc-400">1 неделя — 6 уроков. График последовательного открытия.</p>
        </div>
        <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-white/5">
          {lessons.filter((l) => l.completed).length} / {lessons.length} завершено
        </span>
      </div>

      {/* Connected Nodes Roadmap */}
      <div className="relative">
        <div className="space-y-4">
          {lessons.map((lesson, idx) => {
            const isCurrent = lesson.id === currentLessonId;
            const isLast = idx === lessons.length - 1;
            const lessonTitle = lesson.title.startsWith(`Урок ${lesson.dayNumber}:`)
              ? lesson.title
              : lesson.title.startsWith(`День ${lesson.dayNumber}:`)
              ? lesson.title.replace(`День ${lesson.dayNumber}:`, `Урок ${lesson.dayNumber}:`)
              : `Урок ${lesson.dayNumber}: ${lesson.title}`;
            const labelText = `${lessonTitle}${
              lesson.completed ? ' (Завершен)' : lesson.accessible ? ' (Доступен)' : ' (Заблокирован)'
            }`;


            return (
              <div key={lesson.id} className="relative flex items-start gap-4">
                {/* Connecting vertical line */}
                {!isLast && (
                  <div
                    className={`absolute left-4.5 top-9 bottom-[-16px] w-0.5 ${
                      lesson.completed ? 'bg-emerald-500/60' : 'bg-zinc-800'
                    }`}
                  />
                )}

                {/* Node circle */}
                <div
                  role={lesson.accessible ? 'button' : undefined}
                  tabIndex={lesson.accessible ? 0 : -1}
                  aria-label={labelText}
                  onClick={() => handleLessonClick(lesson)}
                  onKeyDown={(e) => handleKeyDown(e, lesson)}
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                    lesson.accessible ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400' : 'cursor-not-allowed'
                  } ${
                    lesson.completed
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : isCurrent
                      ? 'bg-white text-black border-2 border-white shadow-[0_0_16px_rgba(255,255,255,0.4)] animate-pulse'
                      : lesson.accessible
                      ? 'bg-zinc-800 border border-zinc-600 text-white hover:border-white'
                      : 'bg-zinc-950 border border-white/5 text-zinc-600'
                  }`}
                >
                  {lesson.completed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : lesson.accessible ? (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Node details */}
                <div
                  role={lesson.accessible ? 'button' : undefined}
                  tabIndex={lesson.accessible ? 0 : -1}
                  aria-label={labelText}
                  onClick={() => handleLessonClick(lesson)}
                  onKeyDown={(e) => handleKeyDown(e, lesson)}
                  className={`flex-1 p-3.5 rounded-sm border transition-all ${
                    lesson.accessible ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400' : 'cursor-not-allowed'
                  } ${
                    isCurrent
                      ? 'bg-zinc-800/90 border-zinc-500 text-white'
                      : lesson.accessible
                      ? 'bg-zinc-900/60 border-white/5/90 hover:border-white/5 text-zinc-200'
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-500'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-400">Урок {lesson.dayNumber}</span>
                      <h4 className={`text-xs font-semibold ${lesson.accessible ? 'text-white' : 'text-zinc-500'}`}>
                        {lesson.title.startsWith(`Урок ${lesson.dayNumber}:`)
                          ? lesson.title
                          : lesson.title.startsWith(`День ${lesson.dayNumber}:`)
                          ? lesson.title.replace(`День ${lesson.dayNumber}:`, `Урок ${lesson.dayNumber}:`)
                          : lesson.title}
                      </h4>
                    </div>


                    {lesson.completed ? (
                      <span className="text-[10px] text-emerald-400 font-medium self-start sm:self-auto">Завершен</span>
                    ) : lesson.accessible ? (
                      <span className="text-[10px] text-zinc-300 font-medium self-start sm:self-auto">Открыть урок</span>
                    ) : (
                      <div className="self-start sm:self-auto">
                        <CountdownTimer targetDate={lesson.opensAt} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
