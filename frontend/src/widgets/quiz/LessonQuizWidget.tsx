import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '@/entities/quiz/api/quizApi';
import type { QuizResult } from '@/shared/types';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';

interface LessonQuizWidgetProps {
  lessonId: number;
  courseId: number;
  onPassed?: () => void;
}

export const LessonQuizWidget: React.FC<LessonQuizWidgetProps> = ({
  lessonId,
  courseId,
  onPassed,
}) => {
  const queryClient = useQueryClient();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ['lesson-quiz', lessonId],
    queryFn: () => quizApi.getQuiz(lessonId),
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      quizApi.submitQuiz(lessonId, {
        quizId: quiz!.id,
        selectedOptionIds: selectedAnswers,
      }),
    onSuccess: (quizResult) => {
      setResult(quizResult);
      if (quizResult.passed) {
        queryClient.invalidateQueries({ queryKey: ['lesson', courseId, lessonId] });
        queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
        queryClient.invalidateQueries({ queryKey: ['progress'] });
        if (onPassed) {
          onPassed();
        }
      }
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500 bg-[#0e0e11] border border-white/5 rounded-sm">
        Загрузка квиза...
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500 bg-[#0e0e11] border border-white/5 rounded-sm">
        Квиз для данного урока не настроен или доступ ограничен.
      </div>
    );
  }

  const handleSelectOption = (questionId: number, optionId: number, isMulti: boolean) => {
    if (result) return; // locked if result is showing

    setSelectedAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMulti) {
        return {
          ...prev,
          [questionId]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      } else {
        return {
          ...prev,
          [questionId]: [optionId],
        };
      }
    });
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setResult(null);
  };

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).filter(
    (qId) => (selectedAnswers[Number(qId)] || []).length > 0
  ).length;

  return (
    <div className="bg-[#0e0e11] border border-white/5 rounded-sm overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {/* Header */}
      <div className="px-5 py-4 bg-[#0a0a0c] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-sm bg-amber-500/10 text-amber-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{quiz.title}</h3>
            <p className="text-xs text-zinc-500">
              Проходной балл: {quiz.passingScorePercentage}% &bull; Попыток: {quiz.maxAttempts}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-zinc-500">
            Отвечено: <strong className="text-white">{answeredCount}</strong> / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Questions list */}
      <div className="p-5 space-y-6">
        {quiz.questions.map((q, idx) => {
          const isCorrect = result?.questionResults?.[q.id];
          const explanation = result?.questionExplanations?.[q.id];
          const selectedForQuestion = selectedAnswers[q.id] || [];

          return (
            <div
              key={q.id}
              className={`p-4 rounded-sm border transition-all ${
                result
                  ? isCorrect
                    ? 'bg-emerald-950/15 border-emerald-800/40'
                    : 'bg-rose-950/15 border-rose-800/40'
                  : 'bg-[#0a0a0c] border-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-[#c9d1d9]">
                    #{idx + 1}
                  </span>
                  <p className="text-xs font-medium text-white leading-relaxed">
                    {q.questionText}
                  </p>
                </div>
                {result && (
                  <span className="shrink-0">
                    {isCorrect ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Верно
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Ошибка
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2 mt-2">
                {q.options.map((opt) => {
                  const isSelected = selectedForQuestion.includes(opt.id);
                  const isMulti = q.questionType === 'MULTIPLE_CHOICE';

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!!result}
                      onClick={() => handleSelectOption(q.id, opt.id, isMulti)}
                      className={`w-full text-left p-3 rounded-sm text-xs transition-all flex items-center gap-3 border ${
                        isSelected
                          ? 'bg-[#1f242c] border-[#58a6ff] text-white shadow-sm'
                          : 'bg-[#0e0e11] border-white/5 text-[#c9d1d9] hover:border-zinc-500'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded ${
                          isMulti ? 'rounded-md' : 'rounded-full'
                        } border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#58a6ff] border-[#58a6ff] text-black font-bold'
                            : 'border-[#484f58] bg-[#0a0a0c]'
                        }`}
                      >
                        {isSelected && <span className="text-[10px]">&bull;</span>}
                      </div>
                      <span className="flex-1">{opt.optionText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation note after submission */}
              {result && explanation && (
                <div className="mt-3 p-2.5 rounded bg-[#0e0e11] border border-white/5 text-xs text-zinc-500">
                  <strong className="text-zinc-300">Пояснение:</strong> {explanation}
                </div>
              )}
            </div>
          );
        })}

        {/* Result Banner / Submit action */}
        {result ? (
          <div
            className={`p-4 rounded-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              result.passed
                ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-300'
                : 'bg-rose-950/20 border-rose-800/50 text-rose-300'
            }`}
          >
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                {result.passed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Тест успешно сдан! Результат: {result.scorePercentage}%</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>
                      Не набран проходной балл ({result.scorePercentage}% из{' '}
                      {result.passingScorePercentage}%)
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs mt-1 text-zinc-500">
                Правильных ответов: {result.correctCount} из {result.totalCount}
              </p>
            </div>

            {!result.passed && (
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-2 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white border border-white/5 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Попробовать снова</span>
              </button>
            )}
          </div>
        ) : (
          <div className="pt-2 flex items-center justify-between border-t border-white/5">
            <span className="text-xs text-zinc-500">
              Урок будет автоматически зачтен при результате &ge; {quiz.passingScorePercentage}%
            </span>

            <button
              type="button"
              disabled={submitMutation.isPending || answeredCount === 0}
              onClick={() => submitMutation.mutate()}
              className="px-5 py-2.5 rounded-sm bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              {submitMutation.isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Проверка ответов...</span>
                </>
              ) : (
                <span>Завершить квиз</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
