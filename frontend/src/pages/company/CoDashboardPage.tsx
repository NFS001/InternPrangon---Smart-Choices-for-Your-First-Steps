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

const statusColors: Record<string, string> = {
  Applied: "bg-neutral-100 text-neutral-700 border border-neutral-200",
  Shortlisted: "bg-blue-50 text-blue-700 border border-blue-200",
  Interviewing: "bg-amber-50 text-amber-700 border border-amber-200",
  Rejected: "bg-danger-50 text-red-600 border border-red-200",
};

function getInitials(name?: string) {
  if (!name) return "AP";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CoDashboardPage({ navigate }: Props) {
  const user = getSavedUser();
  const [internships, setInternships] = useState<ApiCompanyInternship[]>([]);
  const [applicants, setApplicants] = useState<ApiCompanyApplicantItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      getMyCompanyInternships().catch(() => ({ count: 0, internships: [] })),
      getAllCompanyApplicants().catch(() => ({ totalApplicants: 0, applicants: [] })),
    ])
      .then(([internshipsRes, applicantsRes]) => {
        if (!mounted) return;
        setInternships(internshipsRes.internships || []);
        setApplicants(applicantsRes.applicants || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const activeInternships = internships.filter((i) => i.status === "active");
  const recentApplicants = [...applicants]
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 5);

  const totalApplicants = applicants.length;
  const shortlistedCount = applicants.filter((a) => a.status === "Shortlisted").length;
  const interviewingCount = applicants.filter((a) => a.status === "Interviewing").length;
  const pendingCount = applicants.filter((a) => a.status === "Applied").length;

  const todayString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="px-6 py-8 lg:px-8 lg:py-10 min-h-screen bg-neutral-50 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-2xl lg:text-3xl text-neutral-900 leading-tight"
            style={{
              fontFamily: "Fraunces, serif",
              fontStyle: "italic",
              fontVariationSettings: "'opsz' 72, 'wght' 700",
            }}
          >
            {user?.name ? `${user.name} Workspace` : "Recruitment workspace"}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">{todayString}</p>
        </div>
        <button
          onClick={() => navigate("co-internships")}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all self-start sm:self-auto flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Post new internship
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-2">
            Active internships
          </p>
          <p className="text-3xl font-bold text-brand-600">
            {loading ? "..." : activeInternships.length}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-2">
            Total applicants
          </p>
          <p className="text-3xl font-bold text-neutral-900">
            {loading ? "..." : totalApplicants}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-2">
            Shortlisted
          </p>
          <p className="text-3xl font-bold text-blue-600">
            {loading ? "..." : shortlistedCount}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-2">
            Interviewing
          </p>
          <p className="text-3xl font-bold text-amber-500">
            {loading ? "..." : interviewingCount}
          </p>
        </div>
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Active internships */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
              Active internships
            </h2>
            <button
              onClick={() => navigate("co-internships")}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Manage all
            </button>
          </div>

          {loading ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-sm text-neutral-400">
              Loading active internships...
            </div>
          ) : activeInternships.length === 0 ? (
            <div className="bg-white border border-dashed border-neutral-300 rounded-2xl p-8 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-bold text-neutral-800 text-sm mb-1">No active internships yet</h3>
              <p className="text-xs text-neutral-500 mb-4 max-w-sm mx-auto">
                Post your first internship vacancy to start connecting with top student talent.
              </p>
              <button
                onClick={() => navigate("co-internships")}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                + Post new internship
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeInternships.map((item) => {
                const urgent = item.daysLeft <= 5;
                const deadlineFormatted = item.deadline
                  ? new Date(item.deadline).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Open";

                return (
                  <div
                    key={item._id}
                    className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-neutral-900 text-sm">
                            {item.title}
                          </span>
                          <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">
                            {item.mode}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              item.type === "Paid"
                                ? "bg-success-50 text-success-700 border border-success-200"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {item.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className={`text-xs font-medium ${
                              urgent ? "text-danger-600" : "text-neutral-500"
                            }`}
                          >
                            Deadline: {deadlineFormatted}
                            {urgent && ` · ${item.daysLeft}d left`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("co-applicants", { internshipId: item._id })}
                        className="text-xs font-semibold text-white px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0 bg-brand-600 hover:bg-brand-700"
                      >
                        View applicants ({item.totalApplicants || 0})
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 mt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 inline-block" />
                          {item.totalApplicants || 0} applicants
                        </span>
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                          {item.shortlisted || 0} shortlisted
                        </span>
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                          {item.interviewing || 0} interviewing
                        </span>
                      </div>
                      <button
                        onClick={() => navigate("co-internships")}
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        Edit / Manage
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Recent applicants */}
        <div className="lg:col-span-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
              Recent applicants
            </h2>
            <button
              onClick={() => navigate("co-applicants")}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View all ({applicants.length})
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-neutral-400">
                Loading applicants...
              </div>
            ) : recentApplicants.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-neutral-800 text-sm mb-1">No applicants yet</h3>
                <p className="text-xs text-neutral-500">
                  When students apply to your internships, their CVs and details will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentApplicants.map((applicant) => {
                  const appliedDateFormatted = applicant.appliedDate
                    ? new Date(applicant.appliedDate).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })
                    : "";

                  return (
                    <div
                      key={applicant.applicationId}
                      onClick={() => navigate("co-applicants")}
                      className="flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {getInitials(applicant.student?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-neutral-900 truncate">
                            {applicant.student?.name || "Student Applicant"}
                          </p>
                          {applicant.student?.badge && (
                            <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-bold">
                              {applicant.student.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 truncate">
                          Applied for: <span className="font-medium text-neutral-700">{applicant.internship?.title || "Internship"}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                            statusColors[applicant.status] || "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {applicant.status}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {appliedDateFormatted}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("co-internships")}
            className="rounded-2xl p-5 text-left transition-all hover:shadow-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-brand-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <p className="font-bold text-sm">Post new internship</p>
            </div>
            <p className="text-brand-100 text-xs">
              Reach hundreds of qualified candidates with detailed job roles
            </p>
          </button>
          <button
            onClick={() => navigate("co-applicants")}
            className="bg-white border border-neutral-200 rounded-2xl p-5 text-left hover:border-neutral-300 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-neutral-900 font-bold text-sm">
                Review applicants ({pendingCount} pending)
              </p>
            </div>
            <p className="text-neutral-500 text-xs">
              Review applicant CVs, shortlist candidates, or schedule interviews
            </p>
          </button>
          <button
            onClick={() => navigate("co-profile")}
            className="bg-white border border-neutral-200 rounded-2xl p-5 text-left hover:border-neutral-300 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-neutral-900 font-bold text-sm">Company profile</p>
            </div>
            <p className="text-neutral-500 text-xs">
              Manage your public-facing company description, branding, and details
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
