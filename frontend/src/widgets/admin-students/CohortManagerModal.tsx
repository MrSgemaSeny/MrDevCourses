import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Users,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { adminStudentApi } from '@/entities/adminStudentApi';
import { Cohort, Course, CreateCohortPayload, UpdateCohortPayload } from '@/shared/types';

interface CohortManagerModalProps {
  courses: Course[];
  isOpen: boolean;
  onClose: () => void;
}

export const CohortManagerModal: React.FC<CohortManagerModalProps> = ({
  courses,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [courseId, setCourseId] = useState<number | ''>(courses[0]?.id || '');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxStudents, setMaxStudents] = useState(50);
  const [isActive, setIsActive] = useState(true);

  // Queries
  const { data: cohorts = [], isLoading } = useQuery<Cohort[]>({
    queryKey: ['admin', 'cohorts'],
    queryFn: adminStudentApi.getAllCohorts,
    enabled: isOpen,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateCohortPayload) =>
      adminStudentApi.createCohort(payload.courseId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cohorts'] });
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Ошибка создания когорты');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCohortPayload }) =>
      adminStudentApi.updateCohort(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cohorts'] });
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Ошибка обновления когорты');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminStudentApi.deleteCohort,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cohorts'] });
      setDeleteConfirmId(null);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Ошибка удаления когорты');
    },
  });

  if (!isOpen) return null;

  const resetForm = () => {
    setIsCreating(false);
    setEditingCohort(null);
    setName('');
    setStartDate('');
    setEndDate('');
    setMaxStudents(50);
    setIsActive(true);
    setErrorMsg(null);
  };

  const handleStartEdit = (cohort: Cohort) => {
    setEditingCohort(cohort);
    setIsCreating(true);
    setCourseId(cohort.courseId);
    setName(cohort.name);
    setStartDate(cohort.startDate ? cohort.startDate.substring(0, 10) : '');
    setEndDate(cohort.endDate ? cohort.endDate.substring(0, 10) : '');
    setMaxStudents(cohort.maxStudents || 50);
    setIsActive(cohort.isActive);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate) {
      setErrorMsg('Укажите название и дату старта');
      return;
    }

    const isoStart = new Date(startDate).toISOString();
    const isoEnd = endDate ? new Date(endDate).toISOString() : undefined;

    if (editingCohort) {
      updateMutation.mutate({
        id: editingCohort.id,
        payload: {
          name: name.trim(),
          startDate: isoStart,
          endDate: isoEnd,
          maxStudents,
          isActive,
        },
      });
    } else {
      if (!courseId) {
        setErrorMsg('Выберите курс для когорты');
        return;
      }
      createMutation.mutate({
        courseId: Number(courseId),
        name: name.trim(),
        startDate: isoStart,
        endDate: isoEnd,
        maxStudents,
        isActive,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-[#0a0a0c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-800 text-zinc-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Управление когортами обучения</h3>
              <p className="text-xs text-zinc-400">
                Создание учебных потоков, лимиты мест и расписание открытия курсов
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-4 border-b border-white/5 bg-[#121216] flex items-center justify-between">
          <div className="text-xs font-semibold text-zinc-300">
            Всего когорт: <span className="font-mono text-zinc-100">{cohorts.length}</span>
          </div>

          {!isCreating && (
            <button
              onClick={() => {
                resetForm();
                setIsCreating(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Создать когорту</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          {isCreating && (
            <form
              onSubmit={handleSubmit}
              className="p-4 rounded-xl bg-[#0a0a0c] border border-white/10 space-y-4 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                  {editingCohort ? 'Редактировать когорту' : 'Новая когорта'}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Отмена
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Course Selection */}
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">Курс</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(Number(e.target.value))}
                    disabled={!!editingCohort}
                    className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500 cursor-pointer disabled:opacity-50"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cohort Name */}
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">Название потока</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например, Осенний поток 2026"
                    className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">Дата старта</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">
                    Дата окончания (опционально)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                {/* Max Students */}
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">Максимум мест</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="cohortActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-800 border-white/10 text-zinc-100 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="cohortActive" className="text-zinc-200 cursor-pointer">
                    Когорта активна (открыта для набора)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{editingCohort ? 'Сохранить изменения' : 'Создать поток'}</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Cohorts */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
              <span className="text-xs">Загрузка когорт...</span>
            </div>
          ) : cohorts.length === 0 ? (
            <div className="p-8 text-center bg-[#0a0a0c] border border-white/5 rounded-xl text-xs text-zinc-500">
              Пока не создано ни одной когорты. Нажмите «Создать когорту», чтобы добавить поток.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {cohorts.map((cohort) => {
                const percent =
                  cohort.maxStudents > 0
                    ? Math.round((cohort.currentStudentsCount / cohort.maxStudents) * 100)
                    : 0;

                return (
                  <div
                    key={cohort.id}
                    className="p-4 bg-[#0a0a0c] border border-white/5 rounded-xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-sm font-semibold text-zinc-100">{cohort.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                              cohort.isActive
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'bg-zinc-800 text-zinc-400 border border-white/5'
                            }`}
                          >
                            {cohort.isActive ? 'АКТИВНА' : 'АРХИВ'}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          Курс: <span className="text-zinc-200 font-medium">{cohort.courseTitle}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(cohort)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Редактировать"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(cohort.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dates & Capacity Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1 border-t border-white/5">
                      <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>
                          Старт:{' '}
                          {cohort.startDate
                            ? new Date(cohort.startDate).toLocaleDateString('ru-RU')
                            : '—'}
                          {cohort.endDate
                            ? ` • До ${new Date(cohort.endDate).toLocaleDateString('ru-RU')}`
                            : ''}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-1">
                          <span>
                            Заполнено: {cohort.currentStudentsCount} / {cohort.maxStudents} мест
                          </span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              percent >= 100 ? 'bg-amber-400' : 'bg-zinc-300'
                            }`}
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delete Confirmation inside item */}
                    {deleteConfirmId === cohort.id && (
                      <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-between text-xs text-red-300 animate-in fade-in duration-100">
                        <span>Удалить когорту «{cohort.name}»?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] cursor-pointer"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(cohort.id)}
                            disabled={deleteMutation.isPending}
                            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                          >
                            {deleteMutation.isPending ? 'Удаление...' : 'Да, удалить'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0a0a0c] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
