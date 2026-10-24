import React from 'react';

export type StatusVariant =
  | 'draft'
  | 'approved'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'voided'
  | 'converted'
  | 'active'
  | 'inactive';

export interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<StatusVariant, { label: string; style: string }> = {
  draft: {
    label: 'ร่าง',
    style: 'bg-surface-alt text-text-muted border-border-strong',
  },
  approved: {
    label: 'อนุมัติแล้ว',
    style: 'bg-info-surface text-info-text border-info-surface',
  },
  paid: {
    label: 'ชำระแล้ว',
    style: 'bg-success-surface text-success-text border-success-surface',
  },
  partially_paid: {
    label: 'ชำระบางส่วน',
    style: 'bg-warning-surface text-warning-text border-warning-surface',
  },
  overdue: {
    label: 'เกินกำหนด',
    style: 'bg-danger-surface text-danger-text border-danger-surface font-semibold animate-pulse',
  },
  voided: {
    label: 'ยกเลิก',
    style: 'bg-surface-alt text-text-subtle border-border line-through',
  },
  converted: {
    label: 'แปลงเอกสารแล้ว',
    style: 'bg-info-surface text-info-text border-info-surface',
  },
  active: {
    label: 'ใช้งานอยู่',
    style: 'bg-success-surface text-success-text border-success-surface',
  },
  inactive: {
    label: 'ปิดใช้งาน',
    style: 'bg-surface-alt text-text-subtle border-border',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const config = statusConfig[status] || statusConfig.draft;
  const displayLabel = label || config.label;

  const sizeStyle =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-pill border select-none ${sizeStyle} ${config.style} ${className}`}
      role="status"
      aria-label={`สถานะ: ${displayLabel}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5" aria-hidden="true" />
      {displayLabel}
    </span>
  );
};
