import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';

export const RefundPolicyPage: React.FC = () => {
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
            Политика возврата средств (Refund Policy)
          </h1>
          <p className="text-xs font-mono text-zinc-500">
            Последнее обновление: 1 сентября 2026 г. | Юрисдикция: Республика Казахстан
          </p>
        </div>

        <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/10 shadow-xl space-y-6 text-xs text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              1. Общие условия возврата
            </h2>
            <p>
              Настоящая Политика возврата средств регламентирует порядок и условия возврата денежных средств за платные образовательные программы и тарифы платформы <strong>MrDeveloper</strong> в соответствии с Законом Республики Казахстан от 4 мая 2010 года № 274-IV «О защите прав потребителей» и Гражданским кодексом Республики Казахстан.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              2. Сроки и условия подачи заявки на возврат
            </h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">14-дневный гарантийный период:</strong> Студент вправе запросить 100% возврат уплаченных средств в течение 14 (четырнадцати) календарных дней с момента оплаты курса при условии, что пройдено не более 20% учебных модулей и не сдавались итоговые проектные работы на проверку ментору.
              </li>
              <li>
                <strong className="text-zinc-200">Тарифы с персональным менторством:</strong> При отказе от обучения на тарифах с персональным сопровождением после истечения 14 дней или при прохождении более 20% программы, сумма возврата рассчитывается пропорционально оставшимся неиспользованным неделям обучения за вычетом фактически понесенных расходов Исполнителя на индивидуальные консультации и код-ревью.
              </li>
              <li>
                <strong className="text-zinc-200">Бесплатные материалы и пробные уроки:</strong> Уроки категории Free Preview предоставляются на безвозмездной основе и не подлежат финансовым претензиям.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              3. Порядок оформления возврата
            </h2>
            <p>
              Для оформления возврата средств студенту необходимо отправить письменное заявление на электронную почту <a href="mailto:muratorynbasar0@gmail.com" className="text-white underline">muratorynbasar0@gmail.com</a> или через официальный Telegram-канал поддержки <a href="https://t.me/mrsgemaseny" target="_blank" rel="noreferrer" className="text-white underline">@mrsgemaseny</a> с указанием:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>ФИО плательщика и email, привязанного к аккаунту;</li>
              <li>Названия курса и выбранного тарифа;</li>
              <li>Даты и способа совершения платежа (квитанция, банковский чек);</li>
              <li>Причины обращения за возвратом;</li>
              <li>Банковских реквизитов счета, с которого была произведена оплата.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              4. Сроки рассмотрения и перечисления средств
            </h2>
            <p>
              Заявление на возврат рассматривается Исполнителем в течение 3 (трех) рабочих дней с момента получения. При положительном решении денежные средства возвращаются тем же способом, которым была совершена оплата, в срок от 3 до 10 банковских дней (в зависимости от регламента банка-эмитента плательщика).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              5. Реквизиты исполнителя
            </h2>
            <p className="text-zinc-400">
              Исполнитель: Орынбасар Мурат (Mr Developer)<br />
              Республика Казахстан, г. Шымкент<br />
              Email: <a href="mailto:muratorynbasar0@gmail.com" className="text-white underline">muratorynbasar0@gmail.com</a><br />
              Телефон: <a href="tel:+77750584021" className="text-white underline">+7 775 058 40 21</a><br />
              Telegram: <a href="https://t.me/mrsgemaseny" target="_blank" rel="noreferrer" className="text-white underline">@mrsgemaseny</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
