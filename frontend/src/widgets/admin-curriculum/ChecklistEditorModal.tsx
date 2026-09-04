import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, ArrowUp, ArrowDown, RotateCcw, CheckSquare } from 'lucide-react';

export interface ChecklistStepItem {
  id: string;
  title: string;
}

interface ChecklistEditorModalProps {
  isOpen: boolean;
  initialChecklist?: string;
  lessonTitle: string;
  onSave: (newChecklistJson: string) => void;
  onClose: () => void;
}

const DEFAULT_STEPS: ChecklistStepItem[] = [
  { id: 'step_1', title: 'Шаг 1: Скачать и открыть стартовый шаблон' },
  { id: 'step_2', title: 'Шаг 2: Выполнить установку зависимостей (npm install)' },
  { id: 'step_3', title: 'Шаг 3: Написать код по видео-разбору' },
  { id: 'step_4', title: 'Шаг 4: Задеплоить на Vercel / GitHub Pages' },
];

export const ChecklistEditorModal: React.FC<ChecklistEditorModalProps> = ({
  isOpen,
  initialChecklist,
  lessonTitle,
  onSave,
  onClose,
}) => {
  const [steps, setSteps] = useState<ChecklistStepItem[]>([]);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialChecklist && initialChecklist.trim().length > 0) {
        try {
          const parsed = JSON.parse(initialChecklist);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const formatted = parsed.map((item: any, idx: number) => ({
              id: item.id || `step_${idx + 1}`,
              title: typeof item === 'string' ? item : item.title || `Шаг ${idx + 1}`,
            }));
            setSteps(formatted);
            setRawText(JSON.stringify(formatted, null, 2));
            return;
          }
        } catch {
          // If not JSON, split by lines
          const lines = initialChecklist
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
          if (lines.length > 0) {
            const formatted = lines.map((line, idx) => ({
              id: `step_${idx + 1}`,
              title: line.replace(/^-\s*\[\s*\]\s*/, ''),
            }));
            setSteps(formatted);
            setRawText(JSON.stringify(formatted, null, 2));
            return;
          }
        }
      }
      setSteps(DEFAULT_STEPS);
      setRawText(JSON.stringify(DEFAULT_STEPS, null, 2));
    }
  }, [isOpen, initialChecklist]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    const newStep: ChecklistStepItem = {
      id: `step_${Date.now()}`,
      title: newStepTitle.trim(),
    };
    const updated = [...steps, newStep];
    setSteps(updated);
    setRawText(JSON.stringify(updated, null, 2));
    setNewStepTitle('');
  };

  const handleRemoveStep = (id: string) => {
    const updated = steps.filter((s) => s.id !== id);
    setSteps(updated);
    setRawText(JSON.stringify(updated, null, 2));
  };

  const handleUpdateStepTitle = (id: string, newTitle: string) => {
    const updated = steps.map((s) => (s.id === id ? { ...s, title: newTitle } : s));
    setSteps(updated);
    setRawText(JSON.stringify(updated, null, 2));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSteps(updated);
    setRawText(JSON.stringify(updated, null, 2));
  };

  const handleResetToDefault = () => {
    setSteps(DEFAULT_STEPS);
    setRawText(JSON.stringify(DEFAULT_STEPS, null, 2));
  };

  const handleSave = () => {
    let outputJson = '';
    if (rawMode) {
      try {
        const parsed = JSON.parse(rawText);
        outputJson = JSON.stringify(parsed);
      } catch {
        // Fallback: parse lines
        const lines = rawText
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0);
        const mapped = lines.map((l, i) => ({ id: `step_${i + 1}`, title: l }));
        outputJson = JSON.stringify(mapped);
      }
    } else {
      outputJson = JSON.stringify(steps);
    }
    onSave(outputJson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#121216] border border-white/10 rounded-sm w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#16161c]">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-semibold text-white truncate max-w-md">
              Пошаговый чеклист урока: {lessonTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRawMode(!rawMode)}
              className="text-xs px-2 py-1 rounded bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              {rawMode ? 'Визуальный режим' : 'JSON Режим'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {rawMode ? (
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400">
                JSON-структура шагов чеклиста:
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={12}
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-sm p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-white/30 resize-none"
                placeholder='[{"id": "step_1", "title": "Шаг 1: ..."}]'
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Список операционных шагов ({steps.length}):</span>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Сбросить на 4 дефолтных шага</span>
                </button>
              </div>

              {/* Steps list */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-2 p-2 rounded-sm bg-[#0a0a0c] border border-white/5 hover:border-white/15 transition-all"
                  >
                    <span className="text-[10px] font-mono text-zinc-500 w-5 text-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleUpdateStepTitle(step.id, e.target.value)}
                      className="flex-1 bg-transparent border-0 text-xs text-white focus:outline-none focus:ring-0"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStep(idx, 'up')}
                        className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                        title="Поднять выше"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === steps.length - 1}
                        onClick={() => handleMoveStep(idx, 'down')}
                        className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                        title="Опустить ниже"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(step.id)}
                        className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        title="Удалить шаг"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add step row */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <input
                  type="text"
                  placeholder="Добавить новый шаг (например: Шаг 5: Протестировать корзину)"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStep();
                    }
                  }}
                  className="flex-1 bg-[#0a0a0c] border border-white/10 rounded-sm px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-sm bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between bg-[#16161c]">
          <div className="text-[11px] text-zinc-500">
            Шаги сохраняются для урока и отображаются у всех студентов.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-sm text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-sm bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Сохранить чеклист</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
