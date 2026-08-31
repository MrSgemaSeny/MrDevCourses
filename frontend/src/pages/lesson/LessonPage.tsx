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
import {
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  ArrowLeft,
  BookOpen,
  Layers,
  Code2,
  HelpCircle,
} from 'lucide-react';


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
        <h2 className="text-sm font-bold text-white mb-2">Доступ ограничен</h2>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <Link
          to={`/courses/${lesson.courseSlug || ''}`}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>К курсу: {lesson.courseTitle || 'Назад'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openQuickNav('glossary')}
            className="px-2.5 py-1 rounded text-xs bg-[#18181b] hover:bg-zinc-800 border border-white/5 hover:border-zinc-500 text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer"
            aria-label="Открыть быструю навигацию"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Быстрая навигация</span>
          </button>


          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-white/5 text-zinc-300">
            Урок {lesson.dayNumber}
          </span>

          {lesson.completed && (
            <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center gap-1">
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
            <div className="aspect-video w-full rounded-sm overflow-hidden bg-zinc-950 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <iframe
                src={embedUrl}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

          {/* Lesson Title & Actions */}
          <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                {lesson.moduleTitle && (
                  <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    {lesson.moduleTitle}
                  </div>
                )}
                <h1 className="text-2xl font-bold text-white tracking-tight">{lesson.title}</h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="px-3 py-2 text-xs font-semibold rounded-md bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Не получается?</span>
                </button>

                <button
                  onClick={() => completeMutation.mutate()}
                  disabled={lesson.completed || completeMutation.isPending}
                  className={`px-4 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
                    lesson.completed
                      ? 'bg-[#141418] border border-white/5 text-emerald-400 cursor-default'
                      : 'bg-[#fafafa] hover:bg-white text-[#09090b] shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lesson.completed ? 'Урок пройден' : completeMutation.isPending ? 'Сохранение...' : 'Отметить как пройденный'}</span>
                </button>
              </div>
            </div>

            {/* Lesson Tabs */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
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
                  className="px-4 py-2 bg-[#141418] hover:bg-zinc-800 border border-white/5 text-zinc-300 text-xs rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
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
                  className="px-4 py-2 bg-[#141418] hover:bg-zinc-800 border border-white/5 text-zinc-300 text-xs rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
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
          <div className="p-4 rounded-sm bg-[#0e0e11] border border-white/5 sticky top-20">
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
                      className={`p-2.5 rounded-sm border text-xs flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-[#141418] border-zinc-500 text-white font-medium'
                          : item.accessible
                          ? 'bg-[#0a0a0c] border-white/5 hover:border-zinc-600 text-zinc-300 cursor-pointer'
                          : 'bg-[#0a0a0c] border-white/5 opacity-50 text-zinc-600 cursor-not-allowed'
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
                        <span className="truncate">Урок {item.dayNumber}: {item.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
