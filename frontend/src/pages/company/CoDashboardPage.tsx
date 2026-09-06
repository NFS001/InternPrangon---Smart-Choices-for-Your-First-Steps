import type { Navigate } from "../../data/index";
import { HR_INTERNSHIPS, HR_APPLICANTS } from "../../data/index";

interface Props {
  navigate: Navigate;
}

const statusColors: Record<string, string> = {
  Applied: "bg-neutral-100 text-neutral-600",
  Shortlisted: "bg-info-50 text-info-600",
  Interviewing: "bg-amber-50 text-amber-700",
  Rejected: "bg-danger-50 text-danger-600",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CoDashboardPage({ navigate }: Props) {
  const activeInternships = HR_INTERNSHIPS.filter((i) => i.status === "active");

  const recentApplicants = [...HR_APPLICANTS]
    .sort((a, b) => {
      const da = new Date(a.appliedDate).getTime();
      const db = new Date(b.appliedDate).getTime();
      return db - da;
    })
    .slice(0, 5);

  const pendingCount = HR_APPLICANTS.filter((a) => a.status === "Applied").length;
  const totalApplicants = HR_APPLICANTS.length;
  const shortlistedCount = HR_APPLICANTS.filter((a) => a.status === "Shortlisted").length;
  const interviewingCount = HR_APPLICANTS.filter((a) => a.status === "Interviewing").length;

  return (
    <div className="px-8 py-10 min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-2xl text-neutral-900 leading-tight"
            style={{
              fontFamily: "Fraunces, serif",
              fontStyle: "italic",
              fontVariationSettings: "'opsz' 72, 'wght' 700",
            }}
          >
            Recruitment workspace
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Wednesday, 19 Aug 2025</p>
        </div>
        <button
          onClick={() => navigate("co-internships")}
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Post new internship
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-2">
            Active internships
          </p>
          <p className="text-3xl font-bold" style={{ color: "#7c3aed" }}>
            {activeInternships.length}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-2">
            Total applicants
          </p>
          <p className="text-3xl font-bold text-neutral-900">{totalApplicants}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-2">
            Shortlisted
          </p>
          <p className="text-3xl font-bold text-info-600">{shortlistedCount}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-2">
            Interviewing
          </p>
          <p className="text-3xl font-bold text-amber-500">{interviewingCount}</p>
        </div>
      </div>

      {/* Two-column section */}
      <div className="flex gap-6 mb-8">
        {/* Left 60%: Active internships */}
        <div className="w-[60%]">
          <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">
            Active internships
          </h2>
          <div className="flex flex-col gap-3">
            {activeInternships.map((item) => {
              const urgent = item.daysLeft <= 5;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-neutral-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 text-sm">
                          {item.title}
                        </span>
                        <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                          {item.type}
                        </span>
                        {item.paid && (
                          <span className="text-xs bg-success-50 text-success-700 px-2 py-0.5 rounded-full">
                            Paid
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-medium ${
                            urgent ? "text-danger-600" : "text-neutral-400"
                          }`}
                        >
                          Deadline: {item.deadline}
                          {urgent && ` · ${item.daysLeft}d left`}
                        </span>
                        {item.stipend && (
                          <span className="text-xs text-neutral-400">
                            · {item.stipend}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("co-applicants", { internshipId: item.id })}
                      className="text-xs font-medium text-white px-3 py-1.5 rounded-lg transition-colors"
                      style={{ backgroundColor: "#7c3aed" }}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLElement).style.backgroundColor = "#6d28d9")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).style.backgroundColor = "#7c3aed")
                      }
                    >
                      View applicants
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 inline-block" />
                        {item.applicants} applicants
                      </span>
                      <span className="inline-flex items-center gap-1 bg-info-50 text-info-600 text-xs px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-info-400 inline-block" />
                        {item.shortlisted} shortlisted
                      </span>
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        {item.interviewing} interviewing
                      </span>
                    </div>
                    <button
                      onClick={() => navigate("co-internships")}
                      className="text-sm font-medium"
                      style={{ color: "#7c3aed" }}
                    >
                      Manage
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 40%: Recent applicants */}
        <div className="w-[40%]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
              Recent applicants
            </h2>
            <button
              onClick={() => navigate("co-applicants")}
              className="text-xs font-medium"
              style={{ color: "#7c3aed" }}
            >
              View all
            </button>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
            {recentApplicants.map((applicant) => (
              <div key={applicant.id} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-full bg-neutral-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {getInitials(applicant.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {applicant.name}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {applicant.university} · {applicant.internshipTitle}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      statusColors[applicant.status]
                    }`}
                  >
                    {applicant.status}
                  </span>
                  <span className="text-xs text-neutral-400">{applicant.appliedDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">
          Quick actions
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => navigate("co-internships")}
            className="rounded-xl p-5 text-left transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#7c3aed" }}
          >
            <p className="text-white font-semibold text-sm">Post new internship</p>
            <p className="text-brand-200 text-xs mt-1">
              Reach hundreds of qualified candidates
            </p>
          </button>
          <button
            onClick={() => navigate("co-applicants")}
            className="bg-white border border-neutral-200 rounded-xl p-5 text-left hover:border-neutral-300 transition-colors"
          >
            <p className="text-neutral-900 font-semibold text-sm">
              Review pending applicants
            </p>
            <p className="text-neutral-500 text-xs mt-1">
              {pendingCount} applicant{pendingCount !== 1 ? "s" : ""} awaiting review
            </p>
          </button>
          <button
            onClick={() => navigate("co-profile")}
            className="bg-white border border-neutral-200 rounded-xl p-5 text-left hover:border-neutral-300 transition-colors"
          >
            <p className="text-neutral-900 font-semibold text-sm">Company profile</p>
            <p className="text-neutral-500 text-xs mt-1">
              Manage your public-facing company information
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
