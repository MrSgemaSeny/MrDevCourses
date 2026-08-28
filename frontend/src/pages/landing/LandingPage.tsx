import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import { useAuth } from '@/features/auth';
import { ArrowRight, Code2, Sparkles, Layers, Cpu, Award } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: courseApi.getCourses,
  });

  return (
    <div className="min-h-full bg-[#090d13] text-[#fafafa]">
      {/* Hero Section with Ambient Glow */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-[#21262d] bg-gradient-to-b from-[#0d1117] via-[#090d13] to-[#090d13]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[320px] bg-gradient-to-br from-[#58a6ff]/10 via-[#a371f7]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#30363d] bg-[#161b22] text-xs text-[#58a6ff] mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Инженерная школа разработки Mr Developer</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            Практическая разработка <br />
            <span className="text-[#58a6ff]">промышленных систем</span>
          </h1>

          <p className="text-sm sm:text-base text-[#8b949e] max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Погружение в современный стек: Spring Boot 3, React 19, PostgreSQL, pgvector RAG и автономные AI-агенты. Проектирование архитектуры и написание production-кода.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/courses"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#fafafa] hover:bg-white text-[#09090b] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <span>Каталог курсов</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-2.5 bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] border border-[#30363d] font-semibold text-xs rounded-xl transition-colors"
              >
                Мой кабинет
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-2.5 bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] border border-[#30363d] font-semibold text-xs rounded-xl transition-colors"
              >
                Войти через Google
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center mb-4 text-[#58a6ff]">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">100% Практический код</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              От архитектуры модульных монолитов и Spring Security до FSD на фронтенде и развертывания в облаке.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center mb-4 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">AI Code Reviewer</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Мгновенный анализ качества кода и проверка домашних заданий с обратной связью уровня Tech Lead.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center mb-4 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Сертификация</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Цифровой диплом с уникальным идентификатором и возможностью публичной верификации работодателями.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-12 border-t border-[#21262d]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Доступные программы</h2>
              <p className="text-xs text-[#8b949e] mt-1">Выберите направление и начните обучение</p>
            </div>
            <Link to="/courses" className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1">
              <span>Смотреть все</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-xs text-[#8b949e]">Загрузка курсов...</div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center bg-[#161b22] border border-[#30363d] rounded-2xl text-xs text-[#8b949e]">
              Курсы формируются и скоро появятся в каталоге.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}`}
                  className="group block p-6 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/50 transition-all duration-300 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                      Открыт набор
                    </span>
                    <span className="text-xs text-[#8b949e] font-mono">
                      {course.totalLessons || 5} уроков
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#58a6ff] transition-colors mb-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-[#8b949e] line-clamp-2 mb-4 leading-relaxed font-normal">
                    {course.description || 'Пошаговый курс с практическими заданиями и ежедневным закреплением материала.'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-[#21262d] text-xs">
                    <span className="text-[#8b949e] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      Интерактивные модули
                    </span>
                    <span className="text-[#fafafa] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Подробнее <ArrowRight className="w-3 h-3" />
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
