import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuickNav } from '@/widgets/quick-nav';
import { GLOSSARY_TERMS } from '@/entities/glossary';
import { Tag, HelpCircle, ArrowRight } from 'lucide-react';


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

  // Determine relevant terms strictly for current day / week
  const resolvedTerms = useMemo(() => {
    if (terms && terms.length > 0) {
      return terms;
    }

    if (dayNumber !== undefined) {
      const byDay = GLOSSARY_TERMS.filter((t) => t.relatedDayNumbers?.includes(dayNumber));
      if (byDay.length > 0) {
        return byDay.map((t) => t.term);
      }

      // Pedagogical fallback: show only terms from the same week/module
      const week = Math.ceil(dayNumber / 6);
      const weekDays = Array.from({ length: 6 }, (_, i) => (week - 1) * 6 + i + 1);
      const byWeek = GLOSSARY_TERMS.filter((t) =>
        t.relatedDayNumbers?.some((d) => weekDays.includes(d))
      );
      if (byWeek.length > 0) {
        return byWeek.slice(0, 6).map((t) => t.term);
      }
    }

    // Default introductory concepts
    return [
      'Вайбкодинг (Vibe Coding)',
      'Промпт-инжиниринг (Prompt Engineering)',
      'Git (Система контроля версий)',
      'Feature-Sliced Design (FSD)',
    ];
  }, [terms, dayNumber]);

  return (
    <div
      data-testid="lesson-context-panel"
      className="p-5 rounded-sm bg-[#0e0e11] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
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

        <Link
          to="/docs"
          className="self-start sm:self-auto text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors font-mono"
        >
          <span>Вся документация</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
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
              className="px-3 py-1.5 rounded-sm bg-[#0a0a0c] border border-white/5 hover:border-zinc-500 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer group"
            >
              <span className="text-zinc-500 font-mono">#</span>
              <span>{termName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
