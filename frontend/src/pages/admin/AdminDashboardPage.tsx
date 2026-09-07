import React, { useState, useEffect, useCallback } from 'react';
import type { Navigate } from '../../data/index';
import {
  getAllCompaniesAdmin,
  getCompanyDirectory,
  getFlagsAdmin,
  searchInternships,
  type ApiCompanyDirectoryItem,
  type ApiFlagItem,
} from '../../api/client';
import { getStoredActivities, type AdminActivityItem } from '../../utils/adminActivity';

interface LiveDashboardCompany {
  id: number | string;
  mongoId?: string;
  name: string;
  logo: string;
  logoBg: string;
  logoColor: string;
  industry: string;
  verificationStatus: 'approved' | 'rejected' | 'pending';
  submittedDate: string;
  documents: string[];
}

interface LiveReportItem {
  id: string | number;
  companyName: string;
  companyLogo: string;
  companyLogoBg: string;
  companyLogoColor: string;
  reportReason: string;
  rating: number;
  content: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3 h-3 ${s <= rating ? 'text-amber-400' : 'text-neutral-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function ActivityIcon({ type }: { type: string }) {
  if (type === 'verification_approved') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (type === 'verification_rejected') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex-shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  if (type === 'review_deleted') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex-shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </span>
    );
  }
  if (type === 'review_dismissed') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-neutral-500 flex-shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex-shrink-0">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 14 14" />
      </svg>
    </span>
  );
}

export default function AdminDashboardPage({ navigate }: { navigate: Navigate }) {
  const [companies, setCompanies] = useState<LiveDashboardCompany[]>([]);
  const [reportedReviews, setReportedReviews] = useState<LiveReportItem[]>([]);
  const [totalInternships, setTotalInternships] = useState<number>(0);
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch live companies and apply any local verification overrides
      const overrides: Record<string, string> = JSON.parse(
        localStorage.getItem('internprangon_company_verifications') || '{}'
      );
      let rawCompanies: ApiCompanyDirectoryItem[] = [];
      try {
        const companyRes = await getAllCompaniesAdmin();
        rawCompanies = companyRes.companies || [];
      } catch {
        // Fallback to public directory if admin token is missing
        const dirRes = await getCompanyDirectory({ limit: 100 }).catch(() => ({ companies: [] }));
        rawCompanies = dirRes.companies || [];
      }

      const liveCompanies: LiveDashboardCompany[] = rawCompanies.map(
        (c: ApiCompanyDirectoryItem, idx: number) => {
          const initials = c.companyName ? c.companyName.trim().slice(0, 2).toUpperCase() : 'CO';
          const override =
            overrides[c._id] ||
            overrides[String(idx + 1)] ||
            overrides[(c.companyName || '').toLowerCase()];
          const baseStatus =
            c.verificationStatus === 'Approved'
              ? 'approved'
              : c.verificationStatus === 'Rejected'
              ? 'rejected'
              : 'pending';
          const finalStatus = ((override || baseStatus) as 'approved' | 'rejected' | 'pending');

          return {
            id: c._id || idx + 1,
            mongoId: c._id,
            name: c.companyName || 'Company',
            logo: initials,
            logoBg: '#eff6ff',
            logoColor: '#2563eb',
            industry: c.industry || 'Technology',
            verificationStatus: finalStatus,
            submittedDate: new Date(c.createdAt || Date.now()).toLocaleDateString(),
            documents: [c.verificationDocument || 'trade_license.pdf'],
          };
        }
      );
      setCompanies(liveCompanies);

      // 2. Fetch live internships count from backend
      const intRes = await searchInternships({ limit: 1 }).catch(() => ({ totalResults: 0, internships: [] }));
      setTotalInternships(intRes.totalResults ?? intRes.internships?.length ?? 0);

      // 3. Fetch live reported reviews and filter out deleted/resolved
      const deletedIds = new Set(
        JSON.parse(localStorage.getItem('internprangon_deleted_reviews') || '[]')
      );
      const resolvedIds = new Set(
        JSON.parse(localStorage.getItem('internprangon_resolved_flags') || '[]')
      );
      const flagRes = await getFlagsAdmin().catch(() => ({ flags: [] }));
      const livePendingFlags: LiveReportItem[] = (flagRes.flags || [])
        .filter((f: ApiFlagItem) => {
          const flagId = String(f._id || '');
          const reviewId = String(f.review?._id || '');
          if (f.status === 'Resolved') return false;
          if (resolvedIds.has(flagId)) return false;
          if (deletedIds.has(reviewId) || deletedIds.has(flagId)) return false;
          return true;
        })
        .map((f: ApiFlagItem) => {
          const comp = f.review?.company?.companyName || 'Platform Partner';
          return {
            id: f._id,
            companyName: comp,
            companyLogo: comp.slice(0, 2).toUpperCase(),
            companyLogoBg: '#eff6ff',
            companyLogoColor: '#2563eb',
            reportReason: f.reason || 'Flagged for moderation',
            rating: f.review?.rating || 5,
            content: f.review?.comment || '',
          };
        });
      setReportedReviews(livePendingFlags);

      // 4. Fetch stored activities
      const storedActivities = getStoredActivities();
      if (storedActivities.length > 0) {
        setActivities(storedActivities);
      } else {
        // Synthesize recent registration activities from real database companies
        const synthesized: AdminActivityItem[] = liveCompanies.slice(0, 5).map((c) => ({
          id: `comp-${c.id}`,
          type:
            c.verificationStatus === 'approved'
              ? 'verification_approved'
              : c.verificationStatus === 'rejected'
              ? 'verification_rejected'
              : 'company_registered',
          description:
            c.verificationStatus === 'approved'
              ? `Company ${c.name} verified`
              : c.verificationStatus === 'rejected'
              ? `Verification review required for ${c.name}`
              : `New enterprise registration: ${c.name}`,
          target: c.industry,
          timestamp: c.submittedDate,
          timeAgo: c.submittedDate,
        }));
        setActivities(synthesized);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const handleSync = () => loadDashboardData();
    window.addEventListener('storage', handleSync);
    window.addEventListener('internprangon_verifications_updated', handleSync);
    window.addEventListener('internprangon_reviews_updated', handleSync);
    window.addEventListener('internprangon_activity_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('internprangon_verifications_updated', handleSync);
      window.removeEventListener('internprangon_reviews_updated', handleSync);
      window.removeEventListener('internprangon_activity_updated', handleSync);
    };
  }, [loadDashboardData]);

  const pendingCompanies = companies.filter((c) => c.verificationStatus === 'pending');
  const approvedCompanies = companies.filter((c) => c.verificationStatus === 'approved');

  const statTiles = [
    {
      label: 'Total Companies',
      value: companies.length,
      color: 'text-neutral-900',
      dot: null,
      status: null,
      target: 'admin-companies',
    },
    {
      label: 'Pending Verification',
      value: pendingCompanies.length,
      color: 'text-amber-600',
      dot: pendingCompanies.length > 0 ? 'bg-amber-400' : null,
      status: pendingCompanies.length > 0 ? 'Needs review' : null,
      target: 'admin-verifications',
    },
    {
      label: 'Verified Companies',
      value: approvedCompanies.length,
      color: 'text-emerald-600',
      dot: null,
      status: null,
      target: 'admin-companies',
    },
    {
      label: 'Total Internships',
      value: totalInternships,
      color: 'text-brand-600',
      dot: null,
      status: null,
      target: 'internships',
    },
    {
      label: 'Reported Reviews',
      value: reportedReviews.length,
      color: 'text-rose-600',
      dot: reportedReviews.length > 0 ? 'bg-rose-400' : null,
      status: reportedReviews.length > 0 ? 'Pending action' : null,
      target: 'admin-reviews',
    },
  ];

  return (
    <div className="px-5 py-5 lg:px-8 lg:py-8 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            InternPrangon Admin · Live Platform Overview ·{' '}
            {new Date().toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => navigate('admin-activity')}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-300 rounded-lg px-3 py-2.5 sm:py-1.5 transition-colors bg-white shadow-sm"
        >
          View activity log
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {statTiles.map((tile) => (
          <div
            key={tile.label}
            onClick={() => tile.target && navigate(tile.target)}
            className={`bg-white border border-neutral-200 rounded-xl px-5 py-4 shadow-sm transition-all ${
              tile.target ? 'cursor-pointer hover:shadow-md hover:border-brand-300 group' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`text-3xl font-bold ${tile.color}`}>
                {loading && companies.length === 0 ? '—' : tile.value}
              </div>
              {tile.target && (
                <span className="text-neutral-300 group-hover:text-brand-600 transition-colors text-xs font-semibold">
                  →
                </span>
              )}
            </div>
            <div className="text-xs text-neutral-500 mt-1 font-medium group-hover:text-neutral-900 transition-colors">
              {tile.label}
            </div>
            {tile.dot && tile.status && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${tile.dot}`} />
                <span className="text-[10px] text-neutral-400 font-semibold">{tile.status}</span>
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
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900">Pending Verifications</span>
                {pendingCompanies.length > 0 && (
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                    {pendingCompanies.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => navigate('admin-verifications')}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                View all
              </button>
            </div>

            {pendingCompanies.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-neutral-400">
                {loading ? 'Checking verification queue…' : 'No pending verifications'}
              </div>
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
                    {pendingCompanies.slice(0, 5).map((company) => (
                      <tr key={company.id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{
                                backgroundColor: company.logoBg || '#eff6ff',
                                color: company.logoColor || '#2563eb',
                              }}
                            >
                              {company.logo || company.name?.slice(0, 2).toUpperCase() || 'CO'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-neutral-900 leading-tight">
                                {company.name}
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                {company.industry || 'Technology'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-500">{company.submittedDate}</td>
                        <td className="px-4 py-3 text-xs text-neutral-500">
                          {company.documents?.length ?? 1} file(s)
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              navigate('admin-verifications', {
                                companyId: String(company.mongoId || company.id),
                              })
                            }
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
                  {pendingCompanies.slice(0, 5).map((company) => (
                    <div
                      key={company.id}
                      className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: company.logoBg || '#eff6ff',
                          color: company.logoColor || '#2563eb',
                        }}
                      >
                        {company.logo || company.name?.slice(0, 2).toUpperCase() || 'CO'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-neutral-900 truncate">
                          {company.name}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {company.submittedDate} · {company.documents?.length ?? 1} file(s)
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          navigate('admin-verifications', {
                            companyId: String(company.mongoId || company.id),
                          })
                        }
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
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900">Reported Reviews</span>
                {reportedReviews.length > 0 && (
                  <span className="text-[10px] font-semibold bg-rose-100 text-rose-600 rounded-full px-2 py-0.5">
                    {reportedReviews.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => navigate('admin-reviews')}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                View all
              </button>
            </div>

            {reportedReviews.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-neutral-400">
                {loading ? 'Checking moderation queue…' : 'No reported reviews pending action'}
              </div>
            ) : (
              <div>
                {reportedReviews.slice(0, 4).map((review, idx) => (
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
                      {review.companyLogo ?? 'CO'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold text-neutral-900">
                          {review.companyName ?? 'Partner Company'}
                        </span>
                        <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 rounded-full px-1.5 py-0.5 font-medium">
                          {review.reportReason ?? 'Reported'}
                        </span>
                        <StarRating rating={review.rating ?? 0} />
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {(review.content ?? '').length > 80
                          ? (review.content ?? '').slice(0, 80) + '…'
                          : review.content || '(No comment)'}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        navigate('admin-reviews', {
                          reportId: String(review.id),
                        })
                      }
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
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden self-start shadow-sm">
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
            {activities.slice(0, 7).map((item, idx) => (
              <div
                key={item.id ?? idx}
                className="flex items-start gap-3 px-4 py-3 border-t border-neutral-100 first:border-t-0"
              >
                <ActivityIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-700 leading-snug font-medium">{item.description}</p>
                  {item.target && (
                    <p className="text-[10px] text-neutral-400 mt-0.5 truncate">{item.target}</p>
                  )}
                  <p className="text-[10px] text-neutral-400 mt-0.5">{item.timeAgo}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-neutral-400">
                {loading ? 'Loading platform activity…' : 'No recent activity recorded'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
