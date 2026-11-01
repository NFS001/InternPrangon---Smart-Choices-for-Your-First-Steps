import React, { useState, useEffect } from "react"
import type { Navigate } from "../data/index"
import { INTERNSHIPS } from "../data/index"
import { CompanyLogo } from "../components/common/CompanyLogos"
import {
  getMyBookmarks,
  addBookmark,
  removeBookmark,
  searchInternships,
} from "../api/client"

interface Props {
  navigate: Navigate
  initialSearch?: string
  initialCategory?: string
}

export interface DisplayInternship {
  id: number
  backendId?: string
  role: string
  company: string
  companyId: number
  logo: string
  logoBg: string
  logoColor: string
  location: string
  type: "Remote" | "On-site" | "Hybrid"
  paid: boolean
  stipend?: string
  deadline: string
  daysLeft: number
  tags: string[]
  posted: string
  duration: string
  featured: boolean
  description: string
}

const CATEGORY_CHIPS = [
  { name: "Engineering", count: 42 },
  { name: "Design", count: 18 },
  { name: "Marketing", count: 24 },
  { name: "Finance", count: 15 },
  { name: "Data & AI", count: 31 },
]

export default function InternshipsPage({
  navigate,
  initialSearch = "",
  initialCategory,
}: Props) {
  const [search, setSearch] = useState(initialSearch || initialCategory || "")
  const [locationFilter, setLocationFilter] = useState<string>("All")
  const [compFilter, setCompFilter] = useState<"all" | "paid" | "unpaid">("all")
  const [modeFilter, setModeFilter] =
    useState<"all" | "Remote" | "On-site" | "Hybrid">("all")
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || "",
  )
  const [sortBy, setSortBy] = useState<"recent" | "deadline" | "stipend">(
    "recent",
  )
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [internshipsList, setInternshipsList] = useState<DisplayInternship[]>(
    [],
  )

  useEffect(() => {
    if (initialSearch !== undefined || initialCategory !== undefined) {
      setSearch(initialSearch || initialCategory || "")
      if (initialCategory) setSelectedCategory(initialCategory)
    }
  }, [initialSearch, initialCategory])

  // 1. Fetch live user bookmarks
  useEffect(() => {
    getMyBookmarks()
      .then((res) => {
        if (res.bookmarks) {
          const ids = res.bookmarks
            .filter((b) => b.internship)
            .map((b) => b.internship._id)
          setSavedIds(ids)
        }
      })
      .catch(() => setSavedIds([]))
  }, [])

  // 2. Fetch live internships from MongoDB Atlas
  useEffect(() => {
    searchInternships()
      .then((res) => {
        if (res.internships && res.internships.length > 0) {
          const mapped: DisplayInternship[] = res.internships.map((bi, idx) => {
            const matchStatic = INTERNSHIPS.find(
              (s) =>
                s.role.toLowerCase() === bi.title.toLowerCase() ||
                (bi.company &&
                  s.company.toLowerCase() === bi.company.toLowerCase()),
            )
            const daysLeft = Math.max(
              0,
              Math.ceil(
                (new Date(bi.deadline).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24),
              ),
            )
            const compName =
              bi.company || matchStatic?.company || "Brain Station 23"
            const logo =
              bi.companyLogo ||
              matchStatic?.logo ||
              compName.slice(0, 2).toUpperCase()

            return {
              id: matchStatic?.id || idx + 1,
              backendId: bi._id,
              role: bi.title,
              company: compName,
              companyId: matchStatic?.companyId || 1,
              logo: logo,
              logoBg: bi.companyLogoBg || matchStatic?.logoBg || "#eff6ff",
              logoColor:
                bi.companyLogoColor || matchStatic?.logoColor || "#2563eb",
              location:
                matchStatic?.location ||
                (bi.mode === "Remote"
                  ? "Remote, Bangladesh"
                  : "Dhaka, Bangladesh"),
              type: bi.mode as "Remote" | "On-site" | "Hybrid" || "On-site",
              paid: bi.type === "Paid",
              stipend:
                matchStatic?.stipend ||
                (bi.type === "Paid" ? "BDT 18,000/mo" : undefined),
              deadline: new Date(bi.deadline).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              daysLeft,
              tags: matchStatic?.tags || [bi.type, bi.mode, "Internship"],
              posted: bi.createdAt || "2026-09-01",
              duration: matchStatic?.duration || "3 months",
              featured: matchStatic?.featured ?? idx < 4,
              description: bi.description,
            }
          })
          setInternshipsList(mapped)
        } else {
          setInternshipsList(INTERNSHIPS as DisplayInternship[])
        }
      })
      .catch(() => setInternshipsList(INTERNSHIPS as DisplayInternship[]))
  }, [])

  const toggleSave = (
    backendId?: string,
    fallbackId?: number,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation()
    const key = backendId || String(fallbackId)
    if (!key) return

    if (savedIds.includes(key)) {
      setSavedIds((prev) => prev.filter((id) => id !== key))
      if (backendId) removeBookmark(backendId).catch(() => {})
    } else {
      setSavedIds((prev) => [...prev, key])
      if (backendId) addBookmark(backendId).catch(() => {})
    }
  }

  const handleCategoryClick = (catName: string) => {
    if (selectedCategory === catName) {
      setSelectedCategory("")
    } else {
      setSelectedCategory(catName)
    }
  }

  const q = search.toLowerCase()
  let results = internshipsList.filter((i) => {
    if (
      q &&
      !i.role.toLowerCase().includes(q) &&
      !i.company.toLowerCase().includes(q) &&
      !i.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      return false
    }
    if (selectedCategory) {
      const matchCat =
        i.role.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        i.tags.some((t) =>
          t.toLowerCase().includes(selectedCategory.toLowerCase()),
        )
      if (!matchCat) return false
    }
    if (compFilter === "paid" && !i.paid) return false
    if (compFilter === "unpaid" && i.paid) return false
    if (modeFilter !== "all" && i.type !== modeFilter) return false
    if (locationFilter === "Remote" && i.type !== "Remote") return false
    if (locationFilter === "On-site" && i.type !== "On-site") return false
    return true
  })

  if (sortBy === "deadline") {
    results = [...results].sort((a, b) => a.daysLeft - b.daysLeft)
  } else if (sortBy === "stipend") {
    results = [...results].sort((a, b) => (b.paid ? 1 : 0) - (a.paid ? 1 : 0))
  } else {
    results = [...results].sort(
      (a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime(),
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-24 font-sans selection:bg-indigo-500 selection:text-white">
      {/* ── Background Aura Glows ── */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-indigo-500/8 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-48 left-1/4 w-[450px] h-[300px] bg-orange-500/8 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* ═══════════════════════════════════════════════════════════════
          PAGE HEADER & UNIFIED DUAL SEARCH BAR
          ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4">
          <button
            onClick={() => navigate("home")}
            className="hover:text-indigo-600 cursor-pointer"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-slate-800">Internships</span>
          {selectedCategory && (
            <>
              <span>/</span>
              <span className="text-indigo-600 font-bold">
                {selectedCategory}
              </span>
            </>
          )}
        </div>

        {/* Page Title & Counter Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              Find your next internship
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
              {results.length} open{" "}
              {results.length === 1 ? "opportunity" : "opportunities"}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
            Discover verified corporate and startup opportunities across
            Bangladesh with guaranteed stipends.
          </p>
        </div>

        {/* ── Unified Dual Search Bar ── */}
        <div className="w-full bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-2 sm:p-2.5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-6">
          {/* Search role, company, or skills */}
          <div className="flex items-center gap-3 px-4 py-2.5 flex-1 min-w-0">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6366F1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search role, company, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-[1px] h-8 bg-slate-200 mx-1 shrink-0" />

          {/* Location or Remote Dropdown */}
          <div className="flex items-center gap-2 px-3 py-2 shrink-0 border-t sm:border-t-0 border-slate-100">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F97316"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer pr-3"
            >
              <option value="All">All Locations</option>
              <option value="Remote">Remote Only</option>
              <option value="On-site">On-site (Dhaka)</option>
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={() => {}}
            className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-bold px-7 py-3 rounded-xl shadow-md shadow-indigo-500/20 text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <span>Search</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* ── Filters & Sorting Controls Bar ── */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Compensation Toggle */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
              {(["all", "paid", "unpaid"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCompFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                    compFilter === opt
                      ? "bg-white text-indigo-700 shadow-xs font-extrabold"
                      : "hover:text-slate-900"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Work Mode Toggle */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
              {(["all", "Remote", "On-site", "Hybrid"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setModeFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    modeFilter === opt
                      ? "bg-white text-indigo-700 shadow-xs font-extrabold"
                      : "hover:text-slate-900"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-500">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "recent" | "deadline" | "stipend")
              }
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-indigo-400 shadow-2xs"
            >
              <option value="recent">Recently posted ▾</option>
              <option value="deadline">Closing soonest ▾</option>
              <option value="stipend">Highest stipend ▾</option>
            </select>
          </div>
        </div>

        {/* ── Category Chips Filter ── */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Categories:
          </span>
          {CATEGORY_CHIPS.map((cat) => {
            const isSelected = selectedCategory === cat.name
            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white/80 hover:bg-white text-slate-700 border-slate-200/80 hover:border-indigo-300"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            )
          })}
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory("")}
              className="text-xs text-rose-600 font-bold hover:underline ml-2 cursor-pointer"
            >
              Clear category
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          OPPORTUNITY CARDS GRID (3-Column Layout)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {results.length === 0 ? (
          <div className="py-24 text-center bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/80 max-w-lg mx-auto p-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl mx-auto mb-4">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              No internships found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              No opportunities currently match your selected filters. Try
              broadening your criteria.
            </p>
            <button
              onClick={() => {
                setSearch("")
                setLocationFilter("All")
                setCompFilter("all")
                setModeFilter("all")
                setSelectedCategory("")
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((intern) => {
              const isSaved = intern.backendId
                ? savedIds.includes(intern.backendId)
                : savedIds.includes(String(intern.id))

              return (
                <div
                  key={intern.backendId || intern.id}
                  onClick={() =>
                    navigate("internship-detail", {
                      id: intern.id,
                      backendId: intern.backendId,
                      internshipData: intern,
                    })
                  }
                  className="group relative bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(99,102,241,0.09)] hover:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500 cursor-pointer"
                >
                  <div>
                    {/* Header: Verified Company Logo, Gold Featured Badge, Bookmark */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <CompanyLogo name={intern.company} size={48} />
                      <div className="flex items-center gap-2">
                        {intern.featured && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 font-bold text-[11px] shadow-2xs">
                            ★ Featured
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) =>
                            toggleSave(intern.backendId, intern.id, e)
                          }
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                            isSaved
                              ? "bg-rose-50 border-rose-200 text-rose-500"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-400 hover:text-slate-600"
                          }`}
                          aria-label={
                            isSaved ? "Remove bookmark" : "Bookmark internship"
                          }
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill={isSaved ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Role Title & Verified Company */}
                    <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {intern.role}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">
                        {intern.company}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#0284C7"
                        className="shrink-0"
                        aria-label="Verified Employer"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>

                    {/* Work Mode & Location Metadata */}
                    <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {intern.type}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[150px]">
                        {intern.location}
                      </span>
                      <span>•</span>
                      <span>{intern.duration}</span>
                    </div>

                    {/* Green Stipend Pill Badge */}
                    <div className="mt-3.5">
                      {intern.paid ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                          💰 {intern.stipend || "Paid Internship"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          Unpaid (Academic Credit)
                        </span>
                      )}
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      {intern.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium bg-slate-100/90 text-slate-600 px-2 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Urgency deadline tag & sleek hover arrow */}
                  <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <span>⏳</span>
                      <span>Closes {intern.deadline}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 group-hover:translate-x-1 transition-all">
                      <span>View details</span>
                      <span>&rarr;</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
