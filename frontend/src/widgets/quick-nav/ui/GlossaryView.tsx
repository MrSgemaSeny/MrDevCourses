import React, { useState, useEffect, useMemo } from 'react';
import { GLOSSARY_TERMS, GlossaryCategory, GlossaryTerm } from '@/entities/glossary';
import { Search, X, Copy, Check, BookOpen, Code, Tag, Calendar } from 'lucide-react';


interface GlossaryViewProps {
  initialSearch?: string | null;
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

export const GlossaryView: React.FC<GlossaryViewProps> = ({ initialSearch, onSelectTerm }) => {
  const [search, setSearch] = useState<string>(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>('all');
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);
  const [copiedTermId, setCopiedTermId] = useState<string | null>(null);

  // When initialSearch changes from outside (e.g. term chip clicked)
  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
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

  const filteredTerms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GLOSSARY_TERMS.filter((term) => {
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
  }, [search, selectedCategory]);

  const handleCopyCode = (termId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTermId(termId);
    setTimeout(() => {
      setCopiedTermId((current) => (current === termId ? null : current));
    }, 2000);
  };

  const getCategoryBadgeClass = (category: GlossaryCategory) => {
    switch (category) {
      case 'security':
        return 'bg-red-950/60 border-red-800/80 text-red-300';
      case 'backend':
        return 'bg-blue-950/60 border-blue-800/80 text-blue-300';
      case 'frontend':
        return 'bg-purple-950/60 border-purple-800/80 text-purple-300';
      case 'ai':
        return 'bg-amber-950/60 border-amber-800/80 text-amber-300';
      case 'devops':
        return 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300';
      default:
        return 'bg-zinc-800 border-white/5 text-zinc-300';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск терминов, концепций, тегов..."
          className="w-full pl-9 pr-8 py-2 text-xs bg-[#18181b] border border-white/5 rounded-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
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
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-200 text-zinc-900 shadow-sm'
                  : 'bg-[#18181b] border border-[#21262d] text-zinc-400 hover:text-white hover:border-white/5'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Term Counter */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-0.5">
        <span>Найдено терминов: {filteredTerms.length}</span>
        {(search || selectedCategory !== 'all') && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
            }}
            className="text-amber-400 hover:underline cursor-pointer"
          >
            Сбросить фильтры
          </button>
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
                    ? 'bg-[#18181b] border-zinc-500/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'bg-[#18181b]/70 border-[#21262d] hover:border-white/5'
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
                  <div className="mt-3 pt-3 border-t border-[#21262d] space-y-3 animate-fadeIn">
                    {/* Full Explanation */}
                    <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
                      {term.fullExplanation}
                    </div>

                    {/* Code Snippet */}
                    {term.codeSnippet && (
                      <div className="rounded-sm bg-[#0d1117] border border-[#21262d] overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-[#18181b] border-b border-[#21262d] text-[11px] text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Code className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Пример реализации</span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(term.id, term.codeSnippet!)}
                            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            aria-label="Копировать код"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Скопировано</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Копировать</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto leading-normal">
                          <code>{term.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {/* Metadata Footer: Days and Tags */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-500">
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
                                День {day}
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
