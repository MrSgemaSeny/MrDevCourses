import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';

export const TermsPage: React.FC = () => {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full lg:w-[75%] max-w-[1080px] space-y-8">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>На главную</span>
        </Link>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Условия использования
          </h1>
          <p className="text-xs font-mono text-zinc-500">
            Последнее обновление: 1 сентября 2026 г.
          </p>
        </div>

        <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/10 shadow-xl space-y-6 text-xs text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              1. Предмет соглашения
            </h2>
            <p>
              Платформа <strong>MrDeveloper</strong> предоставляет доступ к авторским учебным материалам, практическим заданиям, видеоурокам и инструментам AI-проверки кода. Регистрируясь или просматривая курсы, пользователь подтверждает полное согласие с настоящими Условиями.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              2. Правила использования платформы
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
              <li>
                Запрещается передавать учетные данные третьим лицам или использовать платформу для неправомерных действий.
              </li>
              <li>
                Запрещаются попытки взлома API, перегрузки серверов автоматическими скриптами и распространение вредоносного кода через домашние задания.
              </li>
              <li>
                Студенты обязуются соблюдать этику общения в закрытых Discord и Telegram сообществах платформы.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              3. Интеллектуальная собственность
            </h2>
            <p>
              Все исходные видеоматериалы, структура модулей и методические пособия являются интеллектуальной собственностью Mr Developer. Код, написанный студентами в процессе выполнения заданий и пет-проектов, принадлежит самим студентам.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              4. Сертификация
            </h2>
            <p>
              Электронный сертификат генерируется автоматически при 100% выполнении всех обязательных заданий курса и доступен для публичной верификации по уникальному защищённому коду.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              5. Изменения условий
            </h2>
            <p>
              Администрация платформы оставляет за собой право обновлять настоящие условия. Актуальная версия всегда опубликована на данной странице.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
