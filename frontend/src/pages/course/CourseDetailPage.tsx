import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import { lessonApi } from '@/entities/lesson/api/lessonApi';
import { useAuth } from '@/app/providers/AuthProvider';
import { Lock, Play, CheckCircle2, Calendar, Clock, ArrowRight } from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => courseApi.getCourseBySlug(slug!),
    enabled: !!slug,
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Course Hero */}
      <div className="p-8 rounded-xl bg-[rgba(24,24,27,0.85)] border border-[#27272a] mb-8 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
            Обучение 1 день — 1 урок
          </span>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
            {course.totalLessons || 5} уроков
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
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Вы уже записаны
              </span>
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

      {/* Syllabus / Lessons list */}
      <div className="p-8 rounded-xl bg-[rgba(24,24,27,0.7)] border border-[#27272a] backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-2">Программа курса</h2>
        <p className="text-xs text-zinc-400 mb-6">
          {course.enrolled
            ? 'Список уроков и статус их открытия согласно вашему персональному Drip-графику.'
            : 'Запишитесь на курс, чтобы открыть первый день и активировать график открытия уроков.'}
        </p>

        {lessonsLoading ? (
          <div className="py-8 text-center text-zinc-500 text-xs">Загрузка уроков...</div>
        ) : course.enrolled && lessons.length > 0 ? (
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const formattedDate = new Date(lesson.opensAt).toLocaleDateString('ru-RU', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={lesson.id}
                  className={`p-4 rounded-lg border flex items-center justify-between transition-all ${
                    lesson.accessible
                      ? 'bg-zinc-900/80 border-zinc-700/80 hover:border-zinc-500'
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                        lesson.completed
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : lesson.accessible
                          ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                          : 'bg-zinc-900 text-zinc-600 border border-zinc-900'
                      }`}
                    >
                      {lesson.completed ? <CheckCircle2 className="w-4 h-4" /> : `Д${lesson.dayNumber}`}
                    </div>

                    <div>
                      <h3 className={`text-sm font-semibold ${lesson.accessible ? 'text-white' : 'text-zinc-500'}`}>
                        {lesson.title}
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        {lesson.accessible ? (
                          lesson.completed ? (
                            <span className="text-emerald-400">Пройден</span>
                          ) : (
                            <span className="text-zinc-300">Доступен сейчас</span>
                          )
                        ) : (
                          <span>Откроется: {formattedDate}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    {lesson.accessible ? (
                      <Link
                        to={`/courses/${course.id}/lessons/${lesson.id}`}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Смотреть</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 px-3 py-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Заблокирован</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((day) => (
              <div
                key={day}
                className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between text-zinc-400"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-xs font-mono text-zinc-300">
                    Д{day}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-zinc-300">День {day}: Практический модуль</h3>
                    <p className="text-[11px] text-zinc-400">Открывается на {day} день обучения</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
