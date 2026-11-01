import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import {
  getMyCompanyInternships,
  getAllCompanyApplicants,
  type ApiCompanyInternship,
  type ApiCompanyApplicantItem,
  getSavedUser,
} from "../../api/client";

interface Props {
  navigate: Navigate;
}

export default function CoDashboardPage({ navigate }: Props) {
  const user = getSavedUser();
  const companyName = user?.name || "bKash Limited";

  const [internships, setInternships] = useState<ApiCompanyInternship[]>([]);
  const [applicants, setApplicants] = useState<ApiCompanyApplicantItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMyCompanyInternships().catch(() => ({ count: 0, internships: [] })),
      getAllCompanyApplicants().catch(() => ({ totalApplicants: 0, applicants: [] })),
    ])
      .then(([internshipsRes, applicantsRes]) => {
        setInternships(internshipsRes.internships || []);
        setApplicants(applicantsRes.applicants || []);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Real-time calculated metrics
  const activeCount = internships.filter((i) => i.status === "active").length;
  const totalCandidateCount = applicants.length;
  const shortlistedCount = applicants.filter((a) => a.status === "Shortlisted").length;
  const interviewingCount = applicants.filter((a) => a.status === "Interviewing").length;
  const pendingCount = applicants.filter((a) => a.status === "Applied").length;

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-7xl mx-auto space-y-8">
      {/* 1. Header & Live Date Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {companyName} Workspace
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 flex items-center gap-2">
            <span className="font-semibold text-slate-700">Sunday, Nov 1, 2026</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Recruiting Portal active
            </span>
          </p>
        </div>

        <button
          onClick={() => navigate("co-internships")}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-orange-500/20 transition-all self-start sm:self-auto flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>+ Post New Internship</span>
        </button>
      </div>

      {/* 2. Real-Time Recruiting Metrics Bento (4-Card Matrix) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Internships */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Internships</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{activeCount}</p>
          <p className="text-xs text-indigo-600 font-medium mt-1">
            {activeCount} {activeCount === 1 ? "role" : "roles"} accepting applications
          </p>
        </div>

        {/* Card 2: Total Candidates */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Candidates</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-2xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{totalCandidateCount}</p>
          <p className="text-xs text-sky-600 font-medium mt-1">
            {pendingCount} pending initial screening
          </p>
        </div>

        {/* Card 3: Shortlisted */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shortlisted</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <polyline points="16 11 18 13 22 9"/>
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{shortlistedCount}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {shortlistedCount} ready for interview scheduling
          </p>
        </div>

        {/* Card 4: In Interview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Interview</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{interviewingCount}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">
            {interviewingCount} {interviewingCount === 1 ? "interview" : "interviews"} in progress
          </p>
        </div>
      </div>

      {/* 3. Split Two-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Postings (55% width -> 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Active Internships
            </h2>
            <button
              onClick={() => navigate("co-internships")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Manage all ({internships.length}) →
            </button>
          </div>

          <div className="space-y-4">
            {internships.length > 0 ? (
              internships.map((internship) => {
                const total = internship.totalApplicants ?? 0;
                const shortlisted = internship.shortlisted ?? 0;
                const interviewing = internship.interviewing ?? 0;
                const deadlineFormatted = internship.deadline
                  ? new Date(internship.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "May 20, 2027";

                return (
                  <div
                    key={internship._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {internship.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {internship.mode || "On-site"}
                          </span>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                            {internship.type === "Paid" ? "Paid (BDT 20,000/mo)" : "Unpaid"}
                          </span>
                          <span className="text-xs text-slate-400">
                            Deadline: {deadlineFormatted}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate("co-applicants", { internshipId: internship._id })}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors shadow-2xs self-start ${
                          total > 0
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                            : "border border-slate-300 hover:border-slate-400 text-slate-700"
                        }`}
                      >
                        View applicants ({total})
                      </button>
                    </div>

                    {/* Mini Pipeline Breakdown */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {total} {total === 1 ? "Applicant" : "Applicants"}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px]">
                          {shortlisted} Shortlisted
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px]">
                          {interviewing} Interviewing
                        </span>
                      </div>
                      <button
                        onClick={() => navigate("co-internships")}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Edit / Manage
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl">
                  📋
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No Active Internships Posted</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your organization does not currently have any live internship roles. Create your first listing to attract student talent.
                </p>
                <button
                  onClick={() => navigate("co-internships")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  + Post New Internship
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Candidate Stream (45% width -> 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Recent Applicants
            </h2>
            <button
              onClick={() => navigate("co-applicants")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View all ({applicants.length}) →
            </button>
          </div>

          {applicants.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {applicants.slice(0, 6).map((app, idx) => {
                const sName = app.student?.name || "Applicant";
                const sBadge = app.student?.badge || "Explorer";
                const sPoints = app.student?.points ?? 100;
                const roleName = app.internship?.title || "Internship Role";
                const appliedDateStr = app.appliedDate
                  ? new Date(app.appliedDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently";

                // Photo resolution
                let photoSrc = "";
                const lower = sName.toLowerCase();
                if (lower.includes("eva")) photoSrc = "/team_eva.jpg";
                else if (lower.includes("nafis")) photoSrc = "/team_nafis.jpg";
                else if (lower.includes("fuad")) photoSrc = "/team_fuad.jpg";
                else if (lower.includes("tahmid")) photoSrc = "/team_tahmid.jpg";

                const initials = sName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                let statusBadge = (
                  <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    ⚪ Applied
                  </span>
                );
                if (app.status === "Shortlisted") {
                  statusBadge = (
                    <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      🔵 Shortlisted
                    </span>
                  );
                } else if (app.status === "Interviewing") {
                  statusBadge = (
                    <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      🟡 Interviewing
                    </span>
                  );
                } else if (app.status === "Rejected") {
                  statusBadge = (
                    <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      🔴 Rejected
                    </span>
                  );
                }

                const tierIcon = sBadge === "Elite" ? "🏆" : sBadge === "Explorer" ? "🔭" : "🌱";

                return (
                  <div
                    key={app.applicationId || `cand-${idx}`}
                    onClick={() => navigate("co-applicants")}
                    className="p-4 hover:bg-indigo-50/30 transition-colors cursor-pointer flex items-center gap-3.5"
                  >
                    <div className="w-11 h-11 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs shrink-0 bg-slate-100 flex items-center justify-center">
                      {photoSrc ? (
                        <img
                          src={photoSrc}
                          alt={sName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                          {initials}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                          {sName}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          {tierIcon} {sBadge} ({sPoints} pts)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                        Applied for: <span className="text-slate-800">{roleName}</span> · {appliedDateStr}
                      </p>
                    </div>

                    {statusBadge}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto text-xl">
                👥
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No Recent Applicants</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When university students apply to your open roles, their profiles, resumes, and skill tags will stream here in real time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Quick Actions Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Post New Internship (Indigo Gradient) */}
        <div
          onClick={() => navigate("co-internships")}
          className="rounded-2xl p-6 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-lg mb-3">
              ➕
            </div>
            <h3 className="font-extrabold text-base text-white group-hover:text-amber-300 transition-colors">
              + Post New Internship
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Reach hundreds of qualified university students across Bangladesh with structured job listings.
            </p>
          </div>
          <span className="text-xs font-bold text-orange-400 mt-4 flex items-center gap-1">
            Create listing now →
          </span>
        </div>

        {/* Card 2: Review Pending Applicants */}
        <div
          onClick={() => navigate("co-applicants")}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center text-lg mb-3">
              📋
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
              Review Pending Applicants ({pendingCount})
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Review student CVs, shortlist candidates, or trigger interview invites directly.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 mt-4 flex items-center gap-1">
            Open candidate manager →
          </span>
        </div>

        {/* Card 3: Edit Public Company Profile */}
        <div
          onClick={() => navigate("co-profile")}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-lg mb-3">
              🏢
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
              Edit Public Company Profile
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Manage public cover photos, tech stack, culture details, and perks for student viewers.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 mt-4 flex items-center gap-1">
            Update company branding →
          </span>
        </div>
      </div>
    </div>
  );
}
