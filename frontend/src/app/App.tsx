import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/widgets/header/Header';

export const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-[#fafafa]">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#27272a] py-6 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Mr Developer. Все права защищены.</p>
          <p className="text-zinc-600">1 день — 1 урок. Строгий Drip-график обучения.</p>
        </div>
      </footer>
    </div>
  );
};
