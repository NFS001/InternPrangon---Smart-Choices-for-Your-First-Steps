import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import { CompanyLogo } from "../../components/common/CompanyLogos";
import { getMyApplications, getSavedUser } from "../../api/client";
import DocumentPreviewModal from "../../components/common/DocumentPreviewModal";
import { formatResumeFilename } from "../../utils/formatDocument";

interface Props {
  navigate: Navigate;
}

type FilterType = "All" | "Active" | "Interviewing" | "Offers" | "Archived";

interface ApplicationItem {
  id: string;
  companyName: string;
  roleTitle: string;
  location: string;
  stipend: string;
  appliedDate: string;
  status: "Interviewing" | "Shortlisted" | "Applied" | "Offered" | "Archived";
  currentStage: number; // 1 to 4
  stages: Array<{
    title: string;
    date?: string;
  }>;
  alertNote?: {
    type: "interview" | "info" | "submitted";
    text: string;
    actionLabel?: string;
    actionUrl?: string;
  };
  resumeFilename?: string;
  resumeUrl?: string;
}

const DEFAULT_APPLICATIONS: ApplicationItem[] = [
  {
    id: "app-1",
    companyName: "Chaldal",
    roleTitle: "Backend Engineering Intern (C# / .NET)",
    location: "On-site · Tejgaon, Dhaka",
    stipend: "Stipend: BDT 18,000/mo",
    appliedDate: "Sep 7, 2026",
    status: "Interviewing",
    currentStage: 3,
    stages: [
      { title: "Applied", date: "Sep 7" },
      { title: "Profile Shortlisted", date: "Sep 14" },
      { title: "Interview Scheduled", date: "Oct 12" },
      { title: "Decision / Offer" },
    ],
    alertNote: {
      type: "interview",
      text: "📅 Technical Interview via Google Meet on Monday, 3:30 PM.",
      actionLabel: "Join Meeting Link",
      actionUrl: "https://meet.google.com/abc-defg-hij",
    },
    resumeFilename: "Nafis_Uddin_Chowdhury_Resume.pdf",
    resumeUrl: "/sample_resume.pdf",
  },
  {
    id: "app-2",
    companyName: "ShopUp",
    roleTitle: "Operations & Supply Chain Intern",
    location: "On-site · Mohakhali, Dhaka",
    stipend: "Stipend: BDT 15,000/mo",
    appliedDate: "Sep 5, 2026",
    status: "Shortlisted",
    currentStage: 2,
    stages: [
      { title: "Applied", date: "Sep 5" },
      { title: "Profile Shortlisted", date: "Sep 10" },
      { title: "Interview Scheduled" },
      { title: "Decision / Offer" },
    ],
    alertNote: {
      type: "info",
      text: "Application reviewed by hiring manager. Hiring committee is reviewing candidate portfolio.",
    },
    resumeFilename: "Nafis_Uddin_Chowdhury_Resume.pdf",
    resumeUrl: "/sample_resume.pdf",
  },
  {
    id: "app-3",
    companyName: "Pathao",
    roleTitle: "Data Analyst Intern",
    location: "Hybrid · Dhanmondi, Dhaka",
    stipend: "Stipend: BDT 20,000/mo",
    appliedDate: "Sep 1, 2026",
    status: "Applied",
    currentStage: 1,
    stages: [
      { title: "Applied", date: "Sep 1" },
      { title: "Profile Shortlisted" },
      { title: "Interview Scheduled" },
      { title: "Decision / Offer" },
    ],
    alertNote: {
      type: "submitted",
      text: "Application submitted successfully and delivered to talent acquisition queue.",
    },
    resumeFilename: "Nafis_Uddin_Chowdhury_Resume.pdf",
    resumeUrl: "/sample_resume.pdf",
  },
];

export default function ApplicationsPage({ navigate }: Props) {
  const user = getSavedUser();
  const defaultResume = `${(user?.name || "Student").trim().replace(/\s+/g, "_")}_Resume.pdf`;
  const isNafis = user ? (user.name.toLowerCase().includes("nafis") || user.email.toLowerCase().includes("nafis")) : true;

  const [filter, setFilter] = useState<FilterType>("All");
  const [apps, setApps] = useState<ApplicationItem[]>(isNafis ? DEFAULT_APPLICATIONS : []);
  const [selectedResumeModal, setSelectedResumeModal] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    getMyApplications()
      .then((res) => {
        if (res.applications && res.applications.length > 0) {
          const mapped: ApplicationItem[] = res.applications.map((apiApp, idx) => {
            const intern = typeof apiApp.internship === "object" ? apiApp.internship : null;
            const statusMapped = (apiApp.status || "Applied") as ApplicationItem["status"];
            const stageNum =
              statusMapped === "Offered" ? 4 : statusMapped === "Interviewing" ? 3 : statusMapped === "Shortlisted" ? 2 : 1;

            const resumeObj = typeof apiApp.resume === "object" ? apiApp.resume : null;
            const cleanResumeName = formatResumeFilename(
              resumeObj?.filePath || (typeof apiApp.resume === "string" ? apiApp.resume : null),
              resumeObj?.originalName,
              defaultResume
            );

            const compName = (typeof apiApp.internship === "object" && apiApp.internship?.company) || "Partner Company";
            const roleTitle = intern?.title || "Engineering Intern";

            let alertNote: ApplicationItem["alertNote"] = undefined;
            if (statusMapped === "Interviewing") {
              alertNote = {
                type: "interview",
                text: `📅 Technical Interview via Google Meet scheduled for ${roleTitle}.`,
                actionLabel: "Join Meeting Link",
                actionUrl: "https://meet.google.com/abc-defg-hij",
              };
            } else if (statusMapped === "Shortlisted") {
              alertNote = {
                type: "info",
                text: `Application reviewed by ${compName} hiring committee. Shortlisted for interview round.`,
              };
            } else if (statusMapped === "Offered") {
              alertNote = {
                type: "interview",
                text: `🎉 Formal offer letter extended by ${compName}.`,
              };
            } else {
              alertNote = {
                type: "submitted",
                text: `Application submitted successfully and delivered to ${compName} talent acquisition queue.`,
              };
            }

            const appDateStr = new Date(apiApp.appliedDate || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return {
              id: apiApp.applicationId || `app-${idx}`,
              companyName: compName,
              roleTitle,
              location: intern?.mode ? `${intern.mode} · Dhaka` : "On-site · Dhaka",
              stipend: intern?.stipend ? `Stipend: ${intern.stipend}` : "Stipend: BDT 18,000/mo",
              appliedDate: appDateStr,
              status: statusMapped,
              currentStage: stageNum,
              stages: [
                { title: "Applied", date: appDateStr },
                { title: "Profile Shortlisted", date: stageNum >= 2 ? "In Review" : undefined },
                { title: "Interview Scheduled", date: stageNum >= 3 ? "Scheduled" : undefined },
                { title: "Decision / Offer", date: stageNum >= 4 ? "Offered" : undefined },
              ],
              alertNote,
              resumeFilename: cleanResumeName,
              resumeUrl: "/sample_resume.pdf",
            };
          });
          setApps(mapped);
        } else if (!isNafis) {
          setApps([]);
        }
      })
      .catch(() => {
        if (isNafis) {
          setApps(DEFAULT_APPLICATIONS);
        } else {
          setApps([]);
        }
      });
  }, []);

  const counts = {
    all: apps.length,
    active: apps.filter((a) => a.status !== "Archived").length,
    interviewing: apps.filter((a) => a.status === "Interviewing").length,
    offers: apps.filter((a) => a.status === "Offered").length,
    archived: apps.filter((a) => a.status === "Archived").length,
  };

  const filteredApps = apps.filter((a) => {
    if (filter === "Active") return a.status !== "Archived";
    if (filter === "Interviewing") return a.status === "Interviewing";
    if (filter === "Offers") return a.status === "Offered";
    if (filter === "Archived") return a.status === "Archived";
    return true;
  });

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-5xl mx-auto space-y-8">
      {/* Header & Status Navigation */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Applications
        </h1>
        <p className="text-slate-500 text-sm lg:text-base mt-1">
          Track your real-time application stages and employer review progress.
        </p>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-fit mt-6 overflow-x-auto max-w-full">
          <button
            onClick={() => setFilter("All")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filter === "All"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setFilter("Active")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filter === "Active"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active Pipeline ({counts.active})
          </button>
          <button
            onClick={() => setFilter("Interviewing")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filter === "Interviewing"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Interviewing ({counts.interviewing})
          </button>
          <button
            onClick={() => setFilter("Offers")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filter === "Offers"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Offers ({counts.offers})
          </button>
          <button
            onClick={() => setFilter("Archived")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filter === "Archived"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Archived ({counts.archived})
          </button>
        </div>
      </div>

      {/* Detailed Application Cards */}
      <div className="space-y-6">
        {filteredApps.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-12 text-center">
            <div className="text-4xl mb-3">📁</div>
            <h3 className="text-base font-bold text-slate-800">No applications in this view</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Check another filter or explore open internship roles to submit new applications.
            </p>
            <button
              onClick={() => navigate("internships")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
            >
              Explore Openings
            </button>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-5"
            >
              {/* Card Top: Logo, Info, Badges */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <CompanyLogo name={app.companyName} size={48} className="shadow-sm" />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      {app.roleTitle}
                    </h2>
                    <p className="text-sm font-semibold text-slate-600 mt-0.5">
                      {app.companyName}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {app.location}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                        {app.stipend}
                      </span>
                      <span className="text-xs text-slate-400">
                        Applied: {app.appliedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge (Top-Right) */}
                <div className="shrink-0 self-start">
                  {app.status === "Interviewing" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      🟡 Interviewing
                    </span>
                  )}
                  {app.status === "Shortlisted" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      🔵 Shortlisted
                    </span>
                  )}
                  {app.status === "Applied" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      ⚪ Application Submitted
                    </span>
                  )}
                  {app.status === "Offered" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      🟢 Offer Extended
                    </span>
                  )}
                  {app.status === "Archived" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                      Archived
                    </span>
                  )}
                </div>
              </div>

              {/* Modern 4-Stage Horizontal Stepper Bar */}
              <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 sm:p-5">
                <div className="relative flex items-center justify-between">
                  {/* Background Track Line */}
                  <div className="absolute left-6 right-6 top-4 h-1 bg-slate-200 -z-0" />
                  
                  {/* Dynamic Indigo Filled Line */}
                  <div
                    className="absolute left-6 top-4 h-1 bg-indigo-600 transition-all duration-500 -z-0"
                    style={{
                      width:
                        app.currentStage === 1
                          ? "0%"
                          : app.currentStage === 2
                          ? "33%"
                          : app.currentStage === 3
                          ? "66%"
                          : "100%",
                    }}
                  />

                  {app.stages.map((stage, sIdx) => {
                    const stageNumber = sIdx + 1;
                    const isPassed = stageNumber < app.currentStage;
                    const isCurrent = stageNumber === app.currentStage;
                    const isFuture = stageNumber > app.currentStage;

                    return (
                      <div key={stage.title} className="relative z-10 flex flex-col items-center text-center">
                        {/* Node Circle */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                            isPassed
                              ? "bg-indigo-600 text-white"
                              : isCurrent
                              ? "bg-emerald-500 text-white ring-4 ring-emerald-100 animate-pulse"
                              : "bg-white border-2 border-slate-300 text-slate-400"
                          }`}
                        >
                          {isPassed ? (
                            "✓"
                          ) : isCurrent ? (
                            "●"
                          ) : (
                            stageNumber
                          )}
                        </div>

                        {/* Node Label */}
                        <p
                          className={`text-xs mt-2 font-medium max-w-[90px] sm:max-w-[120px] leading-tight ${
                            isCurrent
                              ? "text-slate-900 font-bold"
                              : isPassed
                              ? "text-indigo-900 font-semibold"
                              : "text-slate-400"
                          }`}
                        >
                          {stage.title}
                        </p>
                        {stage.date && (
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            ({stage.date})
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Stage Detail Callout */}
              {app.alertNote && (
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    app.alertNote.type === "interview"
                      ? "bg-indigo-50/70 border-indigo-200/80 text-indigo-950"
                      : app.alertNote.type === "info"
                      ? "bg-blue-50/70 border-blue-200/80 text-blue-950"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <span>{app.alertNote.text}</span>
                  </div>

                  {app.alertNote.actionLabel && (
                    <a
                      href={app.alertNote.actionUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
                    >
                      <span>{app.alertNote.actionLabel}</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("internships")}
                    className="px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl transition-colors shadow-2xs"
                  >
                    View Job Posting
                  </button>

                  <button
                    onClick={() => {
                      setSelectedResumeModal({
                        url: app.resumeUrl || "/sample_resume.pdf",
                        title: app.resumeFilename || `${app.companyName}_Application_Resume.pdf`,
                      });
                    }}
                    className="px-3.5 py-2 border border-indigo-200/80 hover:border-indigo-300 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-700 text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <span>📄</span>
                    <span>Preview Resume</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to withdraw this application?")) {
                      setApps((prev) => prev.filter((item) => item.id !== app.id));
                    }
                  }}
                  className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors"
                >
                  Withdraw Application
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* In-App Glassmorphic Document Preview Modal */}
      {selectedResumeModal && (
        <DocumentPreviewModal
          isOpen={Boolean(selectedResumeModal)}
          onClose={() => setSelectedResumeModal(null)}
          documentUrl={selectedResumeModal.url}
          documentTitle={selectedResumeModal.title}
        />
      )}
    </div>
  );
}
