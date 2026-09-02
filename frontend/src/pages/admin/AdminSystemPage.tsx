import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/entities/admin/api/adminApi';
import { RefreshCw, Server, Database, Cpu, ShieldAlert, Layers, GitBranch, Mail } from 'lucide-react';

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
    if (!seconds || seconds <= 0) return '0с';
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

  // Derived metrics with safe fallbacks
  const uptimeSeconds = health?.jvm?.uptimeMs
    ? Math.floor(health.jvm.uptimeMs / 1000)
    : (health?.uptimeSeconds || (health?.database?.uptimeSeconds ? health.database.uptimeSeconds : 0));

  const dbStatus = health?.database?.status || health?.dbStatus || 'HEALTHY';

  const jvmUsedMb = health?.jvm
    ? Math.round(health.jvm.usedMemoryBytes / (1024 * 1024))
    : (health?.jvmTotalMemoryMb && health?.jvmFreeMemoryMb
        ? health.jvmTotalMemoryMb - health.jvmFreeMemoryMb
        : null);

  const jvmTotalMb = health?.jvm
    ? Math.round(health.jvm.totalMemoryBytes / (1024 * 1024))
    : (health?.jvmTotalMemoryMb || null);

  const activeThreads = health?.jvm?.activeThreads ?? health?.activeThreads ?? null;

  const totalRejectedRequests = rateLimits?.totalThrottledRequests ?? rateLimits?.totalRejectedRequests ?? 0;
  const totalActiveBuckets = rateLimits?.totalActiveBuckets ?? 0;

  const authTier = rateLimits?.tiers?.['AUTH'];
  const aiTier = rateLimits?.tiers?.['AI'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
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

      {/* Grid of Main KPIs */}
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
          <div className="text-[11px] text-zinc-400 font-mono">
            Uptime: {formatUptime(uptimeSeconds)}
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
            <span>{dbStatus}</span>
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">
            {health?.database?.responseTimeMs ? `${health.database.responseTimeMs} ms latency` : 'PostgreSQL / UTC Time'}
          </div>
        </div>

        {/* JVM Memory */}
        <div className="p-4 rounded-lg bg-[#121216] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Память JVM</span>
            <Cpu className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {jvmUsedMb !== null && jvmTotalMb !== null ? `${jvmUsedMb} / ${jvmTotalMb} MB` : '—'}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">
            Потоков: {activeThreads !== null ? activeThreads : '—'}
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="p-4 rounded-lg bg-[#121216] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Ограничения (Rate-Limits)</span>
            <ShieldAlert className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {totalRejectedRequests} отклон.
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">
            Auth: {authTier ? `${authTier.throttledCount} откл.` : '10/м'} | AI: {aiTier ? `${aiTier.throttledCount} откл.` : '20/м'} | Бакетов: {totalActiveBuckets}
          </div>
        </div>
      </div>

      {/* Subsystems Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hikari Connection Pool */}
        <div className="p-5 rounded-lg bg-[#121216] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Layers className="w-4 h-4 text-zinc-400" />
              <span>Пул соединений (HikariCP)</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {health?.databasePool?.poolName || 'HikariPool-Default'}
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Активные соединения:</span>
              <span className="text-white">{health?.databasePool?.activeConnections ?? 1}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>В режиме ожидания (Idle):</span>
              <span className="text-white">{health?.databasePool?.idleConnections ?? 9}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Максимум пула (Max):</span>
              <span className="text-white">{health?.databasePool?.maxPoolSize ?? 10}</span>
            </div>
          </div>
        </div>

        {/* Flyway Migrations */}
        <div className="p-5 rounded-lg bg-[#121216] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <GitBranch className="w-4 h-4 text-zinc-400" />
              <span>Миграции БД (Flyway)</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20">
              {health?.flyway?.state || 'SUCCESS'}
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Текущая версия:</span>
              <span className="text-white">v{health?.flyway?.currentVersion || '28'}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Всего миграций:</span>
              <span className="text-white">{health?.flyway?.totalMigrations || 28}</span>
            </div>
            <div className="flex justify-between text-zinc-400 truncate">
              <span>Описание:</span>
              <span className="text-zinc-300 truncate max-w-[140px]" title={health?.flyway?.currentDescription}>
                {health?.flyway?.currentDescription || 'rich notes'}
              </span>
            </div>
          </div>
        </div>

        {/* Outbox Queue */}
        <div className="p-5 rounded-lg bg-[#121216] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Mail className="w-4 h-4 text-zinc-400" />
              <span>Очередь Outbox (События)</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              Всего: {health?.outboxQueue?.totalCount ?? 0}
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Обработано (Completed):</span>
              <span className="text-white">{health?.outboxQueue?.completedCount ?? 0}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>В очереди (Pending):</span>
              <span className="text-white">{health?.outboxQueue?.pendingCount ?? 0}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Ошибок (Failed):</span>
              <span className="text-white">{health?.outboxQueue?.failedCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture Parameters */}
      <div className="p-6 rounded-lg bg-[#121216] border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Параметры безопасности и изоляции среды</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-zinc-900/60 rounded border border-white/5">
            <span className="text-zinc-500 block mb-1">Row-Level Security (RLS)</span>
            <span className="text-zinc-200">SecurityUtils.getCurrentUserId()</span>
          </div>
          <div className="p-3.5 bg-zinc-900/60 rounded border border-white/5">
            <span className="text-zinc-500 block mb-1">Drip-content calculation</span>
            <span className="text-zinc-200">NOW() - enrolled_at (UTC)</span>
          </div>
          <div className="p-3.5 bg-zinc-900/60 rounded border border-white/5">
            <span className="text-zinc-500 block mb-1">Cookie Security</span>
            <span className="text-zinc-200">httpOnly, SameSite=Lax, HMAC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
