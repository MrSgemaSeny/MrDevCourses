import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { GLOSSARY_TERMS, GlossaryCategory, GlossaryTerm } from '@/entities/glossary';
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
  Network,
  List,
  Shield,
  Server,
  Layout,
  Bot,
  GitBranch,
  ArrowUpRight,
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

interface KnowledgeCluster {
  id: string;
  name: string;
  category: GlossaryCategory;
  hubTermId: string;
  hubTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  satelliteTermIds: string[];
}

const KNOWLEDGE_CLUSTERS: KnowledgeCluster[] = [
  {
    id: 'security-cluster',
    name: 'Безопасность и Авторизация',
    category: 'security',
    hubTermId: 'spring-security',
    hubTitle: 'Spring Security & Фильтры',
    icon: Shield,
    description: 'Stateless JWT аутентификация, ролевой доступ (RBAC), шифрование и защита API.',
    satelliteTermIds: ['jwt', 'oauth2', 'bcrypt', 'rls', 'bucket4j', 'cors-preflight', 'pii-masker'],
  },
  {
    id: 'backend-cluster',
    name: 'Бэкенд и Базы данных',
    category: 'backend',
    hubTermId: 'spring-boot-3',
    hubTitle: 'Spring Boot 3 Core',
    icon: Server,
    description: 'Трехслойная архитектура, ORM Hibernate, транзакции, Redis кеш и REST API.',
    satelliteTermIds: [
      'three-tier-architecture',
      'jpa-entity',
      'table-relationships',
      'flyway',
      'transactional',
      'redis',
      'global-exception-handler',
      'http-protocol',
      'http-request-anatomy',
      'http-methods',
      'http-status-codes',
      'rest-architecture',
      'path-vs-query',
      'drip-content',
    ],
  },
  {
    id: 'frontend-cluster',
    name: 'Фронтенд и FSD Архитектура',
    category: 'frontend',
    hubTermId: 'fsd',
    hubTitle: 'Feature-Sliced Design (FSD)',
    icon: Layout,
    description: 'React 19, строгая типизация TypeScript, состояние (Zustand, Query) и UI-система.',
    satelliteTermIds: [
      'react-ui-data',
      'js-vs-ts',
      'vite',
      'spa-vs-mpa',
      'tanstack-query',
      'zustand',
      'react-hooks',
      'state-management',
      'dto',
      'zod',
      'shared-api',
      'tailwind-v4',
      'lucide-icons',
      'glassmorphism-rules',
      'one-file-landing',
    ],
  },
  {
    id: 'ai-cluster',
    name: 'AI и Вайбкодинг',
    category: 'ai',
    hubTermId: 'vibecoding',
    hubTitle: 'Вайбкодинг Методология',
    icon: Bot,
    description: 'Инженерные промпты, Claude/GPT интеграция, SSE стриминг и RAG-система.',
    satelliteTermIds: [
      'prompt-engineering',
      'basic-vs-pro-prompt',
      'system-prompt',
      'groq-llama',
      'sse-streaming',
      'openhtmltopdf',
    ],
  },
  {
    id: 'devops-cluster',
    name: 'Git, DevOps и Тестирование',
    category: 'devops',
    hubTermId: 'git',
    hubTitle: 'Git & CI/CD Pipeline',
    icon: GitBranch,
    description: 'Система контроля версий, ветвление, code review, автотестирование и деплой.',
    satelliteTermIds: [
      'repository',
      'commit',
      'branch',
      'staging-area',
      'gitignore',
      'pull-request',
      'merge-rebase',
      'git-conflict',
      'github-pages',
      'test-pyramid',
      'unit-testing',
      'mockito',
      'integration-testing',
      'ci-cd',
    ],
  },
];

export const DocsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTag = searchParams.get('tag');
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = (searchParams.get('category') as GlossaryCategory | 'all') || 'all';

  type ViewMode = 'clusters' | 'list';
  type SortMode = 'curriculum' | 'alpha' | 'category';

  const [search, setSearch] = useState<string>(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>(initialCategory);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);
  const [viewMode, setViewMode] = useState<ViewMode>('clusters');
  const [sortMode, setSortMode] = useState<SortMode>('curriculum');
  const [activeInspectorTerm, setActiveInspectorTerm] = useState<GlossaryTerm | null>(null);
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
    setActiveInspectorTerm(null);
    setSearchParams({});
  };

  const filteredTerms = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = GLOSSARY_TERMS.filter((term) => {
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

    return [...list].sort((a, b) => {
      if (sortMode === 'curriculum') {
        const aDay = a.relatedDayNumbers && a.relatedDayNumbers.length > 0 ? Math.min(...a.relatedDayNumbers) : 999;
        const bDay = b.relatedDayNumbers && b.relatedDayNumbers.length > 0 ? Math.min(...b.relatedDayNumbers) : 999;
        if (aDay !== bDay) return aDay - bDay;
        return a.term.localeCompare(b.term, 'ru');
      }
      if (sortMode === 'alpha') {
        return a.term.localeCompare(b.term, 'ru');
      }
      if (sortMode === 'category') {
        const catOrder = a.category.localeCompare(b.category);
        if (catOrder !== 0) return catOrder;
        return a.term.localeCompare(b.term, 'ru');
      }
      return 0;
    });
  }, [search, selectedCategory, selectedTag, sortMode]);

  const handleCopyCode = (termId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTermId(termId);
    setTimeout(() => {
      setCopiedTermId((current) => (current === termId ? null : current));
    }, 2000);
  };

  const termMap = useMemo(() => {
    const map = new Map<string, GlossaryTerm>();
    GLOSSARY_TERMS.forEach((t) => map.set(t.id, t));
    return map;
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-zinc-100">
      {/* 75% Focus Layout */}
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
              Карта знаний (Obsidian Clusters)
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-[#141418] text-zinc-400 border border-white/5">
              5 тематических кластеров &bull; {GLOSSARY_TERMS.length} концепций &bull; {allTags.length} тегов
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            Документация и справочник по концепциям
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl font-normal">
            Все взаимосвязанные темы собраны в единые кластеры связей. Нажмите на любой термин для мгновенного разбора архитектурного паттерна и кода.
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

        {/* View Mode & Sorting Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-zinc-500 px-1">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[11px]">Вид:</span>
            <button
              type="button"
              onClick={() => setViewMode('clusters')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'clusters'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#141418] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Кластерная карта (Obsidian)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#141418] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Развернутые статьи</span>
            </button>
          </div>

          {/* Sorting buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-zinc-500 text-[11px]">Сортировка:</span>
            <button
              type="button"
              onClick={() => setSortMode('curriculum')}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-mono transition-colors cursor-pointer ${
                sortMode === 'curriculum'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#141418] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              По курсу
            </button>
            <button
              type="button"
              onClick={() => setSortMode('alpha')}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-mono transition-colors cursor-pointer ${
                sortMode === 'alpha'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#141418] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              А-Я
            </button>
            <button
              type="button"
              onClick={() => setSortMode('category')}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-mono transition-colors cursor-pointer ${
                sortMode === 'category'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#141418] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              Категории
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
          <span>Найдено концепций: <strong className="text-white">{filteredTerms.length}</strong></span>
          {selectedTag && (
            <span className="text-zinc-300">
              Активный фильтр по хештегу: <span className="text-white font-bold">#{selectedTag}</span>
            </span>
          )}
        </div>

        {/* ----------------- MODE 1: OBSIDIAN CLUSTER MAP VIEW ----------------- */}
        {viewMode === 'clusters' && (
          <div className="space-y-6" data-testid="obsidian-clusters-view">
            {KNOWLEDGE_CLUSTERS.filter((c) => selectedCategory === 'all' || c.category === selectedCategory).map(
              (cluster) => {
                const IconComponent = cluster.icon;
                const hubTerm = termMap.get(cluster.hubTermId);
                const allClusterTermIds = [cluster.hubTermId, ...cluster.satelliteTermIds];
                const clusterTerms = allClusterTermIds
                  .map((id) => termMap.get(id))
                  .filter((t): t is GlossaryTerm => t !== undefined)
                  .filter((t) => filteredTerms.some((ft) => ft.id === t.id));

                if (clusterTerms.length === 0) return null;

                return (
                  <div
                    key={cluster.id}
                    className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 space-y-4 shadow-sm"
                  >
                    {/* Cluster Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-sm bg-[#141418] border border-white/10 flex items-center justify-center text-white shrink-0">
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                            {cluster.name}
                          </h2>
                          <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-white/10 text-zinc-300 border border-white/10">
                            {clusterTerms.length} тем
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-normal">
                          {cluster.description}
                        </p>
                      </div>
                    </div>

                    {/* Central Hub Card (Obsidian Central Node) */}
                    {hubTerm && filteredTerms.some((ft) => ft.id === hubTerm.id) && (
                      <div
                        onClick={() => setActiveInspectorTerm(hubTerm)}
                        className="p-4 rounded-sm bg-[#141418] border border-white/20 hover:border-white/40 transition-all cursor-pointer group space-y-2 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest bg-white text-black font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                              ЦЕНТРАЛЬНЫЙ ХАБ
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">
                              #{hubTerm.category}
                            </span>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
                        </div>

                        <div className="text-sm font-bold text-white group-hover:text-white">
                          {hubTerm.term}
                        </div>
                        <p className="text-xs text-zinc-300 line-clamp-2">
                          {hubTerm.shortDefinition}
                        </p>
                      </div>
                    )}

                    {/* Satellite Connected Concept Nodes */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
                        <span>Связанные концепции кластера:</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cluster.satelliteTermIds.map((satId) => {
                          const satTerm = termMap.get(satId);
                          if (!satTerm || !filteredTerms.some((ft) => ft.id === satTerm.id)) return null;

                          return (
                            <button
                              key={satId}
                              type="button"
                              onClick={() => setActiveInspectorTerm(satTerm)}
                              className="p-3 rounded-sm bg-[#0a0a0c] border border-white/5 hover:border-zinc-500 hover:bg-[#141418] transition-all text-left group cursor-pointer space-y-1"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                                  {satTerm.term}
                                </div>
                                {satTerm.relatedDayNumbers && satTerm.relatedDayNumbers.length > 0 && (
                                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                                    Урок {satTerm.relatedDayNumbers[0]}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-400 line-clamp-1">
                                {satTerm.shortDefinition}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* ----------------- MODE 2: EXPANDED ARTICLE LIST VIEW ----------------- */}
        {viewMode === 'list' && (
          <div className="space-y-6" data-testid="expanded-articles-view">
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
        )}

        {/* ----------------- OBSIDIAN CONCEPT INSPECTOR MODAL / DRAWER ----------------- */}
        {activeInspectorTerm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div
              className="relative w-full max-w-2xl max-h-[90vh] bg-[#0e0e11] border border-white/20 rounded-sm shadow-2xl flex flex-col overflow-hidden animate-scaleIn"
              role="dialog"
              aria-modal="true"
              aria-label={activeInspectorTerm.term}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3 bg-[#141418]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-white/10 border border-white/20 text-white font-semibold">
                      {activeInspectorTerm.category}
                    </span>
                    {activeInspectorTerm.relatedDayNumbers && activeInspectorTerm.relatedDayNumbers.length > 0 && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        Уроки: {activeInspectorTerm.relatedDayNumbers.join(', ')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {activeInspectorTerm.term}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveInspectorTerm(null)}
                  className="p-1.5 rounded bg-[#0a0a0c] border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                  aria-label="Закрыть"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-zinc-300">
                <div className="p-3.5 rounded-sm bg-[#0a0a0c] border border-white/10 font-medium text-white">
                  {activeInspectorTerm.shortDefinition}
                </div>

                <div className="whitespace-pre-line text-zinc-300 leading-relaxed font-normal">
                  {activeInspectorTerm.fullExplanation}
                </div>

                {/* Code Snippet in Inspector */}
                {activeInspectorTerm.codeSnippet && (
                  <div className="rounded-sm bg-[#0a0a0c] border border-white/10 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#141418] border-b border-white/5 text-[11px] font-mono text-zinc-400">
                      <span>Архитектурный пример кода</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(activeInspectorTerm.id, activeInspectorTerm.codeSnippet!)}
                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-mono cursor-pointer transition-colors"
                      >
                        {copiedTermId === activeInspectorTerm.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span className="text-white font-semibold">Скопировано</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Копировать</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3.5 text-xs font-mono text-zinc-200 overflow-x-auto bg-[#0a0a0c]">
                      <code>{activeInspectorTerm.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Tags in Inspector */}
                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-zinc-600" />
                  {activeInspectorTerm.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        handleSelectTag(tag);
                        setActiveInspectorTerm(null);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141418] border border-white/5 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 border-t border-white/10 bg-[#141418] flex items-center justify-between">
                {activeInspectorTerm.relatedDayNumbers && activeInspectorTerm.relatedDayNumbers.length > 0 ? (
                  <Link
                    to={`/courses/1/lessons/${activeInspectorTerm.relatedDayNumbers[0]}`}
                    onClick={() => setActiveInspectorTerm(null)}
                    className="px-3 py-1.5 rounded-sm bg-white hover:bg-zinc-200 text-black font-semibold text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <span>Перейти к уроку {activeInspectorTerm.relatedDayNumbers[0]}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={() => setActiveInspectorTerm(null)}
                  className="px-3 py-1.5 rounded-sm bg-[#0a0a0c] hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-mono cursor-pointer transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
