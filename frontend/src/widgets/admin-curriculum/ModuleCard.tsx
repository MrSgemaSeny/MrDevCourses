import React, { useState } from 'react';
import {
  GripVertical,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { CourseModule } from '@/shared/types';
import { adminApi, CreateLessonPayload, UpdateModulePayload } from '@/entities/adminApi';
import { LessonRow } from './LessonRow';
import { YouTubeValidator } from './YouTubeValidator';

interface ModuleCardProps {
  module: CourseModule;
  courseId: number;
  onUpdated: () => void;
  onDeleteModule: (moduleId: number) => void;
  onDragStartModule?: (e: React.DragEvent, id: number) => void;
  onDragOverModule?: (e: React.DragEvent) => void;
  onDropModule?: (e: React.DragEvent, targetId: number) => void;
  onDragStartLesson?: (e: React.DragEvent, id: number) => void;
  onDragOverLesson?: (e: React.DragEvent) => void;
  onDropLesson?: (e: React.DragEvent, targetId: number, targetModuleId: number) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  courseId,
  onUpdated,
  onDeleteModule,
  onDragStartModule,
  onDragOverModule,
  onDropModule,
  onDragStartLesson,
  onDragOverLesson,
  onDropLesson,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);

  // Edit module state
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description || '');

  // Add lesson state
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDayNumber, setNewLessonDayNumber] = useState(
    module.lessons && module.lessons.length > 0
      ? Math.max(...module.lessons.map((l) => l.dayNumber)) + 1
      : 1
  );
  const [newLessonType, setNewLessonType] = useState<'VIDEO' | 'ARTICLE' | 'PRACTICE' | 'QUIZ'>('VIDEO');
  const [newLessonDuration, setNewLessonDuration] = useState(15);
  const [newLessonYoutubeUrl, setNewLessonYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const payload: UpdateModulePayload = {
        title: title.trim(),
        description: description.trim() || undefined,
      };
      await adminApi.updateModule(module.id, payload);
      setIsEditModalOpen(false);
      onUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось обновить модуль');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const payload: CreateLessonPayload = {
        title: newLessonTitle.trim(),
        dayNumber: newLessonDayNumber,
        moduleId: module.id,
        lessonType: newLessonType,
        durationMinutes: newLessonDuration,
        youtubeUrl: newLessonYoutubeUrl.trim() || undefined,
      };

      await adminApi.createLesson(courseId, payload);
      setNewLessonTitle('');
      setNewLessonYoutubeUrl('');
      setIsAddLessonModalOpen(false);
      onUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось создать урок');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот урок?')) return;
    try {
      await adminApi.deleteLesson(lessonId);
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const lessons = module.lessons || [];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStartModule && onDragStartModule(e, module.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOverModule && onDragOverModule(e);
      }}
      onDrop={(e) => onDropModule && onDropModule(e, module.id)}
      className="bg-[#141418] border border-white/5 rounded-lg overflow-hidden transition-all shadow-sm"
    >
      {/* Module Header */}
      <div className="p-4 bg-[#18181f] border-b border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            className="text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing p-0.5"
            title="Перетащите для изменения порядка модулей"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="p-1.5 rounded bg-zinc-800 text-zinc-300">
            <Layers className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white truncate">
                {module.title}
              </span>
              {module.isFreePreview && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/30">
                  FREE PREVIEW
                </span>
              )}
            </div>
            {module.description && (
              <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-mono">
                {module.description}
              </p>
            )}
          </div>
        </div>

        {/* Module Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono text-zinc-500 px-2">
            {lessons.length} {lessons.length === 1 ? 'урок' : 'уроков'}
          </span>

          <button
            type="button"
            onClick={() => setIsAddLessonModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 text-white text-xs font-medium hover:bg-zinc-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Урок</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Редактировать модуль"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteModule(module.id)}
            className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
            title="Удалить модуль"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Module Lessons Container */}
      {isExpanded && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            onDragOverLesson && onDragOverLesson(e);
          }}
          onDrop={(e) => onDropLesson && onDropLesson(e, 0, module.id)}
          className="p-3 space-y-2 bg-[#0e0e11]/60"
        >
          {lessons.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-white/5 rounded-md text-zinc-500 text-xs">
              В этом модуле пока нет уроков. Нажмите «+ Урок», чтобы добавить первый урок.
            </div>
          ) : (
            lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                courseId={courseId}
                onUpdated={onUpdated}
                onDelete={handleDeleteLesson}
                onDragStart={onDragStartLesson}
                onDragOver={onDragOverLesson}
                onDrop={(e, targetId) => onDropLesson && onDropLesson(e, targetId, module.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Edit Module Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-white/10 rounded-lg w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#16161c]">
              <h2 className="text-sm font-semibold text-white">Редактирование модуля</h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateModule} className="p-5 space-y-4">
              {error && (
                <div className="p-3 rounded bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Название модуля</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {isAddLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-white/10 rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#16161c]">
              <h2 className="text-sm font-semibold text-white">Добавление урока в {module.title}</h2>
              <button
                type="button"
                onClick={() => setIsAddLessonModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="p-5 overflow-y-auto space-y-4">
              {error && (
                <div className="p-3 rounded bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Название урока</label>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="День 1: Введение и архитектура"
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Номер дня (капельница)</label>
                  <input
                    type="number"
                    min="1"
                    value={newLessonDayNumber}
                    onChange={(e) => setNewLessonDayNumber(parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Тип урока</label>
                  <select
                    value={newLessonType}
                    onChange={(e) => setNewLessonType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  >
                    <option value="VIDEO">VIDEO (Видеоурок)</option>
                    <option value="ARTICLE">ARTICLE (Статья)</option>
                    <option value="PRACTICE">PRACTICE (Практика)</option>
                    <option value="QUIZ">QUIZ (Тестирование)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Длительность (минут)</label>
                  <input
                    type="number"
                    min="0"
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 font-mono"
                  />
                </div>
              </div>

              <YouTubeValidator url={newLessonYoutubeUrl} onChange={setNewLessonYoutubeUrl} />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddLessonModalOpen(false)}
                  className="px-4 py-2 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
                >
                  {isLoading ? 'Создание...' : 'Создать урок'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
