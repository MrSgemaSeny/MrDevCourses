import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '@/entities/lesson/api/lessonApi';
import {
  AlertTriangle,
  ChevronDown,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Wrench,
} from 'lucide-react';

interface LessonPitfallsAccordionProps {
  courseId: number;
  lessonId: number;
}

export const LessonPitfallsAccordion: React.FC<LessonPitfallsAccordionProps> = ({
  courseId,
  lessonId,
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: pitfalls = [], isLoading } = useQuery({
    queryKey: ['lesson-pitfalls', courseId, lessonId],
    queryFn: () => lessonApi.getPitfalls(courseId, lessonId),
  });

  const handleToggle = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCopySolution = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-4 rounded-sm bg-[#0e0e11] border border-white/5 animate-pulse flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-white/10" />
        <div className="h-3 w-48 bg-white/10 rounded" />
      </div>
    );
  }

  if (pitfalls.length === 0) {
    return null;
  }

  const filteredPitfalls = pitfalls.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.errorSymptom && p.errorSymptom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.solutionMarkdown.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-5 rounded-sm bg-[#0e0e11] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Типичные ошибки и грабли (FAQ)
            </h3>
            <p className="text-[11px] text-zinc-400">
              Проверьте эти решения, если что-то не компилируется или падает с ошибкой.
            </p>
          </div>
        </div>

        {/* Quick Search */}
        {pitfalls.length > 2 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по ошибке..."
              className="w-full pl-8 pr-3 py-1.5 rounded-sm bg-[#0a0a0c] border border-white/10 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-white/30 font-mono transition-colors"
            />
          </div>
        )}
      </div>

      {/* Accordion List */}
      <div className="space-y-2">
        {filteredPitfalls.map((pitfall) => {
          const isExpanded = expandedId === pitfall.id;

          return (
            <div
              key={pitfall.id}
              className={`rounded-sm border transition-colors ${
                isExpanded
                  ? 'bg-[#121215] border-white/15'
                  : 'bg-[#0a0a0c] border-white/5 hover:border-white/10'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggle(pitfall.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left gap-3 cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Wrench className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-200 hover:text-white truncate">
                    {pitfall.title}
                  </span>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-500 shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3">
                  {/* Error Symptom in Terminal Style */}
                  {pitfall.errorSymptom && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-rose-400" />
                        <span>Симптом / Текст ошибки:</span>
                      </div>
                      <div className="p-2.5 rounded bg-black/60 border border-white/5 font-mono text-[11px] text-rose-300 overflow-x-auto leading-relaxed select-all">
                        {pitfall.errorSymptom}
                      </div>
                    </div>
                  )}

                  {/* Solution Block */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        <span>Как исправить:</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopySolution(pitfall.id, pitfall.solutionMarkdown)}
                        className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === pitfall.id ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            <span className="text-white">Скопировано</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-zinc-500" />
                            <span>Скопировать</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded bg-[#0a0a0c] border border-white/10 text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {pitfall.solutionMarkdown}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};