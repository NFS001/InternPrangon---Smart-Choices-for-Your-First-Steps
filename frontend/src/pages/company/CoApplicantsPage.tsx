import React, { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import {
  getAllCompanyApplicants,
  getMyCompanyInternships,
  updateApplicationStatus,
  type ApiCompanyApplicantItem,
  type ApiCompanyInternship,
} from "../../api/client";
import DocumentPreviewModal from "../../components/common/DocumentPreviewModal";
import { formatResumeFilename } from "../../utils/formatDocument";

interface Props {
  navigate: Navigate;
  internshipId?: string | number;
}

type StageFilter = "all" | "Applied" | "Shortlisted" | "Interviewing" | "Offered" | "Rejected";

interface CandidateCardData {
  id: string;
  name: string;
  photo: string;
  email: string;
  university: string;
  department: string;
  appliedDate: string;
  tierBadge: string;
  tierIcon: string;
  status: "Applied" | "Shortlisted" | "Interviewing" | "Offered" | "Rejected";
  roleTitle: string;
  workMode: string;
  bio: string;
  skills: string[];
  resumeUrl?: string;
}

const DEFAULT_CANDIDATES: CandidateCardData[] = [
  {
    id: "cand-1",
    name: "Farhana Tasnim Eva",
    photo: "/team_eva.jpg",
    email: "eva@gmail.com",
    university: "BRAC University",
    department: "CSE",
    appliedDate: "Sep 9, 2026",
    tierBadge: "Explorer Tier",
    tierIcon: "🔭",
    status: "Applied",
    roleTitle: "Analyst",
    workMode: "Remote",
    bio: "Undergraduate student passionate about data-driven decision making, business analytics, and product strategy.",
    skills: ["Data Analysis", "Python", "SQL", "Tableau", "Excel"],
  },
  {
    id: "cand-2",
    name: "Nafis Uddin Chowdhury",
    photo: "/team_nafis.jpg",
    email: "nafis@g.bracu.ac.bd",
    university: "BRAC University",
    department: "CSE",
    appliedDate: "Sep 8, 2026",
    tierBadge: "Newbie Tier · 25 pts",
    tierIcon: "🌱",
    status: "Applied",
    roleTitle: "Analyst",
    workMode: "Remote",
    bio: "Final-year Computer Science student at BRAC University specializing in full-stack web architectures and distributed systems.",
    skills: ["React", "TypeScript", "Node.js", "Python", "C#", ".NET"],
  },
  {
    id: "cand-3",
    name: "Md. Muhtasim Fuad",
    photo: "/team_fuad.jpg",
    email: "fuad@gmail.com",
    university: "BRAC University",
    department: "CSE",
    appliedDate: "Sep 7, 2026",
    tierBadge: "Explorer Tier",
    tierIcon: "🔭",
    status: "Shortlisted",
    roleTitle: "Fintech Cybersecurity Intern",
    workMode: "On-site",
    bio: "Final year CSE student focusing on network security, web app vulnerability assessment, and ISO compliance.",
    skills: ["React", "TypeScript", "Node.js", "Python", "OWASP", "Docker"],
  },
];

export default function CoApplicantsPage({ navigate: _navigate, internshipId }: Props) {
  const [candidates, setCandidates] = useState<CandidateCardData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals
  const [profileModalCandidate, setProfileModalCandidate] = useState<CandidateCardData | null>(null);
  const [interviewModalCandidate, setInterviewModalCandidate] = useState<CandidateCardData | null>(null);
  const [rejectModalCandidate, setRejectModalCandidate] = useState<CandidateCardData | null>(null);
  const [resumeModalData, setResumeModalData] = useState<{ url: string; title: string } | null>(null);

  // Interview modal inputs
  const [interviewLink, setInterviewLink] = useState("https://meet.google.com/interview-room");
  const [interviewDate, setInterviewDate] = useState("2026-11-05");
  const [interviewTime, setInterviewTime] = useState("15:30");

  useEffect(() => {
    getAllCompanyApplicants()
      .then((res) => {
        if (res.applicants) {
          const mapped: CandidateCardData[] = res.applicants.map((a, idx) => {
            const intern = typeof a.internship === "object" ? a.internship : null;
            const sName = a.student?.name || "Student Candidate";
            let photo = "";
            const lower = sName.toLowerCase();
            if (lower.includes("eva")) photo = "/team_eva.jpg";
            else if (lower.includes("nafis")) photo = "/team_nafis.jpg";
            else if (lower.includes("fuad")) photo = "/team_fuad.jpg";
            else if (lower.includes("tahmid")) photo = "/team_tahmid.jpg";

            return {
              id: a.applicationId || `cand-${idx}`,
              name: sName,
              photo,
              email: a.student?.email || "student@example.com",
              university: "BRAC University",
              department: "CSE",
              appliedDate: a.appliedDate
                ? new Date(a.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "Recently",
              tierBadge: a.student?.badge ? `${a.student.badge} Tier` : "Explorer Tier",
              tierIcon: a.student?.badge === "Elite" ? "🏆" : a.student?.badge === "Explorer" ? "🔭" : "🌱",
              status: (a.status as CandidateCardData["status"]) || "Applied",
              roleTitle: intern?.title || "Internship Role",
              workMode: intern?.mode || "On-site",
              bio: a.student?.bio || "Undergraduate student looking for internship opportunities.",
              skills: a.student?.skills && a.student.skills.length > 0 ? a.student.skills : ["React", "JavaScript", "Problem Solving"],
              resumeUrl: a.resume?.filePath || "/sample_resume.pdf",
            };
          });
          setCandidates(mapped);
        }
      })
      .catch(() => {
        setCandidates([]);
      });
  }, []);

  const handleUpdateStatus = (id: string, newStatus: CandidateCardData["status"]) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    updateApplicationStatus(id, newStatus as any).catch(() => {});
    setSuccessToast(`Candidate status updated to "${newStatus}"!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleConfirmInterview = () => {
    if (!interviewModalCandidate) return;
    handleUpdateStatus(interviewModalCandidate.id, "Interviewing");
    setInterviewModalCandidate(null);
  };

  const handleConfirmReject = () => {
    if (!rejectModalCandidate) return;
    handleUpdateStatus(rejectModalCandidate.id, "Rejected");
    setRejectModalCandidate(null);
  };

  const handleDownloadResume = (c: CandidateCardData) => {
    const cleanName = formatResumeFilename(c.resumeUrl, null, `${c.name.replace(/\s+/g, "_")}_Resume.pdf`);
    setResumeModalData({
      url: c.resumeUrl || "/sample_resume.pdf",
      title: cleanName,
    });
  };

  const filteredCandidates = candidates.filter((c) => {
    if (stageFilter !== "all" && c.status !== stageFilter) return false;
    if (selectedRoleFilter !== "all" && c.roleTitle !== selectedRoleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchUni = c.university.toLowerCase().includes(q);
      const matchSkill = c.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchUni && !matchSkill) return false;
    }
    return true;
  });

  const counts = {
    all: candidates.length,
    applied: candidates.filter((c) => c.status === "Applied").length,
    shortlisted: candidates.filter((c) => c.status === "Shortlisted").length,
    interviewing: candidates.filter((c) => c.status === "Interviewing").length,
    offered: candidates.filter((c) => c.status === "Offered").length,
    rejected: candidates.filter((c) => c.status === "Rejected").length,
  };

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. Page Header & Live Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Applicant Candidate Manager
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              {candidates.length} candidates in pipeline
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Review submitted student resumes, transition hiring pipeline stages, and schedule interviews.
          </p>
        </div>

        {/* Vacancy Filter Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Filter by Role:</span>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-indigo-500 shadow-2xs"
          >
            <option value="all">All Internships ({candidates.length})</option>
            <option value="Analyst">Analyst</option>
            <option value="Fintech Cybersecurity Intern">Fintech Cybersecurity Intern</option>
            <option value="Cloud Infrastructure Intern">Cloud Infrastructure Intern</option>
          </select>
        </div>
      </div>

      {/* 2. Search & Pipeline Stage Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-5 shadow-sm space-y-4">
        {/* Top Search Input */}
        <div className="relative w-full">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
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
            placeholder="🔍 Search candidates by name, university, skills, or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Segmented Stage Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-fit overflow-x-auto max-w-full">
          <button
            onClick={() => setStageFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              stageFilter === "all"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Statuses ({counts.all})
          </button>
          <button
            onClick={() => setStageFilter("Applied")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              stageFilter === "Applied"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Applied ({counts.applied})
          </button>
          <button
            onClick={() => setStageFilter("Shortlisted")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              stageFilter === "Shortlisted"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Shortlisted ({counts.shortlisted})
          </button>
          <button
            onClick={() => setStageFilter("Interviewing")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              stageFilter === "Interviewing"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Interviewing ({counts.interviewing})
          </button>
          <button
            onClick={() => setStageFilter("Offered")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              stageFilter === "Offered"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Offered ({counts.offered})
          </button>
          <button
            onClick={() => setStageFilter("Rejected")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              stageFilter === "Rejected"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rejected ({counts.rejected})
          </button>
        </div>
      </div>

      {/* 3. Detailed Candidate Application Cards */}
      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-bold text-slate-800 text-sm">No candidates match your filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try clearing your search query or switching to another application stage tab.
            </p>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              {/* Candidate Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Real Student Profile Photo */}
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-xs shrink-0 bg-slate-100">
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="w-full h-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                      {candidate.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {candidate.name}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <span>{candidate.tierIcon}</span>
                        <span>{candidate.tierBadge}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">{candidate.email}</span> ·{" "}
                      <span>{candidate.university} ({candidate.department})</span> ·{" "}
                      <span className="text-slate-400">Applied {candidate.appliedDate}</span>
                    </p>
                  </div>
                </div>

                {/* Current Status Pill */}
                <div className="shrink-0 self-start">
                  {candidate.status === "Applied" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      ⚪ Applied
                    </span>
                  )}
                  {candidate.status === "Shortlisted" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      🔵 Shortlisted
                    </span>
                  )}
                  {candidate.status === "Interviewing" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      🟡 Interviewing
                    </span>
                  )}
                  {candidate.status === "Offered" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      🟢 Offer Extended
                    </span>
                  )}
                  {candidate.status === "Rejected" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      🔴 Declined
                    </span>
                  )}
                </div>
              </div>

              {/* Candidate Metadata & Match Overview */}
              <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Role Applied:</span>
                  <span className="font-bold text-indigo-700">{candidate.roleTitle}</span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {candidate.workMode}
                  </span>
                </div>

                <p className="text-slate-600 italic">
                  "{candidate.bio}"
                </p>

                {/* Verified Skills Chips */}
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Skills:</span>
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 bg-white text-slate-700 font-semibold rounded-md border border-slate-200 text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Employer Decision Toolbar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* View Full Profile */}
                  <button
                    onClick={() => setProfileModalCandidate(candidate)}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors"
                  >
                    👁️ View Full Profile
                  </button>

                  {/* Download CV */}
                  <button
                    onClick={() => handleDownloadResume(candidate)}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                  >
                    <span>📄 Preview & Download CV</span>
                  </button>
                </div>

                {/* Decision Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {candidate.status !== "Shortlisted" && (
                    <button
                      onClick={() => handleUpdateStatus(candidate.id, "Shortlisted")}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl transition-colors shadow-2xs"
                    >
                      🔵 Shortlist
                    </button>
                  )}

                  {candidate.status !== "Interviewing" && (
                    <button
                      onClick={() => setInterviewModalCandidate(candidate)}
                      className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 font-bold text-xs rounded-xl transition-colors shadow-2xs"
                    >
                      🟡 Schedule Interview
                    </button>
                  )}

                  {candidate.status !== "Rejected" && (
                    <button
                      onClick={() => setRejectModalCandidate(candidate)}
                      className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 font-semibold text-xs rounded-xl transition-colors"
                    >
                      🔴 Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Interview Modal */}
      {interviewModalCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Schedule Interview with {interviewModalCandidate.name}
              </h3>
              <button
                onClick={() => setInterviewModalCandidate(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Candidate will receive an automated invitation email and an embedded calendar card in their student workspace.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Google Meet / Zoom URL
                </label>
                <input
                  type="text"
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setInterviewModalCandidate(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInterview}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                Send Interview Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto">
              ⚠️
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Decline Application for {rejectModalCandidate.name}?
            </h3>
            <p className="text-xs text-slate-500">
              This updates the student's pipeline status to "Declined". They will be politely notified in their portal.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setRejectModalCandidate(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Full Profile Drawer/Modal */}
      {profileModalCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-2xl w-full shadow-2xl my-8 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-sm shrink-0 bg-slate-100">
                  <img src={profileModalCandidate.photo} alt={profileModalCandidate.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{profileModalCandidate.name}</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✔ Verified Email
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {profileModalCandidate.university} · Department of {profileModalCandidate.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalCandidate(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Standing</h4>
                <p className="text-slate-700 font-medium">B.Sc. in Computer Science & Engineering · Expected Graduation 2026 · CGPA: 3.82</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1">Candidate Bio</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  {profileModalCandidate.bio}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Verified Skill Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profileModalCandidate.skills.map((s) => (
                    <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-semibold text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => handleDownloadResume(profileModalCandidate)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Preview & Download CV (PDF)
                </button>
                <button
                  onClick={() => setProfileModalCandidate(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Glassmorphic Document Preview Modal */}
      {resumeModalData && (
        <DocumentPreviewModal
          isOpen={Boolean(resumeModalData)}
          onClose={() => setResumeModalData(null)}
          documentUrl={resumeModalData.url}
          documentTitle={resumeModalData.title}
        />
      )}
    </div>
  );
}
