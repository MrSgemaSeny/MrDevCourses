import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth, LogoutButton } from '@/features/auth';

interface AdminNavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const adminNavItems: AdminNavItem[] = [
  {
    to: '/admin',
    label: 'Обзор',
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
    to: '/admin/courses',
    label: 'Курсы',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    to: '/admin/students',
    label: 'Студенты',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#09090b] text-[#fafafa]">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-60 bg-[#0d1117] border-r border-[#21262d] flex flex-col z-40">
        {/* Logo + Admin badge */}
        <div className="px-5 py-5 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#fafafa] tracking-tight">
              MrDev<span className="text-[#71717a]">Courses</span>
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#30363d] text-[#8b949e] font-mono">
              admin
            </span>
          </div>
        </div>

        {/* Admin user */}
        <div className="px-5 py-4 border-b border-[#21262d]">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name ?? 'Admin'}
                className="w-8 h-8 rounded-full object-cover border border-[#21262d]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center text-xs text-[#8b949e]">
                {user?.name?.[0]?.toUpperCase() ?? 'A'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#fafafa] truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-xs text-[#71717a] truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#21262d] text-[#fafafa]'
                    : 'text-[#8b949e] hover:text-[#fafafa] hover:bg-[#161b22]'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Back to site + Logout */}
        <div className="px-3 py-4 border-t border-[#21262d] space-y-1">
          <NavLink
            to="/courses"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-[#8b949e] hover:text-[#fafafa] hover:bg-[#161b22] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            На сайт
          </NavLink>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
