import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className="py-12 px-4 text-center rounded-md border border-dashed border-border bg-surface/50 max-w-lg mx-auto my-6 space-y-3">
      <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <p className="text-xs text-text-muted leading-relaxed">{description}</p>
      {(actionText && (actionHref || onActionClick)) && (
        <div className="pt-2">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="primary" size="sm">
                {actionText}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="sm" onClick={onActionClick}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
