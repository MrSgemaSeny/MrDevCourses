import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateApi } from '@/entities/certificate/api/certificateApi';
import type { Certificate } from '@/shared/types';

export const CertificateVerifyPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError('Код сертификата не указан');
      setIsLoading(false);
      return;
    }

    certificateApi.verifyCertificate(code)
      .then((data) => {
        setCertificate(data);
        setError(null);
      })
      .catch(() => {
        setError('Сертификат с указанным кодом не найден или недействителен.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [code]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#e2b340] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="p-8 rounded-sm bg-[#18181b] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] text-center">
        {error ? (
          <div>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Ошибка верификации</h1>
            <p className="text-xs text-zinc-500 mb-6">{error}</p>
            <Link
              to="/courses"
              className="inline-block px-5 py-2.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-xs text-white transition-colors border border-white/5"
            >
              К каталогу курсов
            </Link>
          </div>
        ) : certificate ? (
          <div>
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ОФИЦИАЛЬНО ПОДТВЕРЖДЕНО
            </span>

            <h1 className="text-2xl font-bold text-white mt-4 mb-1">
              Сертификат подлинный
            </h1>
            <p className="text-xs text-zinc-500 font-mono mb-6">
              ID: {certificate.certificateCode}
            </p>

            <div className="space-y-3 bg-[#0a0a0c] p-5 rounded-sm border border-white/5 text-left text-xs mb-6">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Студент:</span>
                <span className="font-semibold text-white">{certificate.userName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Курс:</span>
                <span className="font-semibold text-[#e2b340]">{certificate.courseTitle}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Дата выдачи:</span>
                <span className="text-white">
                  {new Date(certificate.issuedAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Статус:</span>
                <span className="text-emerald-400 font-semibold">100% Завершено</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={certificateApi.getPdfDownloadUrl(certificate.certificateCode)}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-sm bg-[#238636] hover:bg-[#2ea043] text-xs font-semibold text-white transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                Скачать официальный PDF
              </a>
              <Link
                to="/courses"
                className="px-5 py-2.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-xs text-white transition-colors border border-white/5"
              >
                Все курсы MrDeveloper              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
