import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { GoogleLoginButton, EmailAuthForm, useAuth } from '@/features/auth';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-8 rounded-sm bg-[#18181b]/80 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            Вход в MrDev<span className="text-[#a1a1aa]">Courses</span>
          </h1>
          <p className="text-sm text-[#a1a1aa]">
            Доступ к материалам курсов и синхронизация прогресса
          </p>
        </div>

        {errorParam && (
          <div className="mb-6 p-3 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {errorParam}
          </div>
        )}

        {/* Google — primary action */}
        <div className="space-y-3">
          <GoogleLoginButton text="Войти через Google" />

          {/* Recommendation banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-sm bg-[#0a0a0c] border border-white/5">
            <span className="text-[#71717a] mt-0.5 shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </span>
            <p className="text-xs text-[#71717a] leading-relaxed">
              Настоятельно рекомендуем войти через Google — быстрее, безопаснее,
              и прогресс автоматически привязывается к аккаунту.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-white/5" />
          <span className="text-xs text-[#52525b]">или через email</span>
          <div className="flex-1 border-t border-white/5" />
        </div>

        {/* Email/password — secondary */}
        <EmailAuthForm />

        <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-[#71717a]">
          Авторизуясь, вы соглашаетесь с правилами платформы
        </div>
      </div>
    </div>
  );
};
