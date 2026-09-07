import React, { useState, useEffect, useCallback } from 'react';
import type { Navigate } from '../../data/index';
import { LogoMark } from '../../pages/DesignSystemPage';
import { getAllCompaniesAdmin, getFlagsAdmin } from '../../api/client';

interface Props {
  currentPage: string;
  navigate: Navigate;
  onLogout: () => void;
}

export default function AdminSidebar({ currentPage, navigate, onLogout }: Props) {
  const [pendingVerif, setPendingVerif] = useState<number>(0);
  const [pendingReports, setPendingReports] = useState<number>(0);

  const fetchCounts = useCallback(async () => {
    // 1. Verifications pending count (from live backend companies)
    try {
      const overrides: Record<string, string> = JSON.parse(
        localStorage.getItem('internprangon_company_verifications') || '{}'
      );
      const res = await getAllCompaniesAdmin().catch(() => ({ companies: [] }));
      if (res.companies && res.companies.length > 0) {
        const count = res.companies.filter((c, idx) => {
          const override =
            overrides[c._id] ||
            overrides[String(idx + 1)] ||
            overrides[(c.companyName || '').toLowerCase()];
          const base = (c.verificationStatus || 'pending').toLowerCase();
          const finalStatus = (override || base).toLowerCase();
          return finalStatus === 'pending';
        }).length;
        setPendingVerif(count);
      } else {
        setPendingVerif(0);
      }
    } catch {
      setPendingVerif(0);
    }

    // 2. Reviews pending reports count (from live backend flags)
    try {
      const deletedIds = new Set(
        JSON.parse(localStorage.getItem('internprangon_deleted_reviews') || '[]')
      );
      const resolvedIds = new Set(
        JSON.parse(localStorage.getItem('internprangon_resolved_flags') || '[]')
      );

      const res = await getFlagsAdmin().catch(() => ({ flags: [] }));
      const backendPending = (res.flags || []).filter((f) => {
        const flagId = String(f._id || '');
        const reviewId = String(f.review?._id || '');
        if (f.status === 'Resolved') return false;
        if (resolvedIds.has(flagId)) return false;
        if (deletedIds.has(reviewId) || deletedIds.has(flagId)) return false;
        return true;
      });

      setPendingReports(backendPending.length);
    } catch {
      setPendingReports(0);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    const handleSync = () => fetchCounts();
    window.addEventListener('storage', handleSync);
    window.addEventListener('internprangon_verifications_updated', handleSync);
    window.addEventListener('internprangon_reviews_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('internprangon_verifications_updated', handleSync);
      window.removeEventListener('internprangon_reviews_updated', handleSync);
    };
  }, [fetchCounts, currentPage]);

  const navItems = [
    {
      id: 'admin-dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
    },
    {
      id: 'admin-companies',
      label: 'Companies',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      id: 'admin-verifications',
      label: 'Verifications',
      badge: pendingVerif > 0 ? String(pendingVerif) : undefined,
      badgeColor: 'amber',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    },
    {
      id: 'admin-reviews',
      label: 'Reviews',
      badge: pendingReports > 0 ? String(pendingReports) : undefined,
      badgeColor: 'red',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      id: 'admin-activity',
      label: 'Activity',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex w-52 shrink-0 bg-brand-950 flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <button
          onClick={() => navigate('admin-dashboard')}
          className="flex items-center gap-2.5 px-5 h-[64px] border-b border-brand-800 shrink-0 group hover:bg-brand-900 transition-colors"
        >
          <LogoMark size={26} variant="white" />
          <span
            className="font-display italic text-[15px] font-bold text-white group-hover:text-brand-200 transition-colors"
            style={{ fontVariationSettings: "'opsz' 36, 'wght' 800" }}
          >
            InternPrangon
          </span>
        </button>

        {/* Admin badge */}
        <div className="mx-4 mt-4 mb-3 px-3 py-2 bg-brand-800/60 rounded-xl border border-brand-700/50 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M12 1l3.22 6.532 7.21.623-5.224 4.79 1.55 7.085L12 16.45l-6.756 3.58 1.55-7.085L1.57 8.155l7.21-.623z"/>
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-brand-100">Admin Panel</p>
            <p className="text-[9px] text-brand-400">Full access</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 pb-4">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-brand-500 px-3 py-2 mt-1">Navigation</p>
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl transition-all duration-150 text-sm font-medium',
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-brand-300 hover:bg-brand-800 hover:text-white',
                ].join(' ')}
              >
                <span className={active ? 'text-white' : 'text-brand-500'}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={[
                    'px-1.5 py-0.5 text-[9px] font-extrabold rounded-full',
                    item.badgeColor === 'red'   ? (active ? 'bg-white/20 text-white' : 'bg-red-500 text-white') :
                    item.badgeColor === 'amber' ? (active ? 'bg-white/20 text-white' : 'bg-amber-400 text-amber-950') :
                    (active ? 'bg-white/20 text-white' : 'bg-brand-700 text-brand-200'),
                  ].join(' ')}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 pt-2 border-t border-brand-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-400 hover:text-brand-100 hover:bg-brand-800 transition-colors mb-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            Public site
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar (hidden on desktop) ── */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-950 border-t border-brand-800 h-16">
        {[
          {
            id: 'admin-dashboard',
            label: 'Home',
            badgeDot: false,
            icon: (active: boolean) => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            ),
          },
          {
            id: 'admin-companies',
            label: 'Companies',
            badgeDot: false,
            icon: (active: boolean) => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            ),
          },
          {
            id: 'admin-verifications',
            label: 'Verify',
            badgeDot: pendingVerif > 0,
            badgeColor: 'amber',
            icon: (active: boolean) => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            ),
          },
          {
            id: 'admin-reviews',
            label: 'Reviews',
            badgeDot: pendingReports > 0,
            badgeColor: 'red',
            icon: (active: boolean) => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            ),
          },
          {
            id: 'admin-activity',
            label: 'Activity',
            badgeDot: false,
            icon: (active: boolean) => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            ),
          },
        ].map((tab) => {
          const active = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={[
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors',
                active ? 'text-white' : 'text-brand-400',
              ].join(' ')}
            >
              {tab.icon(active)}
              {tab.badgeDot && (
                <span className={[
                  'absolute top-1 right-1/4 w-1.5 h-1.5 rounded-full',
                  tab.badgeColor === 'amber' ? 'bg-amber-400' : 'bg-red-500',
                ].join(' ')} />
              )}
              <span className="text-[10px] font-semibold leading-none">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
