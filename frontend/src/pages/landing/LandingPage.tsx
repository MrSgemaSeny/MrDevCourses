import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import { useAuth } from '@/features/auth';
import { ArrowRight, Code2, Layers, Cpu, Award } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [heroImageError, setHeroImageError] = React.useState(false);
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: courseApi.getCourses,
  });

  const focusClasses = "focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0a0a0c]";

  return (
    <div className="min-h-full bg-[#0a0a0c] text-zinc-100 font-sans">
      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-white/5 bg-[#0a0a0c] relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <div className="max-w-2xl flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-white mb-8 leading-tight">
                Практическая разработка <br />
                <span className="text-zinc-500 font-medium">промышленных систем</span>
              </h1>

              <p className="text-sm text-zinc-400 mb-8 leading-relaxed max-w-xl">
                Погружение в современный стек: Spring Boot 3, React 19, PostgreSQL, pgvector RAG и архитектура сложных систем. Проектирование и написание production-кода без абстрактной теории.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to="/courses"
                  className={`w-full sm:w-auto px-6 py-3 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-sm flex items-center justify-center gap-2 transition-colors ${focusClasses}`}
                >
                  <span>Каталог курсов</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className={`w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 font-medium text-xs rounded-sm transition-colors text-center ${focusClasses}`}
                  >
                    Мой кабинет
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className={`w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 font-medium text-xs rounded-sm transition-colors text-center ${focusClasses}`}
                  >
                    Войти через Google
                  </Link>
                )}
              </div>
            </div>

            {!heroImageError && (
              <div className="hidden md:flex flex-shrink-0 justify-center items-center">
                <div className="w-[440px] lg:w-[540px] rounded-sm overflow-hidden border border-white/5 shadow-[0_0_80px_rgba(255,255,255,0.02)] bg-[#18181b]">
                  <img 
                    src={`${import.meta.env.BASE_URL}hero-image.png`}
                    alt="Вайбкодинг" 
                    onError={() => setHeroImageError(true)}
                    className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500" 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Functional List Highlights */}
      <section className="py-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="p-4 sm:p-6 rounded-sm bg-[#18181b] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col sm:flex-row sm:items-center gap-4">
            <Code2 className="w-5 h-5 text-white shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">100% Практический код</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                От архитектуры модульных монолитов и Spring Security до FSD на фронтенде и развертывания в облаке.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-sm bg-[#18181b] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col sm:flex-row sm:items-center gap-4">
            <Cpu className="w-5 h-5 text-white shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">AI Code Reviewer</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Мгновенный анализ качества кода и проверка домашних заданий с обратной связью уровня Tech Lead.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-sm bg-[#18181b] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col sm:flex-row sm:items-center gap-4">
            <Award className="w-5 h-5 text-white shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Сертификация</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Цифровой диплом с уникальным идентификатором и публичной верификацией в блокчейне.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Доступные программы</h2>
            </div>
            <Link 
              to="/courses"
              className={`text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-mono uppercase tracking-wider rounded-sm ${focusClasses}`}
            >
              <span>Смотреть все</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-xs text-zinc-500 font-mono">Загрузка...</div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center bg-[#18181b] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] rounded-sm text-xs text-zinc-500 font-mono">
              [ Каталог пуст ]
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}`}
                  className={`group block p-4 sm:p-6 rounded-sm bg-[#18181b] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/15 transition-colors ${focusClasses}`}
                >
                  <div className="flex items-center justify-end mb-4">
                    <span className="text-xs text-zinc-500 font-mono">
                      30 уроков
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 mb-8 leading-relaxed">
                    {course.description || 'Пошаговый курс с практическими заданиями и ежедневным закреплением материала.'}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 flex items-center gap-2 font-mono">
                      <Layers className="w-4 h-4" />
                      5 модулей
                    </span>
                    <span className="text-white font-medium opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      Подробнее <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
