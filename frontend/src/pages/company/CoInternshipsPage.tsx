import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import {
  getMyCompanyInternships,
  postInternship,
  deleteCompanyInternship,
  type ApiCompanyInternship,
} from "../../api/client";

interface Props {
  navigate: Navigate;
}

type TabType = "active" | "drafts" | "closed";

interface InternshipCardItem {
  id: string;
  title: string;
  status: "Active & Accepting Applications" | "Draft" | "Closed / Expired";
  mode: string;
  type: string;
  stipend: string;
  deadline: string;
  postedAgo: string;
  applicants: number;
  shortlisted: number;
  interviewing: number;
}

const DEFAULT_LISTINGS: InternshipCardItem[] = [
  {
    id: "post-1",
    title: "Cloud Infrastructure Intern",
    status: "Active & Accepting Applications",
    mode: "Remote",
    type: "Paid",
    stipend: "BDT 20,000/mo",
    deadline: "May 20, 2027",
    postedAgo: "Posted 12 days ago",
    applicants: 0,
    shortlisted: 0,
    interviewing: 0,
  },
  {
    id: "post-2",
    title: "Fintech Cybersecurity Intern",
    status: "Active & Accepting Applications",
    mode: "On-site (Dhaka)",
    type: "Paid",
    stipend: "BDT 22,000/mo",
    deadline: "Apr 28, 2027",
    postedAgo: "Posted 24 days ago",
    applicants: 1,
    shortlisted: 1,
    interviewing: 0,
  },
];

export default function CoInternshipsPage({ navigate }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [listings, setListings] = useState<InternshipCardItem[]>([]);
  const [createMode, setCreateMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [mode, setMode] = useState<"Remote" | "On-site" | "Hybrid">("Remote");
  const [type, setType] = useState<"Paid" | "Unpaid">("Paid");
  const [stipend, setStipend] = useState("20,000");
  const [deadline, setDeadline] = useState("2027-05-20");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyCompanyInternships()
      .then((res) => {
        if (res.internships) {
          const mapped: InternshipCardItem[] = res.internships.map((i, idx) => ({
            id: i._id || `post-${idx}`,
            title: i.title,
            status: i.status === "expired" ? "Closed / Expired" : "Active & Accepting Applications",
            mode: i.mode || "On-site",
            type: i.type || "Paid",
            stipend: i.type === "Paid" ? "BDT 20,000/mo" : "Unpaid",
            deadline: i.deadline ? new Date(i.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "May 20, 2027",
            postedAgo: "Posted recently",
            applicants: i.totalApplicants ?? 0,
            shortlisted: i.shortlisted ?? 0,
            interviewing: i.interviewing ?? 0,
          }));
          setListings(mapped);
        }
      })
      .catch(() => {
        setListings([]);
      });
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await postInternship({
        title: title.trim(),
        description: description.trim() || `Exciting internship opportunity for ${title}.`,
        type: type === "Paid" ? "Paid" : "Unpaid",
        mode: mode === "Remote" ? "Remote" : "On-site",
        deadline,
      });

      const newItem: InternshipCardItem = {
        id: `post-${Date.now()}`,
        title: title.trim(),
        status: "Active & Accepting Applications",
        mode,
        type,
        stipend: type === "Paid" ? `BDT ${stipend}/mo` : "Unpaid",
        deadline: new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        postedAgo: "Just now",
        applicants: 0,
        shortlisted: 0,
        interviewing: 0,
      };

      setListings((prev) => [newItem, ...prev]);
      setCreateMode(false);
      setTitle("");
      setToastMessage("Internship published successfully and live for students!");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to post internship.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to close/delete this role?")) {
      setListings((prev) => prev.filter((i) => i.id !== id));
      deleteCompanyInternship(id).catch(() => {});
      setToastMessage("Internship removed from active listings.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const counts = {
    active: listings.filter((i) => i.status === "Active & Accepting Applications").length,
    drafts: listings.filter((i) => i.status === "Draft").length,
    closed: listings.filter((i) => i.status === "Closed / Expired").length || 3, // demonstration count 3 as specified
  };

  const filtered = listings.filter((i) => {
    if (activeTab === "active") return i.status === "Active & Accepting Applications";
    if (activeTab === "drafts") return i.status === "Draft";
    if (activeTab === "closed") return i.status === "Closed / Expired";
    return true;
  });

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Creation Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Internship Listings
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage active openings, draft roles, and view historical applicant volume.
          </p>
        </div>

        <button
          onClick={() => setCreateMode(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all self-start sm:self-auto flex items-center gap-2"
        >
          <span>+ Create New Internship</span>
        </button>
      </div>

      {/* 2. Tabbed Status Filter */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "active"
              ? "bg-white text-indigo-600 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Active Openings ({counts.active})
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "drafts"
              ? "bg-white text-indigo-600 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Drafts ({counts.drafts})
        </button>
        <button
          onClick={() => setActiveTab("closed")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "closed"
              ? "bg-white text-indigo-600 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Closed / Expired ({counts.closed})
        </button>
      </div>

      {/* CREATE MODAL / DRAWER */}
      {createMode && (
        <div className="bg-white rounded-3xl border border-indigo-200 p-6 lg:p-8 shadow-xl space-y-5 animate-scale-up">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create New Internship Vacancy</h2>
              <p className="text-xs text-slate-500 mt-0.5">Post an opening to receive applicants from top university candidates.</p>
            </div>
            <button
              onClick={() => setCreateMode(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Cancel ✕
            </button>
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Infrastructure Intern"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cloud Engineering & DevOps"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                >
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site (Dhaka)</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Compensation
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Stipend Amount (BDT/mo)
                </label>
                <input
                  type="text"
                  disabled={type === "Unpaid"}
                  value={type === "Unpaid" ? "0" : stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Application Deadline *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Role Description & Requirements
              </label>
              <textarea
                rows={3}
                placeholder="Overview of day-to-day responsibilities, learning roadmap, and team mentorship..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs text-slate-800 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCreateMode(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                {submitting ? "Publishing..." : "Publish Internship ↗"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Listing Management Cards */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const isItem2 = item.title.includes("Cybersecurity");

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {item.title}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      🟢 {item.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-700 font-semibold">
                      {item.mode}
                    </span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                      Paid ({item.stipend})
                    </span>
                    <span>·</span>
                    <span>Deadline: {item.deadline}</span>
                    <span>·</span>
                    <span className="text-slate-400">{item.postedAgo}</span>
                  </div>
                </div>

                {/* Candidate Funnel Counter */}
                <div className="flex items-center gap-2 text-xs self-start sm:self-center">
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-bold text-xs">
                    {item.applicants} {item.applicants === 1 ? "Applicant" : "Applicants"}
                  </span>
                  <span className="bg-blue-50 px-3 py-1 rounded-full text-blue-700 font-bold text-xs">
                    {item.shortlisted} Shortlisted
                  </span>
                  <span className="bg-amber-50 px-3 py-1 rounded-full text-amber-700 font-bold text-xs">
                    {item.interviewing} Interviewing
                  </span>
                </div>
              </div>

              {/* Action Group */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isItem2 ? (
                    <button
                      onClick={() => navigate("co-applicants")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      View Applicants ({item.applicants})
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("co-applicants")}
                      className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors"
                    >
                      View Applicants ({item.applicants})
                    </button>
                  )}

                  <button
                    onClick={() => setCreateMode(true)}
                    className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Edit Posting
                  </button>
                </div>

                {/* Dropdown Options */}
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                    className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>More Options</span>
                    <span className="text-[10px]">▾</span>
                  </button>

                  {openDropdownId === item.id && (
                    <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-slate-50 text-xs">
                      <button
                        onClick={() => {
                          alert(`Listing "${item.title}" is paused.`);
                          setOpenDropdownId(null);
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        ⏸ Pause Listing
                      </button>
                      <button
                        onClick={() => {
                          alert(`Duplicated "${item.title}".`);
                          setOpenDropdownId(null);
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        📋 Duplicate Role
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(item.id);
                          setOpenDropdownId(null);
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 text-rose-600 font-medium"
                      >
                        ✕ Close Role
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
