import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';

export const PrivacyPage: React.FC = () => {
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
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[10px] font-mono bg-[#141418] border border-white/10 text-zinc-300">
            <Shield className="w-3 h-3" />
            <span>Конфиденциальность данных</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Политика конфиденциальности
          </h1>
          <p className="text-xs font-mono text-zinc-500">
            Последнее обновление: 1 сентября 2026 г.
          </p>
        </div>

        <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/10 shadow-xl space-y-6 text-xs text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              1. Общие положения
            </h2>
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональной информации пользователей образовательной платформы <strong>MrDeveloper</strong>. Мы уважительно относимся к вашей приватности и собираем только минимально необходимые данные для организации учебного процесса.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              2. Собираемая информация
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Данные аккаунта:</strong> адрес электронной почты, имя пользователя, аватар (при авторизации через Google OAuth2).
              </li>
              <li>
                <strong className="text-zinc-200">Учебный прогресс:</strong> статистика пройденных уроков, отправленные домашние задания, результаты AI-проверки и выданные сертификаты.
              </li>
              <li>
                <strong className="text-zinc-200">Технические данные:</strong> файлы cookie для поддержания защищённой stateless-сессии (JWT в httpOnly cookie).
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              3. Использование данных
            </h2>
            <p>
              Все данные используются исключительно для:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>Предоставления доступа к урокам и учебным материалам платформы;</li>
              <li>Синхронизации персонального графика обучения (Drip-контент);</li>
              <li>Проверки подлинности выданных сертификатов об окончании курса.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              4. Защита и безопасность
            </h2>
            <p>
              Мы применяем строгие инженерные стандарты безопасности: токены авторизации хранятся в защищённых `httpOnly` cookie с флагами `Secure` и `SameSite`, доступ к API защищён Row-Level Security, а передача данных осуществляется исключительно по протоколу HTTPS.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              5. Контакты
            </h2>
            <p>
              По любым вопросам относительно обработки ваших данных вы можете связаться с нами через Telegram: <a href="https://t.me/mrsgemaseny" target="_blank" rel="noreferrer" className="text-white hover:underline">@mrsgemaseny</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
