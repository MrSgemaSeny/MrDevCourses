import React, { useEffect } from 'react';
import { Award, CheckCircle2, Download, X } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  courseTitle: string;
  completedAt?: string;
  certificateCode?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  studentName,
  courseTitle,
  completedAt,
  certificateCode = 'MRDEV-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="relative w-full max-w-2xl p-8 rounded-sm bg-[#0a0a0c] border-2 border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-zinc-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Закрыть модальное окно"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Frame */}
        <div className="p-8 rounded-sm border border-white/5 bg-[#18181b] text-center relative z-10">
          <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600/60 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Award className="w-6 h-6" />
          </div>

          <span id="certificate-title" className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            Сертификат об окончании
          </span>

          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-2 mb-4">
            MrDeveloper
          </h2>

          <p className="text-xs text-zinc-400 mb-1">Настоящим подтверждается, что</p>
          <h3 className="text-sm font-bold text-white mb-2 underline decoration-zinc-600 underline-offset-8">
            {studentName}
          </h3>

          <p className="text-xs text-zinc-400 mb-2">успешно освоил(а) программу курса</p>
          <div className="text-xs font-semibold text-zinc-200 mb-6 bg-zinc-900/80 py-2 px-4 rounded-sm inline-block border border-white/5">
            {courseTitle}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-zinc-500 pt-4 border-t border-white/5 gap-2">
            <div>Дата: {formattedDate}</div>
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Верифицирован: {certificateCode}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <a
            href={`/certificates/verify/${certificateCode}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#e2b340] hover:underline font-mono"
          >
            Проверить подлинность сертификата →
          </a>

          <div className="flex items-center gap-2">
            <a
              href={`/api/v1/certificates/${certificateCode}/pdf`}
              target="_blank"
              rel="noreferrer"
              aria-label="Скачать официальный PDF сертификат"
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <Download className="w-4 h-4" />
              <span>Официальный PDF</span>
            </a>
            <button
              onClick={() => window.print()}
              aria-label="Распечатать сертификат"
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all border border-white/5 cursor-pointer"
            >
              <span>Печать</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
