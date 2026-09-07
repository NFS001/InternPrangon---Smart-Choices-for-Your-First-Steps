import { useState, useEffect } from "react";
import type { Navigate } from "../data/index";
import { COMPANIES, INTERNSHIPS } from "../data/index";
import { getCompanyReviews, getCompanyDirectory, getCompanyById, getSavedUser } from "../api/client";
import ReportReviewModal, { type ReportTargetReview } from "../components/public/ReportReviewModal";

interface Props {
  navigate: Navigate;
  id?: number | string;
  companyId?: number | string;
  companyData?: any;
}

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`${cls} ${n <= Math.round(rating) ? "text-amber-400" : "text-neutral-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

const HARDCODED_REVIEWS = [
  {
    id: 1,
    rating: 5,
    quote:
      "An incredible learning experience. The team was supportive and I got to work on real features that shipped to production.",
    label: "CS Student · Intern",
  },
  {
    id: 2,
    rating: 4,
    quote:
      "Great mentorship culture. My supervisor held weekly 1-on-1s and gave detailed feedback on my code. Would recommend to any student.",
    label: "CS Student · Intern",
  },
  {
    id: 3,
    rating: 4,
    quote:
      "The work was challenging but the team was always willing to help. Learned more here in 3 months than I did in a year of classes.",
    label: "CS Student · Intern",
  },
];

export default function CompanyDetailPage({ navigate, id, companyId, companyData: initialData }: Props) {
  const targetKey = companyId || id;
  const initialCompany = initialData ||
    (targetKey ? COMPANIES.find(c => (c.mongoId && c.mongoId === targetKey) || String(c.id) === String(targetKey) || (typeof targetKey === 'string' && c.name.toLowerCase() === targetKey.toLowerCase())) : null) ||
    COMPANIES[0];

  const [company, setCompany] = useState(initialCompany);
  const [companyInternships, setCompanyInternships] = useState<any[]>(() => {
    return INTERNSHIPS.filter(i =>
      i.company.toLowerCase() === initialCompany.name.toLowerCase() ||
      i.companyId === initialCompany.id
    );
  });
  const [tab, setTab] = useState<"about" | "internships" | "reviews">("about");
  const [reportingReview, setReportingReview] = useState<ReportTargetReview | null>(null);
  const [reportedReviewIds, setReportedReviewIds] = useState<Set<string | number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [liveReviews, setLiveReviews] = useState<Array<{
    id: string;
    rating: number;
    quote: string;
    label: string;
  }>>([]);

  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('internprangon_deleted_reviews');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const raw = localStorage.getItem('internprangon_deleted_reviews');
        setDeletedIds(new Set(raw ? JSON.parse(raw) : []));
      } catch {}
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('internprangon_reviews_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('internprangon_reviews_updated', handleSync);
    };
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleReportClick = (review: { id: string | number; rating: number; quote: string; label: string }) => {
    setReportingReview({
      id: review.id,
      company: company.name,
      rating: review.rating,
      content: review.quote,
      anonymous: review.label,
    });
  };

  const handleReportSuccess = (targetId: string | number) => {
    setReportedReviewIds((prev) => new Set([...prev, targetId]));
    setToastMessage("Thank you. This review has been flagged for admin moderation.");
  };

  useEffect(() => {
    let isCurrent = true;

    // Determine the exact company we are supposed to be viewing
    const currentComp = initialData ||
      (targetKey ? COMPANIES.find(c => (c.mongoId && c.mongoId === targetKey) || String(c.id) === String(targetKey) || (typeof targetKey === 'string' && c.name.toLowerCase() === targetKey.toLowerCase())) : null);

    if (currentComp) {
      setCompany(currentComp);
      const matched = INTERNSHIPS.filter(
        (i) => i.company.toLowerCase() === currentComp.name.toLowerCase()
      );
      if (matched.length > 0) setCompanyInternships(matched);
    }

    const lookupKey =
      (initialData?.mongoId && typeof initialData.mongoId === 'string' && initialData.mongoId.length === 24 ? initialData.mongoId : null) ||
      (typeof targetKey === 'string' && targetKey.length === 24 ? targetKey : null) ||
      initialData?.name ||
      currentComp?.name ||
      targetKey;

    if (!lookupKey) return;

    getCompanyById(String(lookupKey))
      .then((res) => {
        if (!isCurrent) return;
        if (res.company) {
          const matchStatic = COMPANIES.find(
            (sc) => sc.name.toLowerCase() === res.company.companyName.toLowerCase()
          );
          setCompany((prev: any) => ({
            ...prev,
            mongoId: res.company._id,
            name: res.company.companyName,
            industry: res.company.industry || prev.industry,
            description: res.company.description || prev.description,
            about: matchStatic?.about || res.company.description || prev.about,
            website: res.company.website || prev.website,
            verified: res.company.verificationStatus === "Approved",
            rating: res.company.averageRating || prev.rating || 4.7,
            reviewCount: res.company.reviewCount || prev.reviewCount || 1,
            avgStipend: res.company.averageStipend
              ? `BDT ${res.company.averageStipend.toLocaleString()}/mo`
              : prev.avgStipend,
            logo: matchStatic?.logo || res.company.companyName.slice(0, 2).toUpperCase(),
            logoBg: matchStatic?.logoBg || prev.logoBg || "#eff6ff",
            logoColor: matchStatic?.logoColor || prev.logoColor || "#2845e2",
            size: matchStatic?.size || prev.size || "500+ employees",
            founded: matchStatic?.founded || prev.founded || "2015",
            location: matchStatic?.location || prev.location || "Dhaka, Bangladesh",
            tags: matchStatic?.tags || [res.company.industry || "Technology", "Enterprise", "Internships"],
          }));

          if (res.internships && res.internships.length > 0) {
            const mappedInt = res.internships.map((ri, idx) => ({
              id: idx + 500,
              backendId: ri._id,
              role: ri.title,
              company: res.company.companyName,
              companyId: res.company._id,
              paid: ri.type === "Paid",
              duration: "3 months",
              location: ri.mode === "Remote" ? "Remote, BD" : "Dhaka, BD",
              type: ri.mode,
              deadline: new Date(ri.deadline).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              daysLeft: Math.max(
                0,
                Math.ceil((new Date(ri.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              ),
              stipend: ri.type === "Paid" ? "BDT 18,000/mo" : undefined,
              description: ri.description,
            }));
            setCompanyInternships(mappedInt);
          } else {
            const staticMatch = INTERNSHIPS.filter(
              (i) => i.company.toLowerCase() === res.company.companyName.toLowerCase()
            );
            if (staticMatch.length > 0) setCompanyInternships(staticMatch);
          }

          if (res.reviews && res.reviews.length > 0) {
            setLiveReviews(
              res.reviews.map((r, idx) => ({
                id: (r as any)._id || String(idx),
                rating: r.rating,
                quote: r.comment,
                label: `Verified Student · ${new Date(r.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })}`,
              }))
            );
          }
        }
      })
      .catch(() => {
        if (!isCurrent) return;
        // Lookup ONLY this exact target company in directory fallback
        const targetNameToFind = initialData?.name || currentComp?.name;
        getCompanyDirectory({ limit: 100 })
          .then((dRes) => {
            if (!isCurrent) return;
            const match = dRes.companies?.find(
              (c) =>
                (targetKey && c._id === targetKey) ||
                (targetNameToFind && c.companyName.toLowerCase() === targetNameToFind.toLowerCase())
            );
            if (match) {
              const matchStatic = COMPANIES.find(
                (sc) => sc.name.toLowerCase() === match.companyName.toLowerCase()
              );
              setCompany((prev: any) => ({
                ...prev,
                mongoId: match._id,
                name: match.companyName,
                industry: match.industry || prev.industry,
                description: match.description || prev.description,
                website: match.website || prev.website,
                verified: match.verificationStatus === "Approved",
                rating: match.averageRating || prev.rating,
                reviewCount: match.reviewCount || prev.reviewCount,
                avgStipend: match.averageStipend
                  ? `BDT ${match.averageStipend.toLocaleString()}/mo`
                  : prev.avgStipend,
                logo: matchStatic?.logo || match.companyName.slice(0, 2).toUpperCase(),
                logoBg: matchStatic?.logoBg || prev.logoBg || "#eff6ff",
                logoColor: matchStatic?.logoColor || prev.logoColor || "#2845e2",
                size: matchStatic?.size || prev.size || "500+ employees",
                founded: matchStatic?.founded || prev.founded || "2015",
                location: matchStatic?.location || prev.location || "Dhaka, Bangladesh",
                about: matchStatic?.about || match.description || prev.about,
              }));

              getCompanyReviews(match._id)
                .then((rRes) => {
                  if (!isCurrent) return;
                  if (rRes.reviews && rRes.reviews.length > 0) {
                    setLiveReviews(
                      rRes.reviews.map((r, idx) => ({
                        id: (r as any).id || (r as any)._id || String(idx),
                        rating: r.rating,
                        quote: r.comment,
                        label: `Verified Student · ${new Date(r.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })}`,
                      }))
                    );
                  }
                })
                .catch(() => {});
            }
          })
          .catch(() => {});
      });

    return () => {
      isCurrent = false;
    };
  }, [targetKey, initialData]);

  const urgencyColor = (daysLeft: number) => {
    if (daysLeft <= 3) return "text-red-600 bg-red-50 border-red-200";
    if (daysLeft <= 7) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-neutral-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 border border-white/10 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Report Modal */}
      <ReportReviewModal
        review={reportingReview}
        onClose={() => setReportingReview(null)}
        onSuccess={handleReportSuccess}
        onRequireAuth={() => navigate("login")}
      />

      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Back button */}
        <button
          onClick={() => navigate("companies")}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-700 transition mb-8 group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          All companies
        </button>

        {/* Header card */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-8 mb-6">
          {/* Logo + name row */}
          <div className="flex items-start gap-6 mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 border border-black/5"
              style={{ backgroundColor: company.logoBg, color: company.logoColor }}
            >
              {company.logo}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1
                  className="text-3xl font-bold italic text-neutral-900"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  {company.name}
                </h1>
                {company.verified && (
                  <span className="flex items-center gap-1 text-xs text-brand-600 font-medium bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
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
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                <span>{company.industry}</span>
                <span className="text-neutral-300">·</span>
                <span>{company.size} employees</span>
                <span className="text-neutral-300">·</span>
                <span>{company.location}</span>
                <span className="text-neutral-300">·</span>
                <span>Founded {company.founded}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {company.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-full border border-neutral-200"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-neutral-100">
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <StarRating rating={company.rating} size="lg" />
              </div>
              <p className="text-lg font-bold text-neutral-900">{company.rating.toFixed(1)}</p>
              <p className="text-xs text-neutral-400 mt-0.5">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-neutral-900">{company.reviewCount}</p>
              <p className="text-xs text-neutral-400 mt-0.5">Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">{company.avgStipend}</p>
              <p className="text-xs text-neutral-400 mt-0.5">Avg Stipend</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-brand-600">{company.activeInternships}</p>
              <p className="text-xs text-neutral-400 mt-0.5">Open Positions</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-neutral-100 rounded-2xl p-1.5">
          {(["about", "internships", "reviews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl capitalize transition ${
                tab === t
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t === "internships" ? `Internships (${companyInternships.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab: About */}
        {tab === "about" && (
          <div className="bg-white border border-neutral-100 rounded-2xl p-8 space-y-8">
            <div>
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                About
              </h2>
              <p className="text-neutral-700 leading-relaxed">{company.description}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                Company Info
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Founded", value: company.founded },
                  { label: "Size", value: `${company.size} employees` },
                  { label: "Location", value: company.location },
                  { label: "Industry", value: company.industry },
                  { label: "Avg Stipend", value: company.avgStipend },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-neutral-50 rounded-xl px-5 py-4 border border-neutral-100"
                  >
                    <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-neutral-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Internships */}
        {tab === "internships" && (
          <div className="space-y-3">
            {companyInternships.length === 0 ? (
              <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center text-neutral-400">
                <svg
                  className="w-10 h-10 mx-auto mb-3 opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-sm font-medium">No open internships right now</p>
                <p className="text-xs mt-1">Check back later or explore other companies.</p>
              </div>
            ) : (
              companyInternships.map((internship) => (
                <div
                  key={internship.id}
                  className="bg-white border border-neutral-100 rounded-2xl p-5 flex items-center gap-5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-bold text-neutral-800">{internship.role}</h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          internship.paid
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : "text-neutral-500 bg-neutral-100 border-neutral-200"
                        }`}
                      >
                        {internship.paid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                      <span>{internship.type}</span>
                      <span>·</span>
                      <span>{internship.duration}</span>
                      <span>·</span>
                      <span>{internship.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${urgencyColor(internship.daysLeft)}`}
                    >
                      {internship.daysLeft <= 1
                        ? "Last day"
                        : `${internship.daysLeft}d left`}
                    </span>
                    <button
                      onClick={() => navigate("internship-detail", { id: internship.id, backendId: internship.backendId || internship._id, internshipData: internship })}
                      className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Reviews */}
        {tab === "reviews" && (
          <div className="space-y-4">
            <div className="bg-brand-50 border border-brand-100 rounded-2xl px-5 py-3 flex items-center justify-between">
              <p className="text-xs text-brand-700 font-medium">
                All reviews are anonymous.
              </p>
              <button
                onClick={() => navigate("write-review")}
                className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition"
              >
                Write a review
              </button>
            </div>

            {(() => {
              const activeCompanyReviews = [...liveReviews, ...HARDCODED_REVIEWS].filter((review) => {
                if (deletedIds.has(String(review.id))) return false;
                if (review.quote && deletedIds.has(`txt:${review.quote.trim().slice(0, 45)}`)) return false;
                return true;
              });

              if (activeCompanyReviews.length === 0) {
                return (
                  <div className="bg-white border border-neutral-100 rounded-2xl p-8 text-center text-neutral-500 text-sm">
                    No reviews yet for this company.
                  </div>
                );
              }

              return activeCompanyReviews.map((review) => {
                const isReported = reportedReviewIds.has(review.id);
                return (
                  <div
                    key={review.id}
                    className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <StarRating rating={review.rating} />
                      <span className="text-xs font-semibold text-neutral-700">
                        {review.rating}.0
                      </span>
                    </div>
                    <p className="text-neutral-700 text-sm leading-relaxed mb-4">
                      "{review.quote}"
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <p className="text-xs text-neutral-400 font-medium">{review.label}</p>
                      {isReported ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
                          ✓ Reported
                        </span>
                      ) : (
                        <button
                          onClick={() => handleReportClick(review)}
                          className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600 transition font-medium px-2 py-1 rounded-lg hover:bg-red-50"
                          title="Report this review"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                            />
                          </svg>
                          Report
                        </button>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Report Review Modal */}
      {reportingReview && (
        <ReportReviewModal
          review={reportingReview}
          onClose={() => setReportingReview(null)}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
}
