import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { FOOTER_CONFIG } from '@/shared/config/footerConfig';
import { ROUTES } from '@/shared/config/routes';

export const Footer: React.FC = () => {
  const { brand, sections, legal } = FOOTER_CONFIG;

  return (
    <footer className="border-t border-[#27272a] bg-[#09090b] text-zinc-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          {/* Левая колонка: Бренд и описание */}
          <div className="max-w-sm space-y-3">
            <Link
              to={ROUTES.HOME}
              className="text-base font-bold text-white tracking-tight hover:text-zinc-200 transition-colors inline-block"
            >
              {brand.title}
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {brand.description}
            </p>

            <p className="text-[11px] text-zinc-600 pt-2">
              &copy; {legal.copyrightYear} {legal.copyrightHolder}. Все права защищены.
            </p>
          </div>

          {/* Правая часть: Динамические колонки из конфига */}
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-2 text-xs">
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.label}>
                        {link.isExternal ? (
                          <a
                            href={link.to}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                          >
                            {Icon && <Icon className="w-3.5 h-3.5 text-zinc-300" />}
                            <span>{link.label}</span>
                            <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                          </a>
                        ) : (
                          <Link
                            to={link.to}
                            className="hover:text-white transition-colors inline-block"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Нижний бар: Ссылки на условия и конфиденциальность */}
        {legal.links.length > 0 && (
          <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-600">
            <div className="flex items-center gap-4">
              {legal.links.map((item) => (
                <a
                  key={item.label}
                  href={item.to}
                  className="hover:text-zinc-400 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <span>v1.0 MVP</span>
          </div>
        )}
      </div>
    </footer>
  );
};
