import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';

export const AuthCallbackPage: React.FC = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        await checkAuth();
      } finally {
        if (isMounted) {
          navigate('/courses', { replace: true });
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
        <div className="w-8 h-8 border-2 border-[#27272a] border-t-[#fafafa] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[#a1a1aa]">Завершение авторизации...</p>
      </div>
    </div>
  );
};
