import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonApi } from '@/entities/lesson/api/lessonApi';
import { MarkdownViewer } from '@/shared/ui/MarkdownViewer';
import { QuickNavProvider, QuickNavDrawer, useQuickNav } from '@/widgets/quick-nav';
import { LessonContextPanel } from '@/widgets/lesson';
import { LessonAiTutorChat } from '@/widgets/ai-tutor/LessonAiTutorChat';
import {
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  ArrowLeft,
  BookOpen,
  Layers,
} from 'lucide-react';

const LessonPageContent: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openQuickNav } = useQuickNav();
  const [activeTab, setActiveTab] = useState<'content' | 'tutor'>('content');

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

  // Extract YouTube embed ID
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  if (lessonLoading) {
    return <div className="text-center py-24 text-zinc-500 text-sm">Загрузка урока...</div>;
  }

  if (lessonError || !lesson) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Доступ ограничен</h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6">
          {(lessonError as any)?.response?.data?.message || 'Этот урок заблокирован согласно вашему графику обучения.'}
        </p>
        <Link
          to={`/courses`}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-md transition-colors"
        >
          Вернуться к курсам
        </Link>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(lesson.youtubeUrl);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#27272a]">
        <Link
          to={`/courses/${lesson.courseSlug || ''}`}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>К курсу: {lesson.courseTitle || 'Назад'}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Quick-Nav trigger button */}
          <button
            onClick={() => openQuickNav('glossary')}
            className="px-2.5 py-1 rounded text-xs bg-[#161b22] hover:bg-zinc-800 border border-[#30363d] hover:border-zinc-500 text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer"
            aria-label="Открыть быструю навигацию"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Быстрая навигация</span>
          </button>

          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-zinc-900 border border-zinc-700 text-zinc-300">
            День {lesson.dayNumber}
          </span>
          {lesson.completed && (
            <span className="px-2.5 py-0.5 rounded text-[11px] bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Пройден
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Video Player */}
          {embedUrl ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-950 border border-[#27272a] shadow-2xl">
              <iframe
                src={embedUrl}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="aspect-video w-full rounded-xl bg-zinc-950/60 border border-[#27272a] flex flex-col items-center justify-center text-zinc-500 text-xs">
              <BookOpen className="w-8 h-8 mb-2 opacity-50" />
              <span>Текстовый урок</span>
            </div>
          )}

          {/* Lesson Title & Actions */}
          <div className="p-6 rounded-xl bg-[rgba(24,24,27,0.85)] border border-[#27272a] backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-white tracking-tight">{lesson.title}</h1>

              <button
                onClick={() => completeMutation.mutate()}
                disabled={lesson.completed || completeMutation.isPending}
                className={`px-4 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
                  lesson.completed
                    ? 'bg-zinc-800/60 border border-zinc-700 text-emerald-400 cursor-default'
                    : 'bg-[#fafafa] hover:bg-white text-[#09090b] shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lesson.completed ? 'Урок пройден' : completeMutation.isPending ? 'Сохранение...' : 'Отметить как пройденный'}</span>
              </button>
            </div>

            {/* Lesson Content / AI Tutor Tabs */}
            <div className="pt-4 border-t border-[#27272a]">
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('content')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'content'
                      ? 'bg-[#21262d] text-[#fafafa] border border-[#30363d]'
                      : 'text-[#8b949e] hover:text-[#fafafa]'
                  }`}
                >
                  Материалы урока
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tutor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'tutor'
                      ? 'bg-[#238636]/20 text-emerald-400 border border-emerald-500/40'
                      : 'text-[#8b949e] hover:text-[#fafafa]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  AI Наставник
                </button>
              </div>

              {activeTab === 'content' ? (
                <>
                  <MarkdownViewer content={lesson.content} />
                  {/* Contextual Terms Panel */}
                  <div className="mt-6 pt-6 border-t border-[#27272a]">
                    <LessonContextPanel
                      dayNumber={lesson.dayNumber}
                      courseId={cId}
                      lessonId={lId}
                    />
                  </div>
                </>
              ) : (
                <LessonAiTutorChat
                  courseId={cId}
                  lessonId={lId}
                  lessonTitle={lesson.title}
                />
              )}
            </div>

            {/* Prev / Next navigation */}
            <div className="mt-8 pt-6 border-t border-[#27272a] flex items-center justify-between">
              {lesson.prevLessonId ? (
                <button
                  onClick={() => navigate(`/courses/${cId}/lessons/${lesson.prevLessonId}`)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
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
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Следующий урок</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Curriculum (1 col) */}
        <div className="lg:col-span-1">
          <div className="p-4 rounded-xl bg-[rgba(24,24,27,0.85)] border border-[#27272a] sticky top-20 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <span>Уроки курса</span>
            </h3>

            {lessonsLoading ? (
              <div className="text-center py-6 text-zinc-500 text-xs">Загрузка...</div>
            ) : (
              <div className="space-y-2">
                {lessons.map((item) => {
                  const isActive = item.id === lId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.accessible) {
                          navigate(`/courses/${cId}/lessons/${item.id}`);
                        }
                      }}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-zinc-800 border-zinc-500 text-white font-medium'
                          : item.accessible
                          ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300 cursor-pointer'
                          : 'bg-zinc-950/40 border-zinc-900 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {item.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : item.accessible ? (
                          <Play className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        )}
                        <span className="truncate">Д{item.dayNumber}: {item.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick-Nav Slide-over Drawer (Fixed overlay, does not unmount video or page) */}
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
