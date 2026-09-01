import React, { useState } from 'react';
import {
  GripVertical,
  Video,
  FileText,
  Code,
  HelpCircle,
  Clock,
  Edit2,
  Trash2,
  Paperclip,
  BookOpen,
} from 'lucide-react';
import { LessonDetail, LessonSummary, LessonType } from '@/shared/types';
import { adminApi, UpdateLessonPayload } from '@/entities/adminApi';
import { LiveMarkdownPreviewModal } from './LiveMarkdownPreviewModal';
import { MaterialManagerModal } from './MaterialManagerModal';
import { QuizEditorModal } from './QuizEditorModal';
import { YouTubeValidator } from './YouTubeValidator';

interface LessonRowProps {
  lesson: LessonSummary | LessonDetail;
  courseId?: number;
  onUpdated: () => void;
  onDelete: (id: number) => void;
  onDragStart?: (e: React.DragEvent, id: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: number) => void;
}

export const LessonRow: React.FC<LessonRowProps> = ({
  lesson,
  courseId: _courseId,
  onUpdated,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Edit form state
  const [title, setTitle] = useState(lesson.title);
  const [dayNumber, setDayNumber] = useState(lesson.dayNumber);
  const [sortOrder] = useState(lesson.sortOrder);
  const [lessonType, setLessonType] = useState<LessonType>(lesson.lessonType || 'VIDEO');
  const [durationMinutes, setDurationMinutes] = useState(lesson.durationMinutes || 0);
  const [isPublished, setIsPublished] = useState(lesson.isPublished !== false);
  const [youtubeUrl, setYoutubeUrl] = useState((lesson as LessonDetail).youtubeUrl || '');
  const [content, setContent] = useState((lesson as LessonDetail).content || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTogglePublish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const nextPublished = !isPublished;
      setIsPublished(nextPublished);
      await adminApi.updateLesson(lesson.id, {
        title: lesson.title,
        dayNumber: lesson.dayNumber,
        sortOrder: lesson.sortOrder,
        isPublished: nextPublished,
      });
      onUpdated();
    } catch {
      setIsPublished(isPublished);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const payload: UpdateLessonPayload = {
        title: title.trim(),
        dayNumber,
        sortOrder,
        lessonType,
        durationMinutes,
        isPublished,
        youtubeUrl: youtubeUrl.trim() || undefined,
        content,
      };

      await adminApi.updateLesson(lesson.id, payload);
      setIsEditModalOpen(false);
      onUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось обновить урок');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMarkdown = async (newContent: string) => {
    setContent(newContent);
    try {
      await adminApi.updateLesson(lesson.id, {
        title: lesson.title,
        dayNumber: lesson.dayNumber,
        sortOrder: lesson.sortOrder,
        content: newContent,
      });
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type?: LessonType) => {
    switch (type) {
      case 'ARTICLE':
        return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
      case 'PRACTICE':
        return <Code className="w-3.5 h-3.5 text-zinc-400" />;
      case 'QUIZ':
        return <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />;
      default:
        return <Video className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <>
      <div
        draggable
        onDragStart={(e) => onDragStart && onDragStart(e, lesson.id)}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver && onDragOver(e);
        }}
        onDrop={(e) => onDrop && onDrop(e, lesson.id)}
        className="group flex items-center justify-between p-3 rounded-md bg-zinc-950/70 border border-white/5 hover:border-white/10 hover:bg-zinc-900/60 transition-all cursor-move select-none"
      >
        {/* Left Side: Drag Handle + Day Badge + Title + Meta */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            className="text-zinc-600 group-hover:text-zinc-400 cursor-grab active:cursor-grabbing p-0.5"
            title="Перетащите для изменения порядка"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
            День {lesson.dayNumber}
          </span>

          <div className="p-1.5 rounded bg-zinc-900 border border-white/5 shrink-0">
            {getTypeIcon(lesson.lessonType)}
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-white block truncate">
              {lesson.title}
            </span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-zinc-500" />
              {lesson.durationMinutes && lesson.durationMinutes > 0 ? `${lesson.durationMinutes}м` : '--:--'}
            </span>

            {/* Publish / Draft status toggle badge */}
            <button
              type="button"
              onClick={handleTogglePublish}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                isPublished
                  ? 'bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700'
                  : 'bg-zinc-900 text-zinc-500 border border-white/5 hover:text-zinc-400'
              }`}
              title="Переключить статус публикации"
            >
              {isPublished ? 'PUBLISHED' : 'DRAFT'}
            </button>
          </div>
        </div>

        {/* Right Side: Quick Action Modals Toolbar */}
        <div className="flex items-center gap-1 pl-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsMarkdownModalOpen(true)}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Редактор Markdown конспекта"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsMaterialModalOpen(true)}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Материалы и шпаргалки"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsQuizModalOpen(true)}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Конструктор тестов"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Настройки урока"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(lesson.id)}
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Удалить урок"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Markdown Preview Modal */}
      {isMarkdownModalOpen && (
        <LiveMarkdownPreviewModal
          isOpen={isMarkdownModalOpen}
          initialContent={(lesson as LessonDetail).content || content || ''}
          lessonTitle={lesson.title}
          onSave={handleSaveMarkdown}
          onClose={() => setIsMarkdownModalOpen(false)}
        />
      )}

      {/* Materials Modal */}
      {isMaterialModalOpen && (
        <MaterialManagerModal
          isOpen={isMaterialModalOpen}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          materials={(lesson as LessonDetail).materials || []}
          onMaterialsUpdated={onUpdated}
          onClose={() => setIsMaterialModalOpen(false)}
        />
      )}

      {/* Quiz Modal */}
      {isQuizModalOpen && (
        <QuizEditorModal
          isOpen={isQuizModalOpen}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          onQuizSaved={onUpdated}
          onClose={() => setIsQuizModalOpen(false)}
        />
      )}

      {/* Edit Lesson Metadata Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-white/10 rounded-lg w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#16161c]">
              <h2 className="text-sm font-semibold text-white">Редактирование урока</h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="p-5 overflow-y-auto space-y-4">
              {error && (
                <div className="p-3 rounded bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Название урока</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Номер дня (длительность капельницы)</label>
                  <input
                    type="number"
                    min="1"
                    value={dayNumber}
                    onChange={(e) => setDayNumber(parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Тип урока</label>
                  <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value as LessonType)}
                    className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  >
                    <option value="VIDEO">VIDEO (Видеоурок)</option>
                    <option value="ARTICLE">ARTICLE (Статья/теория)</option>
                    <option value="PRACTICE">PRACTICE (Практика/код)</option>
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
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 font-mono"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-white"
                    />
                    <span>Опубликован</span>
                  </label>
                </div>
              </div>

              <YouTubeValidator url={youtubeUrl} onChange={setYoutubeUrl} />

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
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
                  {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
