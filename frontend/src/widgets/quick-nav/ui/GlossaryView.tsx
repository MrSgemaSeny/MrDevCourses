import React, { useState, useEffect, useMemo } from 'react';
import { GLOSSARY_TERMS, GlossaryCategory, GlossaryTerm } from '@/entities/glossary';
import { useQuickNav } from '../model/QuickNavContext';
import { Search, X, Copy, Check, BookOpen, Code, Tag, Calendar } from 'lucide-react';

interface GlossaryViewProps {
  initialSearch?: string | null;
  dayNumber?: number | null;
  onSelectTerm?: (term: GlossaryTerm) => void;
}

const CATEGORIES: { key: GlossaryCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'security', label: 'Безопасность' },
  { key: 'backend', label: 'Бэкенд' },
  { key: 'frontend', label: 'Фронтенд' },
  { key: 'ai', label: 'AI & LLM' },
  { key: 'devops', label: 'DevOps & БД' },
  { key: 'core', label: 'Core' },
];

export const GlossaryView: React.FC<GlossaryViewProps> = ({ initialSearch, dayNumber: propDayNumber, onSelectTerm }) => {
  let contextDayNumber: number | null = null;
  try {
    const quickNav = useQuickNav();
    contextDayNumber = quickNav.dayNumber;
  } catch {
    // optional outside provider
  }

  const currentDay = propDayNumber !== undefined ? propDayNumber : contextDayNumber;

  const [search, setSearch] = useState<string>(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>('all');
  const [scopeFilter, setScopeFilter] = useState<'lesson' | 'all'>(currentDay ? 'lesson' : 'all');
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);
  const [copiedTermId, setCopiedTermId] = useState<string | null>(null);

  // When initialSearch changes from outside (e.g. term chip clicked)
  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
      setScopeFilter('all');
      // Try to auto-expand matching term
      const match = GLOSSARY_TERMS.find(
        (t) =>
          t.id.toLowerCase() === initialSearch.toLowerCase() ||
          t.term.toLowerCase().includes(initialSearch.toLowerCase())
      );
      if (match) {
        setExpandedTermId(match.id);
        setSelectedCategory('all');
      }
    }
  }, [initialSearch]);

  // Sync scope when lesson changes
  useEffect(() => {
    if (currentDay && !initialSearch) {
      setScopeFilter('lesson');
    }
  }, [currentDay, initialSearch]);

  const lessonTermsCount = useMemo(() => {
    if (!currentDay) return 0;
    return GLOSSARY_TERMS.filter((t) => t.relatedDayNumbers?.includes(currentDay)).length;
  }, [currentDay]);

  const filteredTerms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GLOSSARY_TERMS.filter((term) => {
      // If scoped to current lesson and user is not searching freeform text
      if (scopeFilter === 'lesson' && currentDay && !q) {
        if (!term.relatedDayNumbers || !term.relatedDayNumbers.includes(currentDay)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && term.category !== selectedCategory) {
        return false;
      }

      // Text search
      if (q) {
        const matchTerm = term.term.toLowerCase().includes(q);
        const matchShort = term.shortDefinition.toLowerCase().includes(q);
        const matchFull = term.fullExplanation.toLowerCase().includes(q);
        const matchTags = term.tags.some((tag) => tag.toLowerCase().includes(q));
        const matchCategory = term.category.toLowerCase().includes(q);
        return matchTerm || matchShort || matchFull || matchTags || matchCategory;
      }
      return true;
    });
  }, [search, selectedCategory, scopeFilter, currentDay]);

  const handleCopyCode = (termId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTermId(termId);
    setTimeout(() => {
      setCopiedTermId((current) => (current === termId ? null : current));
    }, 2000);
  };

  const getCategoryBadgeClass = (_category: GlossaryCategory) => {
    return 'bg-white/10 border-white/20 text-white font-mono';
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Lesson vs All Scope Filter Toggle */}
      {currentDay && (
        <div className="flex items-center gap-1.5 p-1 bg-[#0e0e11] border border-white/5 rounded-sm">
          <button
            type="button"
            onClick={() => {
              setScopeFilter('lesson');
              setSelectedCategory('all');
            }}
            className={`flex-1 py-1 px-2 rounded text-[11px] font-mono transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              scopeFilter === 'lesson' && !search
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Урок {currentDay} ({lessonTermsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setScopeFilter('all')}
            className={`flex-1 py-1 px-2 rounded text-[11px] font-mono transition-all cursor-pointer text-center ${
              scopeFilter === 'all' || search
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Все термины ({GLOSSARY_TERMS.length})
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value.trim()) {
              setScopeFilter('all');
            }
          }}
          placeholder="Поиск терминов, концепций, тегов..."
          className="w-full pl-9 pr-8 py-2 text-xs bg-[#0e0e11] border border-white/10 rounded-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors font-mono"
          aria-label="Поиск по глоссарию"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
            aria-label="Очистить поиск"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-2.5 py-1 rounded-sm text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'bg-[#0e0e11] border border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Term Counter & Docs Page Link */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-0.5">
        <span>
          Найдено терминов: {filteredTerms.length}
          {scopeFilter === 'lesson' && currentDay && !search ? ` (Урок ${currentDay})` : ''}
        </span>
        {scopeFilter === 'lesson' && currentDay && !search ? (
          <button
            onClick={() => setScopeFilter('all')}
            className="text-zinc-400 hover:text-white underline cursor-pointer"
          >
            Все термины &rarr;
          </button>
        ) : (search || selectedCategory !== 'all' || (scopeFilter === 'all' && currentDay)) ? (
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              if (currentDay) setScopeFilter('lesson');
            }}
            className="text-zinc-400 hover:text-white underline cursor-pointer"
          >
            {currentDay ? `К Уроку ${currentDay}` : 'Сбросить фильтры'}
          </button>
        ) : (
          <a
            href={`${import.meta.env.BASE_URL}docs`}
            className="text-zinc-400 hover:text-white underline flex items-center gap-1"
          >
            Вся документация &rarr;
          </a>
        )}
      </div>

      {/* Terms List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredTerms.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2">
            <BookOpen className="w-8 h-8 text-zinc-600 opacity-60" />
            <p>Термины по запросу не найдены.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
              }}
              className="mt-2 px-3 py-1.5 text-xs bg-zinc-800 text-zinc-200 rounded-md hover:bg-zinc-700 cursor-pointer"
            >
              Показать все термины
            </button>
          </div>
        ) : (
          filteredTerms.map((term) => {
            const isExpanded = expandedTermId === term.id;
            const isCopied = copiedTermId === term.id;

            return (
              <div
                key={term.id}
                data-testid={`glossary-card-${term.id}`}
                className={`p-3.5 rounded-sm border transition-all ${
                  isExpanded
                    ? 'bg-[#0e0e11] border-zinc-500/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'bg-[#0e0e11]/70 border-white/5 hover:border-white/5'
                }`}
              >
                {/* Header */}
                <div
                  className="flex items-start justify-between gap-2 cursor-pointer"
                  onClick={() => {
                    setExpandedTermId(isExpanded ? null : term.id);
                    if (onSelectTerm) onSelectTerm(term);
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white tracking-tight">{term.term}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase tracking-wider ${getCategoryBadgeClass(
                          term.category
                        )}`}
                      >
                        {term.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{term.shortDefinition}</p>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-fadeIn">
                    {/* Full Explanation */}
                    <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
                      {term.fullExplanation}
                    </div>

                    {/* Code Snippet */}
                    {term.codeSnippet && (
                      <div className="rounded-sm bg-[#0a0a0c] border border-white/5 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e0e11] border-b border-white/5 text-[10px] text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Code className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Пример реализации</span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(term.id, term.codeSnippet!)}
                            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            aria-label="Копировать код"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-white" />
                                <span className="text-white font-medium">Скопировано</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Копировать</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 text-xs font-mono text-zinc-300 overflow-x-auto leading-normal">
                          <code>{term.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {/* Metadata Footer: Days and Tags */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-zinc-500">
                      {term.relatedDayNumbers && term.relatedDayNumbers.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>Уроки:</span>
                          <div className="flex gap-1">
                            {term.relatedDayNumbers.map((day) => (
                              <span
                                key={day}
                                className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]"
                              >
                                Урок {day}
                              </span>

                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Tag className="w-3 h-3 text-zinc-500" />
                        {term.tags.map((tag) => (
                          <span key={tag} className="text-zinc-500 hover:text-zinc-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
