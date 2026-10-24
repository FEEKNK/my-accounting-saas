import React from 'react';

export interface KPICardProps {
  title: string;
  value: string | number;
  changePercent?: number; // e.g. +12.5 or -4.2
  periodLabel?: string; // e.g. "เทียบกับเดือนก่อน"
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  changePercent,
  periodLabel = 'เทียบกับเดือนที่แล้ว',
  icon,
  isLoading = false,
  className = '',
}) => {
  const isPositive = typeof changePercent === 'number' && changePercent >= 0;
  const isNegative = typeof changePercent === 'number' && changePercent < 0;

  return (
    <div
      className={`p-5 rounded-md border border-border bg-bg shadow-card flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-muted">{title}</span>
        {icon && <div className="text-text-subtle p-2 rounded-sm bg-surface">{icon}</div>}
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-7 bg-surface-alt rounded w-3/4" />
          <div className="h-4 bg-surface-alt rounded w-1/2" />
        </div>
      ) : (
        <div>
          <div className="text-2xl font-bold text-text font-mono tabular-nums tracking-tight">
            {value}
          </div>

          {typeof changePercent === 'number' && (
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span
                className={`font-semibold inline-flex items-center ${
                  isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-text-muted'
                }`}
              >
                {isPositive ? '↑ +' : '↓ '}
                {changePercent.toFixed(1)}%
              </span>
              <span className="text-text-subtle">{periodLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
