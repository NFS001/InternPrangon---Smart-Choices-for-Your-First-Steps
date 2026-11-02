import React, { useState, useEffect } from "react";
import type { Navigate } from "../data/index";
import { COMPANIES, INTERNSHIPS } from "../data/index";
import { CompanyLogo } from "../components/common/CompanyLogos";
import {
  getCompanyReviews,
  getCompanyDirectory,
  getCompanyById,
  getSavedUser,
} from "../api/client";
import ReportReviewModal, {
  type ReportTargetReview,
} from "../components/public/ReportReviewModal";

interface Props {
  navigate: Navigate;
  id?: number | string;
  companyId?: number | string;
  companyData?: any;
  slug?: string;
  backendId?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-4 h-4 ${
            n <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 fill-slate-200"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

const DEFAULT_TECH_STACK = ["Cloud", "React", "Node.js", "Enterprise", "AWS", "Docker"];

const getMockReviewsForCompany = (compName: string) => [
  {
    id: "r1",
    author: "Zubaer Rahman",
    university: "BUET, CSE '26",
    badge: "Verified Intern",
    rating: 5.0,
    date: "Aug 2026",
    quote:
      `Working at ${compName} was a transformative experience for my software engineering journey. I got to contribute directly to distributed microservices and attended weekly architecture design reviews with principal architects. The mentorship culture is outstanding.`,
  },
  {
    id: "r2",
    author: "Mehnaz Tabassum",
    university: "BRAC University, CS '25",
    badge: "Verified Intern",
    rating: 5.0,
    date: "Jul 2026",
    quote:
      `The engineering culture at ${compName} is remarkably transparent and encouraging. Rather than working on toy assignments, my supervisor paired with me on production pull requests and helped me build an enterprise component library. Received a full-time PPO offer before graduating!`,
  },
  {
    id: "r3",
    author: "Tanvir Ahmed",
    university: "NSU, ECE '26",
    badge: "Verified DevOps Intern",
    rating: 4.8,
    date: "Jun 2026",
    quote:
      "Great balance of autonomy and guidance. Free coffee, collaborative breakout zones, and friendly sprint retrospectives made every day engaging. A genuine 10/10 tech internship in Dhaka.",
  },
];

export default function CompanyDetailPage({
  navigate,
  id,
  companyId,
  companyData: initialData,
  slug,
  backendId,
}: Props) {
  const targetKey = companyId || backendId || id || slug;
  const initialCompany =
    initialData ||
    (targetKey
      ? COMPANIES.find(
          (c) =>
            (c.mongoId && c.mongoId === targetKey) ||
            String(c.id) === String(targetKey) ||
            (typeof targetKey === "string" &&
              (c.name.toLowerCase() === targetKey.toLowerCase() ||
                (c.slug && c.slug.toLowerCase() === targetKey.toLowerCase())))
        )
      : null) ||
    COMPANIES[0];

  const [company, setCompany] = useState(initialCompany);
  const [tab, setTab] = useState<"about" | "internships" | "reviews">("about");
  const [following, setFollowing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportingReview, setReportingReview] = useState<ReportTargetReview | null>(null);
  const [reportedReviewIds, setReportedReviewIds] = useState<Set<string | number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [liveReviews, setLiveReviews] = useState<any[]>([]);
  const [backendInternships, setBackendInternships] = useState<any[]>([]);

  // Find active internships belonging to this company
  const compInternships = INTERNSHIPS.filter(
    (i) =>
      i.company.toLowerCase() === (company.name || "").toLowerCase() ||
      i.companyId === company.id
  );
  const activeInternshipsToDisplay = backendInternships.length > 0 ? backendInternships : compInternships;

  // Sync when initialCompany or targetKey changes
  useEffect(() => {
    if (initialData) {
      setCompany(initialData);
    } else {
      const match = targetKey
        ? COMPANIES.find(
            (c) =>
              (c.mongoId && c.mongoId === targetKey) ||
              String(c.id) === String(targetKey) ||
              (typeof targetKey === "string" &&
                (c.name.toLowerCase() === targetKey.toLowerCase() ||
                  (c.slug && c.slug.toLowerCase() === targetKey.toLowerCase())))
          )
        : null;
      if (match) setCompany(match);
    }
  }, [targetKey, initialData]);

  // Load backend details & verified reviews if mongoId or targetKey is available
  useEffect(() => {
    const keyToFetch = company.mongoId || (targetKey ? String(targetKey) : undefined);
    if (!keyToFetch) return;

    getCompanyById(keyToFetch)
      .then((res) => {
        if (res.company) {
          const c = res.company;
          const matchStatic = COMPANIES.find(
            (sc) => sc.name.toLowerCase() === c.companyName.toLowerCase()
          );
          setCompany((prev: any) => ({
            ...prev,
            mongoId: c._id,
            name: c.companyName || prev.name,
            industry: c.industry || matchStatic?.industry || prev.industry,
            description: c.description || prev.description,
            about: c.description || matchStatic?.about || prev.about,
            website: c.website || matchStatic?.website || prev.website,
            verified: c.verificationStatus === "Approved",
            rating: c.averageRating || matchStatic?.rating || prev.rating,
            reviewCount: c.reviewCount || matchStatic?.reviewCount || prev.reviewCount,
            avgStipend: c.averageStipend
              ? `BDT ${c.averageStipend.toLocaleString()}/mo`
              : prev.avgStipend,
            size: matchStatic?.size || prev.size || "500+ Employees",
            founded: matchStatic?.founded || prev.founded || "2015",
            location: matchStatic?.location || prev.location || "Dhaka, Bangladesh",
          }));
        }

        if (res.internships && res.internships.length > 0) {
          setBackendInternships(
            res.internships.map((bi) => ({
              id: bi._id,
              role: bi.title,
              company: company.name,
              type: bi.type,
              mode: bi.mode,
              location: company.location || "Dhaka, Bangladesh",
              stipend: "BDT 18,000/mo",
              deadline: bi.deadline
                ? new Date(bi.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Open",
              tags: [bi.mode, bi.type],
              description: bi.description || "Exciting internship opportunity.",
            }))
          );
        }

        if (res.reviews && res.reviews.length > 0) {
          setLiveReviews(
            res.reviews.map((r: any, idx: number) => ({
              id: r._id || String(idx),
              author: r.anonymous ? "Anonymous Student" : r.student?.name || "Student Contributor",
              university: r.university || "BRAC University",
              badge: "Verified Intern",
              rating: r.rating || 5.0,
              date: new Date(r.createdAt || Date.now()).toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              }),
              quote: r.comment || "Great work culture and supportive engineering mentorship.",
            }))
          );
        }
      })
      .catch(() => {});
  }, [targetKey, company.mongoId]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setToastMessage("Company profile link copied to clipboard!");
    setTimeout(() => {
      setCopied(false);
      setToastMessage(null);
    }, 3000);
  };

  const handleFollowToggle = () => {
    setFollowing((prev) => !prev);
    setToastMessage(following ? `Unfollowed ${company.name}` : `You are now following ${company.name}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReportSuccess = (reviewId: string | number) => {
    setReportedReviewIds((prev) => new Set(prev).add(reviewId));
    setToastMessage("Report submitted successfully. Admin moderation team notified.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const reviewsToDisplay = liveReviews.length > 0 ? liveReviews : getMockReviewsForCompany(company.name);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-24 font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* ── Background Aura Glows ── */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[380px] bg-indigo-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-96 left-1/4 w-[500px] h-[340px] bg-orange-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0F172A]/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 border border-white/10 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Review Report Modal */}
      <ReportReviewModal
        review={reportingReview}
        onClose={() => setReportingReview(null)}
        onSuccess={handleReportSuccess}
        onRequireAuth={() => navigate("login")}
      />

      {/* ═══════════════════════════════════════════════════════════════
          1. BREADCRUMB & TOP CONTROLS
          ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <button
              onClick={() => navigate("companies")}
              className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer py-1 -ml-1 px-1 rounded-lg hover:bg-indigo-50/60"
            >
              <span>&larr;</span>
              <span>Back to all companies</span>
            </button>
            <span>/</span>
            <button onClick={() => navigate("home")} className="hover:text-slate-800 cursor-pointer">
              Home
            </button>
            <span>/</span>
            <button onClick={() => navigate("companies")} className="hover:text-slate-800 cursor-pointer">
              Companies
            </button>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px]">{company.name}</span>
          </div>

          {/* Right Side Actions: Share & Follow */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShare}
              className="h-9 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white/90 hover:bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>{copied ? "Link Copied!" : "Share Profile"}</span>
            </button>

            <button
              onClick={handleFollowToggle}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                following
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs"
                  : "bg-white hover:bg-indigo-50/80 border-indigo-200 text-indigo-600 shadow-2xs"
              }`}
            >
              <span>{following ? "✓ Following" : "+ Follow Company"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          2. COMPANY HERO & COVER SHOWCASE
          ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          {/* 16:6 Aspect Ratio Photographic Cover Banner */}
          <div className="relative w-full h-48 sm:h-64 lg:h-72 overflow-hidden bg-slate-900">
            <img
              src="/workplace_office_banner.jpg"
              alt={`${company.name} office interior and tech floor`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
              📍 {company.location || "Mohakhali, Dhaka"}
            </span>
          </div>

          {/* Logo Overlay & Header Info */}
          <div className="p-6 sm:p-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-5">
              {/* Elevated Logo Container Overlapping Banner */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-3 shadow-xl border border-slate-100 flex items-center justify-center shrink-0">
                <CompanyLogo name={company.name} size={76} />
              </div>

              {/* Verified Pill Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/90 text-xs font-bold shadow-2xs">
                  <span>✔</span>
                  <span>Verified Partner Employer</span>
                </span>
              </div>
            </div>

            {/* Brand Title & Headline Info */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                {company.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium mt-1.5">
                {company.industry || "Software & Cloud Solutions"} · {company.size || "700+ Engineers"} · {company.location || "Mohakhali, Dhaka"} · Founded {company.founded || "2006"}
              </p>

              {/* Tech Stack Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {DEFAULT_TECH_STACK.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100/90 text-slate-700 border border-slate-200/80 shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                3. KEY METRICS HIGHLIGHT BAR (BENTO STRIP)
                ═══════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
              {/* Metric 1 */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Student Rating</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-2xl font-black text-[#0F172A]">★ {company.rating ? company.rating.toFixed(1) : "5.0"}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Average Intern Stipend</span>
                <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-2">
                  {company.avgStipend || "BDT 18,000 / mo"}
                </p>
              </div>

              {/* Metric 3 */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/60 flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Active Opportunities</span>
                <p className="text-2xl font-black text-indigo-700 mt-2">
                  {activeInternshipsToDisplay.length > 0 ? activeInternshipsToDisplay.length : 2} Open Roles
                </p>
              </div>

              {/* Metric 4 */}
              <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-200/60 flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Recruiter Response</span>
                <p className="text-2xl font-black text-[#0F172A] mt-2">&lt; 48 Hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            4. SEGMENTED TAB NAVIGATION
            ═══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 mt-8 mb-6 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-1.5 max-w-md shadow-xs">
          <button
            onClick={() => setTab("about")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === "about"
                ? "bg-indigo-600 text-white shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            About & Culture
          </button>
          <button
            onClick={() => setTab("internships")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === "internships"
                ? "bg-indigo-600 text-white shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active Internships ({activeInternshipsToDisplay.length > 0 ? activeInternshipsToDisplay.length : 2})
          </button>
          <button
            onClick={() => setTab("reviews")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === "reviews"
                ? "bg-indigo-600 text-white shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Student Reviews ({company.reviewCount || reviewsToDisplay.length})
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            5. TAB CONTENT: 2-COLUMN RESPONSIVE LAYOUT (65% / 35%)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 items-start">
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN (65% width) - Main Story, Gallery & Opportunities
              ───────────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-8 min-w-0">
            {/* Tab: About & Culture */}
            {(tab === "about" || tab === "internships" || tab === "reviews") && (
              <>
                {/* "About Company" Section */}
                {tab === "about" && (
                  <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Company Overview</span>
                    <h2 className="text-2xl font-bold text-[#0F172A] mt-1 mb-4">About {company.name}</h2>
                    <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                      <p>
                        {company.about || company.description || `${company.name} is one of Bangladesh's recognized organizations delivering industry-leading solutions in ${company.industry || "Software & Cloud Solutions"}. They foster an inclusive, high-growth environment that prioritizes hands-on professional development.`}
                      </p>
                      <p>
                        Through their accredited university internship program, interns at {company.name} participate directly in production sprint cycles, receive personalized 1-on-1 mentorship from senior tech leads, and gain hands-on experience solving impactful engineering challenges.
                      </p>
                    </div>
                  </div>
                )}

                {/* "Workplace & Engineering Culture" Bento Gallery */}
                {tab === "about" && (
                  <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <div className="mb-6">
                      <span className="text-xs font-bold text-[#F97316] uppercase tracking-widest">Behind the Scenes</span>
                      <h2 className="text-2xl font-bold text-[#0F172A] mt-1">Workplace & Engineering Culture</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Take a look inside the daily creative and collaborative atmosphere at {company.name}.
                      </p>
                    </div>

                    {/* 3-Photo Bento Mosaic */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Photo 1: Standing desks & open ops floor */}
                      <div className="sm:col-span-2 rounded-2xl overflow-hidden relative group aspect-[21/9] bg-slate-900 shadow-xs">
                        <img
                          src="/workplace_office_banner.jpg"
                          alt="Engineers collaborating at standing desks"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                          <p className="text-xs font-semibold text-white drop-shadow">
                            Engineers collaborating at modern open workstations & dual-monitor setups
                          </p>
                        </div>
                      </div>

                      {/* Photo 2: Casual breakout area */}
                      <div className="rounded-2xl overflow-hidden relative group aspect-square bg-slate-900 shadow-xs">
                        <img
                          src="/office_team_coffee.jpg"
                          alt="Casual breakout area and team bonding"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                          <p className="text-xs font-semibold text-white drop-shadow">
                            Casual breakout lounge & team coffee sessions
                          </p>
                        </div>
                      </div>

                      {/* Photo 3: Hackathon whiteboard session */}
                      <div className="rounded-2xl overflow-hidden relative group aspect-square bg-slate-900 shadow-xs">
                        <img
                          src="/office_whiteboard_sprint.jpg"
                          alt="Sprint planning and whiteboard architectural review"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                          <p className="text-xs font-semibold text-white drop-shadow">
                            Hackathons & weekly agile sprint architecture reviews
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* "Active Internship Opportunities" at this Company */}
                {(tab === "about" || tab === "internships") && (
                  <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Open Positions</span>
                        <h2 className="text-2xl font-bold text-[#0F172A] mt-1">
                          Active Internship Opportunities at {company.name}
                        </h2>
                      </div>
                      <span className="text-xs font-bold text-slate-400">
                        {activeInternshipsToDisplay.length} {activeInternshipsToDisplay.length === 1 ? 'Role' : 'Roles'}
                      </span>
                    </div>

                    {activeInternshipsToDisplay.length === 0 ? (
                      <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-sm font-semibold text-slate-600">No active openings right now at {company.name}.</p>
                        <p className="text-xs text-slate-400 mt-1">Check back soon or follow this company for alert notifications.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeInternshipsToDisplay.map((intern: any, idx: number) => {
                          const roleName = intern.role || intern.title || "Internship Role";
                          const internMode = intern.mode || "Remote";
                          const internStipend = intern.stipend || company.avgStipend || "BDT 18,000/mo";
                          const internType = intern.type || "Paid";
                          return (
                            <div
                              key={intern.id || idx}
                              onClick={() =>
                                navigate("internship-detail", {
                                  id: intern.id || idx + 1,
                                  backendId: typeof intern.id === "string" ? intern.id : undefined,
                                  internshipData: {
                                    id: intern.id || idx + 1,
                                    company: company.name,
                                    role: roleName,
                                    mode: internMode,
                                    duration: intern.duration || "3 months",
                                    stipend: internStipend,
                                    type: internType,
                                    description: intern.description,
                                  },
                                })
                              }
                              className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    {internMode} • {intern.duration || "3-6 months"}
                                  </span>
                                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    {internStipend}
                                  </span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm mt-2 hover:text-indigo-600 transition-colors">
                                  {roleName}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {intern.description || `Gain practical hands-on experience and mentorship at ${company.name}.`}
                                </p>
                              </div>
                              <span className="text-xs font-bold text-indigo-600 mt-4 inline-flex items-center gap-1">
                                View Details &rarr;
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* "Student Reviews" Section */}
                {(tab === "about" || tab === "reviews") && (
                  <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Verified Experiences</span>
                        <h2 className="text-2xl font-bold text-[#0F172A] mt-1">Student Reviews</h2>
                      </div>
                      <button
                        onClick={() => navigate("write-review", { companyId: company.mongoId || company.id, companyName: company.name })}
                        className="px-4 py-2 text-xs font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-xl transition-all cursor-pointer border border-indigo-200 shadow-2xs"
                      >
                        Write a Review
                      </button>
                    </div>

                    <div className="space-y-4">
                      {reviewsToDisplay.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-5 rounded-2xl border border-slate-200/80 bg-white/90 shadow-2xs flex flex-col gap-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#0F172A]">{rev.author}</span>
                                <span className="text-xs text-slate-400">• {rev.university}</span>
                              </div>
                              <span className="inline-block mt-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.2 rounded-full">
                                {rev.badge}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <StarRating rating={rev.rating} />
                              <button
                                onClick={() => setReportingReview({ id: rev.id, company: company.name, content: rev.quote, rating: rev.rating })}
                                className="text-[11px] text-slate-400 hover:text-rose-500 font-semibold cursor-pointer"
                              >
                                {reportedReviewIds.has(rev.id) ? "Reported" : "Report"}
                              </button>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                            "{rev.quote}"
                          </p>
                          <span className="text-[10px] text-slate-400 self-end font-semibold">{rev.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN (35% width) - Quick Facts, Benefits & Map
              ───────────────────────────────────────────────────────────── */}
          <div className="sticky top-20 flex flex-col gap-6">
            {/* 1. "Company Snapshot" Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <h3 className="text-base font-bold text-[#0F172A] mb-4 pb-3 border-b border-slate-100">
                Company Snapshot
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Industry</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{company.industry || "Enterprise Software & FinTech"}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Company Size</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{company.size || "700+ Employees"}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Headquarters</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {company.location ? `${company.location}, Bangladesh` : "Dhaka, Bangladesh"}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Website</span>
                  <a
                    href={company.website?.startsWith("http") ? company.website : `https://${company.website || "example.com"}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 text-sm mt-0.5"
                  >
                    <span>{company.website?.replace(/^https?:\/\//, "") || `${(company.name || "company").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`}</span>
                    <span>↗</span>
                  </a>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Social Profiles</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors">
                      LinkedIn
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors">
                      GitHub
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors">
                      Facebook
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. "Internship Program Benefits" */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
              <h3 className="text-base font-bold text-[#0F172A] mb-4 pb-3 border-b border-slate-100">
                Internship Program Benefits
              </h3>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <span>Direct mentorship by Senior Tech Leads & Engineering Managers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <span>Opportunity for full-time conversion (PPO) post-graduation.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <span>Bi-weekly tech workshops, cloud certifications & hackathon access.</span>
                </li>
              </ul>
            </div>

            {/* 3. Interactive Location Map Snippet */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Campus Location</span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(company.location || company.name + " Dhaka")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Get directions ↗
                </a>
              </div>

              <div className="w-full h-32 rounded-2xl overflow-hidden relative border border-slate-200 bg-[#E2E8F0]">
                {/* SVG Map */}
                <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                  <rect width="300" height="120" fill="#F1F5F9" />
                  <line x1="0" y1="20" x2="300" y2="35" stroke="#CBD5E1" strokeWidth="6" />
                  <line x1="0" y1="85" x2="300" y2="75" stroke="#CBD5E1" strokeWidth="8" />
                  <line x1="60" y1="0" x2="90" y2="120" stroke="#CBD5E1" strokeWidth="6" />
                  <line x1="220" y1="0" x2="190" y2="120" stroke="#CBD5E1" strokeWidth="7" />
                  <path d="M 0 0 L 70 0 L 50 35 L 0 25 Z" fill="#E0F2FE" />
                  <rect x="180" y="8" width="80" height="30" rx="6" fill="#DCFCE7" />
                  {/* Pin */}
                  <circle cx="150" cy="60" r="14" fill="rgba(99, 102, 241, 0.2)" className="animate-ping" />
                  <circle cx="150" cy="60" r="8" fill="#4F46E5" />
                  <circle cx="150" cy="60" r="3" fill="#FFFFFF" />
                </svg>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-xs text-[10px] font-bold text-slate-800 shadow-xs border border-slate-200">
                  📍 {company.location || "Dhaka, Bangladesh"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
