import React from 'react';
import { AdminAnalyticsDashboard } from '@/widgets/admin-telemetry';
import { BarChart3 } from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Platform Telemetry & Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Аналитика и телеметрия платформы
          </h1>
        </div>
      </div>

      {/* Main Dashboard Widget */}
      <AdminAnalyticsDashboard />
    </div>
  );
};
