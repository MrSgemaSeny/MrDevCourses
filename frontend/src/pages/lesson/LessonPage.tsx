import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonApi } from '@/entities/lesson/api/lessonApi';
import { MarkdownViewer } from '@/shared/ui/MarkdownViewer';
import { QuickNavProvider, QuickNavDrawer, useQuickNav } from '@/widgets/quick-nav';
import { LessonContextPanel } from '@/widgets/lesson';
import { HomeworkSubmissionWidget } from '@/widgets/homework/HomeworkSubmissionWidget';
import { LessonQuizWidget } from '@/widgets/quiz/LessonQuizWidget';
import { LessonMaterialsList } from '@/widgets/materials/LessonMaterialsList';
import { StudentHelpModal } from '@/widgets/help/StudentHelpModal';
import { LessonActionCard } from '@/widgets/lesson-action-card/LessonActionCard';
import { LessonPitfallsAccordion } from '@/widgets/lesson-pitfalls/ui/LessonPitfallsAccordion';
import {
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  BookOpen,
  Layers,
  Code2,
  HelpCircle,
} from 'lucide-react';

const MODULE_NAMES: Record<number, string> = {
  1: 'Введение и инструментарий',
  2: 'Frontend-разработка (Маркетплейс)',
  3: 'Full-Stack + 3D (Трекер денег)',
  4: 'CRM: Kanban + Trackers',
  5: 'Pensee (всё в одном)',
};


const LessonPageContent: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openQuickNav } = useQuickNav();
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'homework'>('content');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const cId = Number(courseId);
  const lId = Number(lessonId);

  const { data: lesson, isLoading: lessonLoading, error: lessonError } = useQuery({
    queryKey: ['lesson', cId, lId],
    queryFn: () => lessonApi.getLessonDetail(cId, lId),
    enabled: !isNaN(cId) && !isNaN(lId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', cId],
    queryFn: () => lessonApi.getLessons(cId),
    enabled: !isNaN(cId),
  });

  const completeMutation = useMutation({
    mutationFn: () => lessonApi.completeLesson(cId, lId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', cId, lId] });
      queryClient.invalidateQueries({ queryKey: ['lessons', cId] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });

  const getEmbedUrl = (url?: string) => {
    const targetUrl = url || 'https://youtu.be/qnYl2ibf-rQ?si=_3UjIZihZ-z_MC6_';
    const match = targetUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1` : null;
  };

  if (lessonLoading) {
    return <div className="text-center py-24 text-zinc-500 text-sm font-mono">Загрузка урока...</div>;
  }

  if (lessonError || !lesson) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-bold text-white mb-2">Доступ ограничен</h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6">
          {(lessonError as any)?.response?.data?.message || 'Этот урок заблокирован согласно вашему графику обучения.'}
        </p>
        <Link
          to={`/courses`}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-sm transition-colors"
        >
          Вернуться к курсам
        </Link>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(lesson.youtubeUrl);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 75% Main Column aligned to left */}
      <div className="w-full lg:w-[75%] max-w-[1080px] space-y-8">
        {/* Top Breadcrumb & Actions Bar (Курс > Модуль/Неделя > Урок) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-500">
            <Link to="/courses" className="text-zinc-400 hover:text-white transition-colors">
              Каталог
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <Link to={`/courses/${lesson.courseSlug || cId}`} className="text-zinc-300 hover:text-white transition-colors">
              {lesson.courseTitle || 'Курс'}
            </Link>
            {lesson.moduleTitle && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                <span className="text-zinc-400 truncate max-w-[200px]">{lesson.moduleTitle}</span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <span className="text-white font-medium">Урок {lesson.dayNumber}</span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openQuickNav('glossary')}
              className="px-2.5 py-1 rounded-sm text-xs bg-[#18181b] hover:bg-zinc-800 border border-white/5 hover:border-zinc-500 text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer font-sans"
              aria-label="Открыть быструю навигацию"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>Быстрая навигация</span>
            </button>

            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-white/5 text-zinc-300">
              Урок {lesson.dayNumber}
            </span>

            {lesson.completed && (
              <span className="px-2.5 py-0.5 rounded text-[10px] bg-white/10 border border-white/20 text-white flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3 text-white" />
                Пройден
              </span>
            )}
          </div>
        </div>

        {/* Video Player Box */}
        {embedUrl ? (
          <div className="aspect-video w-full rounded-sm overflow-hidden bg-black border border-white/5 shadow-xl">
            <iframe
              src={embedUrl}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="aspect-video w-full rounded-sm bg-zinc-950/60 border border-white/5 flex flex-col items-center justify-center text-zinc-500 text-xs">
            <BookOpen className="w-8 h-8 mb-2 opacity-50" />
            <span>Текстовый урок</span>
          </div>
        )}

        {/* Lesson Title, Actions & Interactive Workspace */}
        <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                <span className="text-zinc-300">{lesson.courseTitle}</span>
                {lesson.moduleTitle && (
                  <>
                    <span className="text-zinc-600">&bull;</span>
                    <span className="text-zinc-400">{lesson.moduleTitle}</span>
                  </>
                )}
                <span className="text-zinc-600">&bull;</span>
                <span className="text-zinc-500">Урок {lesson.dayNumber}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">{lesson.title}</h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold rounded-sm bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Не получается?</span>
              </button>

              <button
                onClick={() => completeMutation.mutate()}
                disabled={lesson.completed || completeMutation.isPending}
                className={`px-4 py-2 text-xs font-semibold rounded-sm flex items-center justify-center gap-2 transition-all ${
                  lesson.completed
                    ? 'bg-[#141418] border border-white/10 text-zinc-300 cursor-default font-mono'
                    : 'bg-[#fafafa] hover:bg-white text-[#09090b] shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-zinc-300" />
                <span>{lesson.completed ? 'Урок пройден' : completeMutation.isPending ? 'Сохранение...' : 'Отметить как пройденный'}</span>
              </button>
            </div>
          </div>

          {/* Lesson Tabs */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'content'
                    ? 'bg-[#141418] text-white border border-white/10'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                Конспект и материалы
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('homework')}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'homework'
                    ? 'bg-[#141418] text-white border border-white/10'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Практика и сдача ДЗ</span>
              </button>
              {lesson.hasQuiz && (
                <button
                  type="button"
                  onClick={() => setActiveTab('quiz')}
                  className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'quiz'
                      ? 'bg-[#141418] text-white border border-white/10'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Квиз</span>
                </button>
              )}
            </div>

            {activeTab === 'content' ? (
              <div className="space-y-6">
                <LessonActionCard
                  lessonId={lId}
                  courseTitle={lesson.courseTitle}
                  lessonTitle={lesson.title}
                  dayNumber={lesson.dayNumber}
                  onOpenHelp={() => setIsHelpModalOpen(true)}
                />
                <LessonPitfallsAccordion courseId={cId} lessonId={lId} />
                <MarkdownViewer content={lesson.content} />
                <LessonMaterialsList materials={lesson.materials} />
                <div className="pt-6 border-t border-white/5">
                  <LessonContextPanel
                    dayNumber={lesson.dayNumber}
                    courseId={cId}
                    lessonId={lId}
                  />
                </div>
              </div>
            ) : activeTab === 'quiz' ? (
              <LessonQuizWidget
                courseId={cId}
                lessonId={lId}
                onPassed={() => {
                  queryClient.invalidateQueries({ queryKey: ['lesson', cId, lId] });
                  queryClient.invalidateQueries({ queryKey: ['lessons', cId] });
                }}
              />
            ) : (
              <HomeworkSubmissionWidget
                courseId={cId}
                lessonId={lId}
                onLessonCompleted={() => {
                  queryClient.invalidateQueries({ queryKey: ['lesson', cId, lId] });
                  queryClient.invalidateQueries({ queryKey: ['lessons', cId] });
                }}
              />
            )}
          </div>

          {/* Prev / Next navigation */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            {lesson.prevLessonId ? (
              <button
                onClick={() => navigate(`/courses/${cId}/lessons/${lesson.prevLessonId}`)}
                className="px-4 py-2 bg-[#141418] hover:bg-zinc-800 border border-white/5 text-zinc-300 text-xs rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Предыдущий урок</span>
              </button>
            ) : (
              <div />
            )}

            {lesson.nextLessonId ? (
              <button
                onClick={() => navigate(`/courses/${cId}/lessons/${lesson.nextLessonId}`)}
                className="px-4 py-2 bg-[#141418] hover:bg-zinc-800 border border-white/5 text-zinc-300 text-xs rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Следующий урок</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Curriculum Navigation Section (Grouped by Module/Week) */}
        <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <span>Программа курса: {lesson.courseTitle}</span>
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              {lessons.filter((l) => l.completed).length} / {lessons.length} пройдено
            </span>
          </div>

          {lessonsLoading ? (
            <div className="text-center py-6 text-zinc-500 text-xs font-mono">Загрузка уроков...</div>
          ) : (
            <div className="space-y-4">
              {/* Group lessons into chunks or modules */}
              {Array.from(new Set(lessons.map((l) => l.moduleId || Math.ceil(l.dayNumber / 6)))).map((modId) => {
                const moduleLessons = lessons.filter((l) => (l.moduleId || Math.ceil(l.dayNumber / 6)) === modId);
                const weekNumber = Number(modId);
                const moduleLabel = MODULE_NAMES[weekNumber] || `Модуль ${weekNumber}`;

                return (
                  <div key={modId} className="space-y-2">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2 px-1">
                      <span className="text-zinc-500">Неделя {weekNumber}</span>
                      <span className="text-zinc-700">&bull;</span>
                      <span className="text-zinc-300 font-medium">{moduleLabel}</span>
                    </div>

                    <div className="space-y-1.5">
                      {moduleLessons.map((item) => {
                        const isActive = item.id === lId;
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (item.accessible) {
                                navigate(`/courses/${cId}/lessons/${item.id}`);
                              }
                            }}
                            className={`p-3 rounded-sm border text-xs flex items-center justify-between transition-all ${
                              isActive
                                ? 'bg-[#141418] border-white/40 text-white font-medium shadow-sm'
                                : item.accessible
                                ? 'bg-[#0a0a0c] border-white/5 hover:border-zinc-600 text-zinc-300 cursor-pointer'
                                : 'bg-[#0a0a0c] border-white/5 opacity-50 text-zinc-600 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" />
                              ) : item.accessible ? (
                                <Play className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                              )}
                              <span className="truncate">Урок {item.dayNumber}: {item.title}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono text-zinc-500">
                              {item.durationMinutes && <span>{item.durationMinutes} мин</span>}
                              {isActive && <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-semibold">ТЕКУЩИЙ</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <StudentHelpModal
        courseId={cId}
        lessonId={lId}
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <QuickNavDrawer />
    </div>
  );
};

export const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const cId = Number(courseId);
  const lId = Number(lessonId);

  return (
    <QuickNavProvider initialCourseId={!isNaN(cId) ? cId : undefined} initialLessonId={!isNaN(lId) ? lId : undefined}>
      <LessonPageContent />
    </QuickNavProvider>
  );
};
