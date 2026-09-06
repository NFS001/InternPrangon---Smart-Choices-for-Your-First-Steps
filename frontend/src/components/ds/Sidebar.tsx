import React, { useState } from 'react';
import Avatar from './Avatar';
import { Badge } from './Badge';

/* ─── Icon helpers ──────────────────────────────────────────── */
function Icon({ d, d2, children }: { d?: string; d2?: string; children?: React.ReactNode }) {
  if (children) return <>{children}</>;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d && <path d={d} />}
      {d2 && <path d={d2} />}
    </svg>
  );
}

const icons = {
  dashboard:    <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
  search:       <Icon><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></Icon>,
  saved:        <Icon d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />,
  applications: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" d2="M14 2v6h6" />,
  companies:    <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" d2="M9 22V12h6v10" />,
  reviews:      <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  profile:      <Icon><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></Icon>,
  badges:       <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14" d2="M22 4 12 14.01l-3-3" />,
  settings:     <Icon><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></Icon>,
};

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  section?: string;
}

const studentNav: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',        icon: icons.dashboard,    section: 'main' },
  { id: 'search',       label: 'Find Internships',  icon: icons.search,       section: 'main', badge: 'New' },
  { id: 'saved',        label: 'Saved',             icon: icons.saved,        section: 'main', badge: 12 },
  { id: 'applications', label: 'Applications',      icon: icons.applications, section: 'main', badge: 4 },
  { id: 'companies',    label: 'Companies',         icon: icons.companies,    section: 'explore' },
  { id: 'reviews',      label: 'Reviews',           icon: icons.reviews,      section: 'explore' },
  { id: 'profile',      label: 'My Profile',        icon: icons.profile,      section: 'account' },
  { id: 'badges',       label: 'Badges & Points',   icon: icons.badges,       section: 'account' },
  { id: 'settings',     label: 'Settings',          icon: icons.settings,     section: 'account' },
];

const sections = [
  { id: 'main',    label: 'Menu' },
  { id: 'explore', label: 'Explore' },
  { id: 'account', label: 'Account' },
];

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
  userName?: string;
  userEmail?: string;
  points?: number;
}

export default function Sidebar({
  activeItem = 'dashboard',
  onItemClick,
  userName = 'Riya Hossain',
  userEmail = 'riya@university.edu',
  points = 1240,
}: SidebarProps) {
  const [active, setActive] = useState(activeItem);

  function handleClick(id: string) {
    setActive(id);
    onItemClick?.(id);
  }

  return (
    <aside className="w-56 h-full bg-white border-r border-neutral-200 flex flex-col">
      {/* User info */}
      <div className="p-4 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <Avatar name={userName} size="md" status="online" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutral-900 truncate">{userName}</p>
            <p className="text-xs text-neutral-400 truncate">{userEmail}</p>
          </div>
        </div>
        {/* Points */}
        <div className="mt-3 flex items-center justify-between bg-brand-50 rounded-lg px-2.5 py-1.5">
          <span className="text-xs text-brand-700 font-medium">Contributor Points</span>
          <span className="text-xs font-bold text-brand-600">{points.toLocaleString()} pts</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {sections.map((section) => {
          const items = studentNav.filter((n) => n.section === section.id);
          return (
            <div key={section.id} className="mb-4">
              <p className="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                {section.label}
              </p>
              {items.map((item) => {
                const isActive = item.id === active;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleClick(item.id)}
                    className={[
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-100',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                    ].join(' ')}
                  >
                    <span className={`shrink-0 ${isActive ? 'text-brand-600' : 'text-neutral-400'}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && (
                      <Badge
                        variant={typeof item.badge === 'string' ? 'accent' : isActive ? 'primary' : 'default'}
                        size="sm"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-100">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-500 hover:bg-danger-50 hover:text-danger-600 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log out
        </button>
      </div>
    </aside>
  );
}
