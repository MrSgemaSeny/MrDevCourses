import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/widgets/header/Header';
import { Footer } from '@/widgets/footer/Footer';

export const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-[#fafafa]">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
