import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Sparkles, Terminal, Github, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#30363d] bg-[#0d1117] text-[#8b949e] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#21262d]">
          {/* Col 1: Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-base font-bold text-white tracking-tight">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black font-black text-sm shadow-md">
                M
              </div>
              <span className="text-lg">
                MrDev<span className="text-[#58a6ff]">Courses</span>
              </span>
            </Link>
            <p className="text-xs text-[#8b949e] leading-relaxed max-w-sm">
              Инженерная образовательная платформа для разработчиков. Фокус на архитектуре монолитов и микросервисов, AI-агентах, практическом коде и промышленном стеке.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-[11px] text-[#c9d1d9]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Система активна (v2.4 Enterprise)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Обучение */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span>Обучение</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/courses" className="hover:text-[#58a6ff] transition-colors">
                  Каталог курсов
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#58a6ff] transition-colors">
                  Мой прогресс & стрик
                </Link>
              </li>
              <li>
                <span className="text-[#484f58] cursor-not-allowed">
                  Карта компетенций (Скоро)
                </span>
              </li>
              <li>
                <span className="text-[#484f58] cursor-not-allowed">
                  Банк задач & LeetCode
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Инструменты & AI */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Инструменты</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-[#c9d1d9] flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-[#58a6ff]" />
                  AI Code Grader
                </span>
              </li>
              <li>
                <span className="text-[#c9d1d9] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  RAG Наставник (Llama 3.3)
                </span>
              </li>
              <li>
                <Link to="/certificates/verify" className="hover:text-[#58a6ff] flex items-center gap-1 transition-colors">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>Верификация сертификатов</span>
                </Link>
              </li>
              <li>
                <span className="text-[#c9d1d9] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-sky-400" />
                  <span>IDOR & Rate Limiter</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Стек & Ресурсы */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Стек платформы</h4>
            <ul className="space-y-2 text-xs text-[#8b949e]">
              <li>Spring Boot 3.3 & Java 17</li>
              <li>PostgreSQL 17 & pgvector HNSW</li>
              <li>React 19 & Feature-Sliced Design</li>
              <li>Tailwind CSS v4 & Lucide</li>
              <li className="pt-1">
                <a
                  href="https://github.com/MrSgemaSeny/MrDevCourses"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#58a6ff] hover:underline"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-[#8b949e]">
            &copy; {new Date().getFullYear()} MrDevCourses. Архитектура и разработка: <strong className="text-[#c9d1d9]">Mr Developer</strong>.
          </p>

          <div className="flex items-center gap-6 text-[11px] text-[#8b949e]">
            <span>Stateless JWT Session</span>
            <span>&bull;</span>
            <span>UTC Clock Engine</span>
            <span>&bull;</span>
            <span>FSD Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
