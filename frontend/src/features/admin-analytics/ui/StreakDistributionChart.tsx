import React from 'react';
import { StreakDistribution } from '@/entities/admin/api/adminAnalyticsApi';

interface StreakDistributionChartProps {
  distributions: StreakDistribution[];
}

export const StreakDistributionChart: React.FC<StreakDistributionChartProps> = ({ distributions }) => {
  if (!distributions || distributions.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-900/60 border border-white/5 rounded-sm text-zinc-400 text-xs">
        Нет данных о распределении ударного режима.
      </div>
    );
  }

  const maxCount = Math.max(...distributions.map((d) => d.count), 1);
  const chartHeight = 180;
  const chartWidth = 540;
  const barWidth = 56;
  const paddingLeft = 40;
  const paddingBottom = 40;
  const availableWidth = chartWidth - paddingLeft - 20;
  const stepX = availableWidth / distributions.length;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + paddingBottom}`}
        className="w-full h-auto"
        role="img"
        aria-label="Распределение активности по дням подряд"
      >
        <defs>
          <linearGradient id="streakBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = chartHeight - ratio * (chartHeight - 30);
          return (
            <g key={`grid-${i}`}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - 20}
                y2={y}
                stroke="#27272a"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                textAnchor="end"
                fill="#71717a"
                fontSize="9"
                className="font-mono"
              >
                {Math.round(ratio * maxCount)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {distributions.map((dist, idx) => {
          const barHeight = maxCount > 0 ? (dist.count / maxCount) * (chartHeight - 30) : 0;
          const x = paddingLeft + idx * stepX + (stepX - barWidth) / 2;
          const y = chartHeight - barHeight;

          return (
            <g key={`streak-${dist.range}-${idx}`}>
              {/* Bar background */}
              <rect
                x={x}
                y={30}
                width={barWidth}
                height={chartHeight - 30}
                rx={4}
                fill="#18181b"
                stroke="#27272a"
                strokeWidth={1}
              />

              {/* Active Bar */}
              {barHeight > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill="url(#streakBarGradient)"
                />
              )}

              {/* Top value */}
              <text
                x={x + barWidth / 2}
                y={Math.min(y - 6, chartHeight - 10)}
                textAnchor="middle"
                fill="#fafafa"
                fontSize="10"
                fontWeight="600"
                className="font-mono"
              >
                {dist.count}
              </text>

              {/* Percentage */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 16}
                textAnchor="middle"
                fill="#a1a1aa"
                fontSize="9"
                className="font-mono"
              >
                {dist.percentage}%
              </text>

              {/* Range label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 30}
                textAnchor="middle"
                fill="#d4d4d8"
                fontSize="10"
                fontWeight="500"
                className="font-sans"
              >
                {dist.range}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
