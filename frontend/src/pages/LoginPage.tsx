import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { GoogleLoginButton, useAuth } from '@/features/auth';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#18181b]/80 border border-[#27272a] backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight mb-2">
            Вход в MrDev<span className="text-[#a1a1aa]">Courses</span>
          </h1>
          <p className="text-sm text-[#a1a1aa]">
            Войдите через Google для доступа к материалам курсов и синхронизации прогресса
          </p>
        </div>

        {errorParam && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {errorParam}
          </div>
        )}

        <div className="space-y-4">
          <GoogleLoginButton text="Войти через Google" />
        </div>

        <div className="mt-8 pt-6 border-t border-[#27272a] text-center text-xs text-[#71717a]">
          Авторизуясь, вы соглашаетесь с правилами платформы
        </div>
      </div>
    </div>
  );
};
