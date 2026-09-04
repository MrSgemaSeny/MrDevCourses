import React, { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  CheckSquare,
  Square,
  Terminal,
} from 'lucide-react';

export interface SetupTool {
  name: string;
  url: string;
  badge: string;
  description: string;
}

export interface LessonActionCardProps {
  lessonId: number;
  courseTitle?: string;
  lessonTitle: string;
  dayNumber: number;
  starterPrompt?: string;
  checklist?: string;
  onOpenHelp: (stepId: string, stepTitle: string) => void;
}

const DEFAULT_TOOLS: SetupTool[] = [
  { name: 'VS Code', url: 'https://code.visualstudio.com/Download', badge: 'IDE', description: 'Основной редактор' },
  { name: 'Git', url: 'https://git-scm.com/downloads', badge: 'SCM', description: 'Контроль версий' },
  { name: 'Antigravity', url: 'https://antigravity.google/download//', badge: 'Runtime', description: 'Среда разработки' },
  { name: 'Claude Desktop', url: 'https://claude.com/download/', badge: 'GUI', description: 'Claude прямо в ПК' },
];

const DEFAULT_STEPS = [
  { id: 'step_1', title: 'Шаг 1: Скачать и открыть стартовый шаблон', done: false },
  { id: 'step_2', title: 'Шаг 2: Выполнить установку зависимостей (npm install)', done: false },
  { id: 'step_3', title: 'Шаг 3: Написать код по видео-разбору', done: false },
  { id: 'step_4', title: 'Шаг 4: Задеплоить на Vercel / GitHub Pages', done: false },
];

export const LessonActionCard: React.FC<LessonActionCardProps> = ({
  lessonId,
  lessonTitle,
  dayNumber,
  starterPrompt = 'Напиши React-компонент карточки курса на Tailwind CSS и TypeScript...',
  checklist,
  onOpenHelp,
}) => {
  const storageKey = `mrdev_lesson_checklist_${lessonId}`;

  const parseChecklist = (raw?: string) => {
    if (!raw || raw.trim().length === 0) return DEFAULT_STEPS;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any, idx: number) => ({
          id: item.id || `step_${idx + 1}`,
          title: typeof item === 'string' ? item : item.title || `Шаг ${idx + 1}`,
          done: false,
        }));
      }
    } catch {
      const lines = raw
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length > 0) {
        return lines.map((line, idx) => ({
          id: `step_${idx + 1}`,
          title: line.replace(/^-\s*\[\s*\]\s*/, ''),
          done: false,
        }));
      }
    }
    return DEFAULT_STEPS;
  };

  const [steps, setSteps] = useState<{ id: string; title: string; done: boolean }[]>(() => {
    const baseSteps = parseChecklist(checklist);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedSteps: { id: string; done: boolean }[] = JSON.parse(saved);
        const doneMap = new Map(savedSteps.map((s) => [s.id, s.done]));
        return baseSteps.map((s) => ({ ...s, done: doneMap.get(s.id) ?? false }));
      }
      return baseSteps;
    } catch {
      return baseSteps;
    }
  });

  useEffect(() => {
    const baseSteps = parseChecklist(checklist);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedSteps: { id: string; done: boolean }[] = JSON.parse(saved);
        const doneMap = new Map(savedSteps.map((s) => [s.id, s.done]));
        setSteps(baseSteps.map((s) => ({ ...s, done: doneMap.get(s.id) ?? false })));
      } else {
        setSteps(baseSteps);
      }
    } catch {
      setSteps(baseSteps);
    }
  }, [checklist, storageKey]);

  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(steps));
    } catch {
      // Ignore localStorage errors
    }
  }, [steps, storageKey]);

  const toggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, done: !step.done } : step))
    );
  };

  const handleCopyPrompt = async () => {
    if (!starterPrompt) return;
    try {
      await navigator.clipboard.writeText(starterPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // Fallback if clipboard API is blocked
    }
  };

  const completedStepsCount = steps.filter((s) => s.done).length;

  return (
    <div className="p-5 rounded-sm bg-[#0e0e11] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] space-y-5 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
            Операционная карточка дня {dayNumber} ({lessonTitle})
          </h3>
        </div>
        <div className="text-[11px] font-mono text-zinc-400">
          Выполнено шагов: <span className="text-white font-bold">{completedStepsCount}</span> из {steps.length}
        </div>
      </div>

      {/* 1. Quick Tools Setup */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Download className="w-3.5 h-3.5 text-zinc-500" />
          <span>Быстрый сетап софта (Zero-Friction)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEFAULT_TOOLS.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-sm bg-[#0a0a0c] border border-white/5 hover:border-white/20 transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-zinc-200 transition-colors">
                  {tool.name}
                </span>
                <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-[10px] text-zinc-500 mt-1 font-mono">{tool.description}</div>
            </a>
          ))}
        </div>
      </div>

      {/* 2. Interactive Steps Checklist with SOS Trigger */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <CheckSquare className="w-3.5 h-3.5 text-zinc-500" />
          <span>Пошаговый чеклист урока</span>
        </div>
        <div className="space-y-1.5">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-2.5 rounded-sm border transition-colors flex items-center justify-between gap-3 ${
                step.done
                  ? 'bg-[#141418] border-white/10 text-zinc-300'
                  : 'bg-[#0a0a0c] border-white/5 hover:border-white/10 text-white'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                className="flex items-center gap-2.5 flex-1 text-left cursor-pointer"
              >
                {step.done ? (
                  <CheckSquare className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                )}
                <span className={`text-xs ${step.done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                  {step.title}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpenHelp(step.id, step.title)}
                className="w-6 h-6 rounded-sm bg-[#141418] hover:bg-[#1f1f26] border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white flex items-center justify-center text-xs font-mono shrink-0 cursor-pointer transition-colors"
                title="Помощь по этому шагу"
                aria-label="Помощь по шагу"
              >
                ?
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Starter Prompt / Command Snippet */}
      {starterPrompt && (
        <div className="p-3 rounded-sm bg-[#0a0a0c] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Стартовый системный промпт для AI</span>
            </div>
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="px-2 py-1 text-[10px] font-mono rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-3 h-3 text-white" />
                  <span className="text-white font-medium">Скопировано</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-zinc-400" />
                  <span>Скопировать</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] font-mono text-zinc-400 bg-zinc-950/80 p-2 rounded border border-white/5 select-all">
            {starterPrompt}
          </p>
        </div>
      )}
    </div>
  );
};
