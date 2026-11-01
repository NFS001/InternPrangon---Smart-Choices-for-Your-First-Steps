import React, { useState, useEffect, useCallback } from 'react';
import type { Navigate } from '../../data/index';
import { LogoMark } from '../../pages/DesignSystemPage';
import { getAllCompaniesAdmin, getFlagsAdmin, getSavedUser } from '../../api/client';

interface Props {
  currentPage: string;
  navigate: Navigate;
  onLogout: () => void;
}

export default function AdminSidebar({ currentPage, navigate, onLogout }: Props) {
  const user = getSavedUser();
  const [pendingVerif, setPendingVerif] = useState<number>(2);
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
        setPendingVerif(2);
      }
    } catch {
      setPendingVerif(2);
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
      label: 'Overview & Analytics',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      ),
    },
    {
      id: 'admin-companies',
      label: 'Companies Directory',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
        </svg>
      ),
    },
    {
      id: 'admin-verifications',
      label: 'Verification Queue',
      badge: `${pendingVerif} Pending`,
      badgeColor: 'amber',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      ),
    },
    {
      id: 'admin-reviews',
      label: 'Review Moderation',
      badge: `${pendingReports} Reported`,
      badgeColor: pendingReports > 0 ? 'red' : 'slate',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
    {
      id: 'admin-activity',
      label: 'System Activity & Audit Log',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
  ];

  const adminName = user?.name ? user.name.split(' ')[0] + ' ' + (user.name.split(' ')[1]?.[0] || 'U') + '.' : 'Nafis U.';

  return (
    <>
      {/* ── Desktop secured sidebar ── */}
      <aside className="hidden md:flex w-64 shrink-0 bg-slate-900 border-r border-slate-800 text-slate-300 flex-col justify-between sticky top-0 h-screen overflow-y-auto p-4 z-30 font-sans">
        <div>
          {/* Header & Brand Identity */}
          <button
            onClick={() => navigate('admin-dashboard')}
            className="flex items-center justify-between pb-4 border-b border-slate-800 group w-full text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogoMark size={28} />
              <div className="flex items-center">
                <span className="font-extrabold text-[17px] text-white tracking-tight">
                  Intern
                </span>
                <span className="font-black text-[17px] bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 bg-clip-text text-transparent ml-0.5">
                  Prangon
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 ml-0.5 mb-1.5 shrink-0 shadow-sm" />
              </div>
            </div>
            <span className="font-mono text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700/80 px-2 py-0.5 rounded uppercase tracking-wider">
              ADMIN
            </span>
          </button>

          {/* Operator Security Pill */}
          <div className="mt-4 mb-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white tracking-tight flex items-center gap-1.5">
                <span className="text-amber-400">🛡️</span> Superadmin Portal
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                2FA Active
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 truncate">
              User: <span className="text-slate-200 font-semibold">{adminName}</span> · Level 3
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Node: <span className="text-slate-400">dhaka-primary-01</span>
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 mt-3">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-slate-500 px-3 py-1.5">
              Control Center
            </p>
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 text-xs font-semibold ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full shrink-0 ${
                        item.badgeColor === 'amber'
                          ? active
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : item.badgeColor === 'red'
                          ? active
                            ? 'bg-rose-400 text-slate-950'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : active
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Security Controls */}
        <div className="pt-4 border-t border-slate-800 space-y-2.5">
          {/* System Uptime Badge */}
          <div className="px-2.5 py-2 rounded-lg bg-slate-800/50 border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API: 99.98%
            </span>
            <span className="text-slate-500">24ms</span>
          </div>

          {/* External Marketplace Link */}
          <button
            onClick={() => navigate('home')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors text-left"
          >
            <span>↗ Public Marketplace</span>
            <span className="text-slate-600 text-xs font-mono">LIVE</span>
          </button>

          {/* Terminate Admin Session */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/60 rounded-xl transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Terminate Admin Session</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 h-16 px-2 justify-around items-center">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-colors text-[10px] font-semibold ${
                active ? 'text-indigo-400 font-bold' : 'text-slate-400'
              }`}
            >
              <span>{item.icon}</span>
              <span className="truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
