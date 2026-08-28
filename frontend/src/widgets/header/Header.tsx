import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';
import { UserProfileDropdown } from './UserProfileDropdown';
import { Logo } from '@/shared/ui/Logo';
import { BookOpen, LayoutDashboard, Shield, LogIn, Flame } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link
          to={ROUTES.HOME}
          aria-label="MrDev Главная"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Logo />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-xs font-medium">
          <Link
            to={ROUTES.COURSES}
            className="text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <span>Каталог курсов</span>
          </Link>

          {isAuthenticated && (
            <Link
              to={ROUTES.DASHBOARD}
              className="text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-400" />
              <span>Моё обучение</span>
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              to={ROUTES.ADMIN}
              className="text-white hover:text-zinc-200 flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded bg-zinc-900 border border-white/5"
            >
              <Shield className="w-3.5 h-3.5 text-zinc-300" />
              <span>Админ-панель</span>
            </Link>
          )}
        </nav>

        {/* User Profile / Auth Action */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Streak Badge */}
              {(user.currentStreak ?? 0) > 0 && (
                <div
                  title={`Ваш текущий стрик: ${user.currentStreak} дн.`}
                  className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-zinc-300 text-xs font-mono font-medium"
                >
                  <Flame className="w-3.5 h-3.5 text-white" />
                  <span>{user.currentStreak} дн.</span>
                </div>
              )}

              {/* Profile Dropdown */}
              <UserProfileDropdown />
            </div>
          ) : (
            <Link
              to={ROUTES.LOGIN}
              aria-label="Войти в аккаунт"
              className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 text-black text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Войти</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
