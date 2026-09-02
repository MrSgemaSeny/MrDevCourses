import React from 'react';
import { AdminAnalyticsDashboard } from '@/widgets/admin-telemetry';

export const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
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
