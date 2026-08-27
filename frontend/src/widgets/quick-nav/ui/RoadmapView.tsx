import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '@/entities/lesson/api/lessonApi';
import { LessonSummary } from '@/shared/types';
import { CountdownTimer } from '@/shared/ui/CountdownTimer';
import { CheckCircle2, Play, Lock, BookOpen } from 'lucide-react';

interface RoadmapViewProps {
  courseId?: number | null;
  currentLessonId?: number | null;
  onSelectLesson?: (lessonId: number) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  courseId,
  currentLessonId,
  onSelectLesson,
}) => {
  const navigate = useNavigate();

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => (courseId ? lessonApi.getLessons(courseId) : Promise.resolve([])),
    enabled: !!courseId,
  });

  if (!courseId) {
    return (
      <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2">
        <BookOpen className="w-8 h-8 text-zinc-600 opacity-60" />
        <p>Выберите курс для просмотра Roadmap.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2">
        <div className="w-6 h-6 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
        <span>Загрузка карты уроков...</span>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-500 text-xs">
        В данном курсе пока нет доступных уроков.
      </div>
    );
  }

  const completedCount = lessons.filter((l) => l.completed).length;

  const handleLessonClick = (lesson: LessonSummary) => {
    if (lesson.accessible) {
      if (onSelectLesson) {
        onSelectLesson(lesson.id);
      }
      navigate(`/courses/${courseId}/lessons/${lesson.id}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#21262d] flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white tracking-tight">Траектория обучения</h4>
          <p className="text-[11px] text-zinc-400">1 день = 1 урок (капельный доступ)</p>
        </div>
        <span className="text-[11px] font-mono text-zinc-300 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
          {completedCount} / {lessons.length}
        </span>
      </div>

      {/* Connected Nodes List */}
      <div className="relative pl-2 pr-1 py-1">
        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const isCurrent = lesson.id === currentLessonId;
            const isLast = idx === lessons.length - 1;

            return (
              <div key={lesson.id} className="relative flex items-start gap-3">
                {/* Connecting line */}
                {!isLast && (
                  <div
                    className={`absolute left-3.5 top-7 bottom-[-12px] w-0.5 ${
                      lesson.completed ? 'bg-emerald-600/70' : 'bg-zinc-800'
                    }`}
                  />
                )}

                {/* Status Node Icon */}
                <div
                  onClick={() => handleLessonClick(lesson)}
                  className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    lesson.accessible ? 'cursor-pointer' : 'cursor-not-allowed'
                  } ${
                    lesson.completed
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                      : isCurrent
                      ? 'bg-white text-black border border-white ring-2 ring-white/30'
                      : lesson.accessible
                      ? 'bg-zinc-800 border border-zinc-600 text-white hover:border-zinc-400'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-600'
                  }`}
                >
                  {lesson.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : lesson.accessible ? (
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                </div>

                {/* Lesson Details Card */}
                <div
                  onClick={() => handleLessonClick(lesson)}
                  className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${
                    lesson.accessible
                      ? 'cursor-pointer hover:border-zinc-500'
                      : 'cursor-not-allowed opacity-75'
                  } ${
                    isCurrent
                      ? 'bg-zinc-800/90 border-zinc-500 text-white'
                      : lesson.accessible
                      ? 'bg-[#161b22] border-[#21262d] text-zinc-200'
                      : 'bg-[#161b22]/40 border-[#21262d]/50 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] font-mono text-zinc-400">
                      День {lesson.dayNumber}
                    </span>
                    {lesson.completed ? (
                      <span className="text-[10px] text-emerald-400 font-medium">Пройден</span>
                    ) : lesson.accessible ? (
                      <span className="text-[10px] text-zinc-400 font-medium">Доступен</span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">Заблокирован</span>
                    )}
                  </div>

                  <h5 className={`font-semibold text-xs leading-snug truncate ${lesson.accessible ? 'text-white' : 'text-zinc-500'}`}>
                    {lesson.title}
                  </h5>

                  {!lesson.accessible && lesson.opensAt && (
                    <div className="mt-1.5 pt-1.5 border-t border-[#21262d] text-[10px]">
                      <CountdownTimer targetDate={lesson.opensAt} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
