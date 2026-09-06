import React from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
  icon?: boolean;
}

const configs: Record<AlertVariant, { wrapper: string; iconWrapper: string; title: string; body: string; icon: React.ReactNode }> = {
  info: {
    wrapper: 'bg-info-50 border-info-200',
    iconWrapper: 'text-info-500',
    title: 'text-info-800',
    body: 'text-info-700',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  success: {
    wrapper: 'bg-success-50 border-success-200',
    iconWrapper: 'text-success-600',
    title: 'text-success-800',
    body: 'text-success-700',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  warning: {
    wrapper: 'bg-warning-50 border-warning-200',
    iconWrapper: 'text-warning-600',
    title: 'text-warning-800',
    body: 'text-warning-700',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  error: {
    wrapper: 'bg-danger-50 border-danger-200',
    iconWrapper: 'text-danger-500',
    title: 'text-danger-800',
    body: 'text-danger-700',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
};

export default function Alert({ variant = 'info', title, children, onDismiss, className = '', icon = true }: AlertProps) {
  const c = configs[variant];
  return (
    <div className={`flex gap-3 p-3.5 border rounded-xl ${c.wrapper} ${className}`} role="alert">
      {icon && (
        <span className={`shrink-0 mt-0.5 ${c.iconWrapper}`}>{c.icon}</span>
      )}
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-semibold leading-snug ${c.title}`}>{title}</p>}
        {children && (
          <div className={`text-sm leading-relaxed ${title ? 'mt-1' : ''} ${c.body}`}>
            {children}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`shrink-0 opacity-60 hover:opacity-100 transition-opacity ${c.iconWrapper}`}
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ─── Toast ─────────────────────────────────────────────────── */
export interface ToastProps {
  variant?: AlertVariant;
  title: string;
  body?: string;
  onDismiss?: () => void;
}

export function Toast({ variant = 'info', title, body, onDismiss }: ToastProps) {
  const c = configs[variant];
  return (
    <div className={`flex items-start gap-3 px-4 py-3 bg-white border rounded-xl shadow-lg min-w-[280px] max-w-sm ${c.wrapper}`}>
      <span className={`shrink-0 mt-0.5 ${c.iconWrapper}`}>{c.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${c.title}`}>{title}</p>
        {body && <p className={`text-xs mt-0.5 ${c.body}`}>{body}</p>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-neutral-400 hover:text-neutral-600 mt-0.5" aria-label="Close">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
