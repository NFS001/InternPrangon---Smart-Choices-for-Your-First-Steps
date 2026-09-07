import React, { useState, useEffect } from 'react';
import type { Navigate } from '../../data/index';
import { LogoMark } from '../../pages/DesignSystemPage';
import { getSavedUser, getStudentProfile, type ApiUser } from '../../api/client';

interface StudentSidebarProps {
  currentPage: string;
  navigate: Navigate;
  onLogout: () => void;
  currentUser?: ApiUser | null;
}

function getInitials(name?: string) {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: 'internships',
    label: 'Browse',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'applications',
    label: 'My Applications',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: 'write-review',
    label: 'Write Review',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    id: 'contributors',
    label: 'Contributors',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

// Mobile bottom tab items (5 most important)
const MOBILE_TABS = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: 'internships',
    label: 'Browse',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'applications',
    label: 'Applied',
    badge: true,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function StudentSidebar({ currentPage, navigate, onLogout, currentUser }: StudentSidebarProps) {
  const user = currentUser ?? getSavedUser();
  const [profile, setProfile] = useState<{ points: number; badge: string }>({
    points: 0,
    badge: 'Newbie'
  });

  const fetchProfile = () => {
    getStudentProfile()
      .then((res) => {
        if (res.profile) {
          setProfile({
            points: res.profile.points ?? 0,
            badge: res.profile.badge ?? 'Newbie'
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProfile();
    const handleUpdate = () => fetchProfile();
    window.addEventListener('profile-updated', handleUpdate);
    return () => window.removeEventListener('profile-updated', handleUpdate);
  }, [user?.id, currentPage]);

  const displayName = user?.name || 'Student';
  const displayEmail = user?.email || 'student@internprangon.com';
  const initials = getInitials(displayName);

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex w-56 shrink-0 bg-white border-r border-neutral-200 flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 px-5 h-[68px] border-b border-neutral-100 shrink-0 group hover:bg-neutral-50 transition-colors"
        >
          <LogoMark size={28} />
          <span
            className="font-display italic text-[16px] font-bold text-neutral-900 group-hover:text-brand-700 transition-colors"
            style={{ fontVariationSettings: "'opsz' 36, 'wght' 800" }}
          >
            Intern<span className="font-sans not-italic text-brand-600">Prangon</span>
          </span>
        </button>

        {/* User card */}
        <button
          onClick={() => navigate('profile')}
          className="flex items-center gap-3 mx-3 mt-4 mb-2 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left group"
        >
          <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-extrabold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-900 truncate">{displayName}</p>
            <p className="text-[10px] text-neutral-400 truncate">{displayEmail}</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 ml-auto">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {/* Points badge */}
        <div className="mx-3 mb-4 px-3 py-2 bg-brand-50 border border-brand-100 rounded-xl flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <div>
            <p className="text-xs font-extrabold text-brand-800">{profile.points} pts</p>
            <p className="text-[9px] text-brand-500 font-semibold">{profile.badge} tier</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl transition-all duration-150 text-sm font-medium',
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                ].join(' ')}
              >
                <span className={active ? 'text-white' : 'text-neutral-400'}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={['px-1.5 py-0.5 text-[9px] font-extrabold rounded-full', active ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600'].join(' ')}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom items */}
        <div className="px-3 pb-4 pt-2 space-y-0.5 border-t border-neutral-100 mt-2">
          {BOTTOM_ITEMS.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={['w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors', active ? 'bg-brand-600 text-white' : 'text-neutral-500 hover:bg-neutral-100'].join(' ')}
              >
                <span className={active ? 'text-white' : 'text-neutral-400'}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar (hidden on desktop) ── */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 h-16">
        {MOBILE_TABS.map((tab) => {
          const active = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={[
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors',
                active ? 'text-brand-600' : 'text-neutral-400',
              ].join(' ')}
            >
              {tab.icon(active)}
              {tab.badge && (
                <span className="absolute top-1 right-1/4 w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
              <span className="text-[10px] font-semibold leading-none">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
