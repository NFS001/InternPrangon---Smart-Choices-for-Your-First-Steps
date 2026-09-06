import React, { useState, useEffect } from 'react';
import type { Navigate } from '../../data/index';
import { ADMIN_COMPANIES, REPORTED_REVIEWS, ADMIN_ACTIVITY, INTERNSHIPS } from '../../data/index';
import { getAllCompaniesAdmin } from '../../api/client';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3 h-3 ${s <= rating ? 'text-amber-400' : 'text-neutral-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function ActivityIcon({ type }: { type: string }) {
  if (type === 'verification_approved') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-success-100 text-success-600 flex-shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (type === 'verification_rejected') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-danger-100 text-danger-600 flex-shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  if (type === 'review_deleted') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex-shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </span>
    );
  }
  if (type === 'review_dismissed') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-neutral-500 flex-shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  if (type === 'company_registered') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-info-100 text-info-600 flex-shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      </span>
    );
  }
  if (type === 'internship_posted') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex-shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-neutral-400 flex-shrink-0">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </span>
  );
}

export default function AdminDashboardPage({ navigate }: { navigate: Navigate }) {
  const [companies, setCompanies] = useState(ADMIN_COMPANIES);

  useEffect(() => {
    getAllCompaniesAdmin()
      .then((res) => {
        if (res.companies && res.companies.length > 0) {
          const mapped = res.companies.map((c, idx) => {
            const initials = c.companyName ? c.companyName.trim().slice(0, 2).toUpperCase() : 'CO';
            return {
              id: idx + 1,
              name: c.companyName || 'Company',
              logo: initials,
              logoBg: '#eff6ff',
              logoColor: '#2563eb',
              industry: c.industry || 'Technology',
              verificationStatus: c.verificationStatus === 'Approved' ? 'approved' : c.verificationStatus === 'Rejected' ? 'rejected' : 'pending',
              submittedDate: new Date(c.createdAt || Date.now()).toLocaleDateString(),
              documents: [c.verificationDocument || 'trade_license.pdf'],
            };
          });
          setCompanies(mapped as unknown as typeof ADMIN_COMPANIES);
        }
      })
      .catch(() => {});
  }, []);

  const pendingCompanies = companies.filter((c) => c.verificationStatus === 'pending');
  const approvedCompanies = companies.filter((c) => c.verificationStatus === 'approved');
  const pendingReviews = REPORTED_REVIEWS.filter((r) => r.action === 'pending');
  const recentActivity = ADMIN_ACTIVITY.slice(0, 7);

  const statTiles = [
    {
      label: 'Total Companies',
      value: companies.length,
      color: 'text-neutral-900',
      dot: null,
      status: null,
    },
    {
      label: 'Pending Verification',
      value: pendingCompanies.length,
      color: 'text-amber-600',
      dot: 'bg-amber-400',
      status: 'Needs review',
    },
    {
      label: 'Verified Companies',
      value: approvedCompanies.length,
      color: 'text-success-600',
      dot: null,
      status: null,
    },
    {
      label: 'Total Internships',
      value: INTERNSHIPS.length,
      color: 'text-brand-600',
      dot: null,
      status: null,
    },
    {
      label: 'Reported Reviews',
      value: pendingReviews.length,
      color: 'text-danger-600',
      dot: 'bg-red-400',
      status: 'Pending action',
    },
  ];

  return (
    <div className="px-5 py-5 lg:px-8 lg:py-8 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-xs text-neutral-400 mt-0.5">InternPrangon Admin · Last updated: Jan 24, 2025</p>
        </div>
        <button
          onClick={() => navigate('admin-activity')}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-300 rounded-lg px-3 py-2.5 sm:py-1.5 transition-colors bg-white"
        >
          View activity log
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {statTiles.map((tile) => (
          <div key={tile.label} className="bg-white border border-neutral-200 rounded-xl px-5 py-4">
            <div className={`text-3xl font-bold ${tile.color}`}>{tile.value}</div>
            <div className="text-xs text-neutral-500 mt-1">{tile.label}</div>
            {tile.dot && tile.status && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${tile.dot}`} />
                <span className="text-[10px] text-neutral-400">{tile.status}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main content: 3fr + 2fr */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* Pending verifications */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900">Pending Verifications</span>
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                  {pendingCompanies.length}
                </span>
              </div>
              <button
                onClick={() => navigate('admin-verifications')}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                View all
              </button>
            </div>
            {pendingCompanies.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-neutral-400">No pending verifications</div>
            ) : (
              <>
                {/* Desktop table */}
                <table className="hidden md:table w-full">
                  <thead>
                    <tr className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide">
                      <th className="text-left px-4 py-2">Company</th>
                      <th className="text-left px-4 py-2">Submitted</th>
                      <th className="text-left px-4 py-2">Docs</th>
                      <th className="text-left px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCompanies.slice(0, 4).map((company) => (
                      <tr key={company.id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: company.logoBg || '#eff6ff', color: company.logoColor || '#2563eb' }}
                            >
                              {company.logo || company.name?.slice(0, 2).toUpperCase() || 'CO'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-neutral-900 leading-tight">{company.name}</div>
                              <div className="text-[10px] text-neutral-400">{company.industry || 'Technology'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-500">{company.submittedDate}</td>
                        <td className="px-4 py-3 text-xs text-neutral-500">{company.documents?.length ?? 1} files</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate('admin-verifications', { companyId: company.id })}
                            className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                          >
                            Review →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Mobile card list */}
                <div className="md:hidden divide-y divide-neutral-100">
                  {pendingCompanies.slice(0, 4).map((company) => (
                    <div key={company.id} className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors">
                      <div
                        className="w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: company.logoBg || '#eff6ff', color: company.logoColor || '#2563eb' }}
                      >
                        {company.logo || company.name?.slice(0, 2).toUpperCase() || 'CO'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-neutral-900 truncate">{company.name}</div>
                        <div className="text-xs text-neutral-400">{company.submittedDate} · {company.documents?.length ?? 1} files</div>
                      </div>
                      <button
                        onClick={() => navigate('admin-verifications', { companyId: company.id })}
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors shrink-0 py-2"
                      >
                        Review →
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Reported reviews */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900">Reported Reviews</span>
                <span className="text-[10px] font-semibold bg-danger-100 text-danger-600 rounded-full px-2 py-0.5">
                  {pendingReviews.length}
                </span>
              </div>
              <button
                onClick={() => navigate('admin-reviews')}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                View all
              </button>
            </div>
            {pendingReviews.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-neutral-400">No reported reviews pending</div>
            ) : (
              <div>
                {pendingReviews.slice(0, 3).map((review, idx) => (
                  <div
                    key={review.id ?? idx}
                    className="flex items-start sm:items-center gap-3 px-4 py-3 border-t border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 sm:mt-0"
                      style={{
                        backgroundColor: review.companyLogoBg ?? '#f3f4f6',
                        color: review.companyLogoColor ?? '#6b7280',
                      }}
                    >
                      {review.companyLogo ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold text-neutral-900">{review.companyName ?? 'Unknown'}</span>
                        <span className="text-[10px] bg-danger-50 text-danger-600 border border-danger-200 rounded-full px-1.5 py-0.5 font-medium">
                          {review.reportReason ?? 'Reported'}
                        </span>
                        <StarRating rating={review.rating ?? 0} />
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {(review.content ?? '').length > 80
                          ? (review.content ?? '').slice(0, 80) + '…'
                          : (review.content ?? '')}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('admin-reviews')}
                      className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex-shrink-0 transition-colors py-1"
                    >
                      Moderate →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Recent activity */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden self-start">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <span className="text-sm font-semibold text-neutral-900">Recent Activity</span>
            <button
              onClick={() => navigate('admin-activity')}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              View all
            </button>
          </div>
          <div>
            {recentActivity.map((item, idx) => (
              <div
                key={item.id ?? idx}
                className="flex items-start gap-3 px-4 py-3 border-t border-neutral-100 first:border-t-0"
              >
                <ActivityIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-700 leading-snug">{item.description}</p>
                  {item.target && (
                    <p className="text-[10px] text-neutral-400 mt-0.5 truncate">{item.target}</p>
                  )}
                  <p className="text-[10px] text-neutral-300 mt-0.5">{item.timeAgo}</p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-neutral-400">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
