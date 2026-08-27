import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  Layers,
  Code2,
  Cpu,
  Award,
  Zap,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Все направления' },
  { id: 'fullstack', label: 'Full-Stack' },
  { id: 'backend', label: 'Backend & Spring' },
  { id: 'ai', label: 'AI & Vector RAG' },
  { id: 'arch', label: 'Архитектура' },
];

export const CoursesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: courseApi.getCourses,
  });

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [courses, searchQuery]);

  return (
    <div className="min-h-screen bg-[#090d13] text-[#fafafa]">
      {/* Hero Section with Ambient Glow */}
      <div className="relative border-b border-[#21262d] bg-gradient-to-b from-[#0d1117] via-[#090d13] to-[#090d13] overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[320px] bg-gradient-to-br from-[#58a6ff]/10 via-[#a371f7]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-xs text-[#58a6ff] mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">Практическая инженерная школа Mr Developer</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Каталог курсов и программ
            </h1>

            <p className="text-sm sm:text-base text-[#8b949e] leading-relaxed mb-8">
              Пошаговое освоение промышленного стека разработки: архитектура монолитов и микросервисов, AI-инструменты, автономные агенты и чистый production-код.
            </p>

            {/* Platform Highlights / Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#161b22]/70 border border-[#30363d] backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Code2 className="w-4 h-4 text-[#58a6ff]" />
                  <span>100% Практика</span>
                </div>
                <p className="text-[11px] text-[#8b949e] mt-1">Реальные проекты с нуля</p>
              </div>

              <div className="p-3 rounded-xl bg-[#161b22]/70 border border-[#30363d] backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>AI Code Grader</span>
                </div>
                <p className="text-[11px] text-[#8b949e] mt-1">Ревью кода и тесты 24/7</p>
              </div>

              <div className="p-3 rounded-xl bg-[#161b22]/70 border border-[#30363d] backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>RAG Наставник</span>
                </div>
                <p className="text-[11px] text-[#8b949e] mt-1">Контекстный поиск и чат</p>
              </div>

              <div className="p-3 rounded-xl bg-[#161b22]/70 border border-[#30363d] backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Сертификат</span>
                </div>
                <p className="text-[11px] text-[#8b949e] mt-1">Цифровая верификация</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Toolbar: Search and Filter Chips */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#21262d] text-white border border-[#58a6ff]/50 shadow-sm'
                    : 'bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:text-white hover:border-[#484f58]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск по курсам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors"
            />
          </div>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#8b949e]">
            <div className="w-6 h-6 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Загрузка каталога курсов...</span>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center bg-[#161b22] border border-[#30363d] rounded-2xl max-w-lg mx-auto">
            <BookOpen className="w-8 h-8 text-[#8b949e] mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-semibold text-white mb-1">Курсы не найдены</h3>
            <p className="text-xs text-[#8b949e]">
              Попробуйте изменить запрос в строке поиска или выбрать другое направление.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="p-6 sm:p-7 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/50 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-[0_0_30px_rgba(88,166,255,0.06)]"
              >
                <div>
                  {/* Card Header Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#0d1117] text-[#c9d1d9] border border-[#30363d] flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#58a6ff]" />
                        {course.totalLessons || 5} уроков
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#0d1117] text-[#c9d1d9] border border-[#30363d] flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-purple-400" />
                        2 модуля
                      </span>
                    </div>

                    {course.enrolled ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Вы на курсе
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-sky-950/60 text-sky-300 border border-sky-800/60 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        Открыт набор
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-[#58a6ff] transition-colors tracking-tight leading-snug">
                    {course.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed mb-6 font-normal">
                    {course.description ||
                      'Практический интенсив по разработке современных веб-приложений с использованием ИИ, архитектурных протоколов и лучших инженерных практик.'}
                  </p>

                  {/* Tech Stack Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-6">
                    {['Spring Boot 3', 'React 19', 'PostgreSQL', 'pgvector', 'FSD Architecture', 'Docker'].map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#0d1117] text-[#c9d1d9] border border-[#30363d]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-5 border-t border-[#21262d] flex items-center justify-between gap-4">
                  <div className="text-xs text-[#8b949e] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Интерактивная практика</span>
                  </div>

                  <Link
                    to={`/courses/${course.slug}`}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                      course.enrolled
                        ? 'bg-[#238636] hover:bg-[#2ea043] text-white shadow-emerald-950/40'
                        : 'bg-[#fafafa] hover:bg-white text-[#09090b] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                    }`}
                  >
                    <span>{course.enrolled ? 'Продолжить обучение' : 'Программа курса'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
