import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';

const STORAGE_KEY = 'mrdev_cookie_consent_accepted';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // Ignore localStorage access errors in restricted contexts
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore localStorage errors
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Уведомление об использовании файлов cookie"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#0e0e11] border border-white/10 p-4 rounded-sm shadow-2xl space-y-3 font-sans"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-white text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-zinc-300 shrink-0" />
          <span>Технические файлы cookie</span>
        </div>
        <button
          type="button"
          onClick={handleAccept}
          aria-label="Закрыть уведомление"
          className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[11px] text-zinc-400 leading-relaxed">
        Мы используем исключительно технические cookies для аутентификации (JWT) и безопасности сессии. Никаких сторонних рекламных и аналитических трекеров. Подробнее в{' '}
        <Link to={ROUTES.PRIVACY} className="text-white underline hover:text-zinc-200">
          Политике конфиденциальности
        </Link>.
      </p>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={handleAccept}
          className="px-3 py-1.5 bg-white text-black text-xs font-semibold rounded-xs hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          Понятно
        </button>
      </div>
    </aside>
  );
};
