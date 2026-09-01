import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/entities/admin/api/adminApi';
import { Activity, RefreshCw, Server, Database, Cpu, ShieldAlert } from 'lucide-react';

export const AdminSystemPage: React.FC = () => {
  const {
    data: health,
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: adminApi.getSystemHealth,
    refetchInterval: 10000,
  });

  const {
    data: rateLimits,
    isLoading: rateLimitsLoading,
    refetch: refetchRateLimits,
  } = useQuery({
    queryKey: ['admin', 'system-rate-limits'],
    queryFn: adminApi.getRateLimits,
    refetchInterval: 10000,
  });

  const formatUptime = (seconds?: number): string => {
    if (!seconds) return '0с';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}д`);
    if (h > 0) parts.push(`${h}ч`);
    if (m > 0) parts.push(`${m}м`);
    parts.push(`${s}с`);
    return parts.join(' ');
  };

  const handleRefreshAll = () => {
    refetchHealth();
    refetchRateLimits();
  };

  const isLoading = healthLoading || rateLimitsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Infrastructure & Rate Limiting</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Системный монитор и метрики
          </h1>
        </div>
        <button
          type="button"
          onClick={handleRefreshAll}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-white/5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Обновить данные</span>
        </button>
      </div>

      {/* Grid of Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Server Status */}
        <div className="p-4 rounded-lg bg-[#121216] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Статус сервера</span>
            <Server className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
            <span>{health?.status || 'UP'}</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Uptime: {formatUptime(health?.uptimeSeconds)}
          </div>
        </div>

        {/* Database Status */}
        <div className="p-4 rounded-lg bg-[#121216] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>База данных</span>
            <Database className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
            <span>{health?.dbStatus || 'HEALTHY'}</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            PostgreSQL / UTC Time
          </div>
        </div>

        {/* JVM Memory */}
        <div className="p-4 rounded-lg bg-[#121216] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Память JVM</span>
            <Cpu className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {health?.jvmTotalMemoryMb ? `${health.jvmTotalMemoryMb - (health.jvmFreeMemoryMb || 0)} / ${health.jvmTotalMemoryMb} MB` : '—'}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Потоков: {health?.activeThreads ?? '—'}
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="p-4 rounded-lg bg-[#121216] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Ограничения (Rate-Limits)</span>
            <ShieldAlert className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {rateLimits?.totalRejectedRequests ?? 0} отклон.
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Auth: {rateLimits?.authLimitRemaining ?? '—'} | AI: {rateLimits?.aiLimitRemaining ?? '—'}
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="p-6 rounded-lg bg-[#121216] border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Параметры безопасности и изоляции среды</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-zinc-900/60 rounded border border-white/5">
            <span className="text-zinc-500 block mb-1">Row-Level Security (RLS)</span>
            <span className="text-zinc-200">SecurityUtils.getCurrentUserId()</span>
          </div>
          <div className="p-3 bg-zinc-900/60 rounded border border-white/5">
            <span className="text-zinc-500 block mb-1">Drip-content calculation</span>
            <span className="text-zinc-200">NOW() - enrolled_at (UTC)</span>
          </div>
          <div className="p-3 bg-zinc-900/60 rounded border border-white/5">
            <span className="text-zinc-500 block mb-1">Cookie Security</span>
            <span className="text-zinc-200">httpOnly, SameSite=Lax, HMAC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
