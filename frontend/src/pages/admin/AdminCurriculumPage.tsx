import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Course } from '@/shared/types';
import { adminApi, CreateCoursePayload, UpdateCoursePayload } from '@/entities/adminApi';
import { CurriculumTree } from '@/widgets/admin-curriculum';

export const AdminCurriculumPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSlug, setCourseSlug] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseActive, setCourseActive] = useState(true);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getCourses();
      setCourses(data);
      if (data.length > 0 && (!selectedCourseId || !data.some((c) => c.id === selectedCourseId))) {
        setSelectedCourseId(data[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'Ошибка загрузки курсов');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || null;

  const handleOpenCreateCourse = () => {
    setIsEditingCourse(false);
    setCourseTitle('');
    setCourseSlug('');
    setCourseDescription('');
    setCourseActive(true);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setIsEditingCourse(true);
    setCourseTitle(course.title);
    setCourseSlug(course.slug);
    setCourseDescription(course.description || '');
    setCourseActive(course.active);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      if (isEditingCourse && selectedCourseId) {
        const payload: UpdateCoursePayload = {
          title: courseTitle.trim(),
          slug: courseSlug.trim().toLowerCase(),
          description: courseDescription.trim() || undefined,
          active: courseActive,
        };
        await adminApi.updateCourse(selectedCourseId, payload);
      } else {
        const payload: CreateCoursePayload = {
          title: courseTitle.trim(),
          slug: courseSlug.trim().toLowerCase(),
          description: courseDescription.trim() || undefined,
          active: courseActive,
        };
        const created = await adminApi.createCourse(payload);
        setSelectedCourseId(created.id);
      }
      setIsCourseModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось сохранить курс');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm('Вы уверены, что хотите полностью удалить этот курс со всей структурой уроков?')) return;
    try {
      setIsLoading(true);
      await adminApi.deleteCourse(courseId);
      setSelectedCourseId(null);
      fetchCourses();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось удалить курс');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Конструктор учебного плана
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Визуальный редактор курсов, модулей, уроков, шпаргалок и тестов с DnD
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateCourse}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Создать курс</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Courses Selector Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
            Доступные программы обучения
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {courses.length} {courses.length === 1 ? 'курс' : 'курсов'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((c) => {
            const isSelected = c.id === selectedCourseId;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCourseId(c.id)}
                className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#18181f] border-white/20 shadow-md ring-1 ring-white/10'
                    : 'bg-[#121216] border-white/5 hover:border-white/10 hover:bg-[#15151a]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-white truncate">
                        {c.title}
                      </h3>
                      {c.active ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/30">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                          DRAFT
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono mt-1">/{c.slug}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditCourse(c)}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Параметры курса"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {courses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(c.id)}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                        title="Удалить курс"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {c.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                    {c.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Course Curriculum Visual Tree */}
      {selectedCourse ? (
        <CurriculumTree
          key={selectedCourse.id}
          course={selectedCourse}
          onCourseUpdated={fetchCourses}
        />
      ) : (
        <div className="text-center py-16 border border-dashed border-white/5 rounded-lg text-zinc-500 text-xs">
          Выберите курс выше или создайте новый, чтобы приступить к редактированию учебного плана.
        </div>
      )}

      {/* Create / Edit Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-white/10 rounded-lg w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#16161c]">
              <h2 className="text-sm font-semibold text-white">
                {isEditingCourse ? 'Редактирование курса' : 'Новый курс'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Название курса</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => {
                    setCourseTitle(e.target.value);
                    if (!isEditingCourse && !courseSlug) {
                      setCourseSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '')
                      );
                    }
                  }}
                  placeholder="Java Fullstack Архитектор"
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={courseSlug}
                  onChange={(e) => setCourseSlug(e.target.value)}
                  placeholder="java-fullstack-architect"
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Описание курса</label>
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Полная программа подготовки от middle до lead..."
                  rows={3}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={courseActive}
                  onChange={(e) => setCourseActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-white"
                />
                <span>Курс активен и доступен студентам на платформе</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
                >
                  {isLoading ? 'Сохранение...' : isEditingCourse ? 'Сохранить изменения' : 'Создать курс'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
