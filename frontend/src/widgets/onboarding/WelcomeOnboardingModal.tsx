import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowRight, X, ExternalLink, Laptop, ShieldCheck } from 'lucide-react';

interface WelcomeOnboardingModalProps {
  courseTitle: string;
  firstLessonUrl: string;
  discordInviteUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  courseTitle,
  firstLessonUrl,
  discordInviteUrl = 'https://discord.gg/mrdeveloper',
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-white/10 rounded-sm shadow-2xl p-6 space-y-5 text-white">
        {/* Close Button */}
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
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              старт обучения
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Добро пожаловать в {courseTitle}!
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Главный результат курса — твоё первое веб-приложение, задеплоенное онлайн на бесплатном хостинге.
          </p>
        </div>

        {/* 3 Step Guide */}
        <div className="space-y-3 pt-1">
          {/* Step 1: Discord */}
          <div className="p-3.5 rounded-sm bg-[#0a0a0c] border border-white/5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center shrink-0 mt-0.5">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                <span>1. Закрытый Discord-сервер</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 rounded">
                  ОБЯЗАТЕЛЬНО
                </span>
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Все обсуждения, разборы уроков и прямая связь с ментором (Mr Developer) проходят в Discord.
              </p>
              <a
                href={discordInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5865F2] hover:text-[#7289da] mt-2 underline underline-offset-2"
              >
                <span>Присоединиться к серверу</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Step 2: Tools Checklist */}
          <div className="p-3.5 rounded-sm bg-[#0a0a0c] border border-white/5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
              <Laptop className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white">2. Базовый сетап</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Тебе понадобятся: Git, аккаунт на GitHub и удобный редактор (VS Code или Cursor).
              </p>
            </div>
          </div>

          {/* Step 3: Homework rule */}
          <div className="p-3.5 rounded-sm bg-[#0a0a0c] border border-white/5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white">3. Как сдавать домашки</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Сдавай ссылку на GitHub и свой задеплоенный сайт прямо в уроке. Ментор проверяет каждую работу и досрочно открывает следующий день.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(firstLessonUrl);
            }}
            className="w-full py-2.5 px-4 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            <span>Понятно, начать Урок 1</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
