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
    <header className="sticky top-0 z-50 border-b border-[#21262d] bg-[#0d1117]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          aria-label="MrDevCourses Главная"
          className="flex items-center gap-2.5 text-base font-bold text-white tracking-wide hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black font-black text-sm shadow-md">
            M
          </div>
          <span className="text-base font-bold">
            MrDev<span className="text-[#58a6ff]">Courses</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-xs font-semibold">
          <Link
            to="/courses"
            className="text-[#c9d1d9] hover:text-[#58a6ff] flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-[#58a6ff]" />
            <span>Каталог курсов</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="text-[#c9d1d9] hover:text-[#58a6ff] flex items-center gap-1.5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              <span>Моё обучение</span>
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60"
            >
              <Shield className="w-3.5 h-3.5" />
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
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{user.currentStreak} дн.</span>
                </div>
              )}

              {/* User Avatar + Name */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-[#30363d]">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || user.email}
                    className="w-8 h-8 rounded-full border border-[#30363d] object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center text-xs text-[#c9d1d9] font-bold shadow-sm">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white max-w-[130px] truncate leading-tight">
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-[#8b949e] font-mono leading-tight">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                aria-label="Выйти"
                title="Выйти из аккаунта"
                className="p-2 text-[#8b949e] hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-900/40"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              aria-label="Войти в аккаунт"
              className="px-4 py-2 bg-[#fafafa] hover:bg-white text-[#09090b] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
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
