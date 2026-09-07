import { useState, useEffect } from "react";
import type { Navigate } from "../data/index";
import { COMPANIES } from "../data/index";
import { getCompanyDirectory } from "../api/client";

interface Props {
  navigate: Navigate;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-3.5 h-3.5 ${n <= Math.round(rating) ? "text-amber-400" : "text-neutral-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function CompaniesPage({ navigate }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "stipend" | "openings">("rating");
  const [companyList, setCompanyList] = useState(COMPANIES);

  useEffect(() => {
    const apiSort = sortBy === "stipend" ? "averageStipend" : (sortBy === "rating" ? "rating" : undefined);
    getCompanyDirectory({ sortBy: apiSort, limit: 100 })
      .then((res) => {
        if (res.companies && res.companies.length > 0) {
          const mapped = res.companies.map((c, idx) => {
            const matchStatic = COMPANIES.find(
              (sc) => sc.name.toLowerCase() === c.companyName.toLowerCase()
            );
            return {
              id: matchStatic?.id || (idx + 1),
              mongoId: c._id,
              name: c.companyName,
              industry: c.industry || matchStatic?.industry || "Technology",
              location: matchStatic?.location || "Dhaka, Bangladesh",
              verified: c.verificationStatus === "Approved",
              rating: c.averageRating || matchStatic?.rating || 4.7,
              reviewCount: c.reviewCount || matchStatic?.reviewCount || 1,
              avgStipend: c.averageStipend
                ? `BDT ${c.averageStipend.toLocaleString()}/mo`
                : (matchStatic?.avgStipend || "BDT 18,000/mo"),
              activeInternships: matchStatic?.activeInternships || 1,
              logo: matchStatic?.logo || c.companyName.slice(0, 2).toUpperCase(),
              logoBg: matchStatic?.logoBg || "#eff6ff",
              logoColor: matchStatic?.logoColor || "#2845e2",
              website: c.website || matchStatic?.website || "https://example.com",
              description: c.description || matchStatic?.description || "Enterprise partner on InternPrangon.",
              about: matchStatic?.about || c.description || "Enterprise partner on InternPrangon offering quality internship opportunities and mentorship.",
              size: matchStatic?.size || "500+ employees",
              founded: matchStatic?.founded || "2015",
              tags: matchStatic?.tags || [c.industry || "Technology", "Enterprise", "Internships"],
            };
          });
          setCompanyList(mapped);
        }
      })
      .catch(() => {});
  }, [sortBy]);

  const parseStipend = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;

  const filtered = companyList.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "openings") return b.activeInternships - a.activeInternships;
    if (sortBy === "stipend") return parseStipend(b.avgStipend) - parseStipend(a.avgStipend);
    return 0;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page Header */}
      <div className="bg-white border-b border-neutral-100 px-8 py-10">
        <h1
          className="text-4xl font-bold italic text-brand-700 mb-1"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          380+ verified companies
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Discover internship opportunities at top companies across industries.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, industries, locations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition"
            />
          </div>

          <div className="flex gap-2">
            {(
              [
                { key: "rating", label: "Highest Rating" },
                { key: "openings", label: "Most Openings" },
                { key: "stipend", label: "Best Stipend" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition whitespace-nowrap ${
                  sortBy === key
                    ? "bg-brand-600 text-white border-violet-600 shadow-sm"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-300 hover:text-brand-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-neutral-400 mb-5">
          Showing {filtered.length} {filtered.length === 1 ? "company" : "companies"}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((company) => (
            <div
              key={company.mongoId || company.id}
              onClick={() => navigate("company-detail", { companyId: company.mongoId || company.id, id: company.id, companyData: company })}
              className="bg-white border border-neutral-100 rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:border-brand-200 transition-all duration-200 flex flex-col gap-3 group"
            >
              {/* Logo + Verified */}
              <div className="flex items-start justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                  style={{ backgroundColor: company.logoBg, color: company.logoColor }}
                >
                  {company.logo}
                </div>
                {company.verified && (
                  <span className="flex items-center gap-1 text-xs text-brand-600 font-medium bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                )}
              </div>

              {/* Name + meta */}
              <div>
                <h3 className="font-bold text-neutral-800 group-hover:text-brand-700 transition text-sm leading-tight">
                  {company.name}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="text-xs text-neutral-400">{company.industry}</span>
                  <span className="text-xs text-neutral-300">·</span>
                  <span className="text-xs text-neutral-400">{company.size}</span>
                  <span className="text-xs text-neutral-300">·</span>
                  <span className="text-xs text-neutral-400">{company.location}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <StarRating rating={company.rating} />
                <span className="text-xs font-semibold text-neutral-700">
                  {company.rating.toFixed(1)}
                </span>
                <span className="text-xs text-neutral-400">({company.reviewCount})</span>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-neutral-50">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {company.avgStipend}
                </span>
                <span className="text-xs text-neutral-500">
                  <span className="font-semibold text-brand-600">{company.activeInternships}</span>{" "}
                  {company.activeInternships === 1 ? "opening" : "openings"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
            <svg
              className="w-12 h-12 mb-4 opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <p className="text-sm font-medium">No companies match your search.</p>
            <p className="text-xs mt-1">Try a different keyword or clear your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
