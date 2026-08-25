import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import { BookOpen, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: courseApi.getCourses,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 pb-6 border-b border-[#27272a]">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Каталог курсов</h1>
        <p className="text-sm text-zinc-400">
          Все курсы Mr Developer работают по строгой Drip-системе: один день — один урок.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-zinc-500 text-sm">Загрузка каталога курсов...</div>
      ) : courses.length === 0 ? (
        <div className="p-8 text-center bg-[rgba(24,24,27,0.6)] border border-[#27272a] rounded-lg text-zinc-400 text-sm">
          В каталоге пока нет доступных курсов.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-6 rounded-lg bg-[rgba(24,24,27,0.8)] border border-[#27272a] hover:border-zinc-700 transition-all flex flex-col justify-between backdrop-blur-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {course.totalLessons || 5} уроков
                  </span>
                  {course.enrolled ? (
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Вы записаны
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                      Открыт набор
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-white mb-2">{course.title}</h2>

                <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-normal">
                  {course.description || 'Пошаговый курс с практическими заданиями и ежедневным открытием уроков.'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#27272a] flex items-center justify-between">
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Drip Engine
                </span>

                <Link
                  to={`/courses/${course.slug}`}
                  className="px-4 py-2 bg-[#fafafa] hover:bg-white text-[#09090b] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  <span>{course.enrolled ? 'Продолжить' : 'Подробнее'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
