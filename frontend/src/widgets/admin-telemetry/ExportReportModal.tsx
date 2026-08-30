import React, { useState } from 'react';
import { adminAnalyticsApi } from '@/entities/adminAnalyticsApi';
import { Download, FileSpreadsheet, FileJson, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourseId: number | null;
  courses: { id: number; title: string }[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  selectedCourseId,
  courses,
}) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [targetCourseId, setTargetCourseId] = useState<number | 'all'>(
    selectedCourseId || (courses.length > 0 ? courses[0].id : 'all')
  );
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const courseIdArg = targetCourseId === 'all' ? undefined : targetCourseId;

      if (format === 'csv') {
        const blob = await adminAnalyticsApi.exportCsv(courseIdArg);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${courseIdArg ?? 'platform'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await adminAnalyticsApi.getExportJson(courseIdArg);
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json;charset=utf-8',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${courseIdArg ?? 'platform'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      setSuccessMessage(`Отчет (${format.toUpperCase()}) успешно экспортирован и сохранен.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка экспорта отчета');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      data-testid="export-report-modal"
    >
      <div className="w-full max-w-md p-6 bg-[#0a0a0c] border border-white/5 rounded-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] relative">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <h3 id="export-modal-title" className="text-sm font-bold text-white">
              Экспорт аналитики платформы
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Format selection */}
          <div>
            <label className="block text-zinc-400 mb-2">Формат выгрузки:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                  format === 'csv'
                    ? 'bg-zinc-900 border-white/20 text-white shadow-sm'
                    : 'bg-zinc-950/60 border-white/5 text-zinc-400 hover:border-white/10'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">CSV-таблица</div>
                  <div className="text-[10px] text-zinc-500">Excel, Numbers, Sheets</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                  format === 'json'
                    ? 'bg-zinc-900 border-white/20 text-white shadow-sm'
                    : 'bg-zinc-950/60 border-white/5 text-zinc-400 hover:border-white/10'
                }`}
              >
                <FileJson className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">JSON-данные</div>
                  <div className="text-[10px] text-zinc-500">Аналитика, сырые данные</div>
                </div>
              </button>
            </div>
          </div>

          {/* Scope selection */}
          <div>
            <label htmlFor="exportCourseSelect" className="block text-zinc-400 mb-1">
              Область экспорта:
            </label>
            <select
              id="exportCourseSelect"
              value={targetCourseId}
              onChange={(e) =>
                setTargetCourseId(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-white/5 rounded-md text-xs text-white focus:outline-none focus:border-zinc-500"
            >
              <option value="all">Вся платформа (все курсы и метрики)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  Курс: {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Info Notes */}
          <div className="p-3 rounded bg-zinc-900/60 border border-white/5 text-[10px] text-zinc-400 space-y-1">
            <p>Экспорт включает:</p>
            <ul className="list-disc list-inside space-y-0.5 text-zinc-300">
              <li>KPI метрики конверсии и ударного режима (Streak)</li>
              <li>Пошаговую воронку прохождения (Funnel drop-off)</li>
              <li>Когортную таблицу удержания по урокам</li>
              <li>Телеметрию AI Tutor и проблемные точки квизов</li>
            </ul>
          </div>

          {/* Status feedback */}
          {successMessage && (
            <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded bg-red-950/60 border border-red-800/60 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md text-zinc-400 hover:text-white cursor-pointer"
            >
              Закрыть
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="px-4 py-2 bg-[#fafafa] hover:bg-white text-[#09090b] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Экспорт...' : `Скачать ${format.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
