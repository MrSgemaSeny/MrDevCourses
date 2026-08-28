import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import { lessonApi } from '@/entities/lesson/api/lessonApi';
import { useAuth } from '@/features/auth';
import { VisualRoadmap } from '@/widgets/roadmap/VisualRoadmap';
import { CertificateModal } from '@/widgets/certificate/CertificateModal';
import { Lock, Play, Calendar, Clock, ArrowRight, Award, CheckCircle2, FileText, HelpCircle, Code2 } from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [showCertificate, setShowCertificate] = useState(false);

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

  const getLessonTypeIcon = (type?: string) => {
    switch (type) {
      case 'ARTICLE':
        return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
      case 'QUIZ':
        return <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />;
      case 'PRACTICE':
        return <Code2 className="w-3.5 h-3.5 text-zinc-400" />;
      default:
        return <Play className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };


  if (courseLoading) {
    return <div className="text-center py-20 text-zinc-500 text-xs">Загрузка информации о курсе...</div>;
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

  const firstAccessibleLesson = lessons.find((l) => l.accessible);
  const isCourseFinished = lessons.length > 0 && lessons.every((l) => l.completed);
  const modules = course.modules || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Course Hero */}
      <div className="p-8 rounded-sm bg-[#18181b] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-white/5 font-mono">
            5 модулей &bull; 30 уроков
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight mb-4">{course.title}</h1>

        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed mb-6 font-normal">
          {course.description || 'Пошаговый курс с практическими уроками, ориентированный на реальный результат.'}
        </p>

        <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
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
            <h2 className="text-sm font-bold text-white tracking-tight">Структура и модули программы</h2>
            <span className="text-xs text-zinc-400">
              {modules.reduce((acc, m) => acc + (m.lessonsCount || 0), 0)} уроков всего
            </span>
          </div>

          <div className="space-y-3">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="bg-[#18181b] border border-white/5 rounded-sm overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <div className="w-full px-5 py-4 bg-[#0a0a0c] flex items-center justify-between text-left">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-white">{mod.title}</span>
                      {mod.isFreePreview && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-white/10">
                          Бесплатный модуль
                        </span>
                      )}
                    </div>

                    {mod.description && (
                      <p className="text-xs text-zinc-400 mt-1">{mod.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-500">
                      {mod.completedLessonsCount || 0} / {mod.lessonsCount}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2 border-t border-white/5 bg-[#18181b]/50">
                  {mod.lessons.map((lessonItem) => (
                    <div
                      key={lessonItem.id}
                      onClick={() => {
                        if (lessonItem.accessible && course.enrolled) {
                          navigate(`/courses/${course.id}/lessons/${lessonItem.id}`);
                        }
                      }}
                      className={`p-3 rounded-sm border text-xs flex items-center justify-between transition-all ${
                        lessonItem.accessible && course.enrolled
                          ? 'bg-[#18181b] border-white/5 hover:border-zinc-500 text-zinc-200 cursor-pointer'
                          : 'bg-[#0a0a0c] border-white/5 text-zinc-500 cursor-default'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1 rounded bg-zinc-900 border border-white/5 shrink-0">
                          {getLessonTypeIcon(lessonItem.lessonType)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white truncate">
                            {lessonItem.title.startsWith(`День ${lessonItem.dayNumber}:`)
                              ? lessonItem.title
                              : `День ${lessonItem.dayNumber}: ${lessonItem.title}`}
                          </div>
                          <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
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
                          <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 border border-white/5 text-white">
                            Доступен
                          </span>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-zinc-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
