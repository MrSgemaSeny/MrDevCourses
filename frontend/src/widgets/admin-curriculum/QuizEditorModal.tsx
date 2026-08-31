import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminApi, CreateQuizPayload, CreateQuizQuestionPayload, CreateQuizOptionPayload } from '@/entities/adminApi';

interface QuizEditorModalProps {
  isOpen: boolean;
  lessonId: number;
  lessonTitle: string;
  onQuizSaved: () => void;
  onClose: () => void;
}

export const QuizEditorModal: React.FC<QuizEditorModalProps> = ({
  isOpen,
  lessonId,
  lessonTitle,
  onQuizSaved,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScorePercentage, setPassingScorePercentage] = useState(80);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(600);
  const [questions, setQuestions] = useState<CreateQuizQuestionPayload[]>([]);
  const [existingQuizId, setExistingQuizId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadQuiz = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const quiz = await adminApi.getQuiz(lessonId);
        if (quiz) {
          setExistingQuizId(quiz.id);
          setTitle(quiz.title);
          setDescription(quiz.description || '');
          setPassingScorePercentage(quiz.passingScorePercentage);
          setMaxAttempts(quiz.maxAttempts);
          setTimeLimitSeconds(quiz.timeLimitSeconds);
          setQuestions(
            quiz.questions.map((q) => ({
              id: q.id,
              questionText: q.questionText,
              questionType: q.questionType,
              points: q.points,
              sortOrder: q.sortOrder,
              options: q.options.map((o) => ({
                id: o.id,
                optionText: o.optionText,
                isCorrect: (o as any).isCorrect ?? false,
                sortOrder: o.sortOrder,
              })),
            }))
          );
        } else {
          setExistingQuizId(null);
          setTitle(`Тест к уроку: ${lessonTitle}`);
          setDescription('');
          setPassingScorePercentage(80);
          setMaxAttempts(3);
          setTimeLimitSeconds(600);
          setQuestions([
            {
              questionText: '',
              questionType: 'SINGLE_CHOICE',
              points: 1,
              sortOrder: 1,
              options: [
                { optionText: '', isCorrect: true, sortOrder: 1 },
                { optionText: '', isCorrect: false, sortOrder: 2 },
              ],
            },
          ]);
        }
      } catch (err: any) {
        setError(err?.message || 'Ошибка загрузки теста');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [isOpen, lessonId, lessonTitle]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        questionType: 'SINGLE_CHOICE',
        points: 1,
        sortOrder: questions.length + 1,
        options: [
          { optionText: '', isCorrect: true, sortOrder: 1 },
          { optionText: '', isCorrect: false, sortOrder: 2 },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (qIdx: number) => {
    setQuestions(questions.filter((_, idx) => idx !== qIdx));
  };

  const handleQuestionChange = (qIdx: number, field: keyof CreateQuizQuestionPayload, val: any) => {
    const updated = [...questions];
    updated[qIdx] = { ...updated[qIdx], [field]: val };
    setQuestions(updated);
  };

  const handleAddOption = (qIdx: number) => {
    const updated = [...questions];
    const currentOptions = updated[qIdx].options || [];
    updated[qIdx].options = [
      ...currentOptions,
      { optionText: '', isCorrect: false, sortOrder: currentOptions.length + 1 },
    ];
    setQuestions(updated);
  };

  const handleRemoveOption = (qIdx: number, oIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options = (updated[qIdx].options || []).filter((_, idx) => idx !== oIdx);
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, oIdx: number, field: keyof CreateQuizOptionPayload, val: any) => {
    const updated = [...questions];
    const opts = [...(updated[qIdx].options || [])];
    opts[oIdx] = { ...opts[oIdx], [field]: val };
    updated[qIdx].options = opts;
    setQuestions(updated);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Укажите название теста');
      return;
    }
    if (questions.length === 0) {
      setError('Добавьте хотя бы один вопрос');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        setError(`Заполните текст вопроса #${i + 1}`);
        return;
      }
      const opts = questions[i].options || [];
      if (opts.length < 2) {
        setError(`Вопрос #${i + 1} должен содержать минимум 2 варианта ответа`);
        return;
      }
      const hasCorrect = opts.some((o) => Boolean(o.isCorrect));
      if (!hasCorrect) {
        setError(`В вопросе #${i + 1} укажите хотя бы один правильный вариант ответа`);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      const payload: CreateQuizPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        passingScorePercentage,
        maxAttempts,
        timeLimitSeconds,
        questions,
      };

      await adminApi.saveQuiz(lessonId, payload);
      onQuizSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось сохранить тест');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!existingQuizId) return;
    if (!window.confirm('Вы уверены, что хотите удалить весь тест к этому уроку?')) return;

    try {
      setIsLoading(true);
      await adminApi.deleteQuiz(existingQuizId);
      onQuizSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось удалить тест');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#121216] border border-white/10 rounded-lg w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#16161c]">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Конструктор тестирования: {lessonTitle}
            </h2>
            <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
              Настройка проходного балла (80%), попыток и вариантов ответов
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

        {/* Form Body */}
        <form onSubmit={handleSaveQuiz} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {error && (
              <div className="p-3 rounded bg-red-950/30 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quiz General Settings */}
            <div className="p-4 rounded-lg bg-zinc-900 border border-white/5 space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Параметры теста</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Название теста</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Проверочный тест"
                    className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Проходной балл (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={passingScorePercentage}
                    onChange={(e) => setPassingScorePercentage(parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Максимум попыток</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Лимит времени (сек)</label>
                  <input
                    type="number"
                    min="60"
                    max="3600"
                    step="60"
                    value={timeLimitSeconds}
                    onChange={(e) => setTimeLimitSeconds(parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Описание (опционально)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Инструкция для студента..."
                    className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Вопросы ({questions.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 text-white text-xs font-medium hover:bg-zinc-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить вопрос</span>
                </button>
              </div>

              {questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-lg bg-zinc-900 border border-white/5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                      #{qIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                      placeholder="Введите формулировку вопроса..."
                      className="flex-1 bg-zinc-950 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Удалить вопрос"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Options */}
                  <div className="pl-6 space-y-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Варианты ответа (отметьте правильные):</span>
                    {(q.options || []).map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(opt.isCorrect)}
                          onChange={(e) => handleOptionChange(qIdx, oIdx, 'isCorrect', e.target.checked)}
                          className="w-4 h-4 rounded bg-zinc-950 border-white/20 text-white focus:ring-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={opt.optionText}
                          onChange={(e) => handleOptionChange(qIdx, oIdx, 'optionText', e.target.value)}
                          placeholder={`Вариант ${oIdx + 1}`}
                          className="flex-1 bg-zinc-950 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                          required
                        />
                        {(q.options || []).length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIdx, oIdx)}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddOption(qIdx)}
                      className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Добавить вариант ответа</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-white/10 bg-[#16161c] flex items-center justify-between">
            {existingQuizId ? (
              <button
                type="button"
                onClick={handleDeleteQuiz}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-red-400 hover:bg-red-950/40 border border-red-900/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить тест</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Сохранение...' : 'Сохранить тест'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
