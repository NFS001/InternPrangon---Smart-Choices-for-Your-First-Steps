import React, { useState, useEffect } from "react";
import type { Navigate } from "../data/index";
import { COMPANIES } from "../data/index";
import { CompanyLogo } from "../components/common/CompanyLogos";
import { getCompanyDirectory } from "../api/client";

interface Props {
  navigate: Navigate;
  initialSearch?: string;
}

const INDUSTRY_PILLS = [
  { name: "All", count: 380 },
  { name: "Software & Cloud", count: 142 },
  { name: "Fintech", count: 68 },
  { name: "E-Commerce", count: 54 },
  { name: "EdTech", count: 38 },
  { name: "Healthcare", count: 42 },
  { name: "Design & Creative", count: 36 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-3.5 h-3.5 ${
            n <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function CompaniesPage({ navigate, initialSearch = "" }: Props) {
  const [search, setSearch] = useState(initialSearch || "");
  const [locationFilter, setLocationFilter] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "openings" | "stipend">("rating");
  const [companyList, setCompanyList] = useState(COMPANIES);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch || "");
    }
  }, [initialSearch]);

  // Fetch verified directory from backend with fallback to static catalog
  useEffect(() => {
    const apiSort = sortBy === "stipend" ? "averageStipend" : sortBy === "rating" ? "rating" : undefined;
    getCompanyDirectory({ sortBy: apiSort, limit: 100 })
      .then((res) => {
        if (res.companies && res.companies.length > 0) {
          const mapped = res.companies.map((c, idx) => {
            const matchStatic = COMPANIES.find(
              (sc) => sc.name.toLowerCase() === c.companyName.toLowerCase()
            );
            return {
              id: matchStatic?.id || idx + 1,
              mongoId: c._id,
              name: c.companyName,
              industry: c.industry || matchStatic?.industry || "Software & Cloud Solutions",
              location: matchStatic?.location || "Dhaka, Bangladesh",
              verified: c.verificationStatus === "Approved",
              rating: c.averageRating || matchStatic?.rating || 4.8,
              reviewCount: c.reviewCount || matchStatic?.reviewCount || 18,
              avgStipend: c.averageStipend
                ? `BDT ${c.averageStipend.toLocaleString()}/mo`
                : matchStatic?.avgStipend || "BDT 18,000/mo",
              activeInternships: matchStatic?.activeInternships || 2,
              logo: matchStatic?.logo || c.companyName.slice(0, 2).toUpperCase(),
              logoBg: matchStatic?.logoBg || "#eff6ff",
              logoColor: matchStatic?.logoColor || "#2845e2",
              website: c.website || matchStatic?.website || "https://example.com",
              description: c.description || matchStatic?.description || "Enterprise partner on InternPrangon.",
              about:
                matchStatic?.about ||
                c.description ||
                "Enterprise employer providing paid software engineering, data, and design internships in Bangladesh.",
              size: matchStatic?.size || "500+ employees",
              founded: matchStatic?.founded || "2015",
              tags: matchStatic?.tags || [c.industry || "Software & Cloud", "Enterprise", "Internships"],
            };
          });
          setCompanyList(mapped);
        }
      })
      .catch(() => {});
  }, [sortBy]);

  const parseStipend = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;

  // Filter and sort computation
  const filtered = companyList
    .filter((c) => {
      const q = search.toLowerCase();
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.industry.toLowerCase().includes(q) &&
        !c.location.toLowerCase().includes(q) &&
        !c.tags?.some((t) => t.toLowerCase().includes(q))
      ) {
        return false;
      }
      if (selectedIndustry !== "All") {
        const indLower = selectedIndustry.toLowerCase();
        const match =
          c.industry.toLowerCase().includes(indLower) ||
          c.tags?.some((t) => t.toLowerCase().includes(indLower));
        if (!match) return false;
      }
      if (locationFilter === "Remote" && !c.location.toLowerCase().includes("remote")) {
        return false;
      }
      if (locationFilter === "Dhaka" && !c.location.toLowerCase().includes("dhaka")) {
        return false;
      }
      if (locationFilter === "Chittagong" && !c.location.toLowerCase().includes("chittagong")) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "openings") return b.activeInternships - a.activeInternships;
      if (sortBy === "stipend") return parseStipend(b.avgStipend) - parseStipend(a.avgStipend);
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-24 font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* ── Background Aura Glows ── */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[380px] bg-indigo-500/8 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-48 right-1/4 w-[450px] h-[320px] bg-orange-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ═══════════════════════════════════════════════════════════════
          PART 2: PAGE HEADER & METRICS
          ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4">
          <button onClick={() => navigate("home")} className="hover:text-indigo-600 cursor-pointer">
            Home
          </button>
          <span>/</span>
          <span className="text-slate-800">Companies</span>
        </div>

        {/* Headline, Subhead & Floating Stats Badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight">
                Explore Top Companies Hiring Interns
              </h1>
              <span className="bg-violet-50 text-violet-700 font-semibold text-xs px-3 py-1 rounded-full border border-violet-100 shadow-2xs shrink-0">
                380+ Verified Employers
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Discover company culture, average intern stipends, and open opportunities across Bangladesh.
            </p>
          </div>
        </div>

        {/* ── Dynamic Interconnected Search & Filter Suite ── */}
        <div className="w-full bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-2 sm:p-2.5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-6">
          {/* Search Input */}
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
              placeholder="Search company name, industry, tech stack..."
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

          {/* Location Dropdown */}
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
              <option value="Dhaka">Dhaka (Central Hub)</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Remote">Remote Across BD</option>
            </select>
          </div>

          {/* Search CTA */}
          <button
            onClick={() => {}}
            className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-bold px-7 py-3 rounded-xl shadow-md shadow-indigo-500/20 text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <span>Search</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* ── Filter Pills & Segmented Sort Bar ── */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-4">
          {/* Industry Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {INDUSTRY_PILLS.map((ind) => {
              const active = selectedIndustry === ind.name;
              return (
                <button
                  key={ind.name}
                  onClick={() => setSelectedIndustry(ind.name)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold"
                      : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200/80 hover:border-indigo-300"
                  }`}
                >
                  <span>{ind.name}</span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {ind.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right-aligned Segmented Sort */}
          <div className="flex items-center justify-between lg:justify-end gap-3 text-xs font-bold shrink-0">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">Sort by:</span>
            <div className="flex items-center rounded-xl bg-slate-100 p-1 text-slate-600">
              <button
                onClick={() => setSortBy("rating")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sortBy === "rating" ? "bg-white text-indigo-700 shadow-2xs font-black" : "hover:text-slate-900"
                }`}
              >
                Highest Rated
              </button>
              <button
                onClick={() => setSortBy("openings")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sortBy === "openings" ? "bg-white text-indigo-700 shadow-2xs font-black" : "hover:text-slate-900"
                }`}
              >
                Most Openings
              </button>
              <button
                onClick={() => setSortBy("stipend")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sortBy === "stipend" ? "bg-white text-indigo-700 shadow-2xs font-black" : "hover:text-slate-900"
                }`}
              >
                Best Stipend
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <p className="text-xs text-slate-500 font-medium px-1">
          Showing {filtered.length} of 380 verified companies
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          COMPANY CARD GRID (4-COLUMN RESPONSIVE LAYOUT)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        {filtered.length === 0 ? (
          <div className="py-24 text-center bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/80 max-w-lg mx-auto p-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl mx-auto mb-4">
              🏢
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No employers found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              No verified companies match your current search and industry filter.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setLocationFilter("All");
                setSelectedIndustry("All");
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((company) => (
              <div
                key={company.mongoId || company.id}
                onClick={() =>
                  navigate("company-detail", {
                    id: company.id,
                    companyId: company.mongoId || company.id,
                    companyData: company,
                  })
                }
                className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500"
              >
                <div>
                  {/* Card Header: Brand Logo & Verified Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <CompanyLogo name={company.name} size={46} />
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full shadow-2xs">
                      <span>✔</span>
                      <span>Verified</span>
                    </span>
                  </div>

                  {/* Company Name */}
                  <h3 className="font-bold text-slate-900 text-base mt-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {company.name}
                  </h3>

                  {/* Subtitle: Industry · Size · Location */}
                  <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                    {company.industry} · {company.size || "500+ employees"} · {company.location}
                  </p>

                  {/* Rating Row: Stars + Numeric Score and Reviews */}
                  <div className="flex items-center gap-1.5 mt-3">
                    <StarRating rating={company.rating} />
                    <span className="text-xs font-bold text-slate-900">{company.rating.toFixed(1)}</span>
                    <span className="text-xs text-slate-400">({company.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Card Footer: Avg Stipend & Active Opportunities Link */}
                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="bg-emerald-50 text-emerald-700 font-medium text-xs px-2.5 py-1 rounded-md border border-emerald-100">
                    {company.avgStipend || "BDT 18,000/mo"}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all">
                    <span>{company.activeInternships} open {company.activeInternships === 1 ? "role" : "roles"}</span>
                    <span>↗</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
