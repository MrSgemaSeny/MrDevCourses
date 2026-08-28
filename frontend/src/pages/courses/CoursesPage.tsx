import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Layers,
  Code2,
  Cpu,
  Award,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Все направления' },
  { id: 'fullstack', label: 'Full-Stack' },
  { id: 'backend', label: 'Backend & Spring' },
  { id: 'ai', label: 'AI & Vector RAG' },
  { id: 'arch', label: 'Архитектура' },
];

export const CoursesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
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
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Header Section */}
      <div className="border-b border-white/5 bg-[#0a0a0c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-white tracking-tight leading-tight mb-3">
              Каталог курсов и программ
            </h1>

            <p className="text-sm text-zinc-400 leading-relaxed mb-8">
              Практическое освоение промышленного стека разработки: архитектура монолитов и микросервисов, AI-инструменты, автономные агенты и production-код.
            </p>

            {/* Platform Highlights / Badges - Solid Monochrome */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-sm bg-[#121214] border border-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Code2 className="w-4 h-4 text-white" />
                  <span>100% Практика</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Реальные проекты с нуля</p>
              </div>

              <div className="p-3.5 rounded-sm bg-[#121214] border border-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Cpu className="w-4 h-4 text-white" />
                  <span>AI Code Grader</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Ревью кода и тесты 24/7</p>
              </div>

              <div className="p-3.5 rounded-sm bg-[#121214] border border-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <BookOpen className="w-4 h-4 text-white" />
                  <span>RAG Наставник</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Контекстный поиск и чат</p>
              </div>

              <div className="p-3.5 rounded-sm bg-[#121214] border border-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Award className="w-4 h-4 text-white" />
                  <span>Сертификат</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Цифровая верификация</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar: Filter Chips and Search Indicator */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-800 text-white border border-zinc-600'
                    : 'bg-[#121214] text-zinc-400 border border-white/5 hover:text-white hover:border-zinc-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {searchQuery && (
            <div className="text-xs text-zinc-400 font-mono">
              Поиск: &laquo;<span className="text-white">{searchQuery}</span>&raquo; ({filteredCourses.length})
            </div>
          )}
        </div>


        {/* Content list */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-zinc-500">
            <span>Загрузка каталога курсов...</span>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center bg-[#121214] border border-white/5 rounded-sm max-w-lg mx-auto">
            <BookOpen className="w-8 h-8 text-zinc-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-semibold text-white mb-1">Курсы не найдены</h3>
            <p className="text-xs text-zinc-400">
              Попробуйте изменить запрос в строке поиска или выбрать другое направление.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="p-6 rounded-sm bg-[#121214] border border-white/5 hover:border-zinc-600 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Card Header Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-white/5 flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-white" />
                        5 модулей
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-900 text-zinc-300 border border-white/5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-white" />
                        30 уроков
                      </span>
                    </div>

                    {course.enrolled && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-200 border border-white/5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        Вы записаны
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-sm font-bold text-white mb-2.5 tracking-tight leading-snug">
                    {course.title}
                  </h2>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-normal">
                    {course.description ||
                      'Практический курс по разработке современных веб-приложений с использованием ИИ, архитектурных протоколов и лучших инженерных практик.'}
                  </p>

                  {/* Tech Stack Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-6">
                    {['Spring Boot 3', 'React 19', 'PostgreSQL', 'pgvector', 'FSD Architecture', 'Docker'].map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                  <Link
                    to={`/courses/${course.slug}`}
                    className="px-4 py-2 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{course.enrolled ? 'Продолжить обучение' : 'Программа курса'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
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
