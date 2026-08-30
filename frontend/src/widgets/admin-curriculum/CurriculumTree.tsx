import React, { useState, useEffect } from 'react';
import {
  Plus,
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Course, CourseModule, LessonSummary } from '@/shared/types';
import { adminApi, CreateModulePayload, ReorderItemPayload } from '@/entities/adminApi';
import { ModuleCard } from './ModuleCard';

interface CurriculumTreeProps {
  course: Course;
  onCourseUpdated: () => void;
}

export const CurriculumTree: React.FC<CurriculumTreeProps> = ({ course, onCourseUpdated }) => {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingReorder, setIsSavingReorder] = useState(false);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [newModulePreview, setNewModulePreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Drag state
  const [draggedModuleId, setDraggedModuleId] = useState<number | null>(null);
  const [draggedLessonId, setDraggedLessonId] = useState<number | null>(null);

  const fetchModules = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getModules(course.id);
      setModules(data);
    } catch (err: any) {
      setError(err?.message || 'Ошибка загрузки модулей');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [course.id]);

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      const payload: CreateModulePayload = {
        title: newModuleTitle.trim(),
        description: newModuleDesc.trim() || undefined,
        isFreePreview: newModulePreview,
        sortOrder: modules.length + 1,
      };

      await adminApi.createModule(course.id, payload);
      setNewModuleTitle('');
      setNewModuleDesc('');
      setNewModulePreview(false);
      setIsAddModuleOpen(false);
      fetchModules();
      onCourseUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось создать модуль');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот модуль вместе со всеми его уроками?')) return;
    try {
      setIsLoading(true);
      await adminApi.deleteModule(moduleId);
      fetchModules();
      onCourseUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось удалить модуль');
    } finally {
      setIsLoading(false);
    }
  };

  // Module Drag & Drop
  const handleDragStartModule = (e: React.DragEvent, id: number) => {
    e.stopPropagation();
    setDraggedModuleId(id);
  };

  const handleDropModule = async (e: React.DragEvent, targetModuleId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedModuleId || draggedModuleId === targetModuleId) {
      setDraggedModuleId(null);
      return;
    }

    const currentModules = [...modules];
    const sourceIdx = currentModules.findIndex((m) => m.id === draggedModuleId);
    const targetIdx = currentModules.findIndex((m) => m.id === targetModuleId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const [moved] = currentModules.splice(sourceIdx, 1);
    currentModules.splice(targetIdx, 0, moved);

    // Optimistic UI
    setModules(currentModules);
    setDraggedModuleId(null);

    // Sync with backend
    try {
      setIsSavingReorder(true);
      const reorderPayload: ReorderItemPayload[] = currentModules.map((m, idx) => ({
        id: m.id,
        sortOrder: idx + 1,
      }));
      const updated = await adminApi.reorderModules(course.id, reorderPayload);
      setModules(updated);
      setSuccessMessage('Порядок модулей и тайминги капельницы успешно сохранены');
      setTimeout(() => setSuccessMessage(null), 3000);
      onCourseUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось сохранить порядок модулей');
      fetchModules();
    } finally {
      setIsSavingReorder(false);
    }
  };

  // Lesson Drag & Drop
  const handleDragStartLesson = (e: React.DragEvent, id: number) => {
    e.stopPropagation();
    setDraggedLessonId(id);
  };

  const handleDropLesson = async (e: React.DragEvent, targetLessonId: number, targetModuleId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedLessonId) return;

    // Build flat list of all lessons in updated order
    const allModules = [...modules];
    let sourceLesson: LessonSummary | null = null;

    // Find and remove source lesson
    for (const mod of allModules) {
      const lIdx = mod.lessons?.findIndex((l) => l.id === draggedLessonId) ?? -1;
      if (lIdx !== -1) {
        sourceLesson = mod.lessons[lIdx];
        mod.lessons.splice(lIdx, 1);
        break;
      }
    }

    if (!sourceLesson) {
      setDraggedLessonId(null);
      return;
    }

    // Insert into target module
    const targetMod = allModules.find((m) => m.id === targetModuleId);
    if (targetMod) {
      if (!targetMod.lessons) targetMod.lessons = [];
      const targetIdx = targetLessonId > 0
        ? targetMod.lessons.findIndex((l) => l.id === targetLessonId)
        : targetMod.lessons.length;

      if (targetIdx !== -1) {
        targetMod.lessons.splice(targetIdx, 0, sourceLesson);
      } else {
        targetMod.lessons.push(sourceLesson);
      }
    }

    // Optimistic UI
    setModules(allModules);
    setDraggedLessonId(null);

    // Build payload of all lessons across all modules
    const reorderPayload: ReorderItemPayload[] = [];
    let globalIndex = 1;

    for (const mod of allModules) {
      if (mod.lessons) {
        for (const les of mod.lessons) {
          reorderPayload.push({
            id: les.id,
            moduleId: mod.id,
            sortOrder: globalIndex++,
          });
        }
      }
    }

    try {
      setIsSavingReorder(true);
      await adminApi.reorderLessons(course.id, reorderPayload);
      fetchModules();
      setSuccessMessage('Уроки переупорядочены и расписание капельницы пересчитано');
      setTimeout(() => setSuccessMessage(null), 3000);
      onCourseUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось сохранить порядок уроков');
      fetchModules();
    } finally {
      setIsSavingReorder(false);
    }
  };

  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg bg-[#141418] border border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">
              Структура курса: {course.title}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              /{course.slug}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Всего {modules.length} {modules.length === 1 ? 'модуль' : 'модулей'}, {totalLessons} {totalLessons === 1 ? 'урок' : 'уроков'}. Поддерживается перетаскивание (Drag-and-Drop) с автопересчетом капельницы.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchModules}
            disabled={isLoading || isSavingReorder}
            className="p-2 rounded-md bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Обновить структуру"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isSavingReorder ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsAddModuleOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить модуль</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Modules List (Tree) */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-lg bg-[#141418]/50">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-xs font-medium text-zinc-300">В этом курсе пока нет модулей</p>
            <p className="text-[10px] text-zinc-500 mt-1">
              Нажмите «Добавить модуль», чтобы создать структуру программы обучения.
            </p>
          </div>
        ) : (
          modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              courseId={course.id}
              onUpdated={() => {
                fetchModules();
                onCourseUpdated();
              }}
              onDeleteModule={handleDeleteModule}
              onDragStartModule={handleDragStartModule}
              onDragOverModule={(e) => e.preventDefault()}
              onDropModule={handleDropModule}
              onDragStartLesson={handleDragStartLesson}
              onDragOverLesson={(e) => e.preventDefault()}
              onDropLesson={handleDropLesson}
            />
          ))
        )}
      </div>

      {/* Add Module Modal */}
      {isAddModuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-white/10 rounded-lg w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#16161c]">
              <h2 className="text-sm font-semibold text-white">Добавление нового модуля</h2>
              <button
                type="button"
                onClick={() => setIsAddModuleOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Название модуля</label>
                <input
                  type="text"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="Модуль 1: Архитектурный фундамент"
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Описание (опционально)</label>
                <textarea
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                  placeholder="О чем этот модуль, какие ключевые компетенции освоит студент..."
                  rows={3}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newModulePreview}
                  onChange={(e) => setNewModulePreview(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-white"
                />
                <span>Бесплатный предпросмотр модуля для всех гостей</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModuleOpen(false)}
                  className="px-4 py-2 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
                >
                  {isLoading ? 'Создание...' : 'Создать модуль'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
