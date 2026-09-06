import { useState } from 'react';
import type { Navigate } from '../../data/index';
import { ADMIN_ACTIVITY } from '../../data/index';

function ActivityIcon({ type }: { type: string }) {
  if (type === 'verification_approved') {
    return (
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (type === 'verification_rejected') {
    return (
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-500 flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  if (type === 'review_deleted') {
    return (
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-500 flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </span>
    );
  }
  if (type === 'review_dismissed') {
    return (
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 text-neutral-500 flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  if (type === 'company_registered') {
    return (
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      </span>
    );
  }
  if (type === 'internship_posted') {
    return (
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 text-neutral-400 flex-shrink-0">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </span>
  );
}

type FilterKey = 'all' | 'verifications' | 'reviews' | 'companies' | 'internships';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'verifications', label: 'Verifications' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'companies', label: 'Companies' },
  { key: 'internships', label: 'Internships' },
];

function matchesFilter(type: string, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'verifications') return type === 'verification_approved' || type === 'verification_rejected';
  if (filter === 'reviews') return type === 'review_deleted' || type === 'review_dismissed';
  if (filter === 'companies') return type === 'company_registered';
  if (filter === 'internships') return type === 'internship_posted';
  return true;
}

export default function AdminActivityPage({ navigate: _navigate }: { navigate: Navigate }) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = ADMIN_ACTIVITY.filter((item) => matchesFilter(item.type, filter));

  return (
    <div className="px-8 py-8 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Activity Log</h1>
        <p className="text-xs text-neutral-400 mt-0.5">All platform events and admin actions.</p>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-1 mb-5 bg-white border border-neutral-200 rounded-xl px-3 py-2 w-fit">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={[
              'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
              filter === opt.key
                ? 'bg-brand-600 text-white'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg className="w-10 h-10 text-neutral-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-neutral-400">No activity matches this filter.</p>
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div
              key={item.id ?? idx}
              className="flex items-start gap-4 px-5 py-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors"
            >
              <ActivityIcon type={item.type} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 leading-snug">{item.description}</p>
                {item.target && (
                  <p className="text-sm text-neutral-500 mt-0.5">{item.target}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {item.adminName && item.adminName !== 'System' && (
                    <span className="text-xs text-neutral-400">by {item.adminName}</span>
                  )}
                  <span className="text-xs text-neutral-400">{item.timestamp}</span>
                </div>
              </div>

              <span className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                {item.timeAgo}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
