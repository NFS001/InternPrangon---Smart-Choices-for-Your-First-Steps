import React, { useState, useEffect } from 'react';
import type { Navigate } from '../../data/index';
import { LogoMark } from '../../pages/DesignSystemPage';
import { getSavedUser, getMyCompanyProfile, getAllCompanyApplicants, type ApiUser } from '../../api/client';

interface Props {
  currentPage: string;
  navigate: Navigate;
  onLogout: () => void;
  currentUser?: ApiUser | null;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'co-dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: 'co-applicants',
    label: 'Applicants',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'co-internships',
    label: 'Internships',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'co-profile',
    label: 'Company Profile',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'co-verification',
    label: 'Verification',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

export default function CompanySidebar({ currentPage, navigate, onLogout, currentUser }: Props) {
  const user = currentUser ?? getSavedUser();
  const [companyInfo, setCompanyInfo] = useState({
    name: user?.name || 'Company',
    industry: 'Software & Technology',
    status: 'Pending',
  });
  const [applicantCount, setApplicantCount] = useState(0);

  useEffect(() => {
    getMyCompanyProfile()
      .then((res) => {
        if (res.profile) {
          setCompanyInfo({
            name: res.profile.companyName || user?.name || 'Company',
            industry: res.profile.industry || 'Technology',
            status: res.profile.verificationStatus || 'Pending',
          });
        }
      })
      .catch(() => {});

    getAllCompanyApplicants()
      .then((res) => {
        setApplicantCount(res.totalApplicants || 0);
      })
      .catch(() => {
        setApplicantCount(0);
      });
  }, [user?.id, user?.name]);

  const isVerified = companyInfo.status === 'Approved';

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

        {/* Company card */}
        <div className="flex items-center gap-3 mx-3 mt-4 mb-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold border border-black/5 shrink-0 bg-brand-50 text-brand-700"
          >
            {companyInfo.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-900 truncate">{companyInfo.name}</p>
            <p className="text-[10px] text-neutral-400 truncate">{companyInfo.industry}</p>
          </div>
        </div>

        {/* Verification badge */}
        <div className="mx-3 mb-4">
          {isVerified ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              <span className="text-[10px] font-bold text-green-700">Verified Enterprise</span>
            </div>
          ) : (
            <button
              onClick={() => navigate('co-verification')}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span className="text-[10px] font-bold text-amber-700">Pending Verification</span>
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = currentPage === item.id;
            const badgeValue = item.id === 'co-applicants' && applicantCount > 0 ? String(applicantCount) : null;

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
                {badgeValue && (
                  <span className={['px-2 py-0.5 text-[10px] font-extrabold rounded-full', active ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'].join(' ')}>
                    {badgeValue}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-3 border-t border-neutral-100 mt-auto">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {companyInfo.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-neutral-800 truncate">{user?.name || companyInfo.name}</p>
              <p className="text-[10px] text-neutral-400 truncate">{user?.email || 'company@example.com'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-danger-600 hover:bg-danger-50 rounded-xl transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={[
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors text-[10px] font-medium',
                active ? 'text-brand-600 font-bold' : 'text-neutral-500',
              ].join(' ')}
            >
              <span className={active ? 'text-brand-600' : 'text-neutral-400'}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
