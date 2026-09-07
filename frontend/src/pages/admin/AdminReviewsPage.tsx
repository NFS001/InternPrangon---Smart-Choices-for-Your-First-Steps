import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Navigate } from '../../data/index';
import {
  getFlagsAdmin,
  updateFlagStatusAdmin,
  deleteReviewAdmin,
  getSavedUser,
  login,
  saveAuth,
  type ApiFlagItem,
} from '../../api/client';

export interface AdminReportItem {
  id: string | number;
  flagId?: string;
  reviewId?: string;
  companyName: string;
  companyLogo: string;
  companyLogoBg: string;
  companyLogoColor: string;
  rating: number;
  content: string;
  reportReason: string;
  reportedBy: string;
  reportedDate: string;
  reviewDate: string;
  status: 'Pending' | 'Resolved' | 'Deleted';
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-3.5 h-3.5 ${
            n <= Math.round(rating) ? 'text-amber-400' : 'text-neutral-200'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

interface Props {
  navigate: Navigate;
  reportId?: string;
}

export default function AdminReviewsPage({ navigate, reportId }: Props) {
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Resolved' | 'Deleted'>('all');
  const [filterReason, setFilterReason] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<AdminReportItem | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState(() => getSavedUser());

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getFlagsAdmin().catch(() => ({ flags: [] }));
      const mapped: AdminReportItem[] = (res.flags || []).map((f: ApiFlagItem, idx: number) => {
        const comp = f.review?.company?.companyName || 'Platform Partner';
        return {
          id: f._id || `flag-${idx}`,
          flagId: f._id,
          reviewId: f.review?._id,
          companyName: comp,
          companyLogo: comp.slice(0, 2).toUpperCase(),
          companyLogoBg: '#eff6ff',
          companyLogoColor: '#2563eb',
          rating: f.review?.rating || 5,
          content: f.review?.comment || '(No review comment available)',
          reportReason: f.reason || 'Inappropriate content',
          reportedBy: 'Anonymous user',
          reportedDate: f.dateFlagged
            ? new Date(f.dateFlagged).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Recently',
          reviewDate: f.review?.createdAt
            ? new Date(f.review.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Recently',
          status: f.status === 'Resolved' ? 'Resolved' : 'Pending',
        };
      });

      const deletedIds = new Set(
        JSON.parse(localStorage.getItem('internprangon_deleted_reviews') || '[]')
      );
      const resolvedIds = new Set(
        JSON.parse(localStorage.getItem('internprangon_resolved_flags') || '[]')
      );

      const combined = mapped.map((r) => {
        if (deletedIds.has(String(r.reviewId)) || deletedIds.has(String(r.id))) {
          return { ...r, status: 'Deleted' as const };
        }
        if (resolvedIds.has(String(r.flagId)) || resolvedIds.has(String(r.id))) {
          return { ...r, status: 'Resolved' as const };
        }
        return r;
      });

      setReports(combined);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (reportId && reports.length > 0) {
      const target = reports.find(
        (r) => String(r.id) === reportId || String(r.flagId) === reportId
      );
      if (target) setSelectedReport(target);
    }
  }, [reportId, reports]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const pendingCount = reports.filter((r) => r.status === 'Pending').length;

  const filteredReports = reports.filter((r) => {
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    const reasonMatch =
      filterReason === 'all' ||
      r.reportReason.toLowerCase() === filterReason.toLowerCase();
    const queryMatch =
      !searchQuery.trim() ||
      r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && reasonMatch && queryMatch;
  });

  const getReasonBadgeClass = (reason: string) => {
    const lower = reason.toLowerCase();
    if (lower.includes('fake') || lower.includes('misleading')) {
      return 'bg-orange-50 text-orange-700 border-orange-200';
    }
    if (lower.includes('spam')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (
      lower.includes('inappropriate') ||
      lower.includes('offensive') ||
      lower.includes('harassment')
    ) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-neutral-50 text-neutral-600 border-neutral-200';
  };

  // Keep Review action: Dismisses the report and leaves the review active
  const handleKeepReview = async (report: AdminReportItem) => {
    try {
      setActionInProgress(true);

      const resolvedKey = 'internprangon_resolved_flags';
      const existingResolved: string[] = JSON.parse(
        localStorage.getItem(resolvedKey) || '[]'
      );
      const itemsToResolve = [
        report.flagId ? String(report.flagId) : null,
        report.id ? String(report.id) : null,
      ].filter(Boolean) as string[];

      itemsToResolve.forEach((item) => {
        if (!existingResolved.includes(item)) {
          existingResolved.push(item);
        }
      });
      localStorage.setItem(resolvedKey, JSON.stringify(existingResolved));
      window.dispatchEvent(new Event('internprangon_reviews_updated'));

      if (report.flagId && !report.flagId.startsWith('flag-')) {
        await updateFlagStatusAdmin(report.flagId, 'Resolved').catch(() => {});
      }
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: 'Resolved' } : r))
      );
      if (selectedReport?.id === report.id) {
        setSelectedReport((prev) => (prev ? { ...prev, status: 'Resolved' } : null));
      }
      setToastMessage('Report resolved. Review remains active on InternPrangon.');
      setSelectedReport(null);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to dismiss report.');
    } finally {
      setActionInProgress(false);
    }
  };

  // Delete Review action: Deletes review from public listings and resolves report
  const handleDeleteReview = async (report: AdminReportItem) => {
    try {
      setActionInProgress(true);

      // 1. Immediately track deletion in localStorage so public listings filter it out across the app
      const deletedKey = 'internprangon_deleted_reviews';
      const existingDeleted: string[] = JSON.parse(
        localStorage.getItem(deletedKey) || '[]'
      );
      const itemsToAdd = [
        report.reviewId ? String(report.reviewId) : null,
        report.id ? String(report.id) : null,
        report.content ? `txt:${report.content.trim().slice(0, 45)}` : null,
      ].filter(Boolean) as string[];

      itemsToAdd.forEach((item) => {
        if (!existingDeleted.includes(item)) {
          existingDeleted.push(item);
        }
      });
      localStorage.setItem(deletedKey, JSON.stringify(existingDeleted));
      window.dispatchEvent(new Event('internprangon_reviews_updated'));

      // 2. Update local state immediately so UI updates with zero lag
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: 'Deleted' } : r))
      );
      if (selectedReport?.id === report.id) {
        setSelectedReport((prev) => (prev ? { ...prev, status: 'Deleted' } : null));
      }

      // 3. Perform backend deletion if real MongoDB ObjectId
      if (report.reviewId && !report.reviewId.startsWith('rev-')) {
        await deleteReviewAdmin(report.reviewId).catch((apiErr) => {
          console.warn('Backend review deletion notice:', apiErr?.message);
        });
      }

      // 4. Resolve flag on backend if real flag
      if (report.flagId && !report.flagId.startsWith('flag-')) {
        await updateFlagStatusAdmin(report.flagId, 'Resolved').catch(() => {});
      }

      setToastMessage('Review deleted successfully from InternPrangon.');
      setSelectedReport(null);
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to delete review.');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    try {
      const auth = await login('admin123@gmail.com', 'admin123');
      saveAuth(auth);
      setCurrentUser(auth.user);
      setToastMessage('Signed in as Demo Admin (admin123@gmail.com)');
      fetchReports();
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to sign in as admin.');
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100000] bg-neutral-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 border border-white/10 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Session Notice if not signed in as admin */}
      {!isAdmin && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠️ Notice:</span>
            <span>
              You are currently viewing as {currentUser ? currentUser.role : 'Guest'}.
              Sign in as Demo Admin for live backend server sync.
            </span>
          </div>
          <button
            onClick={handleQuickAdminLogin}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shrink-0 transition shadow-sm"
          >
            Sign in as Admin (1-Click)
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">Review Reports</h1>
              {pendingCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Review and moderate flagged reviews reported by students.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-brand-50/70 border border-brand-100 rounded-xl px-4 py-2.5 self-start md:self-auto">
            <svg
              className="w-4 h-4 text-brand-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className="text-xs text-brand-800 font-medium">
              Student identities are protected. Reviews &amp; reports remain anonymous.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { label: 'All', value: 'all' },
                { label: 'Pending', value: 'Pending' },
                { label: 'Resolved', value: 'Resolved' },
                { label: 'Deleted', value: 'Deleted' },
              ] as const
            ).map((t) => (
              <button
                key={t.value}
                onClick={() => setFilterStatus(t.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterStatus === t.value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              aria-label="Filter by reason"
              className="text-xs border border-neutral-200 rounded-xl px-3 py-2 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              <option value="all">All Reasons</option>
              <option value="Fake or misleading">Fake or misleading</option>
              <option value="Spam">Spam</option>
              <option value="Inappropriate content">Inappropriate content</option>
              <option value="Other">Other</option>
            </select>

            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search company or review..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded-xl pl-8 pr-3 py-2 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
              <svg
                className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Review Reports Table */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-6">
        {loading ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent mb-3" />
            <p className="text-xs text-neutral-500 font-medium">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-sm">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-800">No review reports found</p>
            <p className="text-xs text-neutral-500 mt-1">
              There are no reports matching the selected filters.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Review</th>
                    <th className="py-3.5 px-5">Company</th>
                    <th className="py-3.5 px-5">Reason</th>
                    <th className="py-3.5 px-5">Reported By</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-neutral-50/80 transition group"
                    >
                      {/* Review Column: Stars + Snippet */}
                      <td className="py-4 px-5 max-w-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                          <StarRating rating={report.rating} />
                          <span className="text-[11px] font-semibold text-neutral-500">
                            {report.rating}.0
                          </span>
                        </div>
                        <p
                          className={`text-neutral-800 font-normal leading-relaxed line-clamp-2 ${
                            report.status === 'Deleted' ? 'line-through text-neutral-400' : ''
                          }`}
                        >
                          “{report.content}”
                        </p>
                      </td>

                      {/* Company Column */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{
                              backgroundColor: report.companyLogoBg,
                              color: report.companyLogoColor,
                            }}
                          >
                            {report.companyLogo}
                          </div>
                          <span className="font-semibold text-neutral-900">
                            {report.companyName}
                          </span>
                        </div>
                      </td>

                      {/* Reason Column */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getReasonBadgeClass(
                            report.reportReason
                          )}`}
                        >
                          {report.reportReason}
                        </span>
                      </td>

                      {/* Reported By Column */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
                          <svg
                            className="w-3.5 h-3.5 text-neutral-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>{report.reportedBy}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {report.reportedDate}
                        </p>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {report.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending
                          </span>
                        )}
                        {report.status === 'Resolved' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Resolved
                          </span>
                        )}
                        {report.status === 'Deleted' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
                            Deleted
                          </span>
                        )}
                      </td>

                      {/* Action Column */}
                      <td className="py-4 px-5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white transition shadow-sm"
                          >
                            Review &rarr;
                          </button>
                          {report.status !== 'Deleted' && (
                            <button
                              onClick={() => handleDeleteReview(report)}
                              title="Delete Review"
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Admin Moderation Inspection Modal */}
      {selectedReport &&
        (typeof document !== 'undefined'
          ? createPortal(
              <div
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={() => setSelectedReport(null)}
              >
                <div
                  className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 animate-scale-in relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 text-base">
                          Review Report Details
                        </h3>
                        <p className="text-[11px] text-neutral-500">
                          Evaluate flagged submission and choose moderation action
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-xl hover:bg-neutral-100 transition"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="space-y-4 my-5">
                    {/* Flag Details Banner */}
                    <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-neutral-700">Flag Reason:</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getReasonBadgeClass(
                            selectedReport.reportReason
                          )}`}
                        >
                          {selectedReport.reportReason}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>Reported By:</span>
                        <span className="font-medium text-neutral-700">
                          {selectedReport.reportedBy} ({selectedReport.reportedDate})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                        <span>Current Status:</span>
                        <span className="font-semibold text-neutral-800">
                          {selectedReport.status}
                        </span>
                      </div>
                    </div>

                    {/* Review Card */}
                    <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                            style={{
                              backgroundColor: selectedReport.companyLogoBg,
                              color: selectedReport.companyLogoColor,
                            }}
                          >
                            {selectedReport.companyLogo}
                          </div>
                          <span className="font-bold text-neutral-900 text-xs">
                            {selectedReport.companyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <StarRating rating={selectedReport.rating} />
                          <span className="text-xs font-bold text-neutral-700">
                            {selectedReport.rating}.0
                          </span>
                        </div>
                      </div>

                      <div className="bg-neutral-50/80 rounded-xl p-3.5 border border-neutral-100">
                        <p className="text-neutral-800 text-xs sm:text-sm italic leading-relaxed">
                          “{selectedReport.content}”
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Anonymous review submission</span>
                        <span>Posted: {selectedReport.reviewDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Moderation Actions */}
                  {selectedReport.status === 'Deleted' ? (
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        This review has been removed.
                      </span>
                      <button
                        onClick={() => setSelectedReport(null)}
                        className="px-4 py-2 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-200 transition"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-neutral-100">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] text-neutral-500 font-medium">
                          {selectedReport.status === 'Pending'
                            ? 'Select moderation action:'
                            : 'Report marked as Resolved (Review is active).'}
                        </p>
                        {selectedReport.status === 'Resolved' && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                            Live on site
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedReport.status === 'Pending' && (
                          <button
                            disabled={actionInProgress}
                            onClick={() => handleKeepReview(selectedReport)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition disabled:opacity-50"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Keep Review
                          </button>
                        )}

                        <button
                          disabled={actionInProgress}
                          onClick={() => handleDeleteReview(selectedReport)}
                          className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm disabled:opacity-50 ${
                            selectedReport.status === 'Resolved' ? 'col-span-2' : ''
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete Review
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>,
              document.body
            )
          : null)}
    </div>
  );
}
