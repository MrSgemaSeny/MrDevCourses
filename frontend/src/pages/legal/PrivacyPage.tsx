import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Политика конфиденциальности
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Последнее обновление: 1 сентября 2026 г. | Юрисдикция: Республика Казахстан
          </p>
        </div>

        <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/10 shadow-xl space-y-6 text-xs text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              1. Общие положения и применимое законодательство
            </h2>
            <p>
              Настоящая Политика конфиденциальности определяет порядок сбора, обработки, хранения и защиты персональных данных пользователей образовательной платформы <strong>MrDeveloper</strong>. Политика разработана в строгом соответствии с Законом Республики Казахстан от 21 мая 2013 года № 94-V «О персональных данных и их защите» и международными стандартами информационной безопасности.
            </p>
            <p>
              Регистрируясь на платформе, пользователь дает безусловное согласие на сбор и обработку своих персональных данных на условиях, предусмотренных настоящей Политикой.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              2. Собираемая информация и минимизация данных
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Данные учетной записи:</strong> адрес электронной почты, имя пользователя, аватар профиля (при авторизации через Google OAuth2).
              </li>
              <li>
                <strong className="text-zinc-200">Учебный прогресс:</strong> статистика пройденных уроков, отправленные домашние задания (ссылки на репозитории GitHub и демонстрационные стенды), результаты тестов и выданные сертификаты.
              </li>
              <li>
                <strong className="text-zinc-200">Обращения в поддержку:</strong> текст запросов помощи (SOS-сигналы) ментору платформы.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              3. Цели сбора и обработки данных
            </h2>
            <p>
              Персональные данные собираются исключительно в целях:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>Предоставления доступа к образовательному контенту и материалам уроков;</li>
              <li>Синхронизации графика обучения (Drip-контент) и фиксации сдачи домашних заданий;</li>
              <li>Индивидуальной обратной связи ментора и код-ревью;</li>
              <li>Генерации и публичной верификации электронных сертификатов об окончании обучения.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              4. Политика использования файлов cookie (Cookies Policy)
            </h2>
            <p>
              Платформа MrDeveloper использует исключительно <strong>строго необходимые (технические) файлы cookie</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>
                <strong className="text-zinc-200">MrDev_token:</strong> криптографически подписанный JWT-токен для обеспечения безопасной stateless-сессии. Хранится в защищенном cookie с атрибутами <code>httpOnly</code>, <code>Secure</code> и <code>SameSite</code>. Недоступен для JavaScript на стороне клиента, что полностью исключает риск кражи токена через XSS.
              </li>
            </ul>
            <p className="text-zinc-400">
              Платформа <strong>не использует</strong> сторонние аналитические или рекламные трекеры (Google Analytics, Meta Pixel, Yandex Metrika). Мы не передаем данные о вашей активности третьим лицам.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              5. Права субъекта персональных данных
            </h2>
            <p>
              В соответствии со ст. 24 Закона РК № 94-V пользователь имеет право:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>Знать о наличии у Оператора своих персональных данных и получать информацию об их обработке;</li>
              <li>Требовать изменения или дополнения своих персональных данных при наличии законных оснований;</li>
              <li>Требовать блокирования или уничтожения своих персональных данных в случае их неправомерного сбора или прекращения потребности в них;</li>
              <li>Отозвать согласие на сбор и обработку персональных данных, направив письменное уведомление Оператору.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              6. Безопасность и защита данных
            </h2>
            <p>
              Мы применяем многоуровневые инженерные меры безопасности: шифрование трафика (TLS/HTTPS), Row-Level Security для изоляции данных студентов, Token Bucket ограничение частоты запросов (Rate Limiting), хеширование паролей по алгоритму BCrypt с динамической солью, аудиторские триггеры в базе данных PostgreSQL.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              7. Реквизиты оператора персональных данных
            </h2>
            <p className="text-zinc-400">
              Оператор персональных данных: Орынбасар Мурат (Mr Developer)<br />
              Местонахождение: Республика Казахстан, г. Шымкент<br />
              Email для обращений: <a href="mailto:muratorynbasar0@gmail.com" className="text-white underline">muratorynbasar0@gmail.com</a><br />
              Телефон: <a href="tel:+77750584021" className="text-white underline">+7 775 058 40 21</a><br />
              Telegram: <a href="https://t.me/mrsgemaseny" target="_blank" rel="noreferrer" className="text-white underline">@mrsgemaseny</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
