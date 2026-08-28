import React, { useMemo } from 'react';
import { useQuickNav } from '@/widgets/quick-nav';
import { GLOSSARY_TERMS } from '@/entities/glossary';
import { Tag, HelpCircle, Flame, Map, ArrowRight } from 'lucide-react';


interface LessonContextPanelProps {
  terms?: string[];
  dayNumber?: number;
  courseId?: number;
  lessonId?: number;
}

export const LessonContextPanel: React.FC<LessonContextPanelProps> = ({
  terms,
  dayNumber,
}) => {
  const { openQuickNav } = useQuickNav();

  // Determine relevant terms either from explicit list or by dayNumber / defaults
  const resolvedTerms = useMemo(() => {
    if (terms && terms.length > 0) {
      return terms;
    }

    if (dayNumber !== undefined) {
      const byDay = GLOSSARY_TERMS.filter((t) => t.relatedDayNumbers?.includes(dayNumber));
      if (byDay.length > 0) {
        return byDay.map((t) => t.term);
      }
    }

    // Default core concepts
    return ['JWT (JSON Web Token)', 'Bucket4j (Token Bucket Rate Limiting)', 'Row-Level Security & IDOR Defense', 'Drip-Content (Капельный контент)', 'Flyway DB Migration', 'Feature-Sliced Design (FSD)'];
  }, [terms, dayNumber]);

  return (
    <div
      data-testid="lesson-context-panel"
      className="p-5 rounded-sm bg-[#18181b] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#21262d]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-300">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight uppercase">
              Не понятен термин или концепция?
            </h3>
            <p className="text-xs text-zinc-400">
              Нажмите на термин для мгновенного разбора в контекстной панели
            </p>
          </div>
        </div>

        <button
          onClick={() => openQuickNav('glossary', null)}
          className="self-start sm:self-auto text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Полный глоссарий</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Clickable Term Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Tag className="w-3.5 h-3.5 text-zinc-500" />
          <span>Ключевые термины этого урока:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {resolvedTerms.map((termName) => (
            <button
              key={termName}
              data-testid={`term-chip-${termName}`}
              onClick={() => openQuickNav('glossary', termName)}
              className="px-3 py-1.5 rounded-sm bg-[#0d1117] border border-white/5 hover:border-amber-400/60 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer group"
            >
              <span className="text-amber-400 font-mono">#</span>
              <span>{termName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fast Navigation Shortcuts */}
      <div className="pt-3 border-t border-[#21262d] flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-zinc-500 text-xs">
          Быстрый просмотр без перезагрузки видео:
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openQuickNav('progress')}
            className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Мой прогресс</span>
          </button>

          <button
            onClick={() => openQuickNav('roadmap')}
            className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Map className="w-3.5 h-3.5 text-zinc-100" />
            <span>Roadmap курса</span>
          </button>
        </div>
      </div>
    </div>
  );
};
