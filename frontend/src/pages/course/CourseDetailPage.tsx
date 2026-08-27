import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import { lessonApi } from '@/entities/lesson/api/lessonApi';
import { useAuth } from '@/features/auth';
import { VisualRoadmap } from '@/widgets/roadmap/VisualRoadmap';
import { CertificateModal } from '@/widgets/certificate/CertificateModal';
import { Lock, Play, Calendar, Clock, ArrowRight, Award, ChevronDown, CheckCircle2, FileText, HelpCircle, Code2 } from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [showCertificate, setShowCertificate] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 1: true, 2: true });

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
    enrollMutation.mutate();
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const getLessonTypeIcon = (type?: string) => {
    switch (type) {
      case 'ARTICLE':
        return <FileText className="w-3.5 h-3.5 text-sky-400" />;
      case 'QUIZ':
        return <HelpCircle className="w-3.5 h-3.5 text-amber-400" />;
      case 'PRACTICE':
        return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Play className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  if (courseLoading) {
    return <div className="text-center py-20 text-zinc-500 text-sm">Загрузка информации о курсе...</div>;
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Курс не найден</h2>
        <Link to="/courses" className="text-sm text-zinc-400 hover:text-white underline">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const firstAccessibleLesson = lessons.find((l) => l.accessible);
  const isCourseFinished = lessons.length > 0 && lessons.every((l) => l.completed);
  const modules = course.modules || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Course Hero */}
      <div className="p-8 rounded-xl bg-[rgba(24,24,27,0.85)] border border-[#27272a] mb-8 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
            Обучение 1 день — 1 урок
          </span>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
            {course.totalLessons || 5} уроков &bull; {modules.length || 2} модуля
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">{course.title}</h1>

        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed mb-6 font-normal">
          {course.description || 'Пошаговый курс с практическими уроками, ориентированный на реальный результат.'}
        </p>

        <div className="pt-6 border-t border-[#27272a] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Ежедневный доступ
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Старт в момент записи
            </span>
          </div>

          {course.enrolled ? (
            <div className="flex items-center gap-3">
              {isCourseFinished && (
                <button
                  onClick={() => setShowCertificate(true)}
                  className="px-4 py-2 bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Сертификат</span>
                </button>
              )}

              {firstAccessibleLesson && (
                <Link
                  to={`/courses/${course.id}/lessons/${firstAccessibleLesson.id}`}
                  className="px-5 py-2.5 bg-[#fafafa] hover:bg-white text-[#09090b] text-xs font-semibold rounded-md flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Открыть урок</span>
                </Link>
              )}
            </div>
          ) : (
            <button
              onClick={handleEnrollClick}
              disabled={enrollMutation.isPending}
              className="px-6 py-2.5 bg-[#fafafa] hover:bg-white text-[#09090b] text-xs font-semibold rounded-md flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] cursor-pointer"
            >
              <span>{enrollMutation.isPending ? 'Запись...' : 'Записаться на курс'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Module Hierarchy Section */}
      {modules.length > 0 ? (
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Структура и модули программы</h2>
            <span className="text-xs text-zinc-400">
              {modules.reduce((acc, m) => acc + (m.lessonsCount || 0), 0)} уроков всего
            </span>
          </div>

          <div className="space-y-3">
            {modules.map((mod) => {
              const isExpanded = expandedModules[mod.id] ?? true;
              return (
                <div
                  key={mod.id}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="w-full px-5 py-4 bg-[#0d1117] flex items-center justify-between hover:bg-[#161b22] transition-colors cursor-pointer text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-semibold text-white">{mod.title}</span>
                        {mod.isFreePreview && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-500/20 text-sky-400 border border-sky-500/30">
                            Бесплатный модуль
                          </span>
                        )}
                      </div>
                      {mod.description && (
                        <p className="text-[11px] text-[#8b949e] mt-1">{mod.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[#8b949e]">
                        {mod.completedLessonsCount || 0} / {mod.lessonsCount}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#8b949e] transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 space-y-2 border-t border-[#30363d] bg-[#161b22]/50">
                      {mod.lessons.map((lessonItem) => (
                        <div
                          key={lessonItem.id}
                          onClick={() => {
                            if (lessonItem.accessible && course.enrolled) {
                              navigate(`/courses/${course.id}/lessons/${lessonItem.id}`);
                            }
                          }}
                          className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                            lessonItem.accessible && course.enrolled
                              ? 'bg-[#0d1117] border-[#30363d] hover:border-zinc-500 text-zinc-200 cursor-pointer'
                              : 'bg-[#090d13]/60 border-[#21262d] text-[#8b949e] cursor-default'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1 rounded bg-[#21262d] shrink-0">
                              {getLessonTypeIcon(lessonItem.lessonType)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-white truncate">
                                День {lessonItem.dayNumber}: {lessonItem.title}
                              </div>
                              <div className="text-[10px] text-[#8b949e] flex items-center gap-2 mt-0.5">
                                <span>{lessonItem.lessonType || 'VIDEO'}</span>
                                {lessonItem.durationMinutes ? (
                                  <span>&bull; {lessonItem.durationMinutes} мин</span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {lessonItem.completed ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Пройден
                              </span>
                            ) : lessonItem.accessible && course.enrolled ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-[#21262d] text-white">
                                Доступен
                              </span>
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-[#8b949e]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Visual Roadmap or Syllabus */}
      {course.enrolled && lessons.length > 0 && (
        <div className="space-y-6">
          <VisualRoadmap courseId={course.id} lessons={lessons} />
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
