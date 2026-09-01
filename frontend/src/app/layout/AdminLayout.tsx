import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth, LogoutButton } from '@/features/auth';
import { ScrollToTop } from '@/app/providers/ScrollToTop';

interface AdminNavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const adminNavItems: AdminNavItem[] = [
  {
    to: '/admin',
    label: 'Обзор платформы',
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
    to: '/admin/curriculum',
    label: 'Учебный план',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    to: '/admin/students',
    label: 'Студенты и когорты',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: '/admin/homeworks',
    label: 'Проверка ДЗ',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    to: '/admin/analytics',
    label: 'Аналитика и воронки',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    to: '/admin/audit',
    label: 'Журнал аудита',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    to: '/admin/system',
    label: 'Системный монитор',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white">
      <ScrollToTop />
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-60 bg-[#0a0a0c] border-r border-white/5 flex flex-col z-40">
        {/* Logo + Admin badge */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white tracking-tight">
              MrDeveloper
            </span>
          </div>
        </div>

        {/* Admin user info */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name ?? 'Admin'}
                className="w-8 h-8 rounded-full object-cover border border-white/5"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-xs text-zinc-400 font-medium">
                {user?.name?.[0]?.toUpperCase() ?? 'A'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white border border-white/10'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Back to site + Logout */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1.5">
          <NavLink
            to="/courses"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            <span>На сайт курсов</span>
          </NavLink>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen bg-[#0a0a0c]">
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
