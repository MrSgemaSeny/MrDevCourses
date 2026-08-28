import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import { useAuth } from '@/features/auth';
import { ArrowRight, Code2, Layers, Cpu, Award } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: courseApi.getCourses,
  });

  return (
    <div className="min-h-full bg-[#09090b] text-[#fafafa]">
      {/* Hero Section */}
      <section className="pt-16 pb-16 border-b border-[#27272a] bg-[#09090b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Практическая разработка <br />
            <span className="text-zinc-400 font-normal">промышленных систем</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Погружение в современный стек: Spring Boot 3, React 19, PostgreSQL, pgvector RAG и архитектура сложных систем. Проектирование и написание production-кода.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/courses"
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded flex items-center justify-center gap-2 transition-colors"
            >
              <span>Каталог курсов</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#121214] hover:bg-zinc-800 text-zinc-200 border border-[#27272a] font-semibold text-xs rounded transition-colors"
              >
                Мой кабинет
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#121214] hover:bg-zinc-800 text-zinc-200 border border-[#27272a] font-semibold text-xs rounded transition-colors"
              >
                Войти через Google
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-lg bg-[#121214] border border-[#27272a]">
            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-white">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">100% Практический код</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              От архитектуры модульных монолитов и Spring Security до FSD на фронтенде и развертывания в облаке.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#121214] border border-[#27272a]">
            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-white">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">AI Code Reviewer</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Мгновенный анализ качества кода и проверка домашних заданий с обратной связью уровня Tech Lead.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#121214] border border-[#27272a]">
            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-white">
              <Award className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Сертификация</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Цифровой диплом с уникальным идентификатором и возможностью публичной верификации.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-12 border-t border-[#27272a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Доступные программы</h2>
              <p className="text-xs text-zinc-400 mt-1">Выберите направление и начните обучение</p>
            </div>
            <Link to="/courses" className="text-xs text-zinc-300 hover:text-white flex items-center gap-1">
              <span>Смотреть все</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-xs text-zinc-500">Загрузка курсов...</div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center bg-[#121214] border border-[#27272a] rounded-lg text-xs text-zinc-400">
              Курсы формируются и скоро появятся в каталоге.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}`}
                  className="group block p-6 rounded-lg bg-[#121214] border border-[#27272a] hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                      Открыт набор
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {course.totalLessons || 5} уроков
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors mb-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed font-normal">
                    {course.description || 'Пошаговый курс с практическими заданиями и ежедневным закреплением материала.'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-[#27272a] text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-white" />
                      Интерактивные модули
                    </span>
                    <span className="text-white font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
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
