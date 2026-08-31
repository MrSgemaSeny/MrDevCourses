import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CourseModule, LessonSummary } from '@/shared/types';
import { ChevronDown, ChevronUp, Play, FileText, HelpCircle, Code2, Lock, CheckCircle2 } from 'lucide-react';

interface CourseCurriculumAccordionProps {
  courseId: number;
  modules: CourseModule[];
  enrolled?: boolean;
}

export const CourseCurriculumAccordion: React.FC<CourseCurriculumAccordionProps> = ({
  courseId,
  modules,
  enrolled = false,
}) => {
  const navigate = useNavigate();

  // 1st module expanded by default
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    if (modules.length > 0) {
      initial[modules[0].id] = true;
    }
    return initial;
  });

  const allExpanded = modules.length > 0 && modules.every((m) => expandedModules[m.id]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedModules({});
    } else {
      const all: Record<number, boolean> = {};
      modules.forEach((m) => {
        all[m.id] = true;
      });
      setExpandedModules(all);
    }
  };

  const getLessonTypeIcon = (type?: string) => {
    switch (type) {
      case 'ARTICLE':
        return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
      case 'QUIZ':
        return <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />;
      case 'PRACTICE':
        return <Code2 className="w-3.5 h-3.5 text-zinc-400" />;
      default:
        return <Play className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const totalLessons = modules.reduce((acc: number, m: CourseModule) => acc + (m.lessonsCount || (m.lessons?.length ?? 0)), 0);
  const totalMinutes = modules.reduce((acc: number, m: CourseModule) => {
    const moduleMins = (m.lessons || []).reduce((lAcc: number, l: LessonSummary) => lAcc + (l.durationMinutes || 0), 0);
    return acc + moduleMins;
  }, 0);

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  if (modules.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Программа курса</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {modules.length} модулей &bull; {totalLessons} уроков {totalHours > 0 ? `• ~${totalHours} ч.` : '• --:--'}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded hover:bg-zinc-900"
        >
          {allExpanded ? 'Свернуть все' : 'Развернуть все'}
        </button>
      </div>

      {/* Modules list */}
      <div className="space-y-3">
        {modules.map((mod, idx) => {
          const isExpanded = !!expandedModules[mod.id];
          const moduleLessons = mod.lessons || [];
          const moduleDuration = moduleLessons.reduce((acc: number, l: LessonSummary) => acc + (l.durationMinutes || 0), 0);

          return (
            <div
              key={mod.id}
              className="bg-[#0e0e11] border border-white/5 rounded-sm overflow-hidden transition-colors"
            >
              {/* Module Header Button */}
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                aria-expanded={isExpanded}
              >
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      Неделя {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-white truncate">{mod.title}</h3>
                    {mod.isFreePreview && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-zinc-300 border border-white/10">
                        Бесплатный модуль
                      </span>
                    )}
                  </div>

                  {mod.description && (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{mod.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs text-zinc-500 font-mono">
                  <span>
                    {moduleLessons.length} {moduleLessons.length === 1 ? 'урок' : 'уроков'}
                    {moduleDuration > 0 ? ` • ${moduleDuration} мин` : ' • --:--'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </button>

              {/* Module Lessons Accordion Body */}
              {isExpanded && (
                <div className="px-5 pb-4 pt-1 space-y-1.5 border-t border-white/5 bg-[#0a0a0c]/60">
                  {moduleLessons.map((lessonItem, lessonIdx) => {
                    const isClickable = (lessonItem.accessible && enrolled) || lessonItem.isFreePreview;
                    const cleanTitle = lessonItem.title
                      .replace(/^(Урок|День)\s*\d+:\s*/i, '')
                      .trim();
                    const displayTitle = `Урок ${lessonIdx + 1}: ${cleanTitle}`;

                    return (
                      <div
                        key={lessonItem.id}
                        onClick={() => {
                          if (isClickable) {
                            navigate(`/courses/${courseId}/lessons/${lessonItem.id}`);
                          }
                        }}
                        className={`p-3 rounded-sm border text-xs flex items-center justify-between transition-all bg-[#0e0e11] border-white/5 ${
                          isClickable
                            ? 'hover:border-zinc-500 hover:bg-[#141418] text-zinc-200 cursor-pointer'
                            : 'opacity-70 text-zinc-500 cursor-default'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1 rounded bg-[#0a0a0c] border border-white/5 shrink-0">
                            {getLessonTypeIcon(lessonItem.lessonType)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate">{displayTitle}</div>
                            <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                              <span>{lessonItem.lessonType || 'VIDEO'}</span>
                              <span>&bull; {lessonItem.durationMinutes && lessonItem.durationMinutes > 0 ? `${lessonItem.durationMinutes} мин` : '--:--'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {lessonItem.completed ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white border border-white/20 flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3 h-3 text-white" /> Пройден
                            </span>
                          ) : lessonItem.isFreePreview && !enrolled ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-zinc-300 border border-white/10 font-mono">
                              Бесплатно
                            </span>
                          ) : lessonItem.accessible && enrolled ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#141418] border border-white/10 text-zinc-300 font-mono">
                              Доступен
                            </span>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-zinc-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
