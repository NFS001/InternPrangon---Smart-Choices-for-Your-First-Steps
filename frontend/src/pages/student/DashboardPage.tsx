import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import { CompanyLogo } from "../../components/common/CompanyLogos";
import {
  getSavedUser,
  getStudentProfile,
  getMyResume,
  getMyBookmarks,
  getMyApplications,
  getMyNotifications,
  type ApiUser,
  type ApiApplicationItem,
  type ApiNotificationItem
} from "../../api/client";
import DocumentPreviewModal from "../../components/common/DocumentPreviewModal";
import { formatResumeFilename } from "../../utils/formatDocument";

interface Props {
  navigate: Navigate;
  currentUser?: ApiUser | null;
}

export default function DashboardPage({ navigate, currentUser }: Props) {
  const user = currentUser ?? getSavedUser();
  const displayName = user?.name || "Nafis Uddin Chowdhury";
  const firstName = displayName.trim().split(" ")[0] || "Nafis";

  const [points, setPoints] = useState(25);
  const [badge, setBadge] = useState("Newbie");
  const [savedCount, setSavedCount] = useState(1);
  const [applications, setApplications] = useState<ApiApplicationItem[]>([]);
  const [notifications, setNotifications] = useState<ApiNotificationItem[]>([]);
  const [resumeFilename, setResumeFilename] = useState("Nafis_Uddin_Chowdhury_Resume.pdf");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    getStudentProfile()
      .then((res) => {
        if (res.profile) {
          setPoints(res.profile.points ?? 25);
          setBadge(res.profile.badge ?? "Newbie");
        }
      })
      .catch(() => {});

    getMyResume()
      .then((res) => {
        if (res.resume && res.resume.filePath) {
          const fn = formatResumeFilename(res.resume.filePath, res.resume.originalName);
          setResumeFilename(fn);
        }
      })
      .catch(() => {});

    getMyBookmarks()
      .then((res) => {
        if (res.bookmarks && res.bookmarks.length > 0) {
          setSavedCount(res.bookmarks.length);
        }
      })
      .catch(() => {});

    getMyApplications()
      .then((res) => {
        if (res.applications && res.applications.length > 0) {
          setApplications(res.applications);
        }
      })
      .catch(() => {});

    getMyNotifications()
      .then((res) => {
        if (res.notifications && res.notifications.length > 0) {
          setNotifications(res.notifications);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-7xl mx-auto space-y-8">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-slate-500 text-sm lg:text-base mt-1">
            You have <span className="font-semibold text-indigo-600">1 active interview scheduled</span> and <span className="font-semibold text-slate-700">2 applications under review</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("internships")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all"
          >
            <span>+ Browse Openings</span>
          </button>
        </div>
      </div>

      {/* 2. Profile Strength Celebration Banner (Glassmorphic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 p-6 md:p-8 text-white shadow-lg border border-indigo-500/20">
        {/* Ambient background glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Circular SVG Progress Gauge */}
          <div className="flex items-center gap-5 w-full lg:w-auto">
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-indigo-950/60"
                  fill="none"
                />
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="5.5"
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                  fill="none"
                  strokeDasharray="188.5"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-bold text-emerald-300">100%</span>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-1">
                <span>Verified Candidate</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Profile 100% Complete & Verified
              </h2>
              <p className="text-slate-300 text-sm mt-0.5 max-w-xl">
                Your profile has high visibility among top recruiters. 1-Click apply is active.
              </p>
            </div>
          </div>

          {/* Right: Action Pills */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            <button
              onClick={() => navigate("profile")}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs md:text-sm rounded-xl border border-white/15 backdrop-blur-sm transition-all"
            >
              Update Skills
            </button>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/60 hover:bg-indigo-600 text-white font-medium text-xs md:text-sm rounded-xl border border-indigo-400/40 backdrop-blur-sm transition-all shadow-sm"
              title="Click to preview verified resume"
            >
              <span>📄</span>
              <span className="truncate max-w-[180px]">{resumeFilename}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bento Grid (3-Column Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1: "Recommended For You" */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Recommended For You
              </h2>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Top Match</span>
            </div>

            <div className="space-y-3.5">
              {/* Card 1: Brain Station 23 */}
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-100 transition-all group">
                <div className="flex items-start gap-3">
                  <CompanyLogo name="Brain Station 23" size={42} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                      Frontend React Engineer Intern
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Brain Station 23 · Gulshan, Dhaka</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        BDT 25,000/mo
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        Hybrid
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">98% Skills Match</span>
                  <button
                    onClick={() => navigate("internship-detail", { id: 1 })}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    1-Click Apply →
                  </button>
                </div>
              </div>

              {/* Card 2: Chaldal */}
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-100 transition-all group">
                <div className="flex items-start gap-3">
                  <CompanyLogo name="Chaldal" size={42} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm truncate group-hover:text-emerald-600 transition-colors">
                      Backend Engineering Intern (C# / .NET)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Chaldal · Tejgaon, Dhaka</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        BDT 18,000/mo
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        On-site
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">95% Match · C#, .NET</span>
                  <button
                    onClick={() => navigate("internship-detail", { id: 2 })}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    1-Click Apply →
                  </button>
                </div>
              </div>

              {/* Card 3: ShopUp */}
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-purple-50/30 hover:border-purple-100 transition-all group">
                <div className="flex items-start gap-3">
                  <CompanyLogo name="ShopUp" size={42} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm truncate group-hover:text-purple-600 transition-colors">
                      Operations & Supply Chain Intern
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">ShopUp · Mohakhali, Dhaka</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        BDT 15,000/mo
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        On-site
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Fast Decision Track</span>
                  <button
                    onClick={() => navigate("internship-detail", { id: 3 })}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    1-Click Apply →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("internships")}
            className="mt-4 pt-3 border-t border-slate-100 w-full text-xs font-semibold text-indigo-600 hover:text-indigo-800 text-center flex items-center justify-center gap-1"
          >
            Browse all openings (48+) →
          </button>
        </div>

        {/* Column 2: "Live Application Pipeline" */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Live Application Pipeline
              </h2>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">3 Active</span>
            </div>

            <div className="space-y-3.5">
              {/* Pipeline 1: Chaldal (Interviewing) */}
              <div className="p-3.5 rounded-xl border border-amber-200/70 bg-amber-50/20 hover:bg-amber-50/40 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <CompanyLogo name="Chaldal" size={36} />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 text-xs truncate">
                        Backend Engineering Intern
                      </h3>
                      <p className="text-[11px] text-slate-500">Chaldal · C# / .NET</p>
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Interviewing
                  </span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-amber-900">📅 Tech Interview · Oct 12, 3:30 PM</span>
                  <button
                    onClick={() => navigate("applications")}
                    className="font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View →
                  </button>
                </div>
              </div>

              {/* Pipeline 2: ShopUp (Shortlisted) */}
              <div className="p-3.5 rounded-xl border border-indigo-200/70 bg-indigo-50/20 hover:bg-indigo-50/40 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <CompanyLogo name="ShopUp" size={36} />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 text-xs truncate">
                        Operations & Supply Chain Intern
                      </h3>
                      <p className="text-[11px] text-slate-500">ShopUp · Supply Logistics</p>
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    Shortlisted
                  </span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-indigo-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Reviewed by Hiring Manager</span>
                  <button
                    onClick={() => navigate("applications")}
                    className="font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View →
                  </button>
                </div>
              </div>

              {/* Pipeline 3: Pathao (Applied) */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-100/50 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <CompanyLogo name="Pathao" size={36} />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 text-xs truncate">
                        Data Analyst Intern
                      </h3>
                      <p className="text-[11px] text-slate-500">Pathao · BI & Analytics</p>
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Applied
                  </span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Applied Sep 7, 2026</span>
                  <button
                    onClick={() => navigate("applications")}
                    className="font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("applications")}
            className="mt-4 pt-3 border-t border-slate-100 w-full text-xs font-semibold text-indigo-600 hover:text-indigo-800 text-center flex items-center justify-center gap-1"
          >
            Track full application timeline →
          </button>
        </div>

        {/* Column 3: "Metrics & Activity" */}
        <div className="space-y-6">
          {/* 2x2 Stat Matrix */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Performance & Metrics
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50/70 border border-indigo-100/80 rounded-xl p-3.5">
                <p className="text-2xl font-black text-indigo-700 tracking-tight">{points}</p>
                <p className="text-xs font-semibold text-indigo-900 mt-0.5">Contributor Pts</p>
                <p className="text-[10px] text-indigo-500">🌱 Newbie Tier</p>
              </div>

              <div className="bg-amber-50/70 border border-amber-100/80 rounded-xl p-3.5">
                <p className="text-2xl font-black text-amber-700 tracking-tight">3</p>
                <p className="text-xs font-semibold text-amber-900 mt-0.5">Active Roles</p>
                <p className="text-[10px] text-amber-600">1 Interview scheduled</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5">
                <p className="text-2xl font-black text-slate-800 tracking-tight">{savedCount}</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">Saved Role</p>
                <p className="text-[10px] text-slate-400">Brain Station 23</p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-xl p-3.5">
                <p className="text-2xl font-black text-emerald-700 tracking-tight">100%</p>
                <p className="text-xs font-semibold text-emerald-900 mt-0.5">Profile Score</p>
                <p className="text-[10px] text-emerald-600">Verified student</p>
              </div>
            </div>
          </div>

          {/* Recent Notification Stream */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recent Alerts
              </h2>
              <button
                onClick={() => navigate("notifications")}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-semibold leading-tight">
                    Chaldal scheduled Technical Interview
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Today at 10:38 PM · Google Meet</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 leading-tight">
                    ShopUp moved your status to <strong className="text-indigo-600">Shortlisted</strong>
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Sep 7, 02:37 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 leading-tight">
                    Earned <strong className="text-emerald-600">+25 points</strong> for Profile Completion
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Sep 7, 11:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Gamification Strip */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 text-white shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                  Current Tier: Newbie (25 / 100 pts)
                </p>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  75 points away from unlocking <span className="text-amber-400">Explorer Tier 🔭</span>
                </h3>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-orange-500 transition-all duration-700"
                style={{ width: "25%" }}
              />
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Next Tier Perks: <span className="text-slate-200 font-medium">Early 24h listing notifications, verified review highlight, and direct recruiter visibility.</span>
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => navigate("contributors")}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
            >
              Leaderboard
            </button>
            <button
              onClick={() => navigate("write-review")}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Earn Points (+30 pts)</span>
              <span>↗</span>
            </button>
          </div>
        </div>
      </div>

      {/* In-App Glassmorphic Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        documentUrl="/sample_resume.pdf"
        documentTitle={resumeFilename}
      />
    </div>
  );
}
