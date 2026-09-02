import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import { useAuth } from '@/features/auth';
import { ArrowRight, Code2, Layers, Cpu, Award, Rocket, Brain, Check } from 'lucide-react';

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

      {/* Main Content Sections: Left-aligned 75% focus container matching CoursesPage */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full lg:w-[75%] max-w-[1080px] space-y-12">
          {/* Functional List Highlights (Extended Features) */}
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
                Архитектурные стандарты
              </h2>
              <p className="text-xs text-zinc-400">
                Практический инструментарий и подходы к проектированию сложных систем.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 hover:border-zinc-600 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Code2 className="w-4 h-4 text-zinc-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-white">100% Практический код</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    От архитектуры модульных монолитов и Spring Security до FSD на фронтенде и деплоя в облако.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 hover:border-zinc-600 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Cpu className="w-4 h-4 text-zinc-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-white">AI Code Reviewer</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Мгновенный анализ качества кода и проверка домашних заданий с обратной связью уровня Tech Lead.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 hover:border-zinc-600 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Rocket className="w-4 h-4 text-zinc-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-white">Деплой с первой недели</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Реальный задеплоенный проект в открытом интернете уже на 3-й день обучения без откладывания на потом.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 hover:border-zinc-600 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Layers className="w-4 h-4 text-zinc-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-white">Production-архитектура</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Spring Boot 3, React 19, PostgreSQL, Flyway, JWT, RLS — реальный индустриальный стек без устаревших подходов.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 hover:border-zinc-600 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="w-4 h-4 text-zinc-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-white">Second Brain система</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Методология организации контекста задач, документации и базы знаний без потери фокуса при работе.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 hover:border-zinc-600 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-4 h-4 text-zinc-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-white">Сертификация</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Цифровой диплом с уникальным идентификатором и публичной верификацией подлинности.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Courses matching CoursesPage Card layout */}
          <section className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
                  Доступные программы
                </h2>
              </div>
              <Link 
                to="/courses"
                className={`text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-mono uppercase tracking-wider rounded-sm ${focusClasses}`}
              >
                <span>Смотреть все</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-16 text-xs text-zinc-500 font-mono">Загрузка каталога...</div>
            ) : courses.length === 0 ? (
              <div className="p-8 text-center bg-[#0e0e11] border border-white/5 rounded-sm text-xs text-zinc-500 font-mono">
                [ Каталог пуст ]
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course: any) => (
                  <div
                    key={course.id}
                    className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 hover:border-zinc-600 transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141418] text-zinc-300 border border-white/5 flex items-center gap-1.5">
                            <span>Уровень {course.level || '1'}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141418] text-zinc-300 border border-white/5 flex items-center gap-1.5">
                            <Layers className="w-3 h-3 text-zinc-400" />
                            <span>5 модулей</span>
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141418] text-zinc-300 border border-white/5">
                            <span>30 уроков</span>
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-white mb-2 tracking-tight group-hover:text-zinc-100 transition-colors">
                        {course.title}
                      </h3>

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
                    <div className="pt-4 border-t border-white/5 flex items-center justify-end">
                      <Link
                        to={`/courses/${course.slug}`}
                        className="px-4 py-2 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer"
                      >
                        <span>Программа курса</span>
                        <ArrowRight className="w-3.5 h-3.5 text-black" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pricing Section */}
          <section className="space-y-4 pt-4 border-t border-white/5">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
                Тарифы обучения
              </h2>
              <p className="text-xs text-zinc-400">
                Прозрачные условия с доступом ко всем материалам и инструментам платформы.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan 1: Куратор / Самостоятельный */}
              <div className="p-6 sm:p-8 rounded-sm bg-[#0e0e11] border border-white/5 hover:border-zinc-600 transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Куратор</span>
                    <span className="text-[10px] font-mono text-zinc-500">Самостоятельно</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold font-mono text-white">9 990 ₸</div>
                    <div className="text-xs text-zinc-500 mt-1 font-mono">доступ к платформе и материалам</div>
                  </div>
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-start gap-3 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span>25 уроков с видео, конспектами и кодовой базой</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span>AI Code Reviewer и мгновенный анализ решений</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span>Проверка домашних заданий через систему</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span>Доступ к базе знаний, документации и сообществу</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span>Обучение в собственном комфортном темпе</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/courses"
                  className={`w-full py-2.5 bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 font-semibold text-xs rounded-sm text-center transition-colors block ${focusClasses}`}
                >
                  Выбрать тариф
                </Link>
              </div>

              {/* Plan 2: Ментор / Личное ведение */}
              <div className="p-6 sm:p-8 rounded-sm bg-[#0e0e11] border border-white/20 hover:border-zinc-400 transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-200 uppercase tracking-wider">Ментор</span>
                    <span className="text-[10px] font-mono text-zinc-300">Личное ведение</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold font-mono text-white">24 990 ₸</div>
                    <div className="text-xs text-zinc-500 mt-1 font-mono">веду тебя лично от идеи до деплоя</div>
                  </div>
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-start gap-3 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <span>Всё, что входит в тариф «Куратор»</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <span>Лично веду тебя за руку от первого коммита до деплоя</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <span>Прямой личный Telegram-чат со мной без ограничений</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <span>Индивидуальный разбор твоих PR, багов и архитектуры</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <span>Совместный запуск твоего проекта в рабочий прод</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/courses"
                  className={`w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-sm text-center transition-colors block ${focusClasses}`}
                >
                  Выбрать тариф
                </Link>
              </div>
            </div>
          </section>

          {/* Conversion CTA Block */}
          <section className="pt-4 border-t border-white/5">
            <div className="p-8 sm:p-10 rounded-sm bg-[#0e0e11] border border-white/10 hover:border-zinc-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-xl space-y-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Первый задеплоенный проект уже через 3 дня
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  Фокус на реальном коде, современной архитектуре и практических навыках без абстрактной теории.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <Link
                  to="/courses"
                  className="px-5 py-2.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer"
                >
                  <span>Начать обучение</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </Link>
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className={`px-5 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 font-medium text-xs rounded-sm transition-colors text-center ${focusClasses}`}
                  >
                    Мой кабинет
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className={`px-5 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 font-medium text-xs rounded-sm transition-colors text-center ${focusClasses}`}
                  >
                    Войти через Google
                  </Link>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
