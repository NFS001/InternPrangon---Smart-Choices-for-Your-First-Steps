import React, { useState, useEffect, useMemo } from "react"
import type { Navigate } from "../../data/index"
import type { AdminCompany, AdminVerifStatus } from "../../data/index"
import {
  getAllCompaniesAdmin,
  getCompanyDirectory,
  addCompanyAdmin,
} from "../../api/client"
import { CompanyLogo } from "../../components/common/CompanyLogos"

interface Props {
  navigate: Navigate
}

export default function AdminCompaniesPage({ navigate }: Props) {
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<AdminVerifStatus | "all">(
    "all",
  )
  const [sortBy, setSortBy] = useState<"submitted" | "name" | "internships">(
    "submitted",
  )
  const [selectedCompanies, setSelectedCompanies] =
    useState<Set<number | string>>(new Set())
  const [activeMenuId, setActiveMenuId] = useState<number | string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Manual Enterprise Registration Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [addName, setAddName] = useState("")
  const [addIndustry, setAddIndustry] = useState("Software & IT")
  const [addWebsite, setAddWebsite] = useState("")
  const [addEmail, setAddEmail] = useState("")
  const [addDescription, setAddDescription] = useState("")
  const [addStatus, setAddStatus] = useState<"Pending" | "Approved">("Pending")
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

      const mapped: AdminCompany[] = rawList.map((c, idx) => {
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
        const finalStatus = override as AdminVerifStatus || baseStatus

        const regNo = `REG-${(c._id || String(1000 + idx)).slice(-6).toUpperCase()}`

        return {
          id: c._id || idx + 1,
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
          industry: c.industry || "Information Technology",
          size: "51–200",
          location: "Dhaka, Bangladesh",
          registrationNo: regNo,
          internshipCount: c.internshipsCount ?? 2,
          reviewCount: c.reviewCount ?? 0,
          documents: [
            c.verificationDocument || "trade_license_2026.pdf",
            "certificate_of_incorporation.pdf",
          ],
          verificationStatus: finalStatus,
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
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 3500)
      return () => clearTimeout(t)
    }
  }, [successMessage])

  // Click outside to close action menu
  useEffect(() => {
    const handleOutside = () => setActiveMenuId(null)
    window.addEventListener("click", handleOutside)
    return () => window.removeEventListener("click", handleOutside)
  }, [])

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName.trim()) return
    setAddLoading(true)
    try {
      await addCompanyAdmin({
        companyName: addName.trim(),
        industry: addIndustry,
        website: addWebsite.trim() || "https://enterprise.com",
        description:
          addDescription.trim() ||
          "Verified enterprise employer registered in Bangladesh.",
        verificationStatus: addStatus,
        verificationDocument: "trade_license_2026.pdf",
      })
      setSuccessMessage(
        `Enterprise "${addName.trim()}" onboarded successfully.`,
      )
      setShowAddModal(false)
      setAddName("")
      setAddWebsite("")
      setAddEmail("")
      setAddDescription("")
      fetchLiveCompanies()
    } catch {
      setSuccessMessage("Failed to register enterprise manually.")
    } finally {
      setAddLoading(false)
    }
  }

  // Filter & sort logic
  const filtered = useMemo(() => {
    return companies
      .filter((c) => {
        const s = search.toLowerCase()
        const matchesSearch =
          (c.name || "").toLowerCase().includes(s) ||
          (c.registrationNo || "").toLowerCase().includes(s) ||
          (c.website || "").toLowerCase().includes(s) ||
          (c.industry || "").toLowerCase().includes(s)
        const matchesStatus =
          statusFilter === "all" || c.verificationStatus === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === "name") return (a.name || "").localeCompare(b.name || "")
        if (sortBy === "internships")
          return (b.internshipCount || 0) - (a.internshipCount || 0)
        return (
          new Date(b.submittedDate || 0).getTime() -
          new Date(a.submittedDate || 0).getTime()
        )
      })
  }, [companies, search, statusFilter, sortBy])

  // Bulk selection logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCompanies(new Set(filtered.map((c) => c.id)))
    } else {
      setSelectedCompanies(new Set())
    }
  }

  const handleToggleSelect = (id: number | string) => {
    const next = new Set(selectedCompanies)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedCompanies(next)
  }

  // Count summaries
  const pendingCount = companies.filter(
    (c) => c.verificationStatus === "pending",
  ).length
  const approvedCount = companies.filter(
    (c) => c.verificationStatus === "approved",
  ).length
  const rejectedCount = companies.filter(
    (c) => c.verificationStatus === "rejected",
  ).length

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
              Companies Registration Directory
            </h1>
            <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
              {companies.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise registry, legal verification compliance dossiers, and
            active hiring authorizations.
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
          + Register Enterprise Manually
        </button>
      </div>

      {/* Table Control Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 my-6 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
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
            placeholder="Search by company name, registration number, or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Filter Pills */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({companies.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                statusFilter === "pending"
                  ? "bg-white text-amber-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                statusFilter === "approved"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified ({approvedCount})
            </button>
            <button
              onClick={() => setStatusFilter("rejected")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === "rejected"
                  ? "bg-white text-rose-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="submitted">Submission Date (Newest)</option>
              <option value="name">Company Name (A–Z)</option>
              <option value="internships">Openings (Highest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* High-Density Enterprise Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500 font-medium">
              Loading enterprise directory...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-sm font-semibold text-slate-800 mb-1">
              No matching enterprises found
            </p>
            <p className="text-xs text-slate-400 mb-4">
              No records matched your search term or active filters.
            </p>
            <button
              onClick={() => {
                setSearch("")
                setStatusFilter("all")
              }}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedCompanies.size === filtered.length &&
                        filtered.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-4 py-3.5">Company Legal Entity</th>
                  <th className="px-4 py-3.5">Industry & Sector</th>
                  <th className="px-4 py-3.5">Verification Status</th>
                  <th className="px-4 py-3.5">Openings</th>
                  <th className="px-4 py-3.5">Peer Reviews</th>
                  <th className="px-4 py-3.5">Submitted Date</th>
                  <th className="px-5 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((company) => {
                  const isChecked = selectedCompanies.has(company.id)

                  return (
                    <tr
                      key={company.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(company.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Company Name + Logo + Domain */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <CompanyLogo name={company.name} size={36} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 truncate">
                                {company.name}
                              </span>
                              <span className="font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                                {company.registrationNo}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">
                              {company.website.replace("https://", "")}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {company.industry}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {company.verificationStatus === "approved" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <svg
                              className="w-3 h-3 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                            Verified
                          </span>
                        ) : company.verificationStatus === "pending" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                            ✕ Rejected
                          </span>
                        )}
                      </td>

                      {/* Openings */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => navigate("internships")}
                          className="font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          {company.internshipCount || 0} active
                        </button>
                      </td>

                      {/* Peer Reviews */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-slate-700">
                            {company.reviewCount ?? 0}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            reviews
                          </span>
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td className="px-4 py-3.5 font-mono text-slate-600 text-[11px]">
                        {company.submittedDate}
                      </td>

                      {/* Admin Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2 relative">
                          {company.verificationStatus === "pending" ? (
                            <button
                              onClick={() =>
                                navigate("admin-verifications", {
                                  companyId: company.id,
                                })
                              }
                              className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                            >
                              Review Docs
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                navigate("admin-verifications", {
                                  companyId: company.id,
                                })
                              }
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors shadow-xs"
                            >
                              Audit Profile
                            </button>
                          )}

                          {/* More dropdown toggle */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMenuId(
                                  activeMenuId === company.id
                                    ? null
                                    : company.id,
                                )
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuId === company.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 text-left text-xs"
                              >
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null)
                                    navigate("admin-verifications", {
                                      companyId: company.id,
                                    })
                                  }}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left flex items-center gap-2"
                                >
                                  <span>🛡️</span> Compliance Dossier
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null)
                                    navigate("companies")
                                  }}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left flex items-center gap-2"
                                >
                                  <span>↗</span> Public Marketplace
                                </button>
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null)
                                    navigate("admin-verifications", {
                                      companyId: company.id,
                                    })
                                  }}
                                  className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 text-left flex items-center gap-2 font-medium"
                                >
                                  <span>🗑️</span> Purge Record...
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Summary */}
        <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <div className="font-mono">
            Showing{" "}
            <strong className="text-slate-800">{filtered.length}</strong> of{" "}
            {companies.length} enterprise records
          </div>
          {selectedCompanies.size > 0 && (
            <div className="font-semibold text-indigo-700">
              {selectedCompanies.size} record(s) selected
            </div>
          )}
        </div>
      </div>

      {/* Manual Enterprise Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Manual Enterprise Registration
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct administrative onboarding & compliance ingestion
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCompany} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Legal Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Apex Data Systems Ltd."
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={addIndustry}
                    onChange={(e) => setAddIndustry(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Software & IT">Software & IT</option>
                    <option value="Fintech & Banking">Fintech & Banking</option>
                    <option value="E-Commerce & Retail">
                      E-Commerce & Retail
                    </option>
                    <option value="Logistics & Supply Chain">
                      Logistics & Supply Chain
                    </option>
                    <option value="Pharmaceuticals">Pharmaceuticals</option>
                    <option value="Telecommunications">
                      Telecommunications
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={addStatus}
                    onChange={(e) =>
                      setAddStatus(e.target.value as "Pending" | "Approved")
                    }
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="Pending">Pending Audit</option>
                    <option value="Approved">Directly Verified</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Website
                  </label>
                  <input
                    type="text"
                    value={addWebsite}
                    onChange={(e) => setAddWebsite(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Compliance Email
                  </label>
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="compliance@company.com"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Summary
                </label>
                <textarea
                  rows={2}
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  placeholder="Enterprise description, operating units, and primary corporate address..."
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Compliance Document Simulation Attachment */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📄</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      trade_license_2026.pdf
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Simulated Authenticated Dossier · 1.8 MB
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Attached
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {addLoading ? "Registering..." : "✔ Confirm Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
