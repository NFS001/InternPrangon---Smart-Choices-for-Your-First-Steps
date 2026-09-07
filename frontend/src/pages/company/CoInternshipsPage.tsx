import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import {
  getMyCompanyInternships,
  postInternship,
  deleteCompanyInternship,
  type ApiCompanyInternship,
} from "../../api/client";

type TabType = "active" | "expired";

export default function CoInternshipsPage({ navigate }: { navigate: Navigate }) {
  const [internships, setInternships] = useState<ApiCompanyInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [createMode, setCreateMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [formError, setFormError] = useState("");

  // Create form state
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [mode, setMode] = useState<"Remote" | "On-site">("Remote");
  const [type, setType] = useState<"Paid" | "Unpaid">("Paid");
  const [stipend, setStipend] = useState("");
  const [duration, setDuration] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [qualifications, setQualifications] = useState("");

  const fetchInternships = () => {
    setLoading(true);
    getMyCompanyInternships()
      .then((res) => {
        setInternships(res.internships || []);
      })
      .catch(() => {
        setInternships([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const tabCounts: Record<TabType, number> = {
    active: internships.filter((i) => i.status === "active").length,
    expired: internships.filter((i) => i.status === "expired").length,
  };

  const filtered = internships.filter((i) => i.status === activeTab);

  async function handlePublish() {
    setFormError("");
    if (!title.trim()) {
      setFormError("Please enter an internship title.");
      return;
    }
    if (!deadline) {
      setFormError("Please select an application deadline.");
      return;
    }

    const fullDescription = [
      description.trim() || `Exciting internship opportunity for ${title}.`,
      department ? `Department: ${department}` : "",
      stipend ? `Stipend: ${stipend}` : "",
      duration ? `Duration: ${duration}` : "",
      responsibilities ? `Responsibilities:\n${responsibilities}` : "",
      qualifications ? `Qualifications:\n${qualifications}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    setPublishing(true);
    try {
      await postInternship({
        title: title.trim(),
        description: fullDescription,
        type,
        mode,
        deadline,
      });

      setCreateMode(false);
      setTitle("");
      setDepartment("");
      setStipend("");
      setDuration("");
      setDeadline("");
      setDescription("");
      setResponsibilities("");
      setQualifications("");
      setToastMessage("Internship published successfully and is now live!");
      fetchInternships();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to post internship.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this internship posting?")) return;
    try {
      await deleteCompanyInternship(id);
      setToastMessage("Internship deleted successfully.");
      fetchInternships();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete internship.");
    }
  }

  useEffect(() => {
    if (toastMessage) {
      const id = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(id);
    }
  }, [toastMessage]);

  /* ── CREATE FORM ── */
  if (createMode) {
    return (
      <div className="min-h-screen bg-neutral-50 px-6 py-8 lg:px-8 lg:py-10 max-w-4xl mx-auto">
        {toastMessage && (
          <div className="fixed top-5 right-5 bg-success-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in">
            {toastMessage}
          </div>
        )}

        <button
          onClick={() => setCreateMode(false)}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand-700 mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to listings
        </button>

        <h1
          className="text-2xl lg:text-3xl text-neutral-900 mb-6"
          style={{
            fontFamily: "Fraunces, serif",
            fontStyle: "italic",
            fontVariationSettings: "'opsz' 72, 'wght' 700",
          }}
        >
          Post a new internship
        </h1>

        {formError && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-xl text-sm mb-6">
            {formError}
          </div>
        )}

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
          {/* Title */}
          <FormField label="Internship Title *" hint="The official role title for this opportunity.">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Full Stack Developer Intern"
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </FormField>

          {/* Department */}
          <FormField label="Department" hint="The team or division this intern joins.">
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Engineering, Product Design, Marketing"
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </FormField>

          {/* Work Mode */}
          <FormField label="Work Mode *" hint="Work environment for the candidate.">
            <div className="flex gap-2">
              {(["Remote", "On-site"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    mode === m
                      ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                      : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </FormField>

          {/* Type / Compensation */}
          <FormField label="Compensation *" hint="Select Paid or Unpaid opportunity.">
            <div className="flex gap-2">
              {(["Paid", "Unpaid"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    type === t
                      ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                      : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </FormField>

          {/* Stipend if Paid */}
          {type === "Paid" && (
            <FormField label="Stipend / Salary" hint="Monthly compensation amount.">
              <input
                type="text"
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                placeholder="e.g. BDT 15,000 - 25,000 / month"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </FormField>
          )}

          {/* Duration */}
          <FormField label="Duration" hint="Expected duration of the internship.">
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 3 months (Flexible)"
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </FormField>

          {/* Deadline */}
          <FormField label="Application Deadline *" hint="Date after which new applications are closed.">
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </FormField>

          {/* Description */}
          <FormField label="Job Description *" hint="Provide an overview of the role, team, and learning opportunities.">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the opportunity, key missions, and what the intern will learn..."
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </FormField>

          {/* Responsibilities */}
          <FormField label="Responsibilities" hint="Key tasks the intern will handle.">
            <textarea
              rows={3}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              placeholder="• Build user interfaces with React\n• Collaborate with the backend engineering team"
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </FormField>

          {/* Qualifications */}
          <FormField label="Requirements & Skills" hint="Preferred skills, tools, or major.">
            <textarea
              rows={3}
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              placeholder="• Familiarity with JavaScript, React, or Node.js\n• Passion for learning and problem solving"
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </FormField>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setCreateMode(false)}
              className="px-5 py-2.5 border border-neutral-200 text-neutral-600 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={publishing}
              onClick={handlePublish}
              className="px-8 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-all disabled:opacity-50 shadow-sm"
            >
              {publishing ? "Publishing..." : "Publish internship"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── LIST VIEW ── */
  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-8 lg:px-8 lg:py-10 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-success-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50">
          {toastMessage}
        </div>
      )}

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
            Internship listings
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Manage active and past vacancy posts.</p>
        </div>
        <button
          onClick={() => setCreateMode(true)}
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create new internship
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl w-fit mb-7">
        {(["active", "expired"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-white text-brand-700 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span
              className={`ml-1.5 text-xs rounded-full px-2 py-0.5 font-bold ${
                activeTab === tab ? "bg-brand-100 text-brand-700" : "bg-neutral-200 text-neutral-500"
              }`}
            >
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Cards list */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-neutral-400">
            Loading your internship postings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-neutral-300 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-bold text-neutral-800 text-base mb-1">No {activeTab} internships found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5">
              {activeTab === "active"
                ? "You have no active listings. Post an internship to start receiving applications from qualified students."
                : "No expired internships found in your archives."}
            </p>
            {activeTab === "active" && (
              <button
                onClick={() => setCreateMode(true)}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                + Post new internship
              </button>
            )}
          </div>
        ) : (
          filtered.map((internship) => (
            <InternshipRowCard
              key={internship._id}
              internship={internship}
              navigate={navigate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ── Internship row card ── */
function InternshipRowCard({
  internship,
  navigate,
  onDelete,
}: {
  internship: ApiCompanyInternship;
  navigate: Navigate;
  onDelete: (id: string) => void;
}) {
  const { _id, title, status, type, mode, deadline, daysLeft, totalApplicants, shortlisted, interviewing, applied } = internship;

  const deadlineFormatted = deadline
    ? new Date(deadline).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Open";

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h2 className="font-bold text-neutral-900 text-base">{title}</h2>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                status === "active"
                  ? "bg-success-100 text-success-700"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {status === "active" ? "Active" : "Expired"}
            </span>
            {daysLeft > 0 && daysLeft <= 3 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-danger-100 text-danger-600">
                Closing in {daysLeft}d!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3 flex-wrap">
            <span className="font-medium text-neutral-700">{mode}</span>
            <span>&middot;</span>
            <span className={type === "Paid" ? "text-success-600 font-semibold" : "text-neutral-500"}>
              {type}
            </span>
            <span>&middot;</span>
            <span>Deadline: {deadlineFormatted}</span>
          </div>

          <div className="flex gap-4 text-xs text-neutral-600 mb-2 flex-wrap">
            <span className="bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-100">
              <strong className="text-neutral-900">{totalApplicants || 0}</strong> applicants
            </span>
            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">
              <strong className="text-blue-900">{shortlisted || 0}</strong> shortlisted
            </span>
            <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100">
              <strong className="text-amber-900">{interviewing || 0}</strong> interviewing
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-2 shrink-0">
          <button
            onClick={() => navigate("co-applicants", { internshipId: _id })}
            className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm text-center"
          >
            View applicants ({totalApplicants || 0})
          </button>
          <button
            onClick={() => onDelete(_id)}
            className="px-4 py-2 border border-neutral-200 text-neutral-600 text-xs font-medium rounded-xl hover:bg-danger-50 hover:text-danger-600 hover:border-danger-200 transition-colors text-center"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-800 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
    </div>
  );
}
