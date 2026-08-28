import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/widgets/header/Header';
import { Footer } from '@/widgets/footer/Footer';
import { ScrollToTop } from './providers/ScrollToTop';

export const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0c] text-zinc-100">
      <ScrollToTop />
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
