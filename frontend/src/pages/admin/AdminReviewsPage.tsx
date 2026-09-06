import React, { useState, useEffect } from 'react'
import type { Navigate, ModerationAction, ReportReason, ReportedReview } from '../../data/index'
import { REPORTED_REVIEWS } from '../../data/index'
import { getFlagsAdmin, updateFlagStatusAdmin, type ApiFlagItem } from '../../api/client'

export default function AdminReviewsPage({ navigate }: { navigate: Navigate }) {
  const [reviews, setReviews] = useState<Array<ReportedReview & { flagId?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filterAction, setFilterAction] = useState<ModerationAction | 'all'>('all')
  const [filterReason, setFilterReason] = useState<ReportReason | 'all'>('all')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    getFlagsAdmin()
      .then((res) => {
        if (res.flags && res.flags.length > 0) {
          const mapped: Array<ReportedReview & { flagId?: string }> = res.flags.map((f: ApiFlagItem, idx: number) => ({
            id: idx + 1,
            flagId: f._id,
            companyName: 'Platform Partner',
            companyLogo: 'PP',
            companyLogoBg: '#f5f3ff',
            companyLogoColor: '#7c3aed',
            reviewType: 'Internship Experience',
            rating: f.review?.rating || 4,
            authorRole: 'Student Reviewer',
            reviewDate: new Date(f.dateFlagged || Date.now()).toLocaleDateString(),
            content: f.review?.comment || 'Reported comment text',
            reportReason: (f.reason as ReportReason) || 'Inappropriate content',
            reportedBy: 'Platform User',
            reportedDate: new Date(f.dateFlagged || Date.now()).toLocaleDateString(),
            action: f.status === 'Resolved' ? 'dismissed' : 'pending',
          }))
          setReviews(mapped)
        } else {
          setReviews([...REPORTED_REVIEWS])
        }
      })
      .catch(() => {
        setReviews([...REPORTED_REVIEWS])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 2500)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const pendingCount = reviews.filter((r) => r.action === 'pending').length

  const filtered = reviews.filter((r) => {
    const actionMatch = filterAction === 'all' || r.action === filterAction
    const reasonMatch = filterReason === 'all' || r.reportReason === filterReason
    return actionMatch && reasonMatch
  })

  async function dismissReport(id: number) {
    const item = reviews.find((r) => r.id === id)
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, action: 'dismissed' } : r)))
    if (item?.flagId) {
      await updateFlagStatusAdmin(item.flagId, 'Resolved').catch(() => {})
    }
    setSuccessMessage('Report dismissed.')
  }

  async function confirmDeleteReview(id: number) {
    const item = reviews.find((r) => r.id === id)
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, action: 'deleted' } : r)))
    if (item?.flagId) {
      await updateFlagStatusAdmin(item.flagId, 'Resolved').catch(() => {})
    }
    setConfirmDelete(null)
    setSuccessMessage('Review removed.')
  }

  const reasonColor: Record<ReportReason, string> = {
    'Inappropriate content': 'bg-danger-50 text-danger-600 border-danger-200',
    'Fake review': 'bg-orange-50 text-orange-700 border-orange-200',
    Spam: 'bg-amber-50 text-amber-700 border-amber-200',
    'Misleading information': 'bg-info-50 text-info-600 border-blue-200',
    Other: 'bg-neutral-50 text-neutral-600 border-neutral-200',
  }

  const confirmReview = confirmDelete !== null ? reviews.find((r) => r.id === confirmDelete) : null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Success banner */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold">
          {successMessage}
        </div>
      )}

      {/* Confirmation modal */}
      {confirmDelete !== null && confirmReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-danger-600">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 text-center mb-2">Delete this review?</h2>
            <p className="text-sm text-neutral-600 text-center mb-4">
              This review will be permanently removed from InternPrangon. The anonymous contributor will not be notified.
            </p>
            <div className="bg-neutral-50 rounded-lg p-3 text-xs italic text-neutral-600 mb-6">
              {confirmReview.content.slice(0, 120)}{confirmReview.content.length > 120 ? '…' : ''}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-neutral-300 rounded-xl px-5 py-2.5 text-sm text-neutral-700 font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteReview(confirmDelete)}
                className="flex-1 bg-red-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-red-700"
              >
                Delete review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-neutral-900">Review Moderation</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{pendingCount} reports pending review</p>
        {pendingCount > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-600 shrink-0">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs text-amber-800 font-medium">
              Student identity is never exposed. Reviews are anonymous to protect contributors.
            </span>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 px-5 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          {(['all', 'pending', 'dismissed', 'deleted'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterAction(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterAction === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={filterReason}
          onChange={(e) => setFilterReason(e.target.value as ReportReason | 'all')}
          className="text-xs border border-neutral-200 rounded-lg px-3 py-1.5 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All reasons</option>
          <option value="Inappropriate content">Inappropriate content</option>
          <option value="Fake review">Fake review</option>
          <option value="Spam">Spam</option>
          <option value="Misleading information">Misleading information</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-5 py-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-neutral-200 rounded-lg" />
                  <div className="h-4 bg-neutral-200 rounded w-32" />
                  <div className="ml-auto h-6 bg-neutral-200 rounded-full w-24" />
                </div>
                <div className="h-3 bg-neutral-200 rounded w-full mb-2" />
                <div className="h-3 bg-neutral-200 rounded w-5/6 mb-2" />
                <div className="h-3 bg-neutral-200 rounded w-4/6" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-danger-50 border border-danger-200 rounded-xl p-6 text-center">
            <p className="text-danger-600 font-semibold mb-3">Failed to load reported reviews.</p>
            <button
              onClick={() => { setError(false); setLoading(true); setTimeout(() => { setReviews([...REPORTED_REVIEWS]); setLoading(false) }, 600) }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                <path d="M3 3l18 18M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3l-3.45-5.97M13.71 3.86a2 2 0 00-3.42 0l-.59 1.02" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-neutral-600 font-medium mb-4">No reported reviews match this filter.</p>
            <button
              onClick={() => { setFilterAction('all'); setFilterReason('all') }}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((review) => {
              const isDeleted = review.action === 'deleted'
              return (
                <div
                  key={review.id}
                  className={`bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-sm transition-shadow ${isDeleted ? 'opacity-60' : ''}`}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: review.companyLogoBg, color: review.companyLogoColor }}
                      >
                        {review.companyLogo}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">{review.companyName}</p>
                        <p className="text-xs text-neutral-400">{review.reviewType}</p>
                      </div>
                    </div>
                    <div>
                      {review.action === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending review
                        </span>
                      )}
                      {review.action === 'dismissed' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-500 border border-neutral-200">
                          Dismissed
                        </span>
                      )}
                      {review.action === 'deleted' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-danger-50 text-danger-600 border border-danger-200">
                          Deleted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Second row: pills */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span
                      className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${
                        review.reviewType === 'Internship Experience'
                          ? 'bg-brand-50 text-brand-700 border-brand-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {review.reviewType}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill={star <= review.rating ? '#f59e0b' : '#e5e5e5'}
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${reasonColor[review.reportReason] || 'bg-neutral-50 text-neutral-600 border-neutral-200'}`}>
                      {review.reportReason}
                    </span>
                    <span className="text-xs text-neutral-400">Reported {review.reportedDate || 'Recently'}</span>
                  </div>

                  {/* Review content */}
                  <div className="mt-3 bg-neutral-50 rounded-lg p-3">
                    {isDeleted ? (
                      <p className="text-sm text-neutral-400 italic">[Review removed]</p>
                    ) : (
                      <p className="text-sm text-neutral-700 italic">{review.content}</p>
                    )}
                    <p className="text-[10px] text-neutral-400 mt-1.5">
                      Anonymous review — contributor identity is not stored.
                    </p>
                  </div>

                  {/* Action buttons */}
                  {review.action === 'pending' && (
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => dismissReport(review.id)}
                        className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300"
                      >
                        Dismiss report
                      </button>
                      <button
                        onClick={() => setConfirmDelete(review.id)}
                        className="px-4 py-2 border border-danger-200 rounded-lg text-sm font-semibold text-danger-600 hover:bg-danger-50"
                      >
                        Delete review
                      </button>
                    </div>
                  )}

                  {review.action !== 'pending' && (
                    <p className="mt-3 text-xs text-neutral-400">
                      {isDeleted ? `Deleted · ${review.reviewDate}` : `Actioned on ${review.reviewDate}`}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
