import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import type { AppStatus } from "../../data/index";
import { getMyApplications, type ApiApplicationItem } from "../../api/client";

interface Props {
  navigate: Navigate;
}

type FilterTab = "All" | "Active" | "Rejected";

const STATUS_STEPS: AppStatus[] = ["Applied", "Shortlisted", "Interviewing", "Offered"];

const statusBadge: Record<string, string> = {
  Applied: "bg-neutral-100 text-neutral-700",
  Shortlisted: "bg-info-100 text-info-700",
  Interviewing: "bg-amber-100 text-amber-700",
  Offered: "bg-success-100 text-success-700",
  Rejected: "bg-danger-100 text-danger-600",
};

function TimelineBar({ status }: { status: string }) {
  const rejected = status === "Rejected";
  const activeIdx = rejected ? -1 : STATUS_STEPS.indexOf(status as AppStatus);

  return (
    <div className="mt-3">
      <div className="flex items-center gap-0">
        {STATUS_STEPS.map((step, idx) => {
          const done = !rejected && idx <= activeIdx;
          const current = !rejected && idx === activeIdx;
          return (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 border-2 transition-colors ${
                  rejected
                    ? "border-neutral-200 bg-white"
                    : done
                    ? current
                      ? "border-violet-600 bg-brand-600"
                      : "border-violet-400 bg-brand-400"
                    : "border-neutral-200 bg-white"
                }`}
              />
              {idx < STATUS_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    !rejected && idx < activeIdx ? "bg-brand-400" : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        {STATUS_STEPS.map((step) => (
          <span key={step} className="text-xs text-neutral-400" style={{ flex: 1 }}>
            {step}
          </span>
        ))}
      </div>
      {rejected && (
        <p className="text-xs text-danger-500 mt-1">Application closed — not selected</p>
      )}
    </div>
  );
}

export default function ApplicationsPage({ navigate }: Props) {
  const [filter, setFilter] = useState<FilterTab>("All");
  const [applications, setApplications] = useState<ApiApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then((res) => {
        setApplications(res.applications || []);
      })
      .catch(() => {
        setApplications([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = applications.filter((app) => {
    if (filter === "Active") return app.status !== "Rejected";
    if (filter === "Rejected") return app.status === "Rejected";
    return true;
  });

  const tabs: FilterTab[] = ["All", "Active", "Rejected"];

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-3xl mx-auto">
      <h1
        className="text-2xl text-brand-700 mb-2"
        style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic" }}
      >
        My Applications
      </h1>
      <p className="text-neutral-500 text-sm mb-6">
        {loading ? "Loading applications..." : `${applications.length} total applications`}
      </p>

      {/* Filter tabs */}
      <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0 mb-6">
        <div className="flex gap-2 whitespace-nowrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === tab
                  ? "bg-brand-600 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tab}
              {tab === "All" && (
                <span className={`ml-1.5 text-xs ${filter === tab ? "text-brand-200" : "text-neutral-400"}`}>
                  {applications.length}
                </span>
              )}
              {tab === "Active" && (
                <span className={`ml-1.5 text-xs ${filter === tab ? "text-brand-200" : "text-neutral-400"}`}>
                  {applications.filter((a) => a.status !== "Rejected").length}
                </span>
              )}
              {tab === "Rejected" && (
                <span className={`ml-1.5 text-xs ${filter === tab ? "text-brand-200" : "text-neutral-400"}`}>
                  {applications.filter((a) => a.status === "Rejected").length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Application cards */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 && !loading && (
          <div className="py-20 text-center text-neutral-500">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-semibold text-neutral-800 text-base mb-1">No applications submitted yet.</p>
            <p className="text-neutral-400 text-sm mb-6">Explore open internships and submit your application.</p>
            <button
              onClick={() => navigate("internships")}
              className="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors"
            >
              Browse internships
            </button>
          </div>
        )}

        {filtered.map((app) => {
          const internshipObj = typeof app.internship === "object" ? app.internship : null;
          const roleTitle = internshipObj?.title || "Internship Role";
          const companyName = (internshipObj as any)?.company || (internshipObj as any)?.companyName || "Enterprise Partner";
          const industry = (internshipObj as any)?.companyIndustry;
          const formattedDate = new Date(app.appliedDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const deadlineStr = internshipObj?.deadline
            ? new Date(internshipObj.deadline).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : null;

          const companyInitials = companyName.trim().slice(0, 2).toUpperCase();

          return (
            <div
              key={app.applicationId}
              className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Top: role + company + status badge */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 bg-brand-50 text-brand-700 border border-brand-100"
                >
                  {companyInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-neutral-900 text-lg leading-tight">{roleTitle}</h3>
                      <p className="text-brand-700 font-medium text-sm mt-0.5">
                        {companyName} {industry ? `• ${industry}` : ""}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 ${statusBadge[app.status] || "bg-neutral-100 text-neutral-700"}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-medium">
                      {internshipObj?.mode || "On-site"}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-medium ${internshipObj?.type === "Paid" ? "bg-success-50 text-success-700 border border-success-200" : "bg-neutral-100 text-neutral-600"}`}>
                      {internshipObj?.type || "Paid"}
                    </span>
                    {deadlineStr && (
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-50 text-neutral-500 border border-neutral-200">
                        Deadline: {deadlineStr}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle: dates */}
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-400">
                <span>Applied on {formattedDate}</span>
                {typeof app.resume === "object" && app.resume?.originalName && (
                  <>
                    <span>•</span>
                    <span className="truncate">Attached Resume: {app.resume.originalName}</span>
                  </>
                )}
              </div>

              {/* Timeline */}
              <div className="mt-3">
                <TimelineBar status={app.status} />
              </div>

              {/* Action button */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Application ID: {app.applicationId.slice(-8)}</span>
                <button
                  onClick={() => {
                    if (internshipObj?._id) {
                      navigate("internship-detail", { backendId: internshipObj._id });
                    } else {
                      navigate("internships");
                    }
                  }}
                  className="text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl px-3.5 py-2 transition-colors"
                >
                  {internshipObj?._id ? "View Internship Details →" : "Browse Opportunities →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
