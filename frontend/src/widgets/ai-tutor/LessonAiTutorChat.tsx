import React, { useState } from 'react';
import { aiTutorApi } from '@/entities/ai/api/aiTutorApi';
import type { AiTutorResponse } from '@/shared/types';
import { MarkdownViewer } from '@/shared/ui/MarkdownViewer';

interface LessonAiTutorChatProps {
  courseId: number;
  lessonId: number;
  lessonTitle: string;
}

interface Message {
  role: 'user' | 'tutor';
  content: string;
  timestamp: string;
}

export const LessonAiTutorChat: React.FC<LessonAiTutorChatProps> = ({
  courseId,
  lessonId,
  lessonTitle,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'tutor',
      content: `Привет! Я твой AI-наставник по уроку **"${lessonTitle}"**. Спроси меня, если что-то непонятно по коду или теории!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([
    'Объясни ключевую идею урока',
    'Какие подводные камни в этой теме?',
    'Покажи практический пример',
  ]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || question).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response: AiTutorResponse = await aiTutorApi.askTutor({
        courseId,
        lessonId,
        question: query,
      });

      const tutorMsg: Message = {
        role: 'tutor',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, tutorMsg]);
      if (response.suggestedFollowUps && response.suggestedFollowUps.length > 0) {
        setSuggestedFollowUps(response.suggestedFollowUps);
      }
    } catch {
      const errorMsg: Message = {
        role: 'tutor',
        content: 'Не удалось получить ответ от AI. Попробуйте еще раз позже.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#fafafa]">
            Senior AI Tutor
          </span>
        </div>
        <span className="text-[11px] text-[#8b949e] font-mono truncate max-w-[200px]">
          {lessonTitle}
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#238636] text-white'
                  : 'bg-[#0d1117] border border-[#30363d] text-[#c9d1d9]'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <MarkdownViewer content={msg.content} />
              )}
            </div>
            <span className="text-[10px] text-[#8b949e] mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0d1117] border border-[#30363d] w-fit">
            <div className="w-4 h-4 border-2 border-[#e2b340] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#8b949e]">AI анализирует контекст урока...</span>
          </div>
        )}
      </div>

      {/* Suggested Follow-ups */}
      {suggestedFollowUps.length > 0 && !isLoading && (
        <div className="px-4 py-2 bg-[#0d1117]/60 border-t border-[#21262d] flex items-center gap-1.5 overflow-x-auto">
          {suggestedFollowUps.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] transition-colors cursor-pointer border border-[#30363d]"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-[#0d1117] border-t border-[#30363d] flex gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Задать вопрос по уроку..."
          disabled={isLoading}
          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#fafafa] placeholder-[#8b949e] focus:outline-none focus:border-[#e2b340] transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          Отправить
        </button>
      </form>
    </div>
  );
};
