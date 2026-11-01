import React, { useState, useEffect } from "react";
import type { Navigate } from "../data/index";
import { INTERNSHIPS, COMPANIES } from "../data/index";
import { CompanyLogo } from "../components/common/CompanyLogos";
import {
  getMyBookmarks,
  addBookmark,
  removeBookmark,
  applyToInternship,
  getMyApplications,
  searchInternships,
  getInternshipById,
  getSavedUser,
} from "../api/client";

interface Props {
  navigate: Navigate;
  id?: number | string;
  backendId?: string;
  internshipData?: any;
}

const PERKS = [
  {
    icon: "🎓",
    title: "Mentorship from Senior Leaders",
    desc: "1-on-1 weekly guidance from principal architects and engineering directors.",
    bg: "bg-blue-50/80 border-blue-100",
  },
  {
    icon: "💻",
    title: "Live Production System Experience",
    desc: "Deploy code directly to production clusters serving thousands of active users.",
    bg: "bg-purple-50/80 border-purple-100",
  },
  {
    icon: "📜",
    title: "University-Recognized Certificate",
    desc: "Official BRAC and accredited university internship credits and recommendation.",
    bg: "bg-emerald-50/80 border-emerald-100",
  },
  {
    icon: "⏰",
    title: "Flexible Hours & Hybrid Fridays",
    desc: "Work in harmony with your class schedules, exams, and project submissions.",
    bg: "bg-orange-50/80 border-orange-100",
  },
];

export default function InternshipDetailPage({
  navigate,
  id,
  backendId: initialBackendId,
  internshipData,
}: Props) {
  const getInitialIntern = () => {
    if (internshipData) {
      const compName = internshipData.company || "ShopUp";
      return {
        id: internshipData.id || id || 1,
        backendId: internshipData.backendId || internshipData._id || initialBackendId,
        role: internshipData.role || internshipData.title || "Operations & Supply Chain Intern",
        company: compName,
        companyId: internshipData.companyId || internshipData.companyProfileId || 1,
        location: internshipData.location || "Tejgaon I/A, Dhaka",
        type: (internshipData.type || internshipData.mode || "On-site") as "Remote" | "On-site" | "Hybrid",
        paid: typeof internshipData.paid === "boolean" ? internshipData.paid : internshipData.type === "Paid",
        stipend: internshipData.stipend || (internshipData.type === "Paid" ? "BDT 15,000 / month" : "BDT 18,000 / month"),
        duration: internshipData.duration || "3 Months",
        deadline: internshipData.deadline || "April 18, 2027",
        daysLeft: typeof internshipData.daysLeft === "number" ? internshipData.daysLeft : 18,
        tags: internshipData.tags || ["Logistics", "Operations", "Analytics", "ERP"],
        description:
          internshipData.description ||
          "Join the high-velocity core operations team at ShopUp. You will work side-by-side with operations directors, supply chain analysts, and software engineers to optimize warehousing workflows, reduce delivery turnaround times, and solve real-world distribution challenges across Bangladesh.",
        responsibilities: [
          "Analyze fulfillment center dispatch timings, warehouse stock tracking, and supplier coordination workflows.",
          "Coordinate directly with logistics fleet captains to improve on-time delivery rates across major Dhaka delivery hubs.",
          "Collect ground-level operational data and present weekly performance insights to the executive leadership team.",
          "Partner with product engineering to test and roll out new mobile dispatch and inventory scanning applications.",
        ],
        qualifications: [
          "Currently enrolled in or recent graduate of BBA, Supply Chain, Industrial Engineering, or Computer Science.",
          "Proficiency in Microsoft Excel, Google Sheets, and foundational data visualization.",
          "Strong communication, analytical thinking, and eagerness to learn in a high-growth tech environment.",
          "Available for a minimum of 3 to 6 months full-time or part-time internship engagement.",
        ],
      };
    }
    const matched = INTERNSHIPS.find((i) => String(i.id) === String(id)) ?? INTERNSHIPS[0];
    return {
      ...matched,
      stipend: matched.stipend || (matched.paid ? "BDT 18,000 / month" : "Unpaid"),
      responsibilities: [
        "Collaborate with cross-functional product, design, and engineering teams on production features.",
        "Take ownership of critical daily deliverables with direct guidance from an experienced team mentor.",
        "Participate in daily agile standups, architecture discussions, and retrospective workshops.",
      ],
      qualifications: [
        "Enrolled in or completed an accredited undergraduate or graduate program.",
        "Demonstrated project portfolio or strong foundational coursework in the relevant domain.",
        "Curious, proactive mindset with passion for collaborative problem-solving.",
      ],
    };
  };

  const [intern, setIntern] = useState(getInitialIntern);
  const [resolvedBackendId, setResolvedBackendId] = useState<string | undefined>(
    initialBackendId || internshipData?.backendId || internshipData?._id
  );
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
    action?: () => void;
    actionLabel?: string;
  } | null>(null);

  // Match company profile for the right column snapshot
  const matchedCompany =
    COMPANIES.find(
      (c) =>
        c.id === intern.companyId ||
        c.name.toLowerCase() === intern.company.toLowerCase()
    ) || {
      name: intern.company,
      industry: "B2B Commerce & Logistics",
      employees: "500+ employees",
      founded: "2016",
      bio: "ShopUp is Bangladesh's leading full-stack B2B commerce platform, empowering micro-retailers with digital supply chain, logistics, and embedded finance.",
      openingsCount: 14,
    };

  // Sync state when props change
  useEffect(() => {
    setIntern(getInitialIntern());
    setResolvedBackendId(initialBackendId || internshipData?.backendId || internshipData?._id);
    setSaved(false);
    setApplied(false);
    setNotice(null);
  }, [id, initialBackendId, internshipData]);

  // Fetch live internship details if backend ID is valid
  useEffect(() => {
    const targetId = initialBackendId || internshipData?.backendId || internshipData?._id;
    if (targetId && typeof targetId === "string" && targetId.length === 24) {
      getInternshipById(targetId)
        .then((res) => {
          if (res.internship) {
            const fetched = res.internship;
            setResolvedBackendId(fetched._id);
            setIntern((prev) => ({
              ...prev,
              backendId: fetched._id,
              role: fetched.title || prev.role,
              company: (fetched as any).company || prev.company,
              companyId: (fetched as any).companyProfileId || prev.companyId,
              description: fetched.description || prev.description,
              type: (fetched.mode as "Remote" | "On-site" | "Hybrid") || prev.type,
              paid: fetched.type === "Paid",
              stipend: (fetched as any).stipend || (fetched.type === "Paid" ? "BDT 15,000 / month" : undefined),
              deadline: new Date(fetched.deadline).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }));
          }
        })
        .catch(() => {});
    }
  }, [id, initialBackendId, internshipData]);

  // Sync bookmarks and applications
  useEffect(() => {
    if (!resolvedBackendId) return;

    getMyBookmarks()
      .then((res) => {
        const isBookmarked = res.bookmarks?.some(
          (b) => b.internship?._id === resolvedBackendId
        );
        if (isBookmarked) setSaved(true);
      })
      .catch(() => {});

    getMyApplications()
      .then((res) => {
        const isApplied = res.applications?.some(
          (a) =>
            (typeof a.internship === "object" ? a.internship?._id : a.internship) ===
            resolvedBackendId
        );
        if (isApplied) setApplied(true);
      })
      .catch(() => {});
  }, [resolvedBackendId]);

  const handleToggleSave = async () => {
    const user = getSavedUser();
    if (!user) {
      setNotice({
        type: "error",
        message: "Please log in to save internships to your profile.",
        action: () => navigate("login"),
        actionLabel: "Log in",
      });
      return;
    }

    if (!resolvedBackendId) {
      setSaved((prev) => !prev);
      return;
    }

    try {
      if (saved) {
        setSaved(false);
        await removeBookmark(resolvedBackendId);
      } else {
        setSaved(true);
        await addBookmark(resolvedBackendId);
      }
    } catch {
      setSaved((prev) => !prev);
    }
  };

  const handleApply = async () => {
    const user = getSavedUser();
    if (!user) {
      setNotice({
        type: "error",
        message: "Please log in with your student account to apply in one click.",
        action: () => navigate("login"),
        actionLabel: "Log in",
      });
      return;
    }

    if (!resolvedBackendId) {
      setApplied(true);
      setNotice({
        type: "success",
        message: "Application submitted successfully! You can track its progress in Applications.",
        action: () => navigate("applications"),
        actionLabel: "View Applications",
      });
      return;
    }

    setApplying(true);
    setNotice(null);

    try {
      await applyToInternship(resolvedBackendId);
      setApplied(true);
      setNotice({
        type: "success",
        message: "Application submitted successfully with your verified InternPrangon profile!",
        action: () => navigate("applications"),
        actionLabel: "Track Application",
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to apply.";
      if (errMsg.toLowerCase().includes("resume")) {
        setNotice({
          type: "error",
          message: "Please upload your resume in your student profile before applying.",
          action: () => navigate("profile"),
          actionLabel: "Upload Resume in Profile",
        });
      } else if (errMsg.toLowerCase().includes("already applied")) {
        setApplied(true);
        setNotice({
          type: "success",
          message: "You have already applied for this role! Track it under My Applications.",
          action: () => navigate("applications"),
          actionLabel: "View Applications",
        });
      } else {
        setNotice({
          type: "error",
          message: errMsg,
        });
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-24 font-sans selection:bg-indigo-500 selection:text-white">
      {/* ── Background Aura Glows ── */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-indigo-500/6 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-96 right-1/4 w-[500px] h-[350px] bg-orange-500/6 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* ═══════════════════════════════════════════════════════════════
          TOP BREADCRUMB & BACK NAVIGATION
          ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500">
          <button
            onClick={() => navigate("internships")}
            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer py-1 -ml-1 px-1 rounded-lg hover:bg-indigo-50/60"
          >
            <span>&larr;</span>
            <span>Back to all internships</span>
          </button>

          <div className="flex items-center gap-2 text-slate-400">
            <button onClick={() => navigate("home")} className="hover:text-slate-700 cursor-pointer">Home</button>
            <span>/</span>
            <button onClick={() => navigate("internships")} className="hover:text-slate-700 cursor-pointer">Internships</button>
            <span>/</span>
            <span className="text-slate-700 font-bold truncate max-w-[200px] sm:max-w-xs">{intern.role}</span>
          </div>
        </div>

        {/* Global Alert Notification Banner */}
        {notice && (
          <div
            className={`mt-4 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border ${
              notice.type === "success"
                ? "bg-emerald-50/90 text-emerald-800 border-emerald-200"
                : "bg-rose-50/90 text-rose-800 border-rose-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl shrink-0">{notice.type === "success" ? "✓" : "⚠️"}</span>
              <p className="text-xs sm:text-sm font-semibold">{notice.message}</p>
            </div>
            {notice.action && notice.actionLabel && (
              <button
                onClick={notice.action}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  notice.type === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    : "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                }`}
              >
                {notice.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TWO-COLUMN DESKTOP WORKSPACE (65% Left, 35% Right)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 items-start">
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN (65% width) - Role Details & Workplace Imagery
              ───────────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-8 min-w-0">
            {/* 1. Role Hero Header Card with Photographic Cover Banner */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              {/* 16:9 Rounded Photographic Top Banner */}
              <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-slate-900">
                <img
                  src="/workplace_office_banner.jpg"
                  alt={`${intern.company} modern collaborative tech operations hub`}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                  🏢 Tech Operations Hub
                </span>
              </div>

              {/* Overlapping Company Profile Card */}
              <div className="p-6 sm:p-8 pt-0 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-6">
                  {/* Real Verified Company Logo in Crisp White Box */}
                  <div className="w-24 h-24 rounded-2xl bg-white p-2.5 shadow-xl border border-slate-100 flex items-center justify-center shrink-0">
                    <CompanyLogo name={intern.company} size={72} />
                  </div>

                  {/* Verification Badge */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Verified Employer
                    </span>
                  </div>
                </div>

                {/* Role Title & Metadata */}
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight">
                    {intern.role}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-600 font-medium">
                    <span className="text-indigo-600 font-bold hover:underline cursor-pointer">
                      {intern.company}
                    </span>
                    <span>•</span>
                    <span>{intern.location}</span>
                    <span>•</span>
                    <span className="text-slate-800 font-semibold">{intern.type}</span>
                  </div>

                  {/* Key Badges Strip */}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Paid
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-100">
                      {intern.type}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      Internship
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                      Posted 2 days ago
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. "About this internship" */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold text-[#0F172A] mb-4">About this internship</h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {intern.description}
              </p>
            </div>

            {/* 3. "Key Responsibilities" & "Requirements" with Custom Styled Checkmarks */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col gap-8">
              {/* Key Responsibilities */}
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] mb-4">Key Responsibilities</h2>
                <ul className="space-y-3">
                  {intern.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-xs">
                        ✓
                      </div>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="pt-6 border-t border-slate-100">
                <h2 className="text-xl font-bold text-[#0F172A] mb-4">Requirements & Qualifications</h2>
                <ul className="space-y-3">
                  {intern.qualifications.map((qual, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-xs">
                        ✓
                      </div>
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. "What We Offer" (Perks & Culture Bento) */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="mb-6">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Growth & Support</span>
                <h2 className="text-xl font-bold text-[#0F172A] mt-1">What We Offer</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Internships at {intern.company} are designed for rapid personal progression and verified career impact.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PERKS.map((perk) => (
                  <div
                    key={perk.title}
                    className={`rounded-2xl p-5 border ${perk.bg} flex flex-col justify-between transition-all hover:shadow-xs`}
                  >
                    <span className="text-2xl mb-3">{perk.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{perk.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{perk.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. NEW "Life at the Workplace" Photo Grid */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="mb-6">
                <span className="text-xs font-bold text-[#F97316] uppercase tracking-widest">Culture & Community</span>
                <h2 className="text-xl font-bold text-[#0F172A] mt-1">Life at the Workplace</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Experience real-world impact inside Bangladesh's top B2B supply chain ecosystem.
                </p>
              </div>

              {/* 3-Photo Bento Mosaic Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo 1 (Wide): Open-plan engineering & operations floor */}
                <div className="sm:col-span-2 rounded-2xl overflow-hidden relative group aspect-[21/9] bg-slate-900 shadow-xs">
                  <img
                    src="/workplace_office_banner.jpg"
                    alt="Open-plan engineering and operations floor with dual monitors"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                    <p className="text-xs font-semibold text-white drop-shadow">
                      Open-plan operations floor with dual monitors & natural sunlight
                    </p>
                  </div>
                </div>

                {/* Photo 2 (Square): Team collaborating over coffee */}
                <div className="rounded-2xl overflow-hidden relative group aspect-square bg-slate-900 shadow-xs">
                  <img
                    src="/office_team_coffee.jpg"
                    alt="Team collaborating over coffee in the office lounge"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                    <p className="text-xs font-semibold text-white drop-shadow">
                      Coffee break & team bonding in the lounge
                    </p>
                  </div>
                </div>

                {/* Photo 3 (Square): Whiteboard brainstorming session */}
                <div className="rounded-2xl overflow-hidden relative group aspect-square bg-slate-900 shadow-xs">
                  <img
                    src="/office_whiteboard_sprint.jpg"
                    alt="Whiteboard brainstorming session during sprint planning"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                    <p className="text-xs font-semibold text-white drop-shadow">
                      Architecture & agile sprint planning whiteboard session
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN (35% width) - Sticky Apply & Company Snapshot
              ───────────────────────────────────────────────────────────── */}
          <div className="sticky top-20 flex flex-col gap-6">
            {/* 1. Sticky Application Action Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              {/* Application Status Radar Dot */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Application Window
                </span>
                <span className="text-xs font-semibold text-slate-400">⚡ Fast Review</span>
              </div>

              {/* Key Specs Grid */}
              <div className="space-y-3.5 mb-6">
                {/* Compensation Pill */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                  <span className="text-xs font-semibold text-emerald-800">Monthly Compensation</span>
                  <span className="text-sm font-black text-emerald-700">{intern.stipend}</span>
                </div>

                {/* Duration */}
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 px-1">
                  <span>Duration:</span>
                  <span className="font-bold text-slate-900">{intern.duration}</span>
                </div>

                {/* Work Mode */}
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 px-1">
                  <span>Work Mode:</span>
                  <span className="font-bold text-slate-900">{intern.type} ({intern.location})</span>
                </div>

                {/* Deadline */}
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 px-1">
                  <span>Application Deadline:</span>
                  <span className="font-bold text-slate-900">{intern.deadline}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleApply}
                  disabled={applying || applied}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                    applied
                      ? "bg-emerald-600 text-white shadow-emerald-500/20"
                      : "bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white shadow-indigo-500/25 hover:shadow-indigo-500/35 active:scale-[0.99]"
                  }`}
                >
                  {applying ? (
                    <span>Submitting Application...</span>
                  ) : applied ? (
                    <span>✓ Application Submitted</span>
                  ) : (
                    <span>Apply Now (1-Click with Profile)</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleToggleSave}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    saved
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{saved ? "Saved to Bookmarks" : "Save for Later"}</span>
                </button>
              </div>

              {/* Micro-copy */}
              <p className="text-[11px] text-slate-400 text-center mt-4">
                Average recruiter response time: <span className="font-bold text-slate-600">3 business days</span>.
              </p>
            </div>

            {/* 2. "About Employer" Card & Mini Map Preview */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-6 shadow-xs">
              {/* Header with Company Logo & Name */}
              <div className="flex items-center gap-3.5 mb-4">
                <CompanyLogo name={intern.company} size={46} />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{matchedCompany.name}</h3>
                  <p className="text-xs text-slate-500">{matchedCompany.industry}</p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {matchedCompany.bio}
              </p>

              {/* Metadata Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Company Size</span>
                  <span className="font-bold text-slate-800">{matchedCompany.employees}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Founded</span>
                  <span className="font-bold text-slate-800">{matchedCompany.founded}</span>
                </div>
              </div>

              {/* Mini Map Preview */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Office Location</span>
                <div className="w-full h-28 rounded-2xl overflow-hidden relative border border-slate-200 bg-[#E2E8F0]">
                  {/* Clean SVG Visual Map Snippet */}
                  <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                    {/* Map Grid Roads */}
                    <rect width="300" height="120" fill="#F1F5F9" />
                    <line x1="0" y1="30" x2="300" y2="40" stroke="#CBD5E1" strokeWidth="6" />
                    <line x1="0" y1="80" x2="300" y2="70" stroke="#CBD5E1" strokeWidth="8" />
                    <line x1="80" y1="0" x2="100" y2="120" stroke="#CBD5E1" strokeWidth="6" />
                    <line x1="200" y1="0" x2="180" y2="120" stroke="#CBD5E1" strokeWidth="7" />
                    <line x1="140" y1="20" x2="260" y2="110" stroke="#E2E8F0" strokeWidth="4" />
                    {/* Water / Greenery Patch */}
                    <path d="M 0 0 L 60 0 L 40 40 L 0 30 Z" fill="#E0F2FE" />
                    <rect x="220" y="10" width="70" height="30" rx="6" fill="#DCFCE7" />
                    {/* Location Pin with Pulse */}
                    <circle cx="150" cy="55" r="14" fill="rgba(99, 102, 241, 0.2)" className="animate-ping" />
                    <circle cx="150" cy="55" r="8" fill="#4F46E5" />
                    <circle cx="150" cy="55" r="3" fill="#FFFFFF" />
                  </svg>
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 shadow-xs border border-slate-200">
                    📍 Tejgaon Industrial Area, Dhaka
                  </div>
                </div>
              </div>

              {/* View Company Profile Link */}
              <button
                onClick={() => navigate("company-detail", { id: intern.companyId })}
                className="w-full py-2.5 text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>View company profile & {matchedCompany.openingsCount || 14} other openings</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
