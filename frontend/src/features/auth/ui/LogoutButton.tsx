import React from 'react';
import { useAuth } from '../model/useAuth';

interface LogoutButtonProps {
  className?: string;
  onLoggedOut?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = '',
  onLoggedOut,
}) => {
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    if (onLoggedOut) {
      onLoggedOut();
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border border-white/5 text-[#a1a1aa] hover:text-white hover:bg-[#18181b] ${className}`}
    >
      Выйти
    </button>
  );
};
