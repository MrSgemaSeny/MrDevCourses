import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';
import { UserProfileDropdown } from './UserProfileDropdown';
import { Logo } from '@/shared/ui/Logo';
import { BookOpen, LayoutDashboard, Shield, LogIn, Flame, Search, Rocket } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isCoursesPage = location.pathname === ROUTES.COURSES;
  const currentQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(currentQuery);

  useEffect(() => {
    if (isCoursesPage) {
      setSearchTerm(searchParams.get('q') || '');
    }
  }, [isCoursesPage, searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (isCoursesPage) {
      const newParams = new URLSearchParams(searchParams);
      if (val.trim()) {
        newParams.set('q', val);
      } else {
        newParams.delete('q');
      }
      navigate(`${ROUTES.COURSES}?${newParams.toString()}`, { replace: true });
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isCoursesPage) {
      navigate(`${ROUTES.COURSES}?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Brand */}
        <Link
          to={ROUTES.HOME}
          aria-label="MrDevCourses Главная"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <Logo />
        </Link>

        {/* Global Search in Header */}
        <div className="relative hidden md:block w-52 lg:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Поиск по курсам..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className="w-full bg-[#121214] border border-white/10 rounded-sm pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
          />
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-6 shrink-0">
          <nav className="flex items-center gap-6 text-xs font-medium">

          <Link
            to={ROUTES.COURSES}
            className="text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <span>Каталог курсов</span>
          </Link>

          <Link
            to={ROUTES.PROJECTS}
            className="text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Rocket className="w-4 h-4 text-zinc-400" />
            <span>Проекты</span>
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
      </div>
    </header>

  );
};
