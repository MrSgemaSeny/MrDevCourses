import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { GLOSSARY_TERMS, GlossaryCategory } from '@/entities/glossary';
import {
  Search,
  X,
  Copy,
  Check,
  BookOpen,
  Code,
  Tag,
  Calendar,
  ChevronRight,
} from 'lucide-react';

const CATEGORIES: { key: GlossaryCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Все концепции' },
  { key: 'security', label: 'Безопасность' },
  { key: 'backend', label: 'Бэкенд' },
  { key: 'frontend', label: 'Фронтенд' },
  { key: 'ai', label: 'AI & LLM' },
  { key: 'devops', label: 'DevOps & БД' },
  { key: 'core', label: 'Core' },
];

export const DocsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTag = searchParams.get('tag');
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = (searchParams.get('category') as GlossaryCategory | 'all') || 'all';

  const [search, setSearch] = useState<string>(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>(initialCategory);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);
  const [copiedTermId, setCopiedTermId] = useState<string | null>(null);

  // Synchronize state from URL search params
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    const queryFromUrl = searchParams.get('q');
    const catFromUrl = searchParams.get('category') as GlossaryCategory | 'all';

    if (tagFromUrl !== null) setSelectedTag(tagFromUrl);
    if (queryFromUrl !== null) setSearch(queryFromUrl);
    if (catFromUrl) setSelectedCategory(catFromUrl);
  }, [searchParams]);

  // Extract all unique hashtags sorted by frequency
  const allTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    GLOSSARY_TERMS.forEach((term) => {
      term.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, []);

  const handleSelectTag = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
      searchParams.delete('tag');
    } else {
      setSelectedTag(tag);
      searchParams.set('tag', tag);
    }
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (cat: GlossaryCategory | 'all') => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (val.trim()) {
      searchParams.set('q', val.trim());
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedTag(null);
    setSearchParams({});
  };

  const filteredTerms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GLOSSARY_TERMS.filter((term) => {
      // Category filter
      if (selectedCategory !== 'all' && term.category !== selectedCategory) {
        return false;
      }
      // Tag filter
      if (selectedTag && !term.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
        return false;
      }
      // Query filter
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
  }, [search, selectedCategory, selectedTag]);

  const handleCopyCode = (termId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTermId(termId);
    setTimeout(() => {
      setCopiedTermId((current) => (current === termId ? null : current));
    }, 2000);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-zinc-100">
      {/* 75% Column Alignment matching Design System */}
      <div className="w-full lg:w-[75%] max-w-[1080px] space-y-8">
        {/* Breadcrumb Header */}
        <nav className="flex items-center gap-2 text-xs font-mono text-zinc-500 pb-4 border-b border-white/5">
          <Link to="/" className="text-zinc-400 hover:text-white transition-colors">
            Главная
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span className="text-white font-medium">База знаний и документация</span>
        </nav>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white border border-white/20">
              Архитектурный стандарт
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-[#141418] text-zinc-400 border border-white/5">
              {GLOSSARY_TERMS.length} концепций &bull; {allTags.length} тегов
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            Документация и справочник по концепциям
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl font-normal">
            Инженерная база знаний курса MrDeveloper: разбор терминов, архитектурных паттернов, протоколов безопасности и готовые примеры кода для каждого урока.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-5 rounded-sm bg-[#0e0e11] border border-white/5 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Поиск по концепциям, терминам, объяснениям и коду..."
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-[#0a0a0c] border border-white/10 rounded-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors font-mono"
              aria-label="Поиск по документации"
            />
            {search && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-0.5 cursor-pointer"
                aria-label="Очистить поиск"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 font-mono ${
                    isActive
                      ? 'bg-white text-black font-semibold'
                      : 'bg-[#141418] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Hashtags Explorer Pill Cloud */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-500" />
                <span>Навигация по хештегам ({allTags.length}):</span>
              </span>
              {(selectedTag || search || selectedCategory !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-zinc-400 hover:text-white underline underline-offset-2 cursor-pointer transition-colors"
                >
                  Сбросить все фильтры
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {allTags.map(({ tag, count }) => {
                const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className={`px-2.5 py-1 rounded-sm text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'bg-[#0a0a0c] border border-white/5 hover:border-white/20 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded ${isSelected ? 'bg-black/10 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
          <span>Найдено документов: {filteredTerms.length}</span>
          {selectedTag && (
            <span className="text-zinc-300">
              Активный фильтр по хештегу: <span className="text-white font-bold">#{selectedTag}</span>
            </span>
          )}
        </div>

        {/* Concept Documentation Cards List */}
        <div className="space-y-6">
          {filteredTerms.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-3 bg-[#0e0e11] rounded-sm border border-white/5 p-6">
              <BookOpen className="w-10 h-10 text-zinc-600 opacity-60" />
              <p className="text-sm text-zinc-300 font-medium">Концепции по заданным фильтрам не найдены.</p>
              <p className="text-zinc-500 max-w-md text-xs">
                Попробуйте изменить поисковый запрос или сбросить фильтры по категориям и хештегам.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 text-xs bg-white hover:bg-zinc-200 text-black font-semibold rounded-sm transition-colors cursor-pointer"
              >
                Показать всю документацию
              </button>
            </div>
          ) : (
            filteredTerms.map((term) => {
              const isCopied = copiedTermId === term.id;

              return (
                <article
                  key={term.id}
                  id={term.id}
                  className="p-6 sm:p-7 rounded-sm bg-[#0e0e11] border border-white/5 space-y-5 shadow-sm scroll-mt-20 hover:border-white/10 transition-colors"
                >
                  {/* Article Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-white/5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/10 border border-white/20 text-white font-semibold">
                          {term.category}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          ID: {term.id}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                        {term.term}
                      </h2>
                    </div>

                    {/* Related Day Badges linking to lessons */}
                    {term.relatedDayNumbers && term.relatedDayNumbers.length > 0 && (
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-[11px] font-mono text-zinc-400">Уроки:</span>
                        <div className="flex gap-1">
                          {term.relatedDayNumbers.map((day) => (
                            <Link
                              key={day}
                              to={`/courses/1/lessons/${day}`}
                              className="px-2 py-0.5 rounded bg-[#141418] hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white font-mono text-[11px] transition-colors"
                              title={`Перейти к Уроку ${day}`}
                            >
                              Урок {day}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Short Summary & Full In-depth Explanation */}
                  <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
                    <p className="font-medium text-white bg-[#141418] p-3 rounded-sm border border-white/5">
                      {term.shortDefinition}
                    </p>
                    <div className="whitespace-pre-line text-zinc-400 font-normal leading-relaxed">
                      {term.fullExplanation}
                    </div>
                  </div>

                  {/* Code Implementation Snippet */}
                  {term.codeSnippet && (
                    <div className="rounded-sm bg-[#0a0a0c] border border-white/10 overflow-hidden space-y-0">
                      <div className="flex items-center justify-between px-3.5 py-2 bg-[#121216] border-b border-white/5 text-[11px] text-zinc-400 font-mono">
                        <div className="flex items-center gap-2">
                          <Code className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="text-zinc-300 font-medium">Архитектурный пример кода</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(term.id, term.codeSnippet!)}
                          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-zinc-800 font-mono"
                          aria-label="Копировать пример кода"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-white" />
                              <span className="text-white font-semibold">Скопировано</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Копировать</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed bg-[#0a0a0c]">
                        <code>{term.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Hashtags Footer */}
                  <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-zinc-600" />
                    {term.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleSelectTag(tag)}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          selectedTag?.toLowerCase() === tag.toLowerCase()
                            ? 'bg-white text-black font-semibold'
                            : 'bg-[#141418] border border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
