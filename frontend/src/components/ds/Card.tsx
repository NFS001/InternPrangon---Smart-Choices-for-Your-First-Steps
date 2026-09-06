import React from 'react';
import { Badge, StatusBadge, type StatusType } from './Badge';
import Rating from './Rating';
import Avatar from './Avatar';
import Button from './Button';

/* ─── Icons ─────────────────────────────────────────────────── */
const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);
const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const ThumbsUpIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

/* ─── Base Card ─────────────────────────────────────────────── */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const padMap = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };

export function Card({ children, className = '', padding = 'md', hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-white border border-neutral-200 rounded-xl',
        hover ? 'hover:shadow-md hover:border-neutral-300 cursor-pointer transition-all duration-200' : 'shadow-sm',
        padMap[padding],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

/* ─── Internship Card ───────────────────────────────────────── */
export interface InternshipData {
  id: string;
  title: string;
  company: string;
  companyInitial?: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  paid: boolean;
  stipend?: string;
  deadline: string;
  daysLeft: number;
  tags: string[];
  isNew?: boolean;
  saved?: boolean;
  applied?: boolean;
}

interface InternshipCardProps {
  data: InternshipData;
  onSave?: (id: string) => void;
  onApply?: (id: string) => void;
  view?: 'grid' | 'list';
}

function CompanyLogo({ initial, size = 'md' }: { initial: string; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-10 h-10 text-base' : 'w-11 h-11 text-lg';
  return (
    <div className={`${s} rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold shrink-0`}>
      {initial}
    </div>
  );
}

export function InternshipCard({ data, onSave, onApply, view = 'grid' }: InternshipCardProps) {
  const isUrgent = data.daysLeft <= 7;
  const initial = data.companyInitial ?? data.company[0];

  if (view === 'list') {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md hover:border-neutral-300 transition-all duration-200 flex gap-4 items-start">
        <CompanyLogo initial={initial} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-neutral-900 text-sm">{data.title}</h3>
                {data.isNew && <StatusBadge status="new" size="sm" />}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{data.company}</p>
            </div>
            <button
              onClick={() => onSave?.(data.id)}
              className={`shrink-0 p-1.5 rounded-lg transition-colors ${data.saved ? 'text-brand-600' : 'text-neutral-400 hover:text-neutral-600'}`}
              aria-label={data.saved ? 'Unsave' : 'Save'}
            >
              <BookmarkIcon filled={data.saved} />
            </button>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-neutral-500"><LocationIcon />{data.location}</span>
            <StatusBadge status={data.type as StatusType} size="sm" />
            <StatusBadge status={data.paid ? 'paid' : 'unpaid'} size="sm" />
            {data.stipend && <span className="text-xs font-semibold text-success-700">{data.stipend}</span>}
          </div>
          {data.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {data.tags.slice(0, 4).map((tag) => <Badge key={tag} size="sm">{tag}</Badge>)}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-danger-600' : 'text-neutral-500'}`}>
            <ClockIcon />{data.daysLeft}d left
          </span>
          {data.applied
            ? <StatusBadge status="under-review" size="sm" />
            : <Button size="sm" onClick={() => onApply?.(data.id)}>Apply</Button>
          }
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md hover:border-neutral-300 transition-all duration-200 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <CompanyLogo initial={initial} />
        <button
          onClick={() => onSave?.(data.id)}
          className={`p-1.5 rounded-lg transition-colors ${data.saved ? 'text-brand-600' : 'text-neutral-400 hover:text-neutral-600'}`}
          aria-label={data.saved ? 'Unsave' : 'Save'}
        >
          <BookmarkIcon filled={data.saved} />
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-neutral-900 text-sm leading-snug">{data.title}</h3>
          {data.isNew && <StatusBadge status="new" size="sm" />}
        </div>
        <p className="text-xs text-neutral-500 mt-1">{data.company}</p>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <StatusBadge status={data.type as StatusType} size="sm" />
        <StatusBadge status={data.paid ? 'paid' : 'unpaid'} size="sm" />
      </div>

      <span className="flex items-center gap-1 text-xs text-neutral-500">
        <LocationIcon />{data.location}
      </span>

      {data.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {data.tags.slice(0, 3).map((tag) => <Badge key={tag} size="sm">{tag}</Badge>)}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <span className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-danger-600' : 'text-neutral-500'}`}>
          <ClockIcon />{data.daysLeft} days left
        </span>
        {data.stipend && <span className="text-xs font-semibold text-success-700">{data.stipend}</span>}
      </div>

      {data.applied
        ? <div className="flex justify-center"><StatusBadge status="under-review" /></div>
        : <Button fullWidth size="sm" onClick={() => onApply?.(data.id)}>Apply Now</Button>
      }
    </div>
  );
}

/* ─── Company Card ──────────────────────────────────────────── */
export interface CompanyData {
  id: string;
  name: string;
  industry: string;
  size: string;
  rating: number;
  reviewCount: number;
  activeInternships: number;
  verified: boolean;
  location: string;
}

interface CompanyCardProps {
  data: CompanyData;
  onClick?: () => void;
}

export function CompanyCard({ data, onClick }: CompanyCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md hover:border-neutral-300 transition-all duration-200 cursor-pointer flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl shrink-0">
          {data.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-semibold text-neutral-900 text-sm">{data.name}</h3>
            {data.verified && <StatusBadge status="verified" size="sm" />}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">{data.industry}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Rating value={data.rating} size="sm" showValue />
        <span className="text-xs text-neutral-400">({data.reviewCount} reviews)</span>
      </div>

      <div className="grid grid-cols-2 gap-3 py-2 border-t border-b border-neutral-100">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-neutral-400 font-medium">Team size</p>
          <p className="text-xs font-medium text-neutral-700 mt-0.5">{data.size} people</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-neutral-400 font-medium">Open roles</p>
          <p className="text-xs font-semibold text-brand-600 mt-0.5">{data.activeInternships} internships</p>
        </div>
      </div>

      <span className="flex items-center gap-1 text-xs text-neutral-500">
        <LocationIcon />{data.location}
      </span>
    </div>
  );
}

/* ─── Review Card ───────────────────────────────────────────── */
export interface ReviewData {
  id: string;
  rating: number;
  title: string;
  body: string;
  role: string;
  date: string;
  helpful: number;
  tags: string[];
  voted?: boolean;
}

interface ReviewCardProps {
  data: ReviewData;
  onHelpful?: (id: string) => void;
}

export function ReviewCard({ data, onHelpful }: ReviewCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar name="A U" size="sm" />
          <div>
            <p className="text-xs font-semibold text-neutral-800">Anonymous</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">{data.role} · {data.date}</p>
          </div>
        </div>
        <Rating value={data.rating} size="sm" />
      </div>

      <div>
        <h4 className="font-semibold text-sm text-neutral-900 mb-1">{data.title}</h4>
        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">{data.body}</p>
      </div>

      {data.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {data.tags.map((tag) => <Badge key={tag} size="sm">{tag}</Badge>)}
        </div>
      )}

      <div className="flex items-center pt-2 border-t border-neutral-100">
        <button
          onClick={() => onHelpful?.(data.id)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${data.voted ? 'text-brand-600' : 'text-neutral-400 hover:text-brand-600'}`}
        >
          <ThumbsUpIcon />
          Helpful ({data.helpful})
        </button>
      </div>
    </div>
  );
}

/* ─── Notification Item ─────────────────────────────────────── */
export type NotifType = 'application' | 'review' | 'badge' | 'system' | 'deadline';

export interface NotifData {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const notifIcons: Record<NotifType, React.ReactNode> = {
  application: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  review: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  badge: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  system: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  deadline: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

const notifColors: Record<NotifType, string> = {
  application: 'bg-brand-50 text-brand-600',
  review:      'bg-info-50 text-info-600',
  badge:       'bg-accent-50 text-accent-600',
  system:      'bg-neutral-100 text-neutral-500',
  deadline:    'bg-danger-50 text-danger-600',
};

interface NotifItemProps {
  data: NotifData;
  onRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function NotifItem({ data, onRead, onDismiss }: NotifItemProps) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${!data.read ? 'bg-brand-50/50' : 'hover:bg-neutral-50'}`}
      onClick={() => onRead?.(data.id)}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notifColors[data.type]}`}>
        {notifIcons[data.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${!data.read ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'}`}>
            {data.title}
          </p>
          {!data.read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />}
        </div>
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{data.body}</p>
        <p className="text-[10px] text-neutral-400 mt-1">{data.time}</p>
      </div>
    </div>
  );
}
