import React from 'react';
import { CourseRetention } from '@/entities/adminAnalyticsApi';

interface LessonRetentionTableProps {
  retention: CourseRetention;
}

export const LessonRetentionTable: React.FC<LessonRetentionTableProps> = ({ retention }) => {
  if (!retention || !retention.lessonRetention || retention.lessonRetention.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-900/60 border border-white/5 rounded-sm text-zinc-400 text-xs">
        Нет данных об удержании студентов по урокам.
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-white/5 bg-[#18181b] overflow-hidden" data-testid="lesson-retention-table">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900/80 border-b border-white/5 text-zinc-400 font-mono">
            <tr>
              <th className="p-3.5">Урок</th>
              <th className="p-3.5">Завершили</th>
              <th className="p-3.5">Конверсия</th>
              <th className="p-3.5">Отсев (Drop-off)</th>
              <th className="p-3.5">Ср. время прохождения</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {retention.lessonRetention.map((lesson) => (
              <tr key={lesson.lessonId} className="hover:bg-zinc-800/30 transition-colors">
                <td className="p-3.5 font-medium text-white">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded bg-zinc-800 border border-white/5 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-300">
                      Д{lesson.dayNumber}
                    </span>
                    <span className="truncate max-w-xs">{lesson.lessonTitle}</span>
                  </div>
                </td>

                <td className="p-3.5 font-mono text-zinc-200">
                  {lesson.completedCount} <span className="text-zinc-500 text-[10px]">/ {retention.totalEnrolled}</span>
                </td>

                <td className="p-3.5">
                  <div className="flex items-center gap-2 max-w-[140px]">
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-zinc-100 text-black h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, lesson.completionRate))}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-300 w-10 text-right">
                      {lesson.completionRate}%
                    </span>
                  </div>
                </td>

                <td className="p-3.5 font-mono">
                  {lesson.dropOffRate > 0 ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-white/10">
                      -{lesson.dropOffRate}%
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-[10px]">0%</span>
                  )}
                </td>

                <td className="p-3.5 font-mono text-zinc-300">
                  {lesson.avgDaysToComplete > 0 ? (
                    <span>{lesson.avgDaysToComplete} дн.</span>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
