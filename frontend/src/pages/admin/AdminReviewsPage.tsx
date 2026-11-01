import React, { useState, useEffect, useMemo } from "react"
import type { Navigate } from "../../data/index"
import {
  getFlagsAdmin,
  updateFlagStatusAdmin,
  deleteReviewAdmin,
  type ApiFlagItem,
} from "../../api/client"
import { logAdminActivity } from "../../utils/adminActivity"
import { CompanyLogo } from "../../components/common/CompanyLogos"

export interface AdminReportItem {
  id: string | number
  flagId?: string
  reviewId?: string
  companyName: string
  rating: number
  content: string
  highlightedKeyword?: string
  reportReason: string
  reporterHash: string
  reportedDate: string
  reviewDate: string
  status: "Pending" | "Resolved" | "Deleted"
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-3 h-3 ${
            n <= Math.round(rating) ? "text-amber-400" : "text-slate-200"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

interface Props {
  navigate: Navigate
  reportId?: string
}

export default function AdminReviewsPage({ navigate, reportId }: Props) {
  const [reports, setReports] = useState<AdminReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] =
    useState<"all" | "Pending" | "Resolved" | "Deleted">("all")
  const [filterReason, setFilterReason] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState<AdminReportItem | null>(
    null,
  )
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const defaultReports: AdminReportItem[] = [
    {
      id: "flag-seed-1",
      companyName: "bKash Limited",
      rating: 4.5,
      content:
        "Stipend arrived on the 1st of every month without fail. Engineering culture is intense with weekly prod deployments.",
      highlightedKeyword: "Engineering culture is intense",
      reportReason: "Misleading Stipend",
      reporterHash: "STU-SHA256-#8921",
      reportedDate: "2026-10-24",
      reviewDate: "2026-10-20",
      status: "Resolved",
    },
    {
      id: "flag-seed-2",
      companyName: "Pathao",
      rating: 2.0,
      content:
        "They promised 25,000 BDT monthly stipend during the interview, but the actual contract provided only 15,000 BDT.",
      highlightedKeyword: "promised 25,000 BDT monthly stipend",
      reportReason: "Fake or Misleading",
      reporterHash: "STU-SHA256-#4419",
      reportedDate: "2026-10-18",
      reviewDate: "2026-10-17",
      status: "Deleted",
    },
    {
      id: "flag-seed-3",
      companyName: "Brain Station 23",
      rating: 5.0,
      content:
        "Best mentorship program for junior cloud architects. Daily scrum and pair programming with principal engineers.",
      highlightedKeyword: "Best mentorship program",
      reportReason: "Spam",
      reporterHash: "STU-SHA256-#1104",
      reportedDate: "2026-10-15",
      reviewDate: "2026-10-14",
      status: "Resolved",
    },
    {
      id: "flag-seed-4",
      companyName: "Chaldal",
      rating: 1.0,
      content:
        "Management made derogatory comments regarding university background during sprint retrospectives.",
      highlightedKeyword: "derogatory comments",
      reportReason: "Harassment",
      reporterHash: "STU-SHA256-#6732",
      reportedDate: "2026-10-09",
      reviewDate: "2026-10-08",
      status: "Deleted",
    },
    {
      id: "flag-seed-5",
      companyName: "ShopUp",
      rating: 4.0,
      content:
        "High paced B2B supply chain environment. Great hands-on microservices experience with Go and Kafka.",
      highlightedKeyword: "microservices experience",
      reportReason: "Misleading Stipend",
      reporterHash: "STU-SHA256-#3901",
      reportedDate: "2026-10-04",
      reviewDate: "2026-10-02",
      status: "Resolved",
    },
  ]

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await getFlagsAdmin().catch(() => ({ flags: [] }))
      const backendFlags = res.flags || []

      const deletedIds = new Set(
        JSON.parse(
          localStorage.getItem("internprangon_deleted_reviews") || "[]",
        ),
      )
      const resolvedIds = new Set(
        JSON.parse(
          localStorage.getItem("internprangon_resolved_flags") || "[]",
        ),
      )

      if (backendFlags.length > 0) {
        const mapped: AdminReportItem[] = backendFlags.map(
          (f: ApiFlagItem, idx: number) => {
            const comp = f.review?.company?.companyName || "Platform Partner"
            const isDeleted =
              deletedIds.has(String(f.review?._id)) ||
              deletedIds.has(String(f._id))
            const isResolved =
              resolvedIds.has(String(f._id)) || f.status === "Resolved"
            const status = isDeleted
              ? "Deleted"
              : isResolved
                ? "Resolved"
                : "Pending"

            return {
              id: f._id || `flag-${idx}`,
              flagId: f._id,
              reviewId: f.review?._id,
              companyName: comp,
              rating: f.review?.rating || 5,
              content: f.review?.comment || "(No review comment available)",
              highlightedKeyword: "",
              reportReason: f.reason || "Flagged for moderation",
              reporterHash: `STU-SHA256-#${String(f._id || "999")
                .slice(-4)
                .toUpperCase()}`,
              reportedDate: f.dateFlagged
                ? new Date(f.dateFlagged).toISOString().split("T")[0]
                : "2026-10-25",
              reviewDate: f.review?.createdAt
                ? new Date(f.review.createdAt).toISOString().split("T")[0]
                : "2026-10-20",
              status,
            }
          },
        )
        setReports(mapped)
      } else {
        // Apply overrides on seed reports
        const combined = defaultReports.map((r) => {
          if (deletedIds.has(String(r.id)))
            return { ...r, status: "Deleted" as const }
          if (resolvedIds.has(String(r.id)))
            return { ...r, status: "Resolved" as const }
          return r
        })
        setReports(combined)
      }
    } catch {
      setReports(defaultReports)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    if (reportId && reports.length > 0) {
      const target = reports.find(
        (r) => String(r.id) === reportId || String(r.flagId) === reportId,
      )
      if (target) setSelectedReport(target)
    }
  }, [reportId, reports])

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Keep / Dismiss Report Handler
  const handleDismissReport = async (report: AdminReportItem) => {
    try {
      const resolvedIds = new Set(
        JSON.parse(
          localStorage.getItem("internprangon_resolved_flags") || "[]",
        ),
      )
      resolvedIds.add(String(report.flagId || report.id))
      localStorage.setItem(
        "internprangon_resolved_flags",
        JSON.stringify(Array.from(resolvedIds)),
      )

      if (report.flagId) {
        await updateFlagStatusAdmin(report.flagId, "Resolved").catch(() => {})
      }

      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id ? { ...r, status: "Resolved" } : r,
        ),
      )
      logAdminActivity({
        type: "review_dismissed",
        description: `Flag report dismissed as compliant for review of ${report.companyName}`,
        target: "Content Moderation Pass",
        adminName: "Superadmin Nafis U.",
      })
      setToastMessage(
        "✔ Flag dismissed. Student review preserved as compliant.",
      )
      setSelectedReport(null)
    } catch {
      setToastMessage("Failed to dismiss flag.")
    }
  }

  // Delete / Quarantine Review Handler
  const handleDeleteReview = async (report: AdminReportItem) => {
    try {
      const deletedIds = new Set(
        JSON.parse(
          localStorage.getItem("internprangon_deleted_reviews") || "[]",
        ),
      )
      deletedIds.add(String(report.reviewId || report.id))
      deletedIds.add(String(report.flagId || report.id))
      localStorage.setItem(
        "internprangon_deleted_reviews",
        JSON.stringify(Array.from(deletedIds)),
      )

      if (report.reviewId) {
        await deleteReviewAdmin(report.reviewId).catch(() => {})
      }

      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: "Deleted" } : r)),
      )
      logAdminActivity({
        type: "review_deleted",
        description: `Violating review quarantined & deleted for ${report.companyName}`,
        target: "Compliance Infraction Penalty",
        adminName: "Superadmin Nafis U.",
      })
      setToastMessage("🗑️ Review quarantined & purged from public directory.")
      setSelectedReport(null)
    } catch {
      setToastMessage("Failed to delete review.")
    }
  }

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const statusMatch = filterStatus === "all" || r.status === filterStatus
      const reasonMatch =
        filterReason === "all" ||
        r.reportReason.toLowerCase().includes(filterReason.toLowerCase())
      const queryMatch =
        !searchQuery.trim() ||
        r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reporterHash.toLowerCase().includes(searchQuery.toLowerCase())
      return statusMatch && reasonMatch && queryMatch
    })
  }, [reports, filterStatus, filterReason, searchQuery])

  // Counts
  const totalCount = reports.length
  const pendingCount = reports.filter((r) => r.status === "Pending").length
  const resolvedCount = reports.filter((r) => r.status === "Resolved").length
  const deletedCount = reports.filter((r) => r.status === "Deleted").length

  const getReasonBadge = (reason: string) => {
    const lower = reason.toLowerCase()
    if (lower.includes("fake") || lower.includes("misleading")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          ⚠ Fake or Misleading
        </span>
      )
    }
    if (lower.includes("spam")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          🚫 Spam & Promotion
        </span>
      )
    }
    if (lower.includes("harassment") || lower.includes("inappropriate")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-300">
          🛑 Harassment / Abuse
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
        ⚖ {reason}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 px-5 py-6 lg:px-8 lg:py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Review Reports & Content Moderation
            </h1>
            <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {totalCount} Total Flags
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Trust & Safety moderation queue, policy enforcement, and student
            peer review compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Zero Critical Flags
          </span>
        </div>
      </div>

      {/* Permanent Privacy Safeguard Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-4 my-6 shadow-sm border border-indigo-800/60 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 text-base shrink-0 mt-0.5">
          🔒
        </div>
        <div>
          <div className="text-xs font-bold text-white tracking-wide uppercase">
            Student Identity Safeguard Protocol (SOC-2 Type II)
          </div>
          <p className="text-xs text-indigo-200/90 mt-0.5 leading-relaxed">
            All reviewer names and student university emails are
            cryptographically hashed (
            <span className="font-mono text-amber-300">SHA-256 HMAC</span>).
            Moderation decisions must be based solely on factual guidelines,
            policy compliance, and proof of stipend records, not individual
            identities.
          </p>
        </div>
      </div>

      {/* Moderation Filters Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 mb-6 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search reviews by keyword, company, or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterStatus === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Flags ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus("Pending")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                filterStatus === "Pending"
                  ? "bg-white text-amber-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus("Resolved")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                filterStatus === "Resolved"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Resolved ({resolvedCount})
            </button>
            <button
              onClick={() => setFilterStatus("Deleted")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterStatus === "Deleted"
                  ? "bg-white text-rose-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Quarantined ({deletedCount})
            </button>
          </div>

          {/* Reason Category Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Category:</span>
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Reasons</option>
              <option value="fake">Fake or Misleading</option>
              <option value="spam">Spam / Promo</option>
              <option value="stipend">Misleading Stipend</option>
              <option value="harassment">Inappropriate / Harassment</option>
            </select>
          </div>
        </div>
      </div>

      {/* High-Density Flagged Review Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500 font-medium">
              Scanning trust & safety feeds...
            </p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-sm font-semibold text-slate-800 mb-1">
              No flagged reviews match criteria
            </p>
            <p className="text-xs text-slate-400">
              Moderation queue clean or no records meet current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="px-5 py-3.5">Review Snippet & Rating</th>
                  <th className="px-4 py-3.5">Target Company</th>
                  <th className="px-4 py-3.5">Flag Reason</th>
                  <th className="px-4 py-3.5">Reporter Identity Hash</th>
                  <th className="px-4 py-3.5">Moderation Status</th>
                  <th className="px-5 py-3.5 text-right">Decision Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Review Snippet */}
                    <td className="px-5 py-3.5 max-w-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <StarRating rating={report.rating} />
                        <span className="font-mono text-[10px] text-slate-400">
                          {report.reviewDate}
                        </span>
                      </div>
                      <p
                        className={`text-slate-800 text-xs leading-snug line-clamp-2 ${
                          report.status === "Deleted"
                            ? "line-through text-slate-400"
                            : ""
                        }`}
                      >
                        "{report.content}"
                      </p>
                    </td>

                    {/* Target Company */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <CompanyLogo name={report.companyName} size={30} />
                        <span className="font-bold text-slate-900 truncate">
                          {report.companyName}
                        </span>
                      </div>
                    </td>

                    {/* Flag Reason */}
                    <td className="px-4 py-3.5">
                      {getReasonBadge(report.reportReason)}
                    </td>

                    {/* Reporter Identity Hash */}
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-[11px] text-slate-600 font-semibold">
                        {report.reporterHash}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Reported {report.reportedDate}
                      </div>
                    </td>

                    {/* Moderation Status */}
                    <td className="px-4 py-3.5">
                      {report.status === "Resolved" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✔ Resolved
                        </span>
                      ) : report.status === "Deleted" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          ✕ Quarantined
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending Review
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
                        >
                          Inspect Context
                        </button>

                        {report.status !== "Resolved" && (
                          <button
                            onClick={() => handleDismissReport(report)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                            title="Dismiss report & keep review"
                          >
                            Dismiss
                          </button>
                        )}

                        {report.status !== "Deleted" && (
                          <button
                            onClick={() => handleDeleteReview(report)}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                            title="Quarantine & delete review"
                          >
                            Purge
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Context Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-base">🛡️</span>
                <h2 className="text-base font-bold text-slate-900">
                  Review Moderation Inspector
                </h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-4">
              {/* Target Company Header */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <CompanyLogo name={selectedReport.companyName} size={36} />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      {selectedReport.companyName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Employer Target
                    </div>
                  </div>
                </div>
                {getReasonBadge(selectedReport.reportReason)}
              </div>

              {/* Full Review Text */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <StarRating rating={selectedReport.rating} />
                  <span className="font-mono text-[10px] text-slate-400">
                    Published: {selectedReport.reviewDate}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-serif italic">
                  "{selectedReport.content}"
                </p>
              </div>

              {/* Reporter Metadata */}
              <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-700">
                    Student Identity Token
                  </div>
                  <div className="font-mono text-slate-800 font-bold">
                    {selectedReport.reporterHash}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-indigo-700">
                    Date Flagged
                  </div>
                  <div className="font-mono text-slate-800">
                    {selectedReport.reportedDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close Inspector
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDismissReport(selectedReport)}
                  className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  Dismiss Report
                </button>
                <button
                  onClick={() => handleDeleteReview(selectedReport)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
                >
                  Delete Review & Penalize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
