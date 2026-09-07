import { useState, useEffect } from "react";
import type { Navigate } from "../data/index";
import { COMPANIES } from "../data/index";
import { getCompanyDirectory } from "../api/client";

interface Props {
  navigate: Navigate;
  initialSearch?: string;
}

interface DisplayCompany {
  id: number;
  backendId?: string;
  name: string;
  industry: string;
  location: string;
  verified: boolean;
  verificationStatus: "Pending" | "Approved" | "Rejected";
  rating: number;
  reviewCount: number;
  avgStipend: string;
  activeInternships: number;
  logo: string;
  logoBg: string;
  logoColor: string;
  website: string;
  description: string;
  size: string;
  about: string;
  tags: string[];
  founded: string;
}

function StarRating({ rating }: { rating: number }) {
  if (rating <= 0) return null;
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

export default function CompaniesPage({ navigate, initialSearch = "" }: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<"rating" | "stipend" | "openings">("rating");
  const [companyList, setCompanyList] = useState<DisplayCompany[]>(COMPANIES as unknown as DisplayCompany[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    setLoading(true);
    const apiSort = sortBy === "stipend" ? "averageStipend" : (sortBy === "rating" ? "rating" : undefined);
    getCompanyDirectory({ sortBy: apiSort, limit: 50 })
      .then((res) => {
        if (res.companies && res.companies.length > 0) {
          const mapped: DisplayCompany[] = res.companies.map((c, idx) => ({
            id: idx + 1,
            backendId: c._id,
            name: c.companyName,
            industry: c.industry || "Software & Technology",
            location: "Dhaka, Bangladesh",
            verified: c.verificationStatus === "Approved",
            verificationStatus: c.verificationStatus,
            rating: c.averageRating || 0,
            reviewCount: c.reviewCount || 0,
            avgStipend: c.averageStipend > 0 ? `BDT ${c.averageStipend.toLocaleString()}/mo` : "Not reported",
            activeInternships: 0,
            logo: c.companyName.slice(0, 2).toUpperCase(),
            logoBg: "#f5f3ff",
            logoColor: "#7c3aed",
            website: c.website || "",
            description: c.description || "Organization registered on InternPrangon.",
            size: "10–200",
            about: c.description || "",
            tags: [c.industry || "Technology", c.verificationStatus === "Approved" ? "Verified" : "Pending"],
            founded: c.createdAt ? new Date(c.createdAt).getFullYear().toString() : "2026",
          }));

          const combined = [...mapped];
          const mappedNames = new Set(mapped.map((m) => m.name.toLowerCase().trim()));
          (COMPANIES as unknown as DisplayCompany[]).forEach((mock) => {
            if (!mappedNames.has(mock.name.toLowerCase().trim())) {
              combined.push(mock);
            }
          });

          setCompanyList(combined);
        } else {
          setCompanyList(COMPANIES as unknown as DisplayCompany[]);
        }
      })
      .catch(() => {
        setCompanyList(COMPANIES as unknown as DisplayCompany[]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sortBy]);

  const parseStipend = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;

  const filtered = companyList.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
  ).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "openings") return b.activeInternships - a.activeInternships;
    if (sortBy === "stipend") return parseStipend(b.avgStipend) - parseStipend(a.avgStipend);
    return 0;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page Header */}
      <div className="bg-white border-b border-neutral-100 px-6 py-8 lg:px-8 lg:py-10">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-3xl lg:text-4xl font-bold italic text-neutral-900 mb-1"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Company Directory
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Discover companies offering internships and read authentic verified reviews.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 lg:px-8">
        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
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
              placeholder="Search companies, industries, sectors..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition"
            />
          </div>

          <div className="flex gap-2">
            {(
              [
                { id: "rating", label: "Top Rated" },
                { id: "stipend", label: "Highest Stipend" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition border ${
                  sortBy === opt.id
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Company Cards Grid */}
        {loading ? (
          <div className="bg-white border border-neutral-200 rounded-3xl p-16 text-center text-neutral-400 shadow-sm">
            Loading company directory...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((company) => (
              <div
                key={company.backendId || company.id}
                onClick={() =>
                  navigate("company-detail", {
                    id: company.id,
                    backendId: company.backendId,
                    companyName: company.name,
                  })
                }
                className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col gap-4 group"
              >
                {/* Top row: Logo + verified */}
                <div className="flex items-start justify-between">
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center text-sm font-extrabold flex-shrink-0 bg-brand-50 text-brand-700 border border-brand-100 p-3"
                  >
                    {company.logo}
                  </div>
                  {company.verified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success-700 bg-success-50 px-2.5 py-1 rounded-full border border-success-200">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Pending Verification
                    </span>
                  )}
                </div>

                {/* Name + meta */}
                <div>
                  <h3 className="font-bold text-neutral-900 group-hover:text-brand-700 transition text-base leading-tight mb-1">
                    {company.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs text-neutral-500 font-medium">{company.industry}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {company.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-neutral-100">
                  {company.reviewCount > 0 ? (
                    <>
                      <StarRating rating={company.rating} />
                      <span className="text-xs font-bold text-neutral-900">
                        {company.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-neutral-400">({company.reviewCount} reviews)</span>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-400 font-medium italic">
                      No reviews yet (0 ratings)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white border border-dashed border-neutral-300 rounded-3xl p-16 text-center shadow-sm">
            <h3 className="font-bold text-neutral-800 text-base mb-1">No companies found</h3>
            <p className="text-xs text-neutral-500">Try changing your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
