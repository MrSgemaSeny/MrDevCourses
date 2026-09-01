import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { userApi } from '@/entities/user/api/userApi';

export const AuthCallbackPage: React.FC = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const user = await userApi.getMe();
        await checkAuth();
        if (isMounted) {
          navigate(user.role === 'ADMIN' ? '/admin' : '/courses', { replace: true });
        }
      } catch {
        if (isMounted) {
          navigate('/login', { replace: true });
        }
      }
    };
    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [checkAuth, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-white/5 border-t-[#fafafa] rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#a1a1aa]">Завершение авторизации...</p>
      </div>
    </div>
  );
};
