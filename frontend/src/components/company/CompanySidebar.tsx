import React, { useState, useEffect } from 'react';
import type { Navigate } from '../../data/index';
import { LogoMark } from '../../pages/DesignSystemPage';
import { CompanyLogo } from '../common/CompanyLogos';
import { getSavedUser, getMyCompanyProfile, getAllCompanyApplicants, getMyCompanyInternships, type ApiUser } from '../../api/client';

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
  badge?: number;
  badgeType?: 'indigo' | 'slate' | 'dot';
}

export default function CompanySidebar({ currentPage, navigate, onLogout, currentUser }: Props) {
  const user = currentUser ?? getSavedUser();
  const [companyInfo, setCompanyInfo] = useState({
    name: user?.name || 'bKash Limited',
    industry: 'Fintech & MFS · Enterprise',
    status: 'Approved',
  });
  const [applicantCount, setApplicantCount] = useState<number | undefined>(undefined);
  const [internshipCount, setInternshipCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    getMyCompanyProfile()
      .then((res) => {
        if (res.profile) {
          setCompanyInfo({
            name: res.profile.companyName || user?.name || 'Company',
            industry: res.profile.industry || 'Technology & Enterprise',
            status: res.profile.verificationStatus || 'Approved',
          });
        }
      })
      .catch(() => {});

    getAllCompanyApplicants()
      .then((res) => {
        if (res.totalApplicants !== undefined) {
          setApplicantCount(res.totalApplicants);
        }
      })
      .catch(() => {});

    getMyCompanyInternships()
      .then((res) => {
        if (res.internships) {
          const active = res.internships.filter((i) => i.status === 'active').length;
          setInternshipCount(active);
        }
      })
      .catch(() => {});
  }, [user?.id, user?.name]);

  const navItems: NavItem[] = [
    {
      id: 'co-dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      ),
    },
    {
      id: 'co-applicants',
      label: 'Applicants',
      badge: applicantCount,
      badgeType: 'indigo',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      id: 'co-internships',
      label: 'Internship Listings',
      badge: internshipCount,
      badgeType: 'slate',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          <line x1="12" y1="12" x2="12" y2="12.01"/>
        </svg>
      ),
    },
    {
      id: 'co-profile',
      label: 'Company Profile',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
          <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
        </svg>
      ),
    },
    {
      id: 'co-verification',
      label: 'Verification Status',
      badgeType: 'dot',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Desktop Persistent Recruiter Navigation */}
      <aside className="hidden md:flex bg-white/90 backdrop-blur-md border-r border-slate-200/80 w-64 min-h-screen p-5 flex-col justify-between sticky top-0 h-screen overflow-y-auto shrink-0 z-30">
        <div>
          {/* Top Branding */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 pb-5 border-b border-slate-100 group w-full text-left cursor-pointer"
          >
            <LogoMark size={32} />
            <div className="flex items-center">
              <span className="font-extrabold text-[18px] text-slate-900 tracking-tight font-sans">
                Intern
              </span>
              <span className="font-black text-[18px] bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent ml-0.5">
                Prangon
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ml-0.5 mb-1.5 shrink-0 shadow-sm" />
            </div>
          </button>

          {/* Company Profile Mini-Badge */}
          <div className="mt-4 mb-4 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white shadow-xs border border-slate-200/60 p-1 flex items-center justify-center shrink-0">
                <CompanyLogo name={companyInfo.name} size={36} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-slate-900 text-sm truncate leading-snug">
                  {companyInfo.name}
                </h3>
                <p className="text-[11px] text-slate-500 truncate font-medium">
                  {companyInfo.industry}
                </p>
              </div>
            </div>

            {/* Verified Shield Badge */}
            <div className="mt-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold w-full justify-center">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM14.707 7.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                </svg>
                <span>✔ Verified Enterprise</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu Items */}
          <nav className="space-y-1.5 mt-2">
            {navItems.map((item) => {
              const active = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                    active
                      ? 'bg-indigo-50 text-indigo-600 font-bold border-l-4 border-indigo-600 pl-3 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? 'text-indigo-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        item.badgeType === 'indigo'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.badgeType === 'dot' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" title="Verified" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="px-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recruiter Account</p>
            <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
              {user?.email || `recruitment@${companyInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`}
            </p>
          </div>

          {/* Sign out */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-colors text-[10px] font-semibold ${
                active ? 'text-indigo-600 font-bold' : 'text-slate-500'
              }`}
            >
              <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{item.icon}</span>
              <span className="truncate max-w-[64px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
