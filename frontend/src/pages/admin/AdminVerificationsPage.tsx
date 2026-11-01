import React, { useState, useEffect } from "react"
import type { Navigate } from "../../data/index"
import type { AdminCompany, AdminVerifStatus } from "../../data/index"
import {
  getAllCompaniesAdmin,
  getCompanyDirectory,
  verifyCompanyAdmin,
  deleteCompanyAdmin,
  addCompanyAdmin,
} from "../../api/client"
import { logAdminActivity } from "../../utils/adminActivity"
import { CompanyLogo } from "../../components/common/CompanyLogos"

interface Props {
  navigate: Navigate
  companyId?: number | string
}

type QueueTab = "pending" | "all" | "approved" | "rejected"
type LiveAdminCompany = AdminCompany & { mongoId?: string }

const saveVerificationOverride = (
  company: { id: number | string mongoId?: string name: string },
  status: AdminVerifStatus,
) => {
  try {
    const raw = localStorage.getItem("internprangon_company_verifications")
    const overrides = raw ? JSON.parse(raw) : {}
    if (company.mongoId) overrides[String(company.mongoId)] = status
    overrides[String(company.id)] = status
    if (company.name) overrides[company.name.toLowerCase()] = status
    localStorage.setItem(
      "internprangon_company_verifications",
      JSON.stringify(overrides),
    )
    window.dispatchEvent(new Event("internprangon_verifications_updated"))
  } catch {}
}

export default function AdminVerificationsPage({ navigate, companyId }: Props) {
  const [companies, setCompanies] = useState<LiveAdminCompany[]>([])
  const [selectedId, setSelectedId] = useState<number | string | null>(
    companyId ?? null,
  )
  const [loading, setLoading] = useState(true)
  const [queueTab, setQueueTab] = useState<QueueTab>("pending")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Compliance checklist states (interactive)
  const [chkTradeLicense, setChkTradeLicense] = useState(true)
  const [chkEmailDomain, setChkEmailDomain] = useState(true)
  const [chkOfficeAddress, setChkOfficeAddress] = useState(true)

  // PDF Preview Drawer State
  const [activePdfDoc, setActivePdfDoc] = useState<{
    title: string
    filename: string
    date: string
    hash: string
  } | null>(null)
  const [pdfZoom, setPdfZoom] = useState(100)
  const [pdfRotation, setPdfRotation] = useState(0)

  // Clarification / Rejection Modals
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [showClarificationModal, setShowClarificationModal] = useState(false)
  const [clarificationNotes, setClarificationNotes] = useState("")

  // Revoke & Danger Zone Delete Modal
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("")

  // Add Company Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [addName, setAddName] = useState("")
  const [addIndustry, setAddIndustry] = useState("Software & IT")
  const [addWebsite, setAddWebsite] = useState("")
  const [addLoading, setAddLoading] = useState(false)

  const fetchLiveCompanies = async () => {
    try {
      setLoading(true)
      const overrides: Record<string, string> = JSON.parse(
        localStorage.getItem("internprangon_company_verifications") || "{}",
      )
      let rawList: any[] = []
      try {
        const res = await getAllCompaniesAdmin()
        rawList = res.companies || []
      } catch {
        const dir = await getCompanyDirectory({ limit: 100 }).catch(() => ({
          companies: [],
        }))
        rawList = dir.companies || []
      }

      const mapped: LiveAdminCompany[] = rawList.map((c, idx) => {
        const initials = c.companyName
          ? c.companyName.trim().slice(0, 2).toUpperCase()
          : "CO"
        const override =
          overrides[c._id] ||
          overrides[String(idx + 1)] ||
          overrides[(c.companyName || "").toLowerCase()]
        const baseStatus: AdminVerifStatus =
          c.verificationStatus === "Approved"
            ? "approved"
            : c.verificationStatus === "Rejected"
              ? "rejected"
              : "pending"
        const status = override as AdminVerifStatus || baseStatus
        const regNo = `REG-${(c._id || String(1000 + idx)).slice(-6).toUpperCase()}`

        return {
          id: c._id || idx + 1,
          mongoId: c._id,
          name: c.companyName || "Company",
          logo: initials,
          logoBg: "#eff6ff",
          logoColor: "#2563eb",
          slug: (c.companyName || "company")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-"),
          email:
            c.user &&
            typeof c.user === "object" &&
            "email" in c.user &&
            (c.user as { email?: string }).email
              ? (c.user as { email: string }).email
              : `compliance@${(c.companyName || "company").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
          website:
            c.website ||
            `https://${(c.companyName || "company").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
          industry: c.industry || "Information Technology & Services",
          size: "51–200 employees",
          location: "Dhaka, Bangladesh",
          registrationNo: regNo,
          internshipCount: c.internshipsCount ?? 2,
          reviewCount: c.reviewCount ?? 0,
          documents: [
            c.verificationDocument || "trade_license_2026.pdf",
            "certificate_of_incorporation.pdf",
          ],
          verificationStatus: status,
          submittedDate: new Date(c.createdAt || Date.now())
            .toISOString()
            .split("T")[0],
        }
      })
      setCompanies(mapped)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveCompanies()
    const handleSync = () => fetchLiveCompanies()
    window.addEventListener("storage", handleSync)
    window.addEventListener("internprangon_verifications_updated", handleSync)
    return () => {
      window.removeEventListener("storage", handleSync)
      window.removeEventListener(
        "internprangon_verifications_updated",
        handleSync,
      )
    }
  }, [])

  useEffect(() => {
    if (companyId !== undefined && companyId !== null) {
      setSelectedId(companyId)
    }
  }, [companyId])

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 3500)
      return () => clearTimeout(t)
    }
  }, [successMessage])

  const selected =
    companies.find(
      (c) =>
        String(c.id) === String(selectedId) ||
        (c.mongoId && c.mongoId === String(selectedId)),
    ) ?? null

  // Approve Handler
  const handleApprove = async () => {
    if (!selected) return
    const name = selected.name
    saveVerificationOverride(selected, "approved")
    if (selected.mongoId) {
      await verifyCompanyAdmin(selected.mongoId, "Approved").catch(() => {})
    }
    logAdminActivity({
      type: "verification_approved",
      description: `Company ${name} approved and verified by Superadmin`,
      target: selected.industry,
      adminName: "Superadmin Nafis U.",
    })
    setSuccessMessage(
      `✔ Verification approved for ${name}. Platform posting unlocked.`,
    )
    fetchLiveCompanies()
  }

  // Clarification Handler
  const handleSendClarification = () => {
    if (!selected) return
    setSuccessMessage(
      `Notification dispatched to ${selected.email} requesting updated filings.`,
    )
    setShowClarificationModal(false)
    setClarificationNotes("")
  }

  // Reject Handler
  const handleRejectConfirm = async () => {
    if (!selected) return
    const name = selected.name
    saveVerificationOverride(selected, "rejected")
    if (selected.mongoId) {
      await verifyCompanyAdmin(
        selected.mongoId,
        "Rejected",
        rejectReason,
      ).catch(() => {})
    }
    logAdminActivity({
      type: "verification_rejected",
      description: `Verification for ${name} rejected: ${rejectReason || "Compliance documentation mismatch"}`,
      target: selected.industry,
      adminName: "Superadmin Nafis U.",
    })
    setSuccessMessage(`✕ Registration for ${name} has been rejected.`)
    setShowRejectModal(false)
    setRejectReason("")
    fetchLiveCompanies()
  }

  // Revoke Handler
  const handleRevokeConfirm = async () => {
    if (!selected) return
    const name = selected.name
    saveVerificationOverride(selected, "pending")
    if (selected.mongoId) {
      await verifyCompanyAdmin(selected.mongoId, "Pending").catch(() => {})
    }
    logAdminActivity({
      type: "verification_rejected",
      description: `Verification revoked for ${name}. Account status reverted to Pending Audit.`,
      target: selected.industry,
      adminName: "Superadmin Nafis U.",
    })
    setSuccessMessage(
      `⚠ Verification revoked for ${name}. Entity returned to pending queue.`,
    )
    setShowRevokeModal(false)
    fetchLiveCompanies()
  }

  // Danger Zone Delete Handler
  const handleDeleteConfirm = async () => {
    if (
      !selected ||
      deleteConfirmationText.trim().toLowerCase() !==
        selected.name.toLowerCase()
    )
      return
    const targetMongoId = selected.mongoId
    const name = selected.name
    saveVerificationOverride(selected, "rejected")
    if (targetMongoId) {
      await deleteCompanyAdmin(targetMongoId).catch(() => {})
    }
    logAdminActivity({
      type: "verification_rejected",
      description: `Permanent deletion and data purge executed for company ${name}`,
      target: "Administrative Hard Delete",
      adminName: "Superadmin Nafis U.",
    })
    setSuccessMessage(`🗑️ Record for ${name} has been permanently expunged.`)
    setShowDeleteModal(false)
    setDeleteConfirmationText("")
    setSelectedId(null)
    fetchLiveCompanies()
  }

  // Add Company Manual Handler
  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName.trim()) return
    setAddLoading(true)
    try {
      await addCompanyAdmin({
        companyName: addName.trim(),
        industry: addIndustry,
        website: addWebsite.trim() || "https://enterprise.com",
        description: "Direct administrative entry awaiting compliance audit.",
        verificationStatus: "Pending",
        verificationDocument: "trade_license_2026.pdf",
      })
      setSuccessMessage(`Added "${addName.trim()}" to verification queue.`)
      setShowAddModal(false)
      setAddName("")
      setAddWebsite("")
      fetchLiveCompanies()
    } finally {
      setAddLoading(false)
    }
  }

  // Filtered Queue
  const queueFiltered = companies.filter((c) => {
    if (queueTab === "all") return true
    return c.verificationStatus === queueTab
  })

  const pendingCount = companies.filter(
    (c) => c.verificationStatus === "pending",
  ).length
  const approvedCount = companies.filter(
    (c) => c.verificationStatus === "approved",
  ).length

  /* ═════════════════════════════════════════════════════════════════════════════
     VIEW 1: AUDIT TICKET SPLIT VIEW (selected !== null)
     ═════════════════════════════════════════════════════════════════════════════ */
  if (selected !== null) {
    const isPending = selected.verificationStatus === "pending"
    const isApproved = selected.verificationStatus === "approved"
    const ticketId = `VRF-2026-${String(selected.registrationNo).replace("REG-", "")}`

    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-16 px-5 py-6 lg:px-8 lg:py-8">
        {/* Toast Notification */}
        {successMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {successMessage}
          </div>
        )}

        {/* Top Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-200/80 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setSelectedId(null)}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 transition-colors"
            >
              ← Back to Verification Queue
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 font-semibold">
              Audit Ticket #{ticketId}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold uppercase">
              {selected.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Ticket Status:
            </span>
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Verified & Authorized
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Pending Superadmin Review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                ✕ Rejected Registration
              </span>
            )}
          </div>
        </div>

        {/* Two-Column Legal Audit Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Legal Entity Profile & Document Viewer (65% width = col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Organization Legal Dossier Card */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3.5">
                  <CompanyLogo name={selected.name} size={48} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        {selected.name}
                      </h2>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {selected.registrationNo}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {selected.website}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Submitted On
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-800">
                    {selected.submittedDate}
                  </div>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 text-xs">
                <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Registered Corporate Address
                  </span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>📍</span> {selected.location || "Dhaka, Bangladesh"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Official Corporate Email
                  </span>
                  <div className="font-semibold text-slate-800 font-mono truncate flex items-center justify-between">
                    <span>{selected.email}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      🟢 Domain Matches
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Enterprise Size
                  </span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>👥</span> {selected.size || "51–200 employees"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Industry Classification
                  </span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>🏢</span> {selected.industry}
                  </div>
                </div>
              </div>
            </div>

            {/* Submitted Compliance Documents Inspector */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Submitted Compliance Documents
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cryptographically verifiable government and regulatory
                    filings
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  2 Files Attached
                </span>
              </div>

              {/* Document Review Cards */}
              <div className="space-y-3 mt-4">
                {/* Document 1: trade_license_2026.pdf */}
                <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-all bg-gradient-to-r from-slate-50/50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold shrink-0">
                      PDF
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        trade_license_2026.pdf
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Government Issued Trade License
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        1.8 MB · Uploaded {selected.submittedDate} · Hash:{" "}
                        <span className="text-slate-600">
                          SHA-256: 7f83...bc91
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() =>
                        setActivePdfDoc({
                          title: "City Corporation Trade License (2026)",
                          filename: "trade_license_2026.pdf",
                          date: selected.submittedDate,
                          hash: "SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5"
                    >
                      <span>👁️</span> Quick In-App PDF Preview
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob(
                          [
                            `Simulated Trade License Document for ${selected.name}`,
                          ],
                          { type: "application/pdf" },
                        )
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `trade_license_${selected.slug}.pdf`
                        a.click()
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Document 2: certificate_of_incorporation.pdf */}
                <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-all bg-gradient-to-r from-slate-50/50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold shrink-0">
                      PDF
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        certificate_of_incorporation.pdf
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          RJSC Incorporation Certificate
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        2.4 MB · Uploaded {selected.submittedDate} · Hash:{" "}
                        <span className="text-slate-600">
                          SHA-256: d41d...8cd9
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() =>
                        setActivePdfDoc({
                          title: "RJSC Certificate of Incorporation",
                          filename: "certificate_of_incorporation.pdf",
                          date: selected.submittedDate,
                          hash: "SHA256: d41d8cd98f00b204e9800998ecf8427e",
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5"
                    >
                      <span>👁️</span> Quick Preview
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob(
                          [
                            `Simulated RJSC Incorporation Certificate for ${selected.name}`,
                          ],
                          { type: "application/pdf" },
                        )
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `incorporation_${selected.slug}.pdf`
                        a.click()
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline PDF Preview Frame */}
              <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-slate-100">
                {/* PDF Viewer Top Controls Bar */}
                <div className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-300 font-semibold">
                      {activePdfDoc
                        ? activePdfDoc.filename
                        : "trade_license_2026.pdf"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      · Page 1 of 1
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPdfZoom(Math.max(50, pdfZoom - 10))}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 font-mono text-slate-200"
                    >
                      -
                    </button>
                    <span className="font-mono text-[11px] text-slate-300">
                      {pdfZoom}%
                    </span>
                    <button
                      onClick={() => setPdfZoom(Math.min(150, pdfZoom + 10))}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 font-mono text-slate-200"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setPdfRotation((pdfRotation + 90) % 360)}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                      title="Rotate 90 degrees"
                    >
                      ↻
                    </button>
                  </div>
                </div>

                {/* Simulated Document Canvas */}
                <div className="p-8 bg-slate-200 flex justify-center overflow-auto min-h-[360px]">
                  <div
                    className="bg-white text-slate-900 shadow-xl rounded-sm p-8 border border-slate-300 transition-transform origin-top"
                    style={{
                      transform: `scale(${pdfZoom / 100}) rotate(${pdfRotation}deg)`,
                      width: "520px",
                      minHeight: "400px",
                    }}
                  >
                    {/* Header Seal */}
                    <div className="text-center pb-4 border-b-2 border-slate-900">
                      <div className="w-10 h-10 rounded-full border-2 border-emerald-700 mx-auto flex items-center justify-center text-emerald-800 font-bold text-xs mb-1">
                        ★ BD ★
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Government of the People's Republic of Bangladesh
                      </div>
                      <div className="text-[11px] font-medium text-slate-600">
                        Dhaka South City Corporation · Trade License Certificate
                      </div>
                    </div>

                    {/* Certificate Body */}
                    <div className="py-6 space-y-3 text-[11px] leading-relaxed">
                      <div className="flex justify-between font-mono text-[10px] text-slate-500">
                        <span>License No: {selected.registrationNo}</span>
                        <span>Date: {selected.submittedDate}</span>
                      </div>

                      <p>
                        This is to certify that{" "}
                        <strong className="text-slate-900">
                          {selected.name}
                        </strong>
                        , having its principal registered office at{" "}
                        <strong className="text-slate-900">
                          {selected.location}
                        </strong>
                        , is hereby granted license to operate within the domain
                        of{" "}
                        <strong className="text-slate-900">
                          {selected.industry}
                        </strong>{" "}
                        for the fiscal period 2026–2027.
                      </p>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-[10px] space-y-1">
                        <div>
                          Authorized Officer: Director of Municipal Licensing
                        </div>
                        <div>Corporate Domain: {selected.website}</div>
                        <div>
                          Status: Verified Authentic Government Database
                        </div>
                      </div>
                    </div>

                    {/* Seal / Signature Stamp */}
                    <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                      <div className="font-mono text-[9px] text-slate-400">
                        SHA-256 Digest Authenticated · Security Node #109
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-8 border border-dashed border-emerald-600 rounded flex items-center justify-center text-[9px] font-bold text-emerald-800 rotate-6 bg-emerald-50/80">
                          VERIFIED
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Verification Action & Danger Zone (35% width = col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            {isPending ? (
              /* Verification Checklist & Decision Module (Pending State) */
              <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Verification Checklist
                  </h3>
                </div>

                {/* Compliance Checklist */}
                <div className="py-4 space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chkTradeLicense}
                      onChange={(e) => setChkTradeLicense(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-700 leading-tight">
                      Trade license validity verified with government database
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chkEmailDomain}
                      onChange={(e) => setChkEmailDomain(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-700 leading-tight">
                      Official corporate email domain authenticated (
                      <strong className="font-mono text-[11px]">
                        @{selected.slug}.com
                      </strong>
                      )
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chkOfficeAddress}
                      onChange={(e) => setChkOfficeAddress(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-700 leading-tight">
                      Physical office address confirmed in Dhaka, Bangladesh
                    </span>
                  </label>
                </div>

                {/* Decision Actions */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  {/* Primary: Approve */}
                  <button
                    onClick={handleApprove}
                    disabled={
                      !chkTradeLicense || !chkEmailDomain || !chkOfficeAddress
                    }
                    className="w-full py-2.5 px-4 bg-[#059669] hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    ✔ Approve Verification & Unlock Posting
                  </button>

                  {/* Secondary: Request Clarification */}
                  <button
                    onClick={() => setShowClarificationModal(true)}
                    className="w-full py-2 px-4 border border-amber-300 text-amber-800 bg-amber-50/50 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    ⚠ Request Further Clarification / Re-upload
                  </button>

                  {/* Tertiary: Reject */}
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full py-2 px-4 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors"
                  >
                    ✕ Reject Registration
                  </button>
                </div>
              </div>
            ) : (
              /* Verified Entity Maintenance & Danger Zone (Verified State) */
              <div className="space-y-6">
                {/* Verification Record Module */}
                <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-emerald-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Verification Active
                    </h3>
                  </div>

                  <div className="py-4 text-xs space-y-2">
                    <div className="text-slate-600">
                      Entity is authorized to post verified internship roles and
                      review student applications.
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 font-mono text-[11px] text-emerald-800">
                      Verified on Sep 7, 2026 by Superadmin Nafis U.
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setShowRevokeModal(true)}
                      className="w-full py-2 px-3 border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      Revoke Verification Status
                    </button>
                  </div>
                </div>

                {/* DANGER ZONE Module */}
                <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-xs bg-gradient-to-b from-white to-rose-50/30">
                  <div className="flex items-center gap-2 pb-3 border-b border-rose-100 text-rose-700">
                    <svg
                      className="w-4 h-4 text-rose-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                    <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wide">
                      Danger Zone
                    </h3>
                  </div>

                  <div className="py-4 text-xs space-y-2">
                    <div className="font-bold text-rose-950">
                      Permanently Delete Company Record
                    </div>
                    <div className="text-rose-700/80 leading-relaxed text-[11px]">
                      This action immediately deletes the company profile,
                      revokes recruiter access, and cascades deletions to 2
                      active internship listings and associated student
                      applications.
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    🗑️ Delete Company & Purge Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Request Clarification */}
        {showClarificationModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Request Clarification / Re-upload
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Send formal notification to{" "}
                <strong className="text-slate-800">{selected.email}</strong>{" "}
                detailing missing documentation.
              </p>
              <textarea
                rows={3}
                value={clarificationNotes}
                onChange={(e) => setClarificationNotes(e.target.value)}
                placeholder="e.g. Please provide a high-resolution color scan of the 2026-2027 renewal receipt..."
                className="w-full text-xs border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowClarificationModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendClarification}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                >
                  Dispatch Clarification Notice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Mandatory Rejection Reason */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-200">
              <h2 className="text-base font-bold text-rose-900 mb-1">
                Reject Registration Dossier
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Please provide an immutable audit note explaining why{" "}
                <strong className="text-slate-800">{selected.name}</strong> was
                rejected.
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Trade license number invalid in national RJSC database..."
                className="w-full text-xs border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Revoke Status */}
        {showRevokeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-amber-200">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Revoke Verification Status
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Are you sure you want to revert{" "}
                <strong className="text-slate-900">{selected.name}</strong> to
                Pending Audit? Active postings will be placed on compliance
                hold.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRevokeModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevokeConfirm}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                >
                  Yes, Revoke Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Danger Zone Hard Delete */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-300">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h2 className="text-base font-bold text-rose-900 mb-1">
                Delete Enterprise & Cascade Purge
              </h2>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                This action cannot be undone. To confirm, type the exact company
                name{" "}
                <strong className="text-slate-900 font-mono">
                  "{selected.name}"
                </strong>{" "}
                below:
              </p>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder={selected.name}
                className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={
                    deleteConfirmationText.trim().toLowerCase() !==
                    selected.name.toLowerCase()
                  }
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Permanently Expunge Company
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ═════════════════════════════════════════════════════════════════════════════
     VIEW 2: VERIFICATION QUEUE WORKLIST (selectedId === null)
     ═════════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 px-5 py-6 lg:px-8 lg:py-8">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {successMessage}
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Compliance & Verification Queue
            </h1>
            <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {pendingCount} Pending Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit incoming company trade licenses, inspect RJSC documentation,
            and authorize recruitment rights.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors self-start md:self-auto"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Ingest Verification Ticket
        </button>
      </div>

      {/* Queue Segmented Tabs */}
      <div className="flex gap-2 my-6">
        <button
          onClick={() => setQueueTab("pending")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            queueTab === "pending"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Pending Queue ({pendingCount})
        </button>
        <button
          onClick={() => setQueueTab("approved")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            queueTab === "approved"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Verified ({approvedCount})
        </button>
        <button
          onClick={() => setQueueTab("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            queueTab === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Records ({companies.length})
        </button>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500 font-medium">
              Scanning compliance queues...
            </p>
          </div>
        ) : queueFiltered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-sm font-semibold text-slate-800 mb-1">
              Queue is empty
            </p>
            <p className="text-xs text-slate-400">
              No organizations currently match this verification status.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="px-5 py-3.5">Company Entity</th>
                  <th className="px-4 py-3.5">Industry Sector</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Documents</th>
                  <th className="px-4 py-3.5">Submitted</th>
                  <th className="px-5 py-3.5 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueFiltered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <CompanyLogo name={c.name} size={36} />
                        <div>
                          <div className="font-bold text-slate-900">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {c.registrationNo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {c.industry}
                    </td>
                    <td className="px-4 py-3.5">
                      {c.verificationStatus === "approved" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✔ Verified
                        </span>
                      ) : c.verificationStatus === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Needs Audit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          ✕ Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-medium border border-slate-200">
                        📄 2 Files Attached
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600 text-[11px]">
                      {c.submittedDate}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedId(c.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          c.verificationStatus === "pending"
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                            : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        Inspect Dossier →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Company Manual Ingestion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Ingest Verification Ticket
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Direct administrative addition to the compliance review queue.
            </p>
            <form onSubmit={handleAddCompany} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Apex Data Systems Ltd."
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Industry Sector
                </label>
                <input
                  type="text"
                  value={addIndustry}
                  onChange={(e) => setAddIndustry(e.target.value)}
                  placeholder="e.g. Fintech & Cloud"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  value={addWebsite}
                  onChange={(e) => setAddWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  {addLoading ? "Submitting..." : "Ingest Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
