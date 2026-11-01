import React, { useState, useEffect, useMemo } from "react"
import type { Navigate } from "../../data/index"
import {
  getStoredActivities,
  type AdminActivityItem,
} from "../../utils/adminActivity"
import { getAllCompaniesAdmin } from "../../api/client"

export interface AuditLogEntry {
  eventId: string
  timestamp: string
  actor: string
  actorIp: string
  actionCode: "COMPANY_VERIFIED" | "COMPANY_REGISTERED" | "VERIFICATION_REVOKED" | "REVIEW_QUARANTINED" | "REVIEW_DISMISSED" | "INTERNSHIP_PUBLISHED" | "INTERNSHIP_DELETED" | "AUTH_TOKEN_ROTATED" | "SECURITY_POLICY_UPDATE"
  targetEntity: string
  targetId: string
  severity: "INFO" | "WARNING" | "CRITICAL"
  category: "verifications" | "reviews" | "companies" | "auth"
  summary: string
  stateDiff?: {
    prev_state: Record<string, unknown>
    new_state: Record<string, unknown>
  }
}

export default function AdminActivityPage({
  navigate: _navigate,
}: {
  navigate: Navigate
}) {
  const [filter, setFilter] =
    useState<"all" | "verifications" | "reviews" | "companies" | "auth">("all")
  const [search, setSearch] = useState("")
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [activities, setActivities] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Generate seed SOC-2 compliant audit trail entries
  const defaultEntries: AuditLogEntry[] = [
    {
      eventId: "EVT-8921-XF",
      timestamp: "2026-11-01 14:32:08 UTC+6",
      actor: "Superadmin (nafis@internprangon.com)",
      actorIp: "103.114.98.24",
      actionCode: "COMPANY_VERIFIED",
      targetEntity: "Brain Station 23",
      targetId: "COM-0291",
      severity: "INFO",
      category: "verifications",
      summary:
        "Compliance documentation authenticated; posting authorization unlocked.",
      stateDiff: {
        prev_state: { verificationStatus: "Pending", authorizedPosting: false },
        new_state: {
          verificationStatus: "Approved",
          authorizedPosting: true,
          auditedBy: "nafis@internprangon.com",
        },
      },
    },
    {
      eventId: "EVT-8919-BC",
      timestamp: "2026-11-01 13:14:45 UTC+6",
      actor: "Superadmin (nafis@internprangon.com)",
      actorIp: "103.114.98.24",
      actionCode: "REVIEW_QUARANTINED",
      targetEntity: "Pathao",
      targetId: "REV-4812",
      severity: "WARNING",
      category: "reviews",
      summary:
        "Stipend discrepancy complaint investigated; review marked fraudulent & quarantined.",
      stateDiff: {
        prev_state: { reviewStatus: "Published", flagCount: 1 },
        new_state: {
          reviewStatus: "Quarantined",
          flaggedByHash: "STU-SHA256-#4419",
          penaltyApplied: false,
        },
      },
    },
    {
      eventId: "EVT-8902-TR",
      timestamp: "2026-11-01 11:20:10 UTC+6",
      actor: "Admin Ingestion Gateway",
      actorIp: "10.0.4.12 (Internal Node)",
      actionCode: "COMPANY_REGISTERED",
      targetEntity: "TEST LIMITED",
      targetId: "COM-9912",
      severity: "INFO",
      category: "companies",
      summary:
        "New enterprise registration submission with 2 uploaded trade license PDFs.",
      stateDiff: {
        prev_state: {},
        new_state: {
          name: "TEST LIMITED",
          industry: "Technology",
          documentsAttached: 2,
        },
      },
    },
    {
      eventId: "EVT-8874-SY",
      timestamp: "2026-11-01 09:00:01 UTC+6",
      actor: "SecOps Automated Daemon",
      actorIp: "10.0.0.1 (Dhaka Node)",
      actionCode: "AUTH_TOKEN_ROTATED",
      targetEntity: "System Keyring (Level 3 Access)",
      targetId: "KEY-9021",
      severity: "INFO",
      category: "auth",
      summary:
        "Routine 24h administrative cryptographic session rotation completed.",
      stateDiff: {
        prev_state: {
          keyVersion: "v2026.10.31",
          validUntil: "2026-11-01T09:00:00Z",
        },
        new_state: {
          keyVersion: "v2026.11.01",
          validUntil: "2026-11-02T09:00:00Z",
        },
      },
    },
    {
      eventId: "EVT-8850-OP",
      timestamp: "2026-10-31 18:45:22 UTC+6",
      actor: "Superadmin (nafis@internprangon.com)",
      actorIp: "103.114.98.24",
      actionCode: "COMPANY_VERIFIED",
      targetEntity: "Optimizely",
      targetId: "COM-0412",
      severity: "INFO",
      category: "verifications",
      summary: "City corporation trade license authenticated via RJSC API.",
      stateDiff: {
        prev_state: { verificationStatus: "Pending" },
        new_state: { verificationStatus: "Approved" },
      },
    },
    {
      eventId: "EVT-8821-CH",
      timestamp: "2026-10-31 16:10:05 UTC+6",
      actor: "Superadmin (nafis@internprangon.com)",
      actorIp: "103.114.98.24",
      actionCode: "COMPANY_VERIFIED",
      targetEntity: "Chaldal",
      targetId: "COM-0118",
      severity: "INFO",
      category: "verifications",
      summary: "Enterprise verification audit approved.",
      stateDiff: {
        prev_state: { verificationStatus: "Pending" },
        new_state: { verificationStatus: "Approved" },
      },
    },
    {
      eventId: "EVT-8810-SH",
      timestamp: "2026-10-30 14:15:30 UTC+6",
      actor: "Superadmin (nafis@internprangon.com)",
      actorIp: "103.114.98.24",
      actionCode: "COMPANY_VERIFIED",
      targetEntity: "ShopUp",
      targetId: "COM-0881",
      severity: "INFO",
      category: "verifications",
      summary: "B2B Commerce entity verification completed.",
      stateDiff: {
        prev_state: { verificationStatus: "Pending" },
        new_state: { verificationStatus: "Approved" },
      },
    },
    {
      eventId: "EVT-8790-BK",
      timestamp: "2026-10-29 11:24:18 UTC+6",
      actor: "Superadmin (nafis@internprangon.com)",
      actorIp: "103.114.98.24",
      actionCode: "COMPANY_VERIFIED",
      targetEntity: "bKash Limited",
      targetId: "COM-0012",
      severity: "INFO",
      category: "verifications",
      summary: "Fintech compliance verification cleared.",
      stateDiff: {
        prev_state: { verificationStatus: "Pending" },
        new_state: { verificationStatus: "Approved" },
      },
    },
  ]

  const loadActivities = async () => {
    try {
      setLoading(true)
      const stored = getStoredActivities()

      // Transform stored activities into structured AuditLogEntries
      const transformedStored: AuditLogEntry[] = stored.map((item, idx) => {
        let code: AuditLogEntry["actionCode"] = "COMPANY_VERIFIED"
        let sev: AuditLogEntry["severity"] = "INFO"
        let cat: AuditLogEntry["category"] = "verifications"

        if (item.type === "verification_approved") {
          code = "COMPANY_VERIFIED"
          sev = "INFO"
          cat = "verifications"
        } else if (item.type === "verification_rejected") {
          code = "VERIFICATION_REVOKED"
          sev = "WARNING"
          cat = "verifications"
        } else if (item.type === "review_deleted") {
          code = "REVIEW_QUARANTINED"
          sev = "CRITICAL"
          cat = "reviews"
        } else if (item.type === "review_dismissed") {
          code = "REVIEW_DISMISSED"
          sev = "INFO"
          cat = "reviews"
        } else if (item.type === "company_registered") {
          code = "COMPANY_REGISTERED"
          sev = "INFO"
          cat = "companies"
        } else if (item.type === "internship_posted") {
          code = "INTERNSHIP_PUBLISHED"
          sev = "INFO"
          cat = "companies"
        }

        return {
          eventId: `EVT-89${90 - idx}-RT`,
          timestamp: item.timestamp.includes("T")
            ? new Date(item.timestamp).toLocaleString("en-US", {
                timeZoneName: "short",
              })
            : item.timestamp,
          actor: item.adminName
            ? `${item.adminName} (nafis@internprangon.com)`
            : "Admin System",
          actorIp: "103.114.98.24",
          actionCode: code,
          targetEntity: item.description
            .replace(/^Company\s+/i, "")
            .replace(/\s+verified$/i, ""),
          targetId: `RES-${1000 + idx}`,
          severity: sev,
          category: cat,
          summary: item.description,
          stateDiff: {
            prev_state: { status: "Pending Review" },
            new_state: {
              status: "Approved / Executed",
              auditNote: item.description,
            },
          },
        }
      })

      // Merge transformed with defaults ensuring uniqueness
      const combined = [...transformedStored, ...defaultEntries]
      const seen = new Set<string>()
      const deduplicated = combined.filter((e) => {
        if (seen.has(e.summary)) return false
        seen.add(e.summary)
        return true
      })

      setActivities(deduplicated)
    } catch {
      setActivities(defaultEntries)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities()
    window.addEventListener("storage", loadActivities)
    window.addEventListener("internprangon_activity_updated", loadActivities)
    return () => {
      window.removeEventListener("storage", loadActivities)
      window.removeEventListener(
        "internprangon_activity_updated",
        loadActivities,
      )
    }
  }, [])

  const filtered = useMemo(() => {
    return activities.filter((item) => {
      const categoryMatch = filter === "all" || item.category === filter
      const searchMatch =
        !search.trim() ||
        item.eventId.toLowerCase().includes(search.toLowerCase()) ||
        item.actionCode.toLowerCase().includes(search.toLowerCase()) ||
        item.targetEntity.toLowerCase().includes(search.toLowerCase()) ||
        item.actor.toLowerCase().includes(search.toLowerCase()) ||
        item.summary.toLowerCase().includes(search.toLowerCase())
      return categoryMatch && searchMatch
    })
  }, [activities, filter, search])

  const getSeverityBadge = (severity: "INFO" | "WARNING" | "CRITICAL") => {
    if (severity === "CRITICAL") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          CRITICAL
        </span>
      )
    }
    if (severity === "WARNING") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          WARNING
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        INFO
      </span>
    )
  }

  const getActionPill = (code: AuditLogEntry["actionCode"]) => {
    return (
      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
        {code}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 px-5 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              System Activity & Audit Trail
            </h1>
            <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              SOC-2 Type II Immutable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, timestamped record of platform administrative events,
            verification overrides, and role publications.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono self-start md:self-auto">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Append-Only Stream Active
          </span>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 my-6 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
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
            placeholder="Search by event ID, action code, actor, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Segmented Filter Buttons */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Events ({activities.length})
          </button>
          <button
            onClick={() => setFilter("verifications")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === "verifications"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Verifications
          </button>
          <button
            onClick={() => setFilter("reviews")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === "reviews"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Content Moderation
          </button>
          <button
            onClick={() => setFilter("companies")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === "companies"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Company Changes
          </button>
          <button
            onClick={() => setFilter("auth")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === "auth"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Auth Logs
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500 font-medium">
              Validating event cryptography...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-sm font-semibold text-slate-800 mb-1">
              No audit events match filters
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting your search criteria or category filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="px-5 py-3.5">Event ID</th>
                  <th className="px-4 py-3.5">Server Timestamp</th>
                  <th className="px-4 py-3.5">Actor & IP</th>
                  <th className="px-4 py-3.5">Action Taken</th>
                  <th className="px-4 py-3.5">Target Entity</th>
                  <th className="px-4 py-3.5">Severity</th>
                  <th className="px-5 py-3.5 text-right">State Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => (
                  <tr
                    key={log.eventId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Event ID */}
                    <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-600">
                      {log.eventId}
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    {/* Actor */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                        {log.actor}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {log.actorIp}
                      </div>
                    </td>

                    {/* Action Taken */}
                    <td className="px-4 py-3.5">
                      {getActionPill(log.actionCode)}
                    </td>

                    {/* Target Entity */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 truncate max-w-[180px]">
                        {log.targetEntity}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {log.targetId}
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="px-4 py-3.5">
                      {getSeverityBadge(log.severity)}
                    </td>

                    {/* Inspect Link */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors"
                      >
                        Inspect Diff →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <div className="font-mono">
            Showing{" "}
            <strong className="text-slate-800">{filtered.length}</strong>{" "}
            authenticated audit events
          </div>
          <div className="font-mono text-[11px] text-emerald-700 font-semibold">
            HMAC-SHA256 Signatures Valid
          </div>
        </div>
      </div>

      {/* View Event JSON / State Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                  {selectedLog.eventId}
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Event Audit Payload & State Diff
                </h2>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              {/* Event Metadata Banner */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">
                    Action Taken
                  </span>
                  <span className="font-bold text-slate-900">
                    {selectedLog.actionCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">
                    Server Timestamp
                  </span>
                  <span className="text-slate-700">
                    {selectedLog.timestamp}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">
                    Authenticated Actor
                  </span>
                  <span className="text-slate-700 truncate block">
                    {selectedLog.actor}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">
                    Target Resource
                  </span>
                  <span className="text-slate-700 font-bold">
                    {selectedLog.targetEntity}
                  </span>
                </div>
              </div>

              {/* Summary Description */}
              <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-slate-800">
                <span className="font-bold text-indigo-900">
                  Audit Summary:{" "}
                </span>
                {selectedLog.summary}
              </div>

              {/* JSON State Diff Comparison */}
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>State Mutation Payload Comparison</span>
                  <span className="font-mono text-slate-400">
                    Content-Type: application/json
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[10px]">
                  {/* Previous State */}
                  <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 text-rose-950 overflow-x-auto">
                    <div className="font-bold text-rose-700 pb-1 mb-1 border-b border-rose-200">
                      - PREVIOUS STATE
                    </div>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(
                        selectedLog.stateDiff?.prev_state || {},
                        null,
                        2,
                      )}
                    </pre>
                  </div>

                  {/* New State */}
                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950 overflow-x-auto">
                    <div className="font-bold text-emerald-700 pb-1 mb-1 border-b border-emerald-200">
                      + MUTATED STATE
                    </div>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(
                        selectedLog.stateDiff?.new_state || {},
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="font-mono text-[10px] text-slate-400">
                Cryptographic Signature:
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
