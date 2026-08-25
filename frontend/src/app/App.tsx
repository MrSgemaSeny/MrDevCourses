import { Outlet, Link } from 'react-router-dom';

export const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#161b22]/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-base font-bold text-white tracking-wide hover:no-underline">
            MrDev<span className="text-[#58a6ff]">Courses</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/courses" className="text-gray-300 hover:text-white transition-colors">
              Курсы
            </Link>
            <Link
              to="/auth"
              className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-medium rounded transition-colors hover:no-underline"
            >
              Войти
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#30363d] py-6 text-center text-xs text-gray-500">
        <p>© 2026 Mr Developer. Все права защищены.</p>
      </footer>
    </div>
  );
};
