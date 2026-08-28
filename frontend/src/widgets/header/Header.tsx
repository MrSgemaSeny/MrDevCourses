import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { BookOpen, LayoutDashboard, Shield, LogOut, LogIn, Flame } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#27272a] bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          aria-label="MrDevCourses Главная"
          className="flex items-center gap-2.5 text-sm font-bold text-white tracking-wide hover:opacity-90 transition-opacity"
        >
          <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-black font-black text-xs">
            M
          </div>
          <span>
            MrDev<span className="text-zinc-400 font-normal">Courses</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-xs font-medium">
          <Link
            to="/courses"
            className="text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <span>Каталог курсов</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-400" />
              <span>Моё обучение</span>
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="text-white hover:text-zinc-200 flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700"
            >
              <Shield className="w-3.5 h-3.5 text-zinc-300" />
              <span>Админ-панель</span>
            </Link>
          )}
        </nav>

        {/* User Auth Info */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Streak Badge */}
              {(user.currentStreak ?? 0) > 0 && (
                <div
                  title={`Ваш текущий стрик: ${user.currentStreak} дн.`}
                  className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-medium"
                >
                  <Flame className="w-3.5 h-3.5 text-white" />
                  <span>{user.currentStreak} дн.</span>
                </div>
              )}

              {/* User Avatar + Name */}
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || user.email}
                    className="w-7 h-7 rounded-full border border-zinc-700 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-200 font-bold">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-medium text-white max-w-[130px] truncate leading-tight">
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono leading-tight">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                aria-label="Выйти"
                title="Выйти из аккаунта"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
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
