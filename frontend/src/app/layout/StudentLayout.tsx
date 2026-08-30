import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth, LogoutButton } from '@/features/auth';
import { Logo } from '@/shared/ui/Logo';
import { ScrollToTop } from '@/app/providers/ScrollToTop';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const studentNavItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Дашборд',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/courses',
    label: 'Мои курсы',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

export const StudentLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-zinc-100">
      <ScrollToTop />
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-60 bg-[#0a0a0c] border-r border-white/5 flex flex-col z-40">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <Logo />
        </div>

        {/* User */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name ?? 'User'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-white/5"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-xs text-zinc-400">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name ?? 'Студент'}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Streak badge */}
          {(user?.currentStreak ?? 0) > 0 && (
            <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[#0a0a0c] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <span className="text-white text-xs">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a.58.58 0 0 1-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 4.96 3.22 2.14.27 4.43-.12 6.07-1.6 1.83-1.66 2.47-4.32 1.53-6.6l-.13-.28c-.1-.28-.3-.54-.77-.82z" />
                </svg>
              </span>
              <span className="text-[10px] text-zinc-300 font-medium font-mono uppercase tracking-wider">{user?.currentStreak} дней стрик</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {studentNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content — offset by sidebar width */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
