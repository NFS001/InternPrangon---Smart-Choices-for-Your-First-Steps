import React, { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import {
  getAllCompanyApplicants,
  getMyCompanyInternships,
  updateApplicationStatus,
  type ApiCompanyApplicantItem,
  type ApiCompanyInternship,
} from "../../api/client";

interface Props {
  navigate: Navigate;
  internshipId?: string;
}

type AppStatusFilter = "all" | "Applied" | "Shortlisted" | "Interviewing" | "Rejected";

function getInitials(name?: string): string {
  if (!name) return "ST";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "ST";
  return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase();
}

const STATUS_COLORS: Record<string, string> = {
  Applied: "bg-neutral-100 text-neutral-700 border border-neutral-200",
  Shortlisted: "bg-blue-50 text-blue-700 border border-blue-200",
  Interviewing: "bg-amber-50 text-amber-700 border border-amber-200",
  Rejected: "bg-danger-50 text-red-600 border border-red-200",
};

export default function CoApplicantsPage({ navigate, internshipId: initialInternshipId }: Props) {
  const [applicants, setApplicants] = useState<ApiCompanyApplicantItem[]>([]);
  const [internships, setInternships] = useState<ApiCompanyInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<AppStatusFilter>("all");
  const [filterInternship, setFilterInternship] = useState<string>(initialInternshipId || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ applicantId: string; newStatus: "Rejected" } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<ApiCompanyApplicantItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplicantsData = () => {
    setLoading(true);
    Promise.all([
      getAllCompanyApplicants().catch(() => ({ totalApplicants: 0, applicants: [] })),
      getMyCompanyInternships().catch(() => ({ count: 0, internships: [] })),
    ])
      .then(([appsRes, internsRes]) => {
        setApplicants(appsRes.applicants || []);
        setInternships(internsRes.internships || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApplicantsData();
  }, []);

  useEffect(() => {
    if (initialInternshipId) {
      setFilterInternship(initialInternshipId);
    }
  }, [initialInternshipId]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  async function handleStatusChange(
    applicantId: string,
    newStatus: "Applied" | "Shortlisted" | "Interviewing" | "Rejected"
  ) {
    if (newStatus === "Rejected") {
      setConfirmAction({ applicantId, newStatus: "Rejected" });
      return;
    }

    setActionLoading(true);
    try {
      await updateApplicationStatus(applicantId, newStatus);
      setApplicants((prev) =>
        prev.map((a) => (a.applicationId === applicantId ? { ...a, status: newStatus } : a))
      );
      if (selectedCandidate?.applicationId === applicantId) {
        setSelectedCandidate((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      setSuccessMessage(`Application status updated to ${newStatus}.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmRejection() {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      await updateApplicationStatus(confirmAction.applicantId, "Rejected");
      setApplicants((prev) =>
        prev.map((a) =>
          a.applicationId === confirmAction.applicantId ? { ...a, status: "Rejected" } : a
        )
      );
      if (selectedCandidate?.applicationId === confirmAction.applicantId) {
        setSelectedCandidate((prev) => (prev ? { ...prev, status: "Rejected" } : null));
      }
      setSuccessMessage("Applicant marked as Rejected.");
      setConfirmAction(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject application.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleDownloadResume(applicationId: string) {
    const token = localStorage.getItem("internprangon_token");
    const downloadUrl = `http://localhost:5000/api/applications/${applicationId}/resume`;
    
    // Create an authenticated download fetch
    fetch(downloadUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to download resume");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `applicant-resume-${applicationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        alert(err instanceof Error ? err.message : "Resume download failed.");
      });
  }

  const filtered = applicants.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterInternship !== "all" && a.internship?.id !== filterInternship) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.student?.name?.toLowerCase().includes(q);
      const matchEmail = a.student?.email?.toLowerCase().includes(q);
      const matchRole = a.internship?.title?.toLowerCase().includes(q);
      const matchSkills = a.student?.skills?.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchRole && !matchSkills) return false;
    }
    return true;
  });

  const allStatuses: ("all" | "Applied" | "Shortlisted" | "Interviewing" | "Rejected")[] = [
    "all",
    "Applied",
    "Shortlisted",
    "Interviewing",
    "Rejected",
  ];

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 lg:px-8 lg:py-10 max-w-7xl mx-auto">
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 bg-success-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Confirmation Modal for Rejection */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-scale-up">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="font-bold text-xl text-neutral-900">Mark candidate as Rejected?</h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                This will update the candidate's status to Rejected and notify them in their dashboard.
              </p>
              <div className="flex gap-3 w-full mt-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleConfirmRejection}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-danger-600 text-white text-sm font-semibold hover:bg-danger-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Profile & CV Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-2xl w-full shadow-2xl my-8 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-5 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white text-lg font-bold flex items-center justify-center flex-shrink-0 shadow-md">
                  {getInitials(selectedCandidate.student?.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-neutral-900">
                      {selectedCandidate.student?.name || "Student Applicant"}
                    </h2>
                    {selectedCandidate.student?.badge && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                        {selectedCandidate.student.badge} Tier
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {selectedCandidate.student?.email || "No email"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Application Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <div>
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Applied Role</p>
                <p className="text-sm font-bold text-neutral-800 truncate">{selectedCandidate.internship?.title || "Internship"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Applied On</p>
                <p className="text-sm font-bold text-neutral-800">
                  {selectedCandidate.appliedDate
                    ? new Date(selectedCandidate.appliedDate).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Current Status</p>
                <span
                  className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-0.5 ${
                    STATUS_COLORS[selectedCandidate.status]
                  }`}
                >
                  {selectedCandidate.status}
                </span>
              </div>
            </div>

            {/* Candidate Bio */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Candidate Bio / Summary
              </h3>
              <div className="bg-white border border-neutral-200 rounded-2xl p-4 text-sm text-neutral-700 leading-relaxed">
                {selectedCandidate.student?.bio ? (
                  selectedCandidate.student.bio
                ) : (
                  <span className="text-neutral-400 italic">No biographical description provided yet.</span>
                )}
              </div>
            </div>

            {/* Candidate Skills */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Skills & Tech Stack
              </h3>
              {selectedCandidate.student?.skills && selectedCandidate.student.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.student.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-brand-50 text-brand-700 font-semibold text-xs px-3 py-1 rounded-xl border border-brand-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">No skills listed.</p>
              )}
            </div>

            {/* Resume / CV Section */}
            <div className="mb-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                  PDF
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">Student Resume / CV Document</p>
                  <p className="text-xs text-neutral-500">
                    {selectedCandidate.resumeAvailable ? "Uploaded and ready for review" : "Standard CV profile attached"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadResume(selectedCandidate.applicationId)}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CV (PDF)
              </button>
            </div>

            {/* Application Decision Controls */}
            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Recruiter Decision & Stage
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={actionLoading || selectedCandidate.status === "Shortlisted"}
                  onClick={() => handleStatusChange(selectedCandidate.applicationId, "Shortlisted")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCandidate.status === "Shortlisted"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                  }`}
                >
                  ✓ Shortlist Candidate
                </button>
                <button
                  disabled={actionLoading || selectedCandidate.status === "Interviewing"}
                  onClick={() => handleStatusChange(selectedCandidate.applicationId, "Interviewing")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCandidate.status === "Interviewing"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  💬 Move to Interview
                </button>
                <button
                  disabled={actionLoading || selectedCandidate.status === "Rejected"}
                  onClick={() => handleStatusChange(selectedCandidate.applicationId, "Rejected")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCandidate.status === "Rejected"
                      ? "bg-danger-600 text-white shadow-sm"
                      : "bg-danger-50 text-red-600 hover:bg-danger-100 border border-red-200"
                  }`}
                >
                  ✕ Reject Candidate
                </button>
                <button
                  disabled={actionLoading || selectedCandidate.status === "Applied"}
                  onClick={() => handleStatusChange(selectedCandidate.applicationId, "Applied")}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 border border-neutral-200 transition-colors ml-auto"
                >
                  Reset Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl lg:text-3xl text-neutral-900 leading-tight"
            style={{
              fontFamily: "Fraunces, serif",
              fontStyle: "italic",
              fontVariationSettings: "'opsz' 72, 'wght' 700",
            }}
          >
            Applicant candidate manager
          </h1>
          {!loading && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
              {filtered.length} candidates
            </span>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 lg:p-5 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <svg
              className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, or skill..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {/* Internship select dropdown */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">Filter by vacancy:</span>
            <select
              value={filterInternship}
              onChange={(e) => setFilterInternship(e.target.value)}
              className="w-full md:w-64 border border-neutral-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 font-medium text-neutral-800"
            >
              <option value="all">All Internships ({internships.length})</option>
              {internships.map((internship) => (
                <option key={internship._id} value={internship._id}>
                  {internship.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex gap-2 flex-wrap border-t border-neutral-100 pt-3">
          {allStatuses.map((st) => {
            const count =
              st === "all"
                ? applicants.length
                : applicants.filter((a) => a.status === st).length;

            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                  filterStatus === st
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {st === "all" ? "All Statuses" : st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidates List / Cards */}
      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-neutral-400">
          Loading applicants from database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-neutral-300 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-neutral-800 text-base mb-1">No applicants found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
            {applicants.length === 0
              ? "You haven't received any applicants yet. Post more internship listings to reach eager students."
              : "No applicants matching the selected criteria. Try adjusting your filters."}
          </p>
          {applicants.length === 0 && (
            <button
              onClick={() => navigate("co-internships")}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Go to Internship Listings
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((applicant) => {
            const appliedDateFormatted = applicant.appliedDate
              ? new Date(applicant.appliedDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "N/A";

            return (
              <div
                key={applicant.applicationId}
                className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Student Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                      {getInitials(applicant.student?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-neutral-900 text-base">
                          {applicant.student?.name || "Student Applicant"}
                        </span>
                        {applicant.student?.badge && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                            {applicant.student.badge}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            STATUS_COLORS[applicant.status]
                          }`}
                        >
                          {applicant.status}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 mt-1">
                        {applicant.student?.email} &middot; Applied on {appliedDateFormatted}
                      </p>

                      <div className="mt-2 text-xs text-neutral-700 flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-brand-700">Role:</span>
                        <span className="font-medium">{applicant.internship?.title || "Internship"}</span>
                        {applicant.internship?.mode && (
                          <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md text-[11px]">
                            {applicant.internship.mode}
                          </span>
                        )}
                      </div>

                      {/* Bio preview if exists */}
                      {applicant.student?.bio && (
                        <p className="text-xs text-neutral-600 mt-2 line-clamp-1 italic">
                          "{applicant.student.bio}"
                        </p>
                      )}

                      {/* Skills Tags */}
                      {applicant.student?.skills && applicant.student.skills.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {applicant.student.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="text-[11px] font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                          {applicant.student.skills.length > 5 && (
                            <span className="text-[11px] text-neutral-400">
                              +{applicant.student.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-neutral-100">
                    <button
                      onClick={() => setSelectedCandidate(applicant)}
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-colors"
                    >
                      View Profile & CV
                    </button>
                    <button
                      onClick={() => handleDownloadResume(applicant.applicationId)}
                      title="Download Resume (PDF)"
                      className="p-2 border border-neutral-200 hover:bg-brand-50 hover:text-brand-600 text-neutral-600 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      CV
                    </button>

                    {applicant.status !== "Shortlisted" && (
                      <button
                        onClick={() => handleStatusChange(applicant.applicationId, "Shortlisted")}
                        className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-xl transition-colors"
                      >
                        Shortlist
                      </button>
                    )}

                    {applicant.status !== "Interviewing" && (
                      <button
                        onClick={() => handleStatusChange(applicant.applicationId, "Interviewing")}
                        className="px-3 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-bold rounded-xl transition-colors"
                      >
                        Interview
                      </button>
                    )}

                    {applicant.status !== "Rejected" && (
                      <button
                        onClick={() => handleStatusChange(applicant.applicationId, "Rejected")}
                        className="px-3 py-2 bg-danger-50 text-red-600 hover:bg-danger-100 border border-red-200 text-xs font-bold rounded-xl transition-colors"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
