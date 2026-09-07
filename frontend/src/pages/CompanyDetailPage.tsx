import { useState, useEffect } from "react";
import type { Navigate } from "../data/index";
import {
  getCompanyDetails,
  type ApiCompanyDetailItem,
  type ApiInternship,
  searchInternships,
} from "../api/client";

interface Props {
  navigate: Navigate;
  id?: number;
  backendId?: string;
  companyName?: string;
}

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  if (rating <= 0) return null;
  const cls = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
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

export default function CompanyDetailPage({ navigate, backendId, companyName: initialName, id }: Props) {
  const [tab, setTab] = useState<"about" | "internships" | "reviews">("about");
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<ApiCompanyDetailItem>({
    _id: backendId || "",
    companyName: initialName || "Company",
    industry: "Software & Technology",
    description: "Technology partner providing internship opportunities in Bangladesh.",
    website: "https://example.com",
    verificationStatus: "Pending",
    averageRating: 0,
    reviewCount: 0,
    averageStipend: 0,
    stipendReportCount: 0,
    internshipsCount: 0,
    internships: [],
    reviews: [],
    createdAt: new Date().toISOString(),
  });

  const [companyInternships, setCompanyInternships] = useState<ApiInternship[]>([]);

  useEffect(() => {
    setLoading(true);
    const targetIdentifier = backendId || initialName || String(id || "");

    if (targetIdentifier) {
      getCompanyDetails(targetIdentifier)
        .then((res) => {
          if (res.company) {
            setCompany(res.company);
          }
        })
        .catch(() => {
          // Fallback if not found by direct details route
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [backendId, initialName, id]);

  useEffect(() => {
    // Search internships matching this company
    searchInternships({ keyword: company.companyName })
      .then((res) => {
        if (res.internships) {
          setCompanyInternships(res.internships);
        }
      })
      .catch(() => {
        setCompanyInternships([]);
      });
  }, [company.companyName]);

  const isVerified = company.verificationStatus === "Approved";
  const joinedDate = company.createdAt
    ? new Date(company.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently joined";

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-6 py-8 lg:px-8 lg:py-12">
        {/* Back button */}
        <button
          onClick={() => navigate("companies")}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-brand-700 transition mb-6 group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all companies
        </button>

        {loading ? (
          <div className="bg-white border border-neutral-200 rounded-3xl p-16 text-center text-neutral-400 shadow-sm">
            Loading company details...
          </div>
        ) : (
          <>
            {/* Header card */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 lg:p-8 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 bg-brand-50 text-brand-700 border border-brand-100 shadow-sm">
                  {company.companyName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1.5">
                    <h1
                      className="text-2xl lg:text-3xl font-bold italic text-neutral-900 leading-tight"
                      style={{ fontFamily: "Fraunces, serif" }}
                    >
                      {company.companyName}
                    </h1>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-success-700 bg-success-50 px-3 py-1 rounded-full border border-success-200">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified Enterprise
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-neutral-600 mb-3">{company.industry}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>Dhaka, Bangladesh</span>
                    </div>
                    {company.website && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                        </svg>
                        <a
                          href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:underline font-medium"
                        >
                          Visit website
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Member since {joinedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Write a review button */}
                <button
                  onClick={() => navigate("write-review")}
                  className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-brand-700 transition-all shadow-sm self-start sm:self-auto"
                >
                  Write a review
                </button>
              </div>

              {/* Stat Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-neutral-100">
                <div className="bg-neutral-50 rounded-2xl p-3.5 text-center">
                  <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">Rating</p>
                  {company.reviewCount > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-lg font-bold text-neutral-900">{company.averageRating.toFixed(1)}</span>
                      <span className="text-amber-400 text-sm">★</span>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-neutral-400 italic">No ratings yet</p>
                  )}
                </div>
                <div className="bg-neutral-50 rounded-2xl p-3.5 text-center">
                  <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">Reviews</p>
                  <p className="text-lg font-bold text-neutral-900">{company.reviewCount}</p>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-3.5 text-center">
                  <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">Average Stipend</p>
                  <p className="text-sm font-bold text-emerald-700">
                    {company.averageStipend > 0 ? `BDT ${company.averageStipend.toLocaleString()}/mo` : "Not reported"}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-3.5 text-center">
                  <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">Active Vacancies</p>
                  <p className="text-lg font-bold text-brand-600">{companyInternships.length}</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-neutral-200 mb-6 gap-6">
              {(
                [
                  { id: "about", label: "About" },
                  { id: "internships", label: `Internships (${companyInternships.length})` },
                  { id: "reviews", label: `Reviews (${company.reviews?.length || company.reviewCount || 0})` },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                    tab === t.id
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: About */}
            {tab === "about" && (
              <div className="space-y-6">
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 lg:p-8 shadow-sm">
                  <h2 className="text-base font-bold text-neutral-900 mb-3">About {company.companyName}</h2>
                  <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                    {company.description || "No detailed description provided by this company yet."}
                  </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-3xl p-6 lg:p-8 shadow-sm">
                  <h2 className="text-base font-bold text-neutral-900 mb-3">Company Overview</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-neutral-400 block mb-0.5 font-medium">Industry</span>
                      <span className="font-semibold text-neutral-800">{company.industry}</span>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-400 block mb-0.5 font-medium">Verification</span>
                      <span className="font-semibold text-neutral-800">{company.verificationStatus}</span>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-400 block mb-0.5 font-medium">Headquarters</span>
                      <span className="font-semibold text-neutral-800">Dhaka, Bangladesh</span>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-400 block mb-0.5 font-medium">Website</span>
                      <span className="font-semibold text-neutral-800">{company.website || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Internships */}
            {tab === "internships" && (
              <div className="space-y-4">
                {(!company.internships || company.internships.length === 0) && companyInternships.length === 0 ? (
                  <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center shadow-sm">
                    <h3 className="font-bold text-neutral-800 text-base mb-1">No active internships posted</h3>
                    <p className="text-xs text-neutral-500">
                      {company.companyName} does not have any open vacancies currently listed.
                    </p>
                  </div>
                ) : (
                  ((company.internships && company.internships.length > 0) ? company.internships : companyInternships).map((intern: any) => (
                    <div
                      key={intern._id || intern.id}
                      className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-neutral-900 text-base">{intern.title}</h3>
                          <span className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-full font-medium">
                            {intern.mode}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                              intern.type === "Paid"
                                ? "bg-success-50 text-success-700 border border-success-200"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {intern.type}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 line-clamp-1">{intern.description || `Internship opportunity with ${company.companyName}`}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Deadline: {intern.deadline ? new Date(intern.deadline).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "Ongoing"}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("internship-detail", { id: 1, backendId: intern._id || intern.id })}
                        className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shrink-0 shadow-sm"
                      >
                        View & Apply
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Reviews */}
            {tab === "reviews" && (
              <div className="space-y-4">
                {(!company.reviews || company.reviews.length === 0) ? (
                  <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      ★
                    </div>
                    <h3 className="font-bold text-neutral-800 text-base mb-1">No reviews yet</h3>
                    <p className="text-xs text-neutral-500 mb-4 max-w-sm mx-auto">
                      There are no student reviews submitted for {company.companyName} yet. Ratings will appear once reviews are submitted.
                    </p>
                    <button
                      onClick={() => navigate("write-review")}
                      className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      Be the first to review
                    </button>
                  </div>
                ) : (
                  company.reviews.map((r) => (
                    <div
                      key={r._id}
                      className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StarRating rating={r.rating} size="sm" />
                          <span className="text-xs font-bold text-neutral-800">{r.rating}.0 / 5.0</span>
                        </div>
                        <span className="text-xs text-neutral-400">
                          {new Date(r.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700 leading-relaxed italic">"{r.comment}"</p>
                      <p className="text-xs text-neutral-400 font-medium">Verified Student Reviewer</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
