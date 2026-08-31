import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import { lessonApi } from '@/entities/lesson/api/lessonApi';
import { useAuth } from '@/features/auth';
import { VisualRoadmap } from '@/widgets/roadmap/VisualRoadmap';
import { CertificateModal } from '@/widgets/certificate/CertificateModal';
import { CourseCurriculumAccordion } from '@/widgets/course-curriculum/CourseCurriculumAccordion';
import { CourseStickyCard } from '@/widgets/course-sidebar/CourseStickyCard';
import { CourseFaqSection } from '@/widgets/course-faq/CourseFaqSection';
import {
  CheckCircle2,
  ChevronRight,
  X,
  Github,
  Send,
  ArrowRight,
  Star,
  Terminal,
  Cpu,
  Sparkles,
} from 'lucide-react';

const learningOutcomes = [
  'Проектирование чистой модульной архитектуры на Spring Boot 3',
  'Построение защищённого API с JWT в stateless httpOnly cookies',
  'Эффективная работа с PostgreSQL, индексами и исключение N+1 запросов',
  'Полноценный фронтенд на React 19, Vite и Feature-Sliced Design (FSD)',
  'Автоматизация тестирования и устойчивый CI/CD пайплайн',
  'Интеграция современных AI-инструментов и вайбкодинг на практике',
];

const courseRequirements = [
  'Базовое понимание синтаксиса Java или любого другого C-подобного языка',
  'Установленная среда разработки (IntelliJ IDEA или VS Code)',
  'Готовность практиковаться и писать реальный код каждый день',
];

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const [showCertificate, setShowCertificate] = useState(false);
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => courseApi.getCourseBySlug(slug!),
    enabled: !!slug,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', course?.id],
    queryFn: () => lessonApi.getLessons(course!.id),
    enabled: !!course?.id && !!course?.enrolled,
  });

  const enrollMutation = useMutation({
    mutationFn: () => courseApi.enroll(course!.id),
    onSuccess: () => {
      setShowEnrollConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['course', slug] });
      queryClient.invalidateQueries({ queryKey: ['lessons', course?.id] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowEnrollConfirm(true);
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/5 border-t-[#fafafa] rounded-full animate-spin" />
          <span className="text-xs text-zinc-500 font-mono">Загрузка курса...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-sm font-bold text-white mb-2">Курс не найден</h2>
        <Link to="/courses" className="text-xs text-zinc-400 hover:text-white underline">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const modules = course.modules || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link to="/courses" className="hover:text-zinc-300 transition-colors">
          Каталог
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-300 truncate max-w-xs sm:max-w-md">{course.title}</span>
      </nav>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-medium bg-[#141418] text-zinc-300 border border-white/5 font-mono">
                {modules.length} модулей &bull; {course.totalLessons || 30} уроков
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-medium bg-[#141418] text-zinc-300 border border-white/5 font-mono flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <Star className="w-3 h-3 fill-zinc-700 text-zinc-700" />
                </div>
                <span>Уровень 2 (Middle)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl font-normal">
              {course.description || 'Пошаговый курс с практическими уроками, ориентированный на реальный результат.'}
            </p>

            {/* Author compact plate */}
            <div className="pt-2 flex items-center gap-3.5">
              <img
                src="/author-avatar.png"
                alt="Mr Developer"
                className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Mr Developer</span>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Автор курса</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                  <a
                    href="https://github.com/MrSgemaSeny"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1 text-[11px] font-mono"
                    aria-label="GitHub"
                  >
                    <Github className="w-3 h-3" />
                    <span>GitHub</span>
                  </a>
                  <span className="text-zinc-600">&bull;</span>
                  <a
                    href="https://t.me/mrsgemaseny"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1 text-[11px] font-mono"
                    aria-label="Telegram"
                  >
                    <Send className="w-3 h-3" />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Block: What You'll Learn (Learning Outcomes) */}
          <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 space-y-4">
            <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono text-[11px] text-zinc-400">
              Чему вы научитесь на курсе
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {learningOutcomes.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Block: Requirements & Target Audience */}
          <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 space-y-4">
            <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono text-[11px] text-zinc-400">
              Требования и кому подойдёт курс
            </h2>

            <ul className="space-y-2 text-xs text-zinc-300 list-disc list-inside">
              {courseRequirements.map((req, idx) => (
                <li key={idx} className="leading-relaxed">
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Block: Course Curriculum Accordion */}
          <CourseCurriculumAccordion
            courseId={course.id}
            modules={modules}
            enrolled={course.enrolled}
          />

          {/* Visual Roadmap if Enrolled */}
          {course.enrolled && lessons.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white tracking-tight">Ваша дорожная карта</h2>
              <VisualRoadmap courseId={course.id} lessons={lessons} />
            </div>
          )}

          {/* Block: Course Deliverables & Tech Stack (Between Curriculum & FAQ) */}
          <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono text-[11px] text-zinc-400 mb-1">
                Результаты обучения и стек программы
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Вы не просто смотрите теорию, а создаёте готовые артефакты для своего портфолио разработчика.
              </p>
            </div>

            {/* 3 Outcome Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-sm bg-[#0a0a0c] border border-white/5 space-y-2">
                <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <Terminal className="w-4 h-4 text-zinc-300" />
                </div>
                <h3 className="text-xs font-semibold text-white">Задеплоенный веб-сервис</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Реальный рабочий продукт в онлайне с Live Demo на Vercel и чистым репозиторием на GitHub.
                </p>
              </div>

              <div className="p-4 rounded-sm bg-[#0a0a0c] border border-white/5 space-y-2">
                <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <Cpu className="w-4 h-4 text-zinc-300" />
                </div>
                <h3 className="text-xs font-semibold text-white">Модульная архитектура</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Backend на Spring Boot 3 + PostgreSQL, JWT в httpOnly cookies, Row-Level Security и FSD на фронтенде.
                </p>
              </div>

              <div className="p-4 rounded-sm bg-[#0a0a0c] border border-white/5 space-y-2">
                <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 text-zinc-300" />
                </div>
                <h3 className="text-xs font-semibold text-white">Навык вайбкодинга</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Эффективная связка с AI-инструментами: архитектурное мышление, системные промпты и TDD без бойлерплейта.
                </p>
              </div>
            </div>

            {/* Tech Stack Chips */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                Технологический стек курса
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Java 17',
                  'Spring Boot 3',
                  'PostgreSQL 17',
                  'Flyway',
                  'React 19',
                  'TypeScript',
                  'Vite',
                  'Feature-Sliced Design',
                  'Tailwind CSS v4',
                  'Docker',
                  'Vercel',
                  'Telegram Bot API',
                ].map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#0a0a0c] border border-white/10 text-zinc-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Block: FAQ Accordion */}
          <CourseFaqSection />
        </div>

        {/* Right Column (4 cols) — Compact Sticky Action Sidebar */}
        <div className="lg:col-span-4">
          <CourseStickyCard
            course={course}
            lessons={lessons}
            onEnroll={handleEnrollClick}
            isEnrolling={enrollMutation.isPending}
            onOpenCertificate={() => setShowCertificate(true)}
            onPlayTrailer={() => setShowTrailerModal(true)}
          />
        </div>
      </div>

      {/* Video Trailer Modal */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-[#0e0e11] border border-white/10 rounded-sm overflow-hidden shadow-2xl space-y-3">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40" />
                <h3 className="text-xs font-semibold text-white font-mono uppercase">
                  Трейлер курса &bull; {course.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTrailerModal(false)}
                className="text-zinc-400 hover:text-white p-1 transition-colors cursor-pointer"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Course Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 flex items-center justify-between border-t border-white/5 bg-[#0a0a0c]">
              <span className="text-[10px] text-zinc-500 font-mono">
                Полный доступ ко всем урокам открывается сразу после записи
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowTrailerModal(false);
                  if (!course.enrolled) {
                    handleEnrollClick();
                  }
                }}
                className="px-4 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
              >
                {course.enrolled ? 'Закрыть' : 'Записаться на курс'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Enrollment */}
      {showEnrollConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#0e0e11] border border-white/10 rounded-sm p-6 shadow-2xl space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white tracking-tight">Подтверждение записи на курс</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Вы собираетесь начать обучение на курсе <span className="text-white font-medium">&laquo;{course.title}&raquo;</span>. 
                После подтверждения вам сразу откроются материалы первой недели и запустится персональный график уроков.
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEnrollConfirm(false)}
                disabled={enrollMutation.isPending}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-transparent hover:bg-white/5 rounded-sm transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => enrollMutation.mutate()}
                disabled={enrollMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-zinc-200 rounded-sm transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                <span>{enrollMutation.isPending ? 'Запись...' : 'Подтвердить запись'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {user && (
        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          studentName={user.name || user.email}
          courseTitle={course.title}
        />
      )}
    </div>
  );
};
