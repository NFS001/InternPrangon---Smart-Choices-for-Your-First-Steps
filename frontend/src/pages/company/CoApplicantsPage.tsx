import React, { useState, useEffect } from 'react'
import type { Navigate, HRAppStatus } from '../../data/index'
import { HR_APPLICANTS, HR_INTERNSHIPS } from '../../data/index'

interface Props {
  navigate: Navigate
  internshipId?: number
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
}

const STATUS_COLORS: Record<HRAppStatus, string> = {
  Applied: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  Shortlisted: 'bg-blue-50 text-blue-700 border border-blue-200',
  Interviewing: 'bg-amber-50 text-amber-700 border border-amber-200',
  Rejected: 'bg-danger-50 text-red-600 border border-red-200',
}

const STATUS_PILL_ACTIVE: Record<HRAppStatus, string> = {
  Applied: 'bg-neutral-700 text-white',
  Shortlisted: 'bg-blue-600 text-white',
  Interviewing: 'bg-amber-500 text-white',
  Rejected: 'bg-danger-600 text-white',
}

export default function CoApplicantsPage({ navigate, internshipId }: Props) {
  const [applicants, setApplicants] = useState(() => HR_APPLICANTS.map((a) => ({ ...a })))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filterStatus, setFilterStatus] = useState<HRAppStatus | 'all'>('all')
  const [filterInternship, setFilterInternship] = useState<number | 'all'>(internshipId ?? 'all')
  const [confirmAction, setConfirmAction] = useState<{ applicantId: number; newStatus: HRAppStatus } | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!successMessage) return
    const t = setTimeout(() => setSuccessMessage(null), 2500)
    return () => clearTimeout(t)
  }, [successMessage])

  function handleRetry() {
    setError(false)
    setLoading(true)
    setTimeout(() => setLoading(false), 600)
  }

  function applyStatusChange(applicantId: number, newStatus: HRAppStatus) {
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, status: newStatus } : a))
    )
    setSuccessMessage('Status updated successfully.')
  }

  function handleStatusChange(applicantId: number, newStatus: HRAppStatus) {
    if (newStatus === 'Rejected') {
      setConfirmAction({ applicantId, newStatus })
    } else {
      applyStatusChange(applicantId, newStatus)
    }
  }

  function handleConfirm() {
    if (!confirmAction) return
    applyStatusChange(confirmAction.applicantId, confirmAction.newStatus)
    setConfirmAction(null)
  }

  const activeInternships = HR_INTERNSHIPS.filter((i) => i.status === 'active')

  const filtered = applicants.filter((a) => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    if (filterInternship !== 'all' && a.internshipId !== filterInternship) return false
    return true
  })

  const allStatuses: HRAppStatus[] = ['Applied', 'Shortlisted', 'Interviewing', 'Rejected']

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Success Banner */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-xs bg-success-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="font-bold text-lg text-neutral-900">Mark as Rejected?</h2>
              <p className="text-sm text-neutral-500">
                {"This will notify the applicant that they have not been selected. This action cannot be undone."}
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-danger-600 text-white text-sm font-semibold hover:bg-danger-700 transition-colors"
                >
                  Confirm rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-5 lg:px-8 lg:py-8">
        {/* Header Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="font-display italic text-2xl text-neutral-900">Applicants</h1>
            {!loading && !error && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-100 text-[#7c3aed] text-xs font-bold">
                {filtered.length} results
              </span>
            )}
          </div>

          {/* Filter Controls */}
          <div className="ml-auto flex items-center gap-3 flex-wrap w-full sm:w-auto">
            {/* Internship Filter */}
            <select
              value={filterInternship}
              onChange={(e) => setFilterInternship(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full sm:w-auto border border-neutral-200 rounded-lg px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs font-semibold text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors"
            >
              <option value="all">All internships</option>
              {activeInternships.map((i) => (
                <option key={i.id} value={i.id}>{i.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto whitespace-nowrap pb-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-2 sm:py-1.5 rounded-full text-xs font-bold transition-colors flex-shrink-0 ${
              filterStatus === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            All
          </button>
          {allStatuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 sm:py-1.5 rounded-full text-xs font-bold transition-colors flex-shrink-0 ${
                filterStatus === s
                  ? STATUS_PILL_ACTIVE[s]
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="divide-y divide-neutral-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 shrink-0" />
                  <div className="flex-[2] space-y-2">
                    <div className="h-3 bg-neutral-200 rounded w-32" />
                    <div className="h-2.5 bg-neutral-100 rounded w-48" />
                  </div>
                  <div className="flex-[2]">
                    <div className="h-3 bg-neutral-200 rounded w-40" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-neutral-100 rounded w-20" />
                  </div>
                  <div className="flex-1">
                    <div className="h-5 bg-neutral-100 rounded-full w-20" />
                  </div>
                  <div className="flex-1 flex gap-2 justify-end">
                    <div className="h-6 bg-neutral-100 rounded-lg w-24" />
                    <div className="h-6 bg-neutral-100 rounded-lg w-16" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="px-6 py-12 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-danger-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-neutral-700">Failed to load applicants.</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div className="px-6 py-16 flex flex-col items-center gap-3">
              <svg className="w-16 h-16 text-neutral-200" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="12" y="4" width="40" height="56" rx="4" />
                <line x1="22" y1="20" x2="42" y2="20" />
                <line x1="22" y1="28" x2="42" y2="28" />
                <line x1="22" y1="36" x2="34" y2="36" />
                <path d="M16 4h8a4 4 0 018 0h8" strokeLinecap="round" />
              </svg>
              <h3 className="text-base font-bold text-neutral-700">No applicants found</h3>
              <p className="text-sm text-neutral-400">Try adjusting your filters</p>
              {filterStatus !== 'all' && (
                <button
                  onClick={() => setFilterStatus('all')}
                  className="mt-1 px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Table */}
          {!loading && !error && filtered.length > 0 && (
            <div>
              {/* Table Header — desktop only */}
              <div className="hidden md:flex px-4 py-3 bg-neutral-50 border-y border-neutral-200 items-center gap-4">
                <div className="flex-[2] text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Applicant</div>
                <div className="flex-[2] text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Internship</div>
                <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Applied</div>
                <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Status</div>
                <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 text-right">Actions</div>
              </div>

              {/* Rows */}
              {filtered.map((applicant) => {
                const isExpanded = expandedId === applicant.id
                return (
                  <div key={applicant.id} className="border-b border-neutral-100 last:border-b-0">
                    {/* Mobile card view */}
                    <div
                      className="md:hidden px-4 py-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : applicant.id)}
                    >
                      {/* Row 1: avatar + name + status */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-bold">{getInitials(applicant.name)}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-neutral-900 truncate">{applicant.name}</div>
                            <div className="text-xs text-neutral-400 truncate">{applicant.university} · {applicant.year}</div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[applicant.status]}`}>
                          {applicant.status}
                        </span>
                      </div>
                      {/* Row 2: internship + applied date */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-neutral-500 truncate flex-1 mr-2">{applicant.internshipTitle}</span>
                        <span className="text-xs text-neutral-400 shrink-0">{applicant.appliedDate}</span>
                      </div>
                      {/* Row 3: actions */}
                      <div
                        className="flex items-center gap-2 mt-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={applicant.status}
                          onChange={(e) => handleStatusChange(applicant.id, e.target.value as HRAppStatus)}
                          className="flex-1 border border-neutral-200 rounded-lg px-2 py-2.5 text-sm font-semibold text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-200 text-sm font-semibold text-[#7c3aed] hover:text-brand-700 hover:bg-brand-50 transition-colors shrink-0"
                          title={`Download ${applicant.resumeFile}`}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a1 1 0 001 1h10a1 1 0 001-1v-1M10 12V4m0 8l-3-3m3 3l3-3" />
                          </svg>
                          Resume
                        </button>
                      </div>
                    </div>

                    {/* Desktop table row */}
                    <div
                      className="hidden md:flex px-4 py-4 items-center gap-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : applicant.id)}
                    >
                      {/* Applicant Column */}
                      <div className="flex-[2] flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{getInitials(applicant.name)}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-neutral-900 truncate">{applicant.name}</div>
                          <div className="text-xs text-neutral-400 truncate">{applicant.university} · {applicant.year}</div>
                          <div className="text-xs text-neutral-400 truncate">{applicant.email}</div>
                        </div>
                      </div>

                      {/* Internship Column */}
                      <div className="flex-[2] min-w-0">
                        <div className="text-sm text-neutral-700 truncate">{applicant.internshipTitle}</div>
                      </div>

                      {/* Applied Column */}
                      <div className="flex-1">
                        <div className="text-sm text-neutral-500">{applicant.appliedDate}</div>
                      </div>

                      {/* Status Column */}
                      <div className="flex-1">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[applicant.status]}`}>
                          {applicant.status}
                        </span>
                      </div>

                      {/* Actions Column */}
                      <div
                        className="flex-1 flex gap-2 justify-end items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={applicant.status}
                          onChange={(e) => handleStatusChange(applicant.id, e.target.value as HRAppStatus)}
                          className="border border-neutral-200 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <button
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#7c3aed] hover:text-brand-700 transition-colors"
                          title={`Download ${applicant.resumeFile}`}
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a1 1 0 001 1h10a1 1 0 001-1v-1M10 12V4m0 8l-3-3m3 3l3-3" />
                          </svg>
                          Resume
                        </button>
                      </div>
                    </div>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <div className="px-4 pb-4 bg-neutral-50 border-b border-neutral-100">
                        {applicant.note && (
                          <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm italic text-amber-800">
                            {applicant.note}
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          {applicant.status !== 'Shortlisted' && applicant.status !== 'Rejected' && (
                            <button
                              onClick={() => handleStatusChange(applicant.id, 'Shortlisted')}
                              className="px-3 py-2.5 sm:py-1.5 rounded-lg bg-info-50 border border-info-200 text-info-700 text-xs font-bold hover:bg-info-100 transition-colors"
                            >
                              Move to Shortlisted
                            </button>
                          )}
                          {applicant.status !== 'Interviewing' && applicant.status !== 'Rejected' && (
                            <button
                              onClick={() => handleStatusChange(applicant.id, 'Interviewing')}
                              className="px-3 py-2.5 sm:py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors"
                            >
                              Move to Interviewing
                            </button>
                          )}
                          {applicant.status !== 'Rejected' && (
                            <button
                              onClick={() => handleStatusChange(applicant.id, 'Rejected')}
                              className="px-3 py-2.5 sm:py-1.5 rounded-lg bg-danger-50 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
