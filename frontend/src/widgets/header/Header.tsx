import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { BookOpen, LayoutDashboard, Shield, LogOut, LogIn } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" aria-label="MrDevCourses Главная" className="flex items-center gap-2 text-base font-bold text-white tracking-wide hover:opacity-90 transition-opacity">
          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-black font-black text-xs">
            M
          </div>
          <span>MrDev<span className="text-zinc-400 font-normal">Courses</span></span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link to="/courses" className="text-zinc-400 hover:text-zinc-100 flex items-center gap-1.5 transition-colors">
            <BookOpen className="w-4 h-4" />
            <span>Курсы</span>
          </Link>

          {isAuthenticated && (
            <Link to="/dashboard" className="text-zinc-400 hover:text-zinc-100 flex items-center gap-1.5 transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span>Моё обучение</span>
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-zinc-400 hover:text-zinc-100 flex items-center gap-1.5 transition-colors">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Админка</span>
            </Link>
          )}
        </nav>

        {/* User Auth Info */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name || user.email} className="w-7 h-7 rounded-full border border-zinc-700 object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-300 font-bold">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-zinc-300 hidden sm:inline max-w-[120px] truncate">
                  {user.name || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Выйти"
                title="Выйти"
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              aria-label="Войти в аккаунт"
              className="px-3.5 py-1.5 bg-[#fafafa] hover:bg-white text-[#09090b] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
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
