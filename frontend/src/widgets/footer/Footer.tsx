import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Send, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#27272a] bg-[#09090b] text-zinc-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          {/* Левая колонка: Описание и копирайт */}
          <div className="max-w-sm space-y-3">
            <Link to="/" className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
              <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-black font-black text-xs">
                M
              </div>
              <span>
                MrDev<span className="text-zinc-400 font-normal">Courses</span>
              </span>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Образовательная платформа для разработчиков от Mr Developer. Практические курсы по промышленному стеку, архитектуре и AI-инструментам.
            </p>

            <p className="text-[11px] text-zinc-600 pt-2">
              &copy; {new Date().getFullYear()} MrDevCourses. Все права защищены.
            </p>
          </div>

          {/* Правая часть: 2 колонки (Навигация и Контакты) */}
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            {/* Колонка 1: Платформа */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Платформа
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/courses" className="hover:text-white transition-colors">
                    Каталог курсов
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-white transition-colors">
                    Моё обучение
                  </Link>
                </li>
                <li>
                  <Link to="/certificates/verify" className="hover:text-white transition-colors">
                    Проверка сертификата
                  </Link>
                </li>
              </ul>
            </div>

            {/* Колонка 2: Контакты и Сообщество */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Контакты
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="https://github.com/MrSgemaSeny/MrDevCourses"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Github className="w-3.5 h-3.5 text-zinc-300" />
                    <span>GitHub</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/mrdeveloper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Telegram</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
