import React, { useState, useEffect, useRef } from "react";
import type { Navigate } from "../../data/index";
import { COMPANIES } from "../../data/index";
import { CompanyLogo } from "../../components/common/CompanyLogos";
import {
  getCompanyDirectory,
  submitCompanyReview,
  submitCompanyStipend,
  submitInterviewExperience,
  type ApiCompanyDirectoryItem,
} from "../../api/client";

interface Props {
  navigate: Navigate;
}

type ReviewType = "Internship Experience" | "Interview Experience";

function StarRating({
  value,
  onChange,
  size = "medium",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "small" | "medium" | "large";
}) {
  const [hovered, setHovered] = useState(0);

  const starSizes = {
    small: "w-5 h-5",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`${starSizes[size]} transition-transform hover:scale-110 focus:outline-none`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isFilled ? "#F59E0B" : "none"}
              stroke={isFilled ? "#F59E0B" : "#CBD5E1"}
              strokeWidth={1.5}
              className="w-full h-full drop-shadow-xs"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export default function WriteReviewPage({ navigate }: Props) {
  const [reviewType, setReviewType] = useState<ReviewType>("Internship Experience");
  const [companyId, setCompanyId] = useState("");
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [companiesList, setCompaniesList] = useState<Array<{ id: string; name: string }>>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Role & Details
  const [roleTitle, setRoleTitle] = useState("");
  const [workMode, setWorkMode] = useState("Hybrid");
  const [term, setTerm] = useState("Fall 2026");
  const [stipend, setStipend] = useState("18000");
  const [unpaid, setUnpaid] = useState(false);
  const [duration, setDuration] = useState("3 Months");

  // Ratings
  const [overallRating, setOverallRating] = useState(5);
  const [mentorshipRating, setMentorshipRating] = useState(4);
  const [cultureRating, setCultureRating] = useState(4);
  const [recommend, setRecommend] = useState<boolean | null>(true);

  // Structured Written Insights
  const [headline, setHeadline] = useState("");
  const [theGood, setTheGood] = useState("");
  const [theChallenges, setTheChallenges] = useState("");
  const [advice, setAdvice] = useState("");

  // Interview Specific fields
  const [interviewRounds, setInterviewRounds] = useState("3");
  const [interviewDifficulty, setInterviewDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  useEffect(() => {
    getCompanyDirectory({ limit: 100 })
      .then((res) => {
        if (res.companies && res.companies.length > 0) {
          const mapped = res.companies.map((c: ApiCompanyDirectoryItem) => ({
            id: c._id,
            name: c.companyName,
          }));
          setCompaniesList(mapped);
          if (mapped.length > 0) {
            setCompanyId(mapped[0].id);
            setSelectedCompanyName(mapped[0].name);
            setCompanySearch(mapped[0].name);
          }
        } else {
          fallbackCompanies();
        }
      })
      .catch(() => {
        fallbackCompanies();
      });

    function fallbackCompanies() {
      const mapped = COMPANIES.map((c) => ({ id: String(c.id), name: c.name }));
      setCompaniesList(mapped);
      if (mapped.length > 0) {
        setCompanyId(mapped[0].id);
        setSelectedCompanyName(mapped[0].name);
        setCompanySearch(mapped[0].name);
      }
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCompanies = companiesList.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const ratingDescriptions: Record<number, string> = {
    1: "1.0 - Poor experience",
    2: "2.0 - Below average",
    3: "3.0 - Decent / Average",
    4: "4.0 - Great experience",
    5: "5.0 - Excellent / Outstanding",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) {
      setErrorMsg("Please select a company.");
      return;
    }
    if (!headline.trim()) {
      setErrorMsg("Please provide a one-line summary headline.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      if (reviewType === "Internship Experience") {
        if (!theGood.trim() && !theChallenges.trim()) {
          setErrorMsg("Please provide your experiences in the Pros and/or Cons section.");
          setSubmitting(false);
          return;
        }

        const reviewText = [
          headline.trim(),
          theGood.trim() ? `PROS: ${theGood.trim()}` : "",
          theChallenges.trim() ? `CONS: ${theChallenges.trim()}` : "",
          advice.trim() ? `ADVICE: ${advice.trim()}` : "",
          `ROLE: ${roleTitle || "Intern"} (${workMode}, ${term})`,
          recommend !== null ? `RECOMMENDED: ${recommend ? "Yes" : "No"}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        await submitCompanyReview(companyId, overallRating || 5, reviewText);

        if (!unpaid && stipend) {
          const num = Number(stipend.replace(/[^0-9]/g, ""));
          if (!isNaN(num) && num > 0) {
            await submitCompanyStipend(companyId, num).catch(() => {});
          }
        }
      } else {
        // Interview Experience
        await submitInterviewExperience(companyId, {
          role: roleTitle.trim() || "Internship Candidate",
          interviewType: workMode === "Remote" ? "Video call" : "On-site",
          rounds: interviewRounds || "2",
          difficulty: interviewDifficulty,
          process: `${headline}\n\n${theGood}`,
          questions: theChallenges || "Technical and problem-solving interview questions.",
          tips: advice,
          outcome: "Selected",
          interviewDate: term,
        });
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12 lg:px-8">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-200 shadow-sm">
            🎉
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Review Submitted Successfully!
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold mb-4">
            <span>🌱 +30 Contributor Points Awarded</span>
          </div>
          <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
            Thank you! Your 100% anonymous insights have been safely added to help university students make informed career choices.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("reviews")}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
            >
              Browse Public Reviews →
            </button>
            <button
              onClick={() => navigate("contributors")}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Check Leaderboard
            </button>
            <button
              onClick={() => navigate("dashboard")}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl text-xs transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-6xl mx-auto space-y-6">
      {/* Header & Privacy Callout */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          Share Your Internship Experience
        </h1>
        <p className="text-slate-500 text-sm lg:text-base mt-1">
          Help fellow university students make informed decisions. Real stories, zero corporate spin.
        </p>

        {/* Privacy Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
          <span className="text-lg shrink-0">🛡️</span>
          <div>
            <p className="font-bold text-amber-950">100% Anonymous Review</p>
            <p className="text-amber-800/90 mt-0.5">
              Your name, email, and university ID will <strong>NEVER</strong> be revealed to employers or displayed on the review.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Form Layout: 2-Column Bento Card Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT COLUMN: Role & Rating Information */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Role & Company Details</span>
              <span className="text-[11px] font-normal text-indigo-600">Step 1 of 2</span>
            </h2>

            {/* Review Type Segmented Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Review Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setReviewType("Internship Experience")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    reviewType === "Internship Experience"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>💼</span>
                  <span>Internship Experience</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewType("Interview Experience")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    reviewType === "Interview Experience"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🎙️</span>
                  <span>Interview Experience</span>
                </button>
              </div>
            </div>

            {/* Company Select with Autocomplete + Logos */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Name <span className="text-rose-500">*</span>
              </label>

              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-300 bg-white hover:border-indigo-400 cursor-pointer shadow-sm text-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedCompanyName ? (
                    <>
                      <CompanyLogo name={selectedCompanyName} size={28} />
                      <span className="font-semibold text-slate-800 truncate">{selectedCompanyName}</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Search & select company...</span>
                  )}
                </div>
                <span className="text-slate-400 text-xs">▾</span>
              </div>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <input
                      type="text"
                      placeholder="Type company name..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1 divide-y divide-slate-50">
                    {filteredCompanies.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setCompanyId(c.id);
                          setSelectedCompanyName(c.name);
                          setCompanySearch(c.name);
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 p-2 hover:bg-indigo-50/50 rounded-lg cursor-pointer transition-colors"
                      >
                        <CompanyLogo name={c.name} size={26} />
                        <span className="text-xs font-semibold text-slate-800">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Role Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Engineer Intern"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Work Mode & Term Dual Select */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Mode
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Term / Season
                </label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Fall 2026">Fall 2026</option>
                  <option value="Summer 2026">Summer 2026</option>
                  <option value="Spring 2026">Spring 2026</option>
                  <option value="Fall 2025">Fall 2025</option>
                </select>
              </div>
            </div>

            {/* Compensation & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Stipend (BDT/mo)
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={unpaid}
                      onChange={(e) => setUnpaid(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 text-xs"
                    />
                    <span className="text-[11px] font-medium text-slate-500">Unpaid</span>
                  </label>
                </div>
                <input
                  type="number"
                  placeholder="e.g. 18000"
                  disabled={unpaid}
                  value={unpaid ? "" : stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Internship Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3 Months"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Multi-Criteria Star Ratings */}
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Overall Experience <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    {ratingDescriptions[overallRating]}
                  </span>
                </div>
                <StarRating value={overallRating} onChange={setOverallRating} size="medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mentorship & Guidance
                  </label>
                  <StarRating value={mentorshipRating} onChange={setMentorshipRating} size="small" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Culture & Work-Life
                  </label>
                  <StarRating value={cultureRating} onChange={setCultureRating} size="small" />
                </div>
              </div>
            </div>

            {/* Recommendation Pill */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Would you recommend this company to other students?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRecommend(true)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    recommend === true
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>👍</span>
                  <span>Yes, recommended</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecommend(false)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    recommend === false
                      ? "bg-rose-50 border-rose-500 text-rose-800 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>👎</span>
                  <span>No, look elsewhere</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Structured Written Insights */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Structured Written Insights</span>
              <span className="text-[11px] font-normal text-indigo-600">Step 2 of 2</span>
            </h2>

            {/* One-line Headline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                One-Line Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Summarize your experience in one punchy sentence..."
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* The Good (Pros) */}
            <div>
              <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                The Good (Pros)
              </label>
              <textarea
                rows={4}
                placeholder="What did you enjoy? What did you learn? (Mentorship, tech stack, codebase, office perks, supportive seniors)..."
                value={theGood}
                onChange={(e) => setTheGood(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-emerald-50/20 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none leading-relaxed"
              />
            </div>

            {/* The Challenges (Cons) */}
            <div>
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                The Challenges (Cons)
              </label>
              <textarea
                rows={4}
                placeholder="What could be improved? (Workload, management, communication, stipend timeliness, unclear requirements)..."
                value={theChallenges}
                onChange={(e) => setTheChallenges(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-amber-50/20 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none leading-relaxed"
              />
            </div>

            {/* Advice for Applicants */}
            <div>
              <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Advice for Applicants
              </label>
              <textarea
                rows={3}
                placeholder="Tips for passing the interview, topics to study, or resume advice for future students..."
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-indigo-400 bg-indigo-50/20 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Submitting this review earns <span className="text-orange-600 font-extrabold">+30 Contributor Points</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Instantly advances your status towards Explorer Tier.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs md:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{submitting ? "Submitting securely..." : "Submit Anonymous Review ↗"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
