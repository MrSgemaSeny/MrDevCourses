import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helpApi } from '@/entities/help/api/helpApi';
import {
  X,
  Send,
  CheckCircle2,
  Clock,
  Terminal,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface StudentHelpModalProps {
  courseId: number;
  lessonId: number;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_STEPS = [
  { id: 'STEP_1_INSTALL', title: '1. Установка редактора (VS Code / Cursor / расширения)' },
  { id: 'STEP_2_GIT_SSH', title: '2. Настройка Git, генерация SSH-ключа и связь с GitHub' },
  { id: 'STEP_3_PROJECT_INIT', title: '3. Создание проекта, npm install и запуск dev-сервера' },
  { id: 'STEP_4_CODE_BUG', title: '4. Ошибка в коде (синтаксис, логика, баг в браузере)' },
  { id: 'STEP_5_DEPLOY', title: '5. Деплой на бесплатный хостинг (GitHub Pages / Vercel)' },
  { id: 'STEP_OTHER', title: 'Другой этап урока' },
];

export const StudentHelpModal: React.FC<StudentHelpModalProps> = ({
  courseId,
  lessonId,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [selectedStep, setSelectedStep] = useState(PRESET_STEPS[0].id);
  const [problemText, setProblemText] = useState('');
  const [errorLogs, setErrorLogs] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: existingRequests = [], isLoading } = useQuery({
    queryKey: ['help-requests', courseId, lessonId],
    queryFn: () => helpApi.getLessonHelpRequests(courseId, lessonId),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (payload: { stepIdentifier: string; stepTitle: string; problemText: string; errorLogs?: string }) =>
      helpApi.createHelpRequest(courseId, lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-requests', courseId, lessonId] });
      setIsSuccess(true);
      setProblemText('');
      setErrorLogs('');
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    },
  });

  if (!isOpen) return null;

  const currentStepObj = PRESET_STEPS.find((s) => s.id === selectedStep) || PRESET_STEPS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim()) return;

    mutation.mutate({
      stepIdentifier: currentStepObj.id,
      stepTitle: currentStepObj.title,
      problemText: problemText.trim(),
      errorLogs: errorLogs.trim() ? errorLogs.trim() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-white/10 rounded-sm shadow-2xl p-6 space-y-5 text-white">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              прямая связь с ментором
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>Не получается? Нужна помощь</span>
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Опиши затык. Ментор (Mr Developer) мгновенно получит уведомление в Telegram и поможет решить проблему.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800/60 rounded-sm flex items-center gap-3 text-emerald-300 animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <h4 className="text-xs font-bold text-white">Сигнал отправлен!</h4>
              <p className="text-[11px] text-emerald-400/90 mt-0.5">
                Ментор уже видит твой вопрос в Telegram и скоро ответит.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step Selection */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>На каком шаге возникла сложность?</span>
              </label>
              <select
                value={selectedStep}
                onChange={(e) => setSelectedStep(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors"
              >
                {PRESET_STEPS.map((step) => (
                  <option key={step.id} value={step.id} className="bg-[#0e0e11] text-white">
                    {step.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Problem Textarea */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Что пошло не так? <span className="text-amber-400">*</span>
              </label>
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                required
                rows={3}
                placeholder="Например: ввел команду ssh-keygen, но в терминале пишет command not found..."
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-sm p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-y"
              />
            </div>

            {/* Terminal logs Textarea */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span>Текст ошибки из терминала или консоли (опционально):</span>
              </label>
              <textarea
                value={errorLogs}
                onChange={(e) => setErrorLogs(e.target.value)}
                rows={2}
                placeholder="Вставьте лог ошибки (Ctrl+V)..."
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-sm p-2.5 text-xs font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors resize-y"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                Отправка push-уведомления ментору в Telegram
              </span>
              <button
                type="submit"
                disabled={mutation.isPending || !problemText.trim()}
                className="py-2 px-4 rounded-sm bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-950/40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{mutation.isPending ? 'Отправка...' : 'Отправить сигнал'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Existing Requests History */}
        {!isLoading && existingRequests.length > 0 && (
          <div className="pt-3 border-t border-white/5 space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Твои недавние запросы по этому уроку ({existingRequests.length})
            </h4>
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {existingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-2.5 rounded-sm bg-[#0a0a0c] border border-white/5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400 font-mono truncate max-w-[240px]">
                      {req.stepTitle || req.stepIdentifier}
                    </span>
                    {req.status === 'RESOLVED' || req.status === 'RESOLVED_WITH_FAQ' ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Решено
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> У ментора
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-300 text-[11px] line-clamp-2">{req.problemText}</p>
                  {req.mentorSolution && (
                    <div className="mt-1.5 p-2 bg-[#121217] border border-emerald-900/50 rounded-sm text-[11px] text-emerald-300">
                      <span className="font-semibold text-emerald-400">Ответ ментора: </span>
                      {req.mentorSolution}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
