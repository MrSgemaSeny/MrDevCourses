import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';
import {
  ChevronDown,
  LayoutDashboard,
  BookOpen,
  Shield,
  LogOut,
  User as UserProfileIcon,
} from 'lucide-react';

export const UserProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate(ROUTES.HOME);
  };

  const displayName = user.name || user.email.split('@')[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Профиль пользователя"
        className="flex items-center gap-2 py-1 px-2 rounded-sm hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-white/5 focus:outline-none"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/10 object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs text-zinc-200 font-bold shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-medium text-white max-w-[120px] truncate leading-tight">
            {displayName}
          </span>
          {user.role === 'ADMIN' && (
            <span className="text-[10px] text-zinc-400 font-mono leading-tight">
              ADMIN
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Modal / Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-sm bg-[#121214] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] z-50 overflow-hidden">
          {/* Header Info */}
          <div className="p-4 border-b border-white/5 bg-[#161618]">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border border-white/5 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-sm text-white font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                  {user.role === 'ADMIN' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 border border-white/5 text-zinc-300">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-1.5 space-y-0.5">
            <Link
              to={ROUTES.PROFILE}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-sm transition-colors"
            >
              <UserProfileIcon className="w-4 h-4 text-zinc-400" />
              <span>Профиль и настройки</span>
            </Link>

            <Link
              to={ROUTES.DASHBOARD}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-sm transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-400" />
              <span>Моё обучение</span>
            </Link>

            <Link
              to={ROUTES.COURSES}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-sm transition-colors"
            >
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <span>Каталог курсов</span>
            </Link>

            {user.role === 'ADMIN' && (
              <Link
                to={ROUTES.ADMIN}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-white bg-zinc-900/60 hover:bg-zinc-800 rounded-sm transition-colors border border-white/5"
              >
                <Shield className="w-4 h-4 text-white" />
                <span>Админ-панель</span>
              </Link>
            )}
          </div>

          {/* Logout Action */}
          <div className="p-1.5 border-t border-white/5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-sm transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Выйти из аккаунта</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
