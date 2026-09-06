import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:  'bg-neutral-100  text-neutral-600  border-neutral-200',
  primary:  'bg-brand-50    text-brand-700    border-brand-200',
  accent:   'bg-accent-50   text-accent-700   border-accent-200',
  success:  'bg-success-50  text-success-700  border-success-200',
  warning:  'bg-warning-50  text-warning-700  border-warning-200',
  danger:   'bg-danger-50   text-danger-700   border-danger-200',
  info:     'bg-info-50     text-info-700     border-info-200',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-neutral-400',
  primary: 'bg-brand-500',
  accent:  'bg-accent-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger:  'bg-danger-500',
  info:    'bg-info-500',
};

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  dot,
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 border rounded-full font-medium leading-none',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

/* ─── Status Badge ──────────────────────────────────────────── */

export type StatusType =
  | 'pending' | 'under-review' | 'interview' | 'accepted' | 'rejected' | 'withdrawn'
  | 'new' | 'verified' | 'unverified' | 'pending-verification'
  | 'paid' | 'unpaid'
  | 'remote' | 'onsite' | 'hybrid';

const statusConfig: Record<StatusType, { label: string; variant: BadgeVariant; dot?: boolean }> = {
  'pending':              { label: 'Pending',             variant: 'default', dot: true },
  'under-review':         { label: 'Under Review',        variant: 'info',    dot: true },
  'interview':            { label: 'Interview',           variant: 'warning', dot: true },
  'accepted':             { label: 'Accepted',            variant: 'success', dot: true },
  'rejected':             { label: 'Rejected',            variant: 'danger',  dot: true },
  'withdrawn':            { label: 'Withdrawn',           variant: 'default', dot: true },
  'new':                  { label: 'New',                 variant: 'accent' },
  'verified':             { label: 'Verified',            variant: 'success' },
  'unverified':           { label: 'Unverified',          variant: 'default' },
  'pending-verification': { label: 'Pending Verification', variant: 'warning' },
  'paid':                 { label: 'Paid',                variant: 'success' },
  'unpaid':               { label: 'Unpaid',              variant: 'default' },
  'remote':               { label: 'Remote',              variant: 'primary' },
  'onsite':               { label: 'On-site',             variant: 'default' },
  'hybrid':               { label: 'Hybrid',              variant: 'info' },
};

export interface StatusBadgeProps {
  status: StatusType;
  size?: BadgeSize;
}

export function StatusBadge({ status, size }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size={size} dot={config.dot}>
      {config.label}
    </Badge>
  );
}
