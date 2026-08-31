import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const defaultFaqs: FaqItem[] = [
  {
    question: 'Нужен ли предварительный опыт программирования?',
    answer: 'Курс рассчитан на разработчиков, знакомых с основами синтаксиса (Java/JavaScript) и желающих освоить реальную промышленную архитектуру и вайбкодинг. Все продвинутые концепции объясняются с нуля на практике.',
  },
  {
    question: 'Сколько времени нужно уделять в день?',
    answer: 'Каждый урок рассчитан на 30–45 минут: 15–20 минут видеоматериала и 20–25 минут на практическое упражнение или квиз.',
  },
  {
    question: 'Как открываются уроки (Drip-система)?',
    answer: 'Уроки открываются ежедневно с момента вашей записи на курс (1 день = 1 новый урок). Вы можете двигаться в комфортном темпе и возвращаться к пройденным материалам в любое время.',
  },
  {
    question: 'Что делать, если возникнут трудности или вопросы?',
    answer: 'В каждом уроке встроен контекстный AI Тьютор, знающий код и конспект занятия, а также доступно закрытое Discord-сообщество сокурсников.',
  },
];

export const CourseFaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-zinc-400" />
        <h2 className="text-base font-bold text-white tracking-tight">Часто задаваемые вопросы</h2>
      </div>

      <div className="space-y-2">
        {defaultFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#0e0e11] border border-white/5 rounded-sm overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-xs font-medium text-white pr-4">{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 border-t border-white/5 bg-[#0a0a0c]/40">
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
