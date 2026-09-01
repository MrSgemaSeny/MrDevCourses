import React from 'react';
import { Outlet } from 'react-router-dom';
import { ScrollToTop } from '../providers/ScrollToTop';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col justify-center">
      <ScrollToTop />
      <main className="flex-1 flex flex-col justify-center">
        <Outlet />
      </main>
    </div>
  );
};
