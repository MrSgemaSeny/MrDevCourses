import React, { useState } from 'react';
import { X, BookOpen, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Student, Course } from '@/shared/types';

interface ManualEnrollModalProps {
  student: Student | null;
  courses: Course[];
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (userId: number, courseId: number) => Promise<void>;
  onUnenroll: (userId: number, courseId: number) => Promise<void>;
}

export const ManualEnrollModal: React.FC<ManualEnrollModalProps> = ({
  student,
  courses,
  isOpen,
  onClose,
  onEnroll,
  onUnenroll,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const enrolledCourseIds = new Set(student.enrollments?.map((e) => e.courseId) || []);
  const availableCourses = courses.filter((c) => !enrolledCourseIds.has(c.id));

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onEnroll(student.id, Number(selectedCourseId));
      setSelectedCourseId('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Ошибка зачисления на курс';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnenroll = async (courseId: number) => {
    try {
      setActionLoadingId(courseId);
      setErrorMsg(null);
      await onUnenroll(student.id, courseId);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Ошибка отчисления с курса';
      setErrorMsg(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#18181b] border border-white/10 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Управление зачислениями</h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                {student.name || student.email} ({student.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Enrollments */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
              Текущие зачисления ({student.enrollments?.length || 0})
            </h4>
            {student.enrollments && student.enrollments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {student.enrollments.map((enr) => (
                  <div
                    key={enr.id}
                    className="flex items-center justify-between p-2.5 bg-[#0a0a0c] border border-white/5 rounded-lg text-xs"
                  >
                    <div>
                      <div className="font-medium text-zinc-200">{enr.courseTitle}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Зачислен: {new Date(enr.enrolledAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={actionLoadingId === enr.courseId}
                      onClick={() => handleUnenroll(enr.courseId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/20 text-[10px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                      title="Отчислить с курса"
                    >
                      {actionLoadingId === enr.courseId ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      <span>Отчислить</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center bg-[#0a0a0c] border border-white/5 rounded-lg text-xs text-zinc-500">
                Студент пока не зачислен ни на один курс.
              </div>
            )}
          </div>

          {/* New Enrollment Form */}
          <form onSubmit={handleEnroll} className="pt-3 border-t border-white/5 space-y-3">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Зачислить на новый курс
            </h4>
            <div className="flex gap-2">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : '')}
                disabled={isSubmitting || availableCourses.length === 0}
                className="flex-1 px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {availableCourses.length === 0
                    ? 'Все доступные курсы уже зачислены'
                    : 'Выберите курс для зачисления...'}
                </option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id} className="bg-[#18181b] text-zinc-100">
                    {course.title}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!selectedCourseId || isSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Зачислить</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 bg-[#0a0a0c] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
