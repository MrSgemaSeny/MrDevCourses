import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Layers,
  Search,
  Play,
  Clock,
  Star,
} from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [hoveredCourseId, setHoveredCourseId] = useState<number | null>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: courseApi.getCourses,
  });

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLevel =
        selectedLevel === 'ALL' ||
        (selectedLevel === '1' && (course.level?.toLowerCase().includes('junior') || course.level === '1' || !course.level)) ||
        (selectedLevel === '2' && (course.level?.toLowerCase().includes('middle') || course.level === '2')) ||
        (selectedLevel === '3' && (course.level?.toLowerCase().includes('senior') || course.level === '3'));

      const matchesFormat =
        selectedFormat === 'ALL' ||
        (selectedFormat === 'VIDEO' && true) ||
        (selectedFormat === 'PRACTICE' && true);

      return matchesSearch && matchesLevel && matchesFormat;
    });
  }, [courses, searchQuery, selectedLevel, selectedFormat]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Header Banner */}
      <div className="border-b border-white/5 bg-[#0a0a0c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              Каталог курсов и программ
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl font-normal">
              Пошаговые программы с практикой, AI-тьютором и автоматической проверкой кода. Осваивайте монолитную и распределённую архитектуру на реальных задачах.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Minimalist Filter Bar: [Поиск] [Уровень] [Формат] */}
        <div className="p-3 bg-[#0e0e11] border border-white/5 rounded-sm flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по курсам..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#0a0a0c] border border-white/10 focus:border-zinc-500 rounded-sm text-xs text-white placeholder-zinc-500 outline-none transition-colors font-mono"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2.5">
            {/* Level Selector */}
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-1.5 bg-[#0a0a0c] border border-white/10 focus:border-zinc-500 rounded-sm text-xs text-zinc-300 outline-none transition-colors cursor-pointer appearance-none pr-7 font-mono"
              >
                <option value="ALL">Уровень: Все</option>
                <option value="1">★ Уровень 1</option>
                <option value="2">★★ Уровень 2</option>
                <option value="3">★★★ Уровень 3</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">
                ▼
              </div>
            </div>

            {/* Format Selector */}
            <div className="relative">
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-3 py-1.5 bg-[#0a0a0c] border border-white/10 focus:border-zinc-500 rounded-sm text-xs text-zinc-300 outline-none transition-colors cursor-pointer appearance-none pr-7 font-mono"
              >
                <option value="ALL">Формат: Все</option>
                <option value="VIDEO">Видео + Практика</option>
                <option value="PRACTICE">Интенсив с ДЗ</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Course Cards Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-zinc-500 font-mono">
            <span>Загрузка каталога курсов...</span>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center bg-[#0e0e11] border border-white/5 rounded-sm max-w-lg mx-auto space-y-2">
            <BookOpen className="w-8 h-8 text-zinc-500 mx-auto opacity-60" />
            <h3 className="text-sm font-semibold text-white">Курсы не найдены</h3>
            <p className="text-xs text-zinc-400">
              Попробуйте изменить поисковый запрос или сбросить фильтры.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => {
              const isHovered = hoveredCourseId === course.id;

              return (
                <div
                  key={course.id}
                  onMouseEnter={() => setHoveredCourseId(course.id)}
                  onMouseLeave={() => setHoveredCourseId(null)}
                  className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 hover:border-zinc-600 transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* Card Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141418] text-zinc-300 border border-white/5 flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {course.level === '2' || course.level?.toLowerCase().includes('middle')
                            ? '★★ Уровень 2'
                            : course.level === '3' || course.level?.toLowerCase().includes('senior')
                            ? '★★★ Уровень 3'
                            : '★ Уровень 1'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141418] text-zinc-300 border border-white/5 flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-zinc-400" />
                          5 модулей
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141418] text-zinc-300 border border-white/5 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          30 уроков
                        </span>
                      </div>

                      {course.enrolled ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" />
                          Вы записаны
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-white/5">
                          Бесплатный MVP
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-base font-bold text-white mb-2 tracking-tight group-hover:text-zinc-100 transition-colors">
                      {course.title}
                    </h2>

                    <p className="text-xs text-zinc-400 leading-relaxed mb-5 line-clamp-2 font-normal">
                      {course.description ||
                        'Практический курс по разработке современных веб-приложений с использованием ИИ, архитектурных протоколов и лучших инженерных практик.'}
                    </p>

                    {/* Tech Stack Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-5">
                      {['Spring Boot 3', 'React 19', 'PostgreSQL', 'FSD Architecture', 'AI Grader'].map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0a0a0c] text-zinc-400 border border-white/5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ~15 ч.
                      </span>
                      {isHovered && (
                        <span className="text-emerald-400 flex items-center gap-1 animate-pulse">
                          <Play className="w-3 h-3 fill-current" /> Превью доступно
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/courses/${course.slug}`}
                      className="px-4 py-2 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer"
                    >
                      <span>{course.enrolled ? 'Продолжить обучение' : 'Программа курса'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
