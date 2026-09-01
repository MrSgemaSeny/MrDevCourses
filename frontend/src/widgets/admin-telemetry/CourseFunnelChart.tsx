import React from 'react';
import { CourseFunnelStep } from '@/entities/adminAnalyticsApi';

interface CourseFunnelChartProps {
  steps: CourseFunnelStep[];
}

export const CourseFunnelChart: React.FC<CourseFunnelChartProps> = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-900/60 border border-white/5 rounded-sm text-zinc-400 text-xs">
        Нет данных воронки для отображения.
      </div>
    );
  }

  const maxCount = Math.max(...steps.map((s) => s.studentsCount), 1);
  const rowHeight = 44;
  const gap = 10;
  const svgHeight = steps.length * (rowHeight + gap) + 20;
  const svgWidth = 700;
  const barStartX = 180;
  const maxBarWidth = svgWidth - barStartX - 130;

  return (
    <div className="w-full overflow-x-auto" data-testid="course-funnel-chart">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto"
        role="img"
        aria-label="График воронки прохождения курса"
      >
        <defs>
          <linearGradient id="funnelBarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#27272a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#52525b" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="funnelCompleteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#52525b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a1a1aa" stopOpacity="1" />
          </linearGradient>
        </defs>

        {steps.map((step, idx) => {
          const y = idx * (rowHeight + gap) + 10;
          const barWidth = maxCount > 0 ? Math.max((step.studentsCount / maxCount) * maxBarWidth, 6) : 6;
          const isCompleteStep = idx === steps.length - 1 && steps.length > 1;
          const gradientId = isCompleteStep ? 'url(#funnelCompleteGradient)' : 'url(#funnelBarGradient)';

          return (
            <g key={`step-${step.stepOrder}-${idx}`} className="transition-all duration-300">
              {/* Step Label */}
              <text
                x={barStartX - 12}
                y={y + 22}
                textAnchor="end"
                fill="#d4d4d8"
                fontSize="11"
                fontWeight="500"
                className="font-sans"
              >
                {step.stepName.length > 24 ? `${step.stepName.substring(0, 24)}...` : step.stepName}
              </text>

              {/* Background track */}
              <rect
                x={barStartX}
                y={y + 6}
                width={maxBarWidth}
                height={24}
                rx={4}
                fill="#18181b"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={1}
              />

              {/* Filled bar */}
              <rect
                x={barStartX}
                y={y + 6}
                width={barWidth}
                height={24}
                rx={4}
                fill={gradientId}
              />

              {/* Student count & conversion inside/outside bar */}
              <text
                x={barStartX + 10}
                y={y + 22}
                fill="#ffffff"
                fontSize="11"
                fontWeight="600"
                className="font-mono"
              >
                {step.studentsCount} чел. ({step.conversionRate}%)
              </text>

              {/* Drop-off rate badge on the right */}
              {idx > 0 && step.dropOffRate > 0 && (
                <g>
                  <rect
                    x={barStartX + maxBarWidth + 12}
                    y={y + 8}
                    width={68}
                    height={20}
                    rx={3}
                    fill="rgba(255, 255, 255, 0.04)"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={1}
                  />
                  <text
                    x={barStartX + maxBarWidth + 46}
                    y={y + 22}
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize="10"
                    fontWeight="500"
                    className="font-mono"
                  >
                    -{step.dropOffRate}%
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
