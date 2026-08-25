import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import { useAuth } from '@/app/providers/AuthProvider';
import { ArrowRight, BookOpen, Clock, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: courseApi.getCourses,
  });

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-[#27272a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-zinc-100" />
            <span>Платформа практического обучения от Mr Developer</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            Обучение вайбкодингу и разработке. <br />
            <span className="text-zinc-400 font-normal">1 день — 1 урок.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Строгая серверная Drip-механика: материал открывается ежедневно по графику. Никакого поверхностного проглатывания — только глубокое закрепление теории на боевом коде.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/courses"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#fafafa] hover:bg-white text-[#09090b] font-medium text-sm rounded-md flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.12)]"
            >
              <span>Каталог курсов</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-medium text-sm rounded-md transition-colors"
              >
                Мой кабинет
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-medium text-sm rounded-md transition-colors"
              >
                Войти через Google
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Philosophy Pillars */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-lg bg-[rgba(24,24,27,0.6)] border border-[#27272a] backdrop-blur-md">
            <div className="w-9 h-9 rounded-md bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mb-4 text-zinc-100">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Drip-дисциплина</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Следующий урок открывается строго через 24 часа. Это развивает устойчивую привычку регулярной разработки.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[rgba(24,24,27,0.6)] border border-[#27272a] backdrop-blur-md">
            <div className="w-9 h-9 rounded-md bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mb-4 text-zinc-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Практика с 1 дня</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              От настройки терминала и IDE до архитектуры модульных монолитов, Spring Security, FSD и production-деплоя.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[rgba(24,24,27,0.6)] border border-[#27272a] backdrop-blur-md">
            <div className="w-9 h-9 rounded-md bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mb-4 text-zinc-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Протоколы и Архитектура</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Обучение правильному управлению ИИ: Second Brain, верификационные тесты, Zero-filler подход и качество.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-12 border-t border-[#27272a]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Доступные курсы</h2>
              <p className="text-xs text-zinc-400 mt-1">Выберите курс и начните обучение прямо сейчас</p>
            </div>
            <Link to="/courses" className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1">
              <span>Смотреть все</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-zinc-500 text-xs">Загрузка курсов...</div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center bg-[rgba(24,24,27,0.6)] border border-[#27272a] rounded-lg text-zinc-400 text-xs">
              Курсы формируются и скоро появятся в каталоге.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}`}
                  className="group block p-6 rounded-lg bg-[rgba(24,24,27,0.7)] border border-[#27272a] hover:border-zinc-700 transition-all backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                      Активен
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {course.totalLessons || 5} уроков
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors mb-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed font-normal">
                    {course.description || 'Пошаговый курс с практическими заданиями и ежедневным открытием уроков.'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-[#27272a] text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                      1 день — 1 урок
                    </span>
                    <span className="text-zinc-200 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Перейти <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
