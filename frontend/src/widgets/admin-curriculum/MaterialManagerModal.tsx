import React, { useState } from 'react';
import { X, Plus, Trash2, FileText, Code, GitBranch, ExternalLink, Paperclip } from 'lucide-react';
import { LessonMaterial, MaterialType } from '@/shared/types';
import { adminApi, CreateMaterialPayload } from '@/entities/adminApi';

interface MaterialManagerModalProps {
  isOpen: boolean;
  lessonId: number;
  lessonTitle: string;
  materials: LessonMaterial[];
  onMaterialsUpdated: () => void;
  onClose: () => void;
}

export const MaterialManagerModal: React.FC<MaterialManagerModalProps> = ({
  isOpen,
  lessonId,
  lessonTitle,
  materials,
  onMaterialsUpdated,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState<MaterialType>('CHEAT_SHEET');
  const [url, setUrl] = useState('');
  const [fileSizeBytes, setFileSizeBytes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setError('Заполните название и URL материала');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const payload: CreateMaterialPayload = {
        title: title.trim(),
        materialType,
        url: url.trim(),
        fileSizeBytes: fileSizeBytes ? parseInt(fileSizeBytes, 10) : undefined,
        sortOrder: materials.length + 1,
      };

      await adminApi.addMaterial(lessonId, payload);
      setTitle('');
      setUrl('');
      setFileSizeBytes('');
      setIsAdding(false);
      onMaterialsUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось добавить материал');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    try {
      setIsLoading(true);
      await adminApi.deleteMaterial(materialId);
      onMaterialsUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось удалить материал');
    } finally {
      setIsLoading(false);
    }
  };

  const getMaterialIcon = (type: MaterialType) => {
    switch (type) {
      case 'CHEAT_SHEET':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'SOURCE_CODE':
        return <Code className="w-4 h-4 text-cyan-400" />;
      case 'REPO_LINK':
        return <GitBranch className="w-4 h-4 text-purple-400" />;
      default:
        return <Paperclip className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#121216] border border-white/10 rounded-lg w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#16161c]">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Материалы урока: {lessonTitle}
            </h2>
            <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
              Прикрепленные шпаргалки, исходный код и ссылки
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* List of materials */}
          <div className="space-y-2">
            {materials.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-white/5 rounded-lg">
                К этому уроку еще не прикреплено никаких дополнительных материалов
              </div>
            ) : (
              materials.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-md bg-zinc-900/80 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded bg-zinc-800 border border-white/5">
                      {getMaterialIcon(m.materialType)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{m.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400 font-mono">
                        <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">{m.materialType}</span>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white flex items-center gap-1 truncate max-w-xs"
                        >
                          <span className="truncate">{m.url}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteMaterial(m.id)}
                    disabled={isLoading}
                    className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    title="Удалить материал"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add material form toggle */}
          {!isAdding ? (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-white/10 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:border-white/20 hover:bg-zinc-900/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить материал</span>
            </button>
          ) : (
            <form onSubmit={handleAddMaterial} className="p-4 rounded-lg bg-zinc-900 border border-white/10 space-y-3">
              <h3 className="text-xs font-semibold text-white">Новый материал</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">Название</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Шпаргалка по Spring Security"
                    className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">Тип материала</label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                    className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  >
                    <option value="CHEAT_SHEET">CHEAT_SHEET (Шпаргалка)</option>
                    <option value="SOURCE_CODE">SOURCE_CODE (Исходный код)</option>
                    <option value="REPO_LINK">REPO_LINK (GitHub Репозиторий)</option>
                    <option value="DOCUMENTATION">DOCUMENTATION (Документация)</option>
                    <option value="PDF">PDF (Файл PDF)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-zinc-400 mb-1">Ссылка (URL)</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-zinc-400 mb-1">Размер файла в байтах (опционально)</label>
                <input
                  type="number"
                  value={fileSizeBytes}
                  onChange={(e) => setFileSizeBytes(e.target.value)}
                  placeholder="1048576"
                  className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
                >
                  {isLoading ? 'Сохранение...' : 'Добавить'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
