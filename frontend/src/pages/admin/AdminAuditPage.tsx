import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, AuditLog } from '@/entities/admin/api/adminApi';
import { Shield, RefreshCw } from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'audit-logs', page],
    queryFn: () => adminApi.getAuditLogs({ page, size: pageSize }),
  });

  const logs = data?.content || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Security & Compliance</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Журнал аудита действий
          </h1>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-white/5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Обновить</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#121216] border border-white/5 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Загрузка журнала аудита...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">Записей в журнале аудита пока нет</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 border-b border-white/5 text-zinc-400 font-mono">
                <tr>
                  <th className="p-3.5">Время (UTC)</th>
                  <th className="p-3.5">Пользователь</th>
                  <th className="p-3.5">Действие</th>
                  <th className="p-3.5">Сущность</th>
                  <th className="p-3.5">IP-адрес</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log: AuditLog) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3.5 text-zinc-400 font-mono">
                      {new Date(log.createdAt).toLocaleString('ru-RU')}
                    </td>
                    <td className="p-3.5 font-medium text-white">
                      {log.userEmail || `ID: ${log.userId}`}
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono px-2 py-0.5 rounded bg-zinc-800 border border-white/10 text-zinc-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-300 font-mono">
                      {log.entityName ? `${log.entityName} #${log.entityId}` : '—'}
                    </td>
                    <td className="p-3.5 text-zinc-400 font-mono">
                      {log.ipAddress || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-white/5 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-400">
            <span>Страница {page + 1} из {totalPages}</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Вперед
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
