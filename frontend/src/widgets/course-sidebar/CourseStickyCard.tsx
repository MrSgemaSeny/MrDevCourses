import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Course, LessonSummary, CourseModule } from '@/shared/types';
import { Play, ArrowRight, Award, CheckCircle2, Share2, Video, BookOpen, Layers, Users } from 'lucide-react';

interface CourseStickyCardProps {
  course: Course;
  lessons: LessonSummary[];
  onEnroll: () => void;
  isEnrolling?: boolean;
  onOpenCertificate?: () => void;
  onPlayTrailer?: () => void;
}

export const CourseStickyCard: React.FC<CourseStickyCardProps> = ({
  course,
  lessons,
  onEnroll,
  isEnrolling = false,
  onOpenCertificate,
  onPlayTrailer,
}) => {
  const [copied, setCopied] = useState(false);
  const [isHoveredVideo, setIsHoveredVideo] = useState(false);

  const completedCount = lessons.filter((l) => l.completed).length;
  const totalCount = lessons.length || (course.modules?.reduce((acc: number, m: CourseModule) => acc + (m.lessonsCount || 0), 0) ?? 0);
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isFinished = totalCount > 0 && completedCount === totalCount;
  const firstAccessible = lessons.find((l) => l.accessible && !l.completed) || lessons[0];

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-[#0e0e11] border border-white/10 rounded-sm overflow-hidden shadow-2xl sticky top-20 w-full">
      {/* Poster / Preview thumbnail with trailer play trigger & hover autoplay */}
      <div
        onMouseEnter={() => setIsHoveredVideo(true)}
        onMouseLeave={() => setIsHoveredVideo(false)}
        className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden border-b border-white/5 cursor-pointer"
        onClick={onPlayTrailer}
      >
        {isHoveredVideo ? (
          <iframe
            src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1"
            title="Course Video Preview"
            className="w-full h-full pointer-events-none border-0"
            allow="autoplay"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-black/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0,transparent_100%)]" />

            {/* Video play icon */}
            <button
              type="button"
              className="relative z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-lg cursor-pointer"
              aria-label="Смотреть трейлер курса"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </>
        )}
      </div>

      {/* Main Action area */}
      <div className="p-6 space-y-6">
        {/* Status / Enrollment State */}
        {course.enrolled ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-mono">
                <span>Ваш прогресс</span>
                <span className="text-white font-semibold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {isFinished ? (
              <button
                type="button"
                onClick={onOpenCertificate}
                className="w-full py-3 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Открыть сертификат</span>
              </button>
            ) : firstAccessible ? (
              <Link
                to={`/courses/${course.id}/lessons/${firstAccessible.id}`}
                className="w-full py-3 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Продолжить обучение</span>
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={onEnroll}
              disabled={isEnrolling}
              className="w-full py-3 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black text-xs font-semibold rounded-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(255,255,255,0.15)] cursor-pointer"
            >
              <span>{isEnrolling ? 'Запись...' : 'Записаться на курс'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-zinc-500 font-mono">
              Бесплатный доступ к материалам курса
            </p>
          </div>
        )}

        {/* 3-4 Key Course Facts */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            Параметры курса
          </h4>

          <ul className="space-y-2 text-xs text-zinc-300">
            <li className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>{course.modules?.length || 5} модулей программы</span>
            </li>
            <li className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>{totalCount || 30} практических уроков</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Video className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>--:-- видеоматериалов</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>Формат: Онлайн + Discord сообщество</span>
            </li>
          </ul>
        </div>

        {/* Share Button */}
        <div className="pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={handleShare}
            className="w-full py-2 bg-transparent hover:bg-white/5 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white text-xs rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer font-mono"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span className="text-white font-medium">Ссылка скопирована!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Поделиться курсом</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
