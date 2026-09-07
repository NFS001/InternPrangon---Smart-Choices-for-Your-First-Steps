import { useState, useEffect } from "react";
import type { Navigate } from "../data/index";
import { INTERNSHIPS } from "../data/index";
import Button from "../components/ds/Button";
import { getMyBookmarks, addBookmark, removeBookmark, searchInternships } from "../api/client";

interface Props {
  navigate: Navigate;
  initialSearch?: string;
  initialCategory?: string;
}

interface DisplayInternship {
  id: number;
  backendId?: string;
  role: string;
  company: string;
  companyId: number;
  logo: string;
  logoBg: string;
  logoColor: string;
  location: string;
  type: "Remote" | "On-site" | "Hybrid";
  paid: boolean;
  stipend?: string;
  deadline: string;
  daysLeft: number;
  tags: string[];
  posted: string;
  duration: string;
  featured: boolean;
  description: string;
}

function UrgencyLabel({ daysLeft, deadline }: { daysLeft: number; deadline: string }) {
  if (daysLeft === 0) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-danger-100 text-danger-700">
        Deadline today
      </span>
    );
  }
  if (daysLeft === 1) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-danger-100 text-danger-700">
        Deadline tomorrow
      </span>
    );
  }
  if (daysLeft <= 3) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-100 text-warning-700">
        Deadline in {daysLeft} days
      </span>
    );
  }
  if (daysLeft <= 7) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-accent-100 text-accent-700">
        {daysLeft} days left
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600">
      Deadline: {deadline}
    </span>
  );
}

export default function InternshipsPage({ navigate, initialSearch = "", initialCategory }: Props) {
  const [search, setSearch] = useState(initialSearch || initialCategory || "");
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "Remote" | "On-site" | "Hybrid">("all");
  const [sortBy, setSortBy] = useState<"deadline" | "recent">("recent");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [internshipsList, setInternshipsList] = useState<DisplayInternship[]>([]);

  useEffect(() => {
    if (initialSearch !== undefined || initialCategory !== undefined) {
      setSearch(initialSearch || initialCategory || "");
    }
  }, [initialSearch, initialCategory]);

  // 1. Fetch live user bookmarks
  useEffect(() => {
    getMyBookmarks()
      .then((res) => {
        if (res.bookmarks) {
          const ids = res.bookmarks
            .filter((b) => b.internship)
            .map((b) => b.internship._id);
          setSavedIds(ids);
        }
      })
      .catch(() => setSavedIds([]));
  }, []);

  // 2. Fetch live internships from MongoDB Atlas
  useEffect(() => {
    searchInternships()
      .then((res) => {
        if (res.internships && res.internships.length > 0) {
          const mapped: DisplayInternship[] = res.internships.map((bi, idx) => {
            const matchStatic = INTERNSHIPS.find(
              (s) =>
                s.role.toLowerCase() === bi.title.toLowerCase() ||
                (bi.company && s.company.toLowerCase() === bi.company.toLowerCase())
            );
            const daysLeft = Math.max(
              0,
              Math.ceil((new Date(bi.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            );
            const compName = bi.company || matchStatic?.company || "Brain Station 23";
            const logo = bi.companyLogo || matchStatic?.logo || compName.slice(0, 2).toUpperCase();

            return {
              id: matchStatic?.id || (idx + 1),
              backendId: bi._id,
              role: bi.title,
              company: compName,
              companyId: matchStatic?.companyId || 1,
              logo: logo,
              logoBg: bi.companyLogoBg || matchStatic?.logoBg || "#eff6ff",
              logoColor: bi.companyLogoColor || matchStatic?.logoColor || "#2845e2",
              location: matchStatic?.location || (bi.mode === "Remote" ? "Remote, Bangladesh" : "Dhaka, Bangladesh"),
              type: bi.mode as "Remote" | "On-site" | "Hybrid",
              paid: bi.type === "Paid",
              stipend: matchStatic?.stipend || (bi.type === "Paid" ? "BDT 18,000/mo" : undefined),
              deadline: new Date(bi.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
              daysLeft,
              tags: matchStatic?.tags || [bi.type, bi.mode, "Internship"],
              posted: bi.createdAt || "2026-09-01",
              duration: matchStatic?.duration || "3 months",
              featured: matchStatic?.featured || false,
              description: bi.description,
            };
          });
          setInternshipsList(mapped);
        } else {
          setInternshipsList(INTERNSHIPS as DisplayInternship[]);
        }
      })
      .catch(() => setInternshipsList(INTERNSHIPS as DisplayInternship[]));
  }, []);

  const toggleSave = (backendId?: string, fallbackId?: number) => {
    const key = backendId || String(fallbackId);
    if (!key) return;

    if (savedIds.includes(key)) {
      setSavedIds((prev) => prev.filter((id) => id !== key));
      if (backendId) {
        removeBookmark(backendId).catch(() => {});
      }
    } else {
      setSavedIds((prev) => [...prev, key]);
      if (backendId) {
        addBookmark(backendId).catch(() => {});
      }
    }
  };

  const q = search.toLowerCase();
  let results = internshipsList.filter((i) => {
    if (
      q &&
      !i.role.toLowerCase().includes(q) &&
      !i.company.toLowerCase().includes(q) &&
      !i.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      return false;
    }
    if (filter === "paid" && !i.paid) return false;
    if (filter === "unpaid" && i.paid) return false;
    if (typeFilter !== "all" && i.type !== typeFilter) return false;
    return true;
  });

  if (sortBy === "deadline") {
    results = [...results].sort((a, b) => a.daysLeft - b.daysLeft);
  } else {
    results = [...results].sort(
      (a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime()
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page header */}
      <div className="bg-white border-b border-neutral-200 px-5 py-6 lg:px-8 lg:py-10">
        <h1
          className="text-2xl lg:text-4xl text-brand-700"
          style={{
            fontStyle: "italic",
            fontVariationSettings: "'opsz' 72, 'wght' 700",
          }}
        >
          Find your internship
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {results.length} {results.length === 1 ? "opportunity" : "opportunities"} available
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-neutral-100 px-5 py-3 lg:px-8 lg:py-4 space-y-3">
        {/* Search — full width on its own line */}
        <input
          type="text"
          placeholder="Search role, company, or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-neutral-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 lg:w-64"
        />

        {/* Scrollable filter strip on mobile, inline on desktop */}
        <div className="-mx-5 px-5 lg:mx-0 lg:px-0">
          <div className="filter-strip lg:flex lg:flex-wrap lg:items-center lg:gap-3">
            {/* Paid filter */}
            <div className="flex rounded-xl border border-neutral-200 overflow-hidden text-sm shrink-0">
              {(["all", "paid", "unpaid"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`px-3 py-1.5 font-medium capitalize transition-colors ${
                    filter === opt
                      ? "bg-brand-600 text-white"
                      : "bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div className="flex rounded-xl border border-neutral-200 overflow-hidden text-sm shrink-0">
              {(["all", "Remote", "On-site", "Hybrid"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setTypeFilter(opt)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    typeFilter === opt
                      ? "bg-brand-600 text-white"
                      : "bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 text-sm text-neutral-500 shrink-0">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "deadline" | "recent")}
                className="border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
              >
                <option value="recent">Recently posted</option>
                <option value="deadline">Closing soon</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Internships grid */}
      <div className="max-w-7xl mx-auto px-5 py-6 lg:px-8 lg:py-8">
        {results.length === 0 ? (
          <div className="py-20 text-center text-neutral-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-neutral-600">No internships match your filters</p>
            <p className="text-sm mt-1">Try clearing your search or adjusting your criteria</p>
            <button
              onClick={() => {
                setSearch("");
                setFilter("all");
                setTypeFilter("all");
              }}
              className="mt-4 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {results.map((intern) => {
              const isSaved = intern.backendId
                ? savedIds.includes(intern.backendId)
                : savedIds.includes(String(intern.id));

              return (
                <div
                  key={intern.backendId || intern.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-4 lg:p-5 flex flex-col gap-3 hover:shadow-md transition-shadow relative"
                >
                  {/* Featured badge */}
                  {intern.featured && (
                    <span className="absolute top-4 right-12 px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
                      Featured
                    </span>
                  )}

                  {/* Bookmark button */}
                  <button
                    onClick={() => toggleSave(intern.backendId, intern.id)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-brand-600 transition-colors"
                    aria-label={isSaved ? "Remove bookmark" : "Bookmark"}
                  >
                    {isSaved ? (
                      <svg className="w-5 h-5 fill-brand-600 text-brand-600" viewBox="0 0 24 24">
                        <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
                      </svg>
                    )}
                  </button>

                  {/* Logo + role */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                      style={{ background: intern.logoBg, color: intern.logoColor }}
                    >
                      {intern.logo}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">{intern.company}</p>
                      <p className="font-semibold text-neutral-900 text-sm leading-tight pr-10">
                        {intern.role}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {intern.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs bg-brand-50 text-brand-700 border border-brand-100 whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Type + duration */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {intern.type}
                    </span>
                    <span>&#183;</span>
                    <span>{intern.duration}</span>
                  </div>

                  {/* Stipend badge */}
                  {intern.paid ? (
                    <span className="self-start px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-100 text-success-700">
                      {intern.stipend ?? "Paid"}
                    </span>
                  ) : (
                    <span className="self-start px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-500">
                      Unpaid
                    </span>
                  )}

                  {/* Deadline urgency */}
                  <UrgencyLabel daysLeft={intern.daysLeft} deadline={intern.deadline} />

                  {/* View details */}
                  <Button
                    fullWidth
                    size="sm"
                    onClick={() => navigate("internship-detail", { id: intern.id, backendId: intern.backendId, internshipData: intern })}
                  >
                    View details
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
