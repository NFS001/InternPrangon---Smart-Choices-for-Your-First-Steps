import { useState, useEffect } from "react";
import type { Navigate } from "../data/index";
import { INTERNSHIPS } from "../data/index";
import Button from "../components/ds/Button";
import {
  getMyBookmarks,
  addBookmark,
  removeBookmark,
  applyToInternship,
  getMyApplications,
  searchInternships,
  getSavedUser
} from "../api/client";

interface Props {
  navigate: Navigate;
  id?: number;
  backendId?: string;
}

function UrgencyLabel({ daysLeft, deadline }: { daysLeft: number; deadline: string }) {
  if (daysLeft === 0) {
    return (
      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-100 text-danger-700">
        Deadline today
      </span>
    );
  }
  if (daysLeft === 1) {
    return (
      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-100 text-danger-700">
        Deadline tomorrow
      </span>
    );
  }
  if (daysLeft <= 3) {
    return (
      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-warning-100 text-warning-700">
        Deadline in {daysLeft} days
      </span>
    );
  }
  if (daysLeft <= 7) {
    return (
      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-700">
        {daysLeft} days left
      </span>
    );
  }
  return (
    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600">
      Deadline: {deadline}
    </span>
  );
}

function BulletList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-neutral-500 text-sm italic">Standard requirements apply for this role.</p>
    );
  }
  return (
    <ul className="space-y-1.5 lg:space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-neutral-600 text-sm leading-relaxed">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0"></span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function InternshipDetailPage({ navigate, id, backendId: initialBackendId }: Props) {
  const staticIntern = INTERNSHIPS.find((i) => i.id === id) ?? INTERNSHIPS[0];
  const [intern, setIntern] = useState(staticIntern);
  const [resolvedBackendId, setResolvedBackendId] = useState<string | undefined>(initialBackendId);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string; action?: () => void; actionLabel?: string } | null>(null);

  // 1. Sync static intern whenever id or initialBackendId prop changes
  useEffect(() => {
    const currentStatic = INTERNSHIPS.find((i) => i.id === id) ?? INTERNSHIPS[0];
    setIntern(currentStatic);
    setResolvedBackendId(initialBackendId);
    setSaved(false);
    setApplied(false);
    setNotice(null);
  }, [id, initialBackendId]);

  // 2. Resolve MongoDB internship ID and sync live status
  useEffect(() => {
    searchInternships()
      .then((res) => {
        if (res.internships && res.internships.length > 0) {
          const currentStatic = INTERNSHIPS.find((i) => i.id === id) ?? INTERNSHIPS[0];
          const found = initialBackendId
            ? res.internships.find((i) => i._id === initialBackendId)
            : res.internships.find(
                (i) => i.title.toLowerCase() === currentStatic.role.toLowerCase()
              ) || res.internships[0];

          if (found) {
            setResolvedBackendId(found._id);
            setIntern((prev) => ({
              ...prev,
              role: found.title || prev.role,
              description: found.description || prev.description,
              type: (found.mode as "Remote" | "On-site" | "Hybrid") || prev.type,
              paid: found.type === "Paid",
            }));
          }
        }
      })
      .catch(() => {});
  }, [id, initialBackendId]);

  // 2. Sync bookmark and application status
  useEffect(() => {
    if (!resolvedBackendId) return;

    getMyBookmarks().then((res) => {
      const isBookmarked = res.bookmarks?.some(
        (b) => b.internship?._id === resolvedBackendId
      );
      if (isBookmarked) setSaved(true);
    }).catch(() => {});

    getMyApplications().then((res) => {
      const isApplied = res.applications?.some(
        (a) => (typeof a.internship === "object" ? a.internship?._id : a.internship) === resolvedBackendId
      );
      if (isApplied) setApplied(true);
    }).catch(() => {});
  }, [resolvedBackendId]);

  const handleToggleSave = async () => {
    const user = getSavedUser();
    if (!user) {
      setNotice({
        type: "error",
        message: "Please log in to save internships.",
        action: () => navigate("login"),
        actionLabel: "Log in"
      });
      return;
    }

    if (!resolvedBackendId) {
      setSaved((prev) => !prev);
      return;
    }

    try {
      if (saved) {
        setSaved(false);
        await removeBookmark(resolvedBackendId);
      } else {
        setSaved(true);
        await addBookmark(resolvedBackendId);
      }
    } catch {
      // Revert if failed
      setSaved((prev) => !prev);
    }
  };

  const handleApply = async () => {
    const user = getSavedUser();
    if (!user) {
      setNotice({
        type: "error",
        message: "Please log in as a student to apply.",
        action: () => navigate("login"),
        actionLabel: "Log in"
      });
      return;
    }

    if (!resolvedBackendId) {
      setApplied(true);
      setNotice({
        type: "success",
        message: "Application submitted successfully! You can view it in My Applications.",
        action: () => navigate("applications"),
        actionLabel: "View Applications"
      });
      return;
    }

    setApplying(true);
    setNotice(null);

    try {
      await applyToInternship(resolvedBackendId);
      setApplied(true);
      setNotice({
        type: "success",
        message: "Application submitted successfully! You can track your progress in My Applications.",
        action: () => navigate("applications"),
        actionLabel: "My Applications"
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to apply.";
      if (errMsg.toLowerCase().includes("resume")) {
        setNotice({
          type: "error",
          message: "Please upload your resume in your student profile before applying.",
          action: () => navigate("profile"),
          actionLabel: "Upload Resume in Profile"
        });
      } else if (errMsg.toLowerCase().includes("already applied")) {
        setApplied(true);
        setNotice({
          type: "success",
          message: "You have already applied for this role! Track it under My Applications.",
          action: () => navigate("applications"),
          actionLabel: "View Applications"
        });
      } else {
        setNotice({
          type: "error",
          message: errMsg
        });
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 lg:pb-0">
      <div className="max-w-4xl mx-auto px-5 py-6 lg:px-8 lg:py-12">
        {/* Back button */}
        <button
          onClick={() => navigate("internships")}
          className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 mb-6 lg:mb-8 transition-colors py-3 lg:py-0 -mx-1 px-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All internships
        </button>

        {/* Notice banner */}
        {notice && (
          <div
            className={`mb-6 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              notice.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{notice.type === "success" ? "✅" : "⚠️"}</span>
              <p className="text-sm font-medium">{notice.message}</p>
            </div>
            {notice.action && notice.actionLabel && (
              <button
                onClick={notice.action}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-colors ${
                  notice.type === "success"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {notice.actionLabel}
              </button>
            )}
          </div>
        )}

        {/* Header section */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 lg:p-8 mb-6">
          <div className="flex items-start gap-4 lg:gap-5">
            {/* Logo */}
            <div
              className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: intern.logoBg, color: intern.logoColor }}
            >
              {intern.logo}
            </div>

            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl lg:text-3xl text-neutral-900 mb-1"
                style={{
                  fontStyle: "italic",
                  fontVariationSettings: "'opsz' 72, 'wght' 700",
                }}
              >
                {intern.role}
              </h1>
              <p className="text-neutral-500 text-sm mb-3">
                {intern.company} &middot; {intern.location} &middot; {intern.type}
              </p>

              {/* Tags */}
              <div className="flex overflow-x-auto gap-1.5 pb-1 mb-4 -mx-0">
                {intern.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-xs bg-brand-50 text-brand-700 border border-brand-100 whitespace-nowrap shrink-0"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Urgency + paid badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <UrgencyLabel daysLeft={intern.daysLeft} deadline={intern.deadline} />
                {intern.paid ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-700">
                    {intern.stipend ? `Paid • ${intern.stipend}` : "Paid"}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-700">
                    Unpaid
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Left: main content */}
          <div className="w-full lg:flex-1 lg:min-w-0 space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 lg:p-6">
              <h2 className="text-base font-semibold text-neutral-900 mb-3">About this internship</h2>
              <p className="text-neutral-600 text-sm leading-relaxed">{intern.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 lg:p-6">
              <h2 className="text-base font-semibold text-neutral-900 mb-3">Responsibilities</h2>
              <BulletList items={intern.responsibilities} />
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 lg:p-6">
              <h2 className="text-base font-semibold text-neutral-900 mb-3">Requirements</h2>
              <BulletList items={intern.qualifications || (intern as any).requirements || []} />
            </div>

            {/* Perks */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 lg:p-6">
              <h2 className="text-base font-semibold text-neutral-900 mb-3">What we offer</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {((intern as any).perks || [
                  "Mentorship from senior software engineers",
                  "Hands-on experience with live production code",
                  "Certificate of completion upon finishing",
                  "Flexible working hours and hybrid support",
                ]).map((perk: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 text-neutral-700 text-sm">
                    <span className="text-base">✨</span>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Apply & Meta Sidebar */}
          <div className="w-full lg:w-72 lg:shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Duration</span>
                  <span className="font-medium text-neutral-800">{intern.duration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Work mode</span>
                  <span className="font-medium text-neutral-800">{intern.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Compensation</span>
                  <span className="font-medium text-neutral-800">{intern.paid ? intern.stipend : "Unpaid"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Deadline</span>
                  <div className="text-right">
                    <UrgencyLabel daysLeft={intern.daysLeft} deadline={intern.deadline} />
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-3">
                {/* Apply button */}
                <Button
                  fullWidth
                  size="md"
                  variant={applied ? "secondary" : "primary"}
                  disabled={applying || applied}
                  className={applied ? "bg-green-600 text-white hover:bg-green-700" : "bg-accent-500 hover:bg-accent-600"}
                  onClick={handleApply}
                >
                  {applying ? "Submitting..." : applied ? "✓ Applied" : "Apply now"}
                </Button>

                {/* Save for later */}
                <button
                  onClick={handleToggleSave}
                  className={`w-full py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    saved
                      ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {saved ? (
                    <svg className="w-4 h-4 fill-brand-600" viewBox="0 0 24 24">
                      <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
                    </svg>
                  )}
                  {saved ? "Saved" : "Save for later"}
                </button>
              </div>

              {/* Company info */}
              <div className="border-t border-neutral-100 pt-4">
                <p className="text-xs text-neutral-400 mb-2">Posted by</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: intern.logoBg, color: intern.logoColor }}
                  >
                    {intern.logo}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{intern.company}</p>
                    <button
                      onClick={() => navigate("company-detail", { id: intern.companyId })}
                      className="text-xs text-brand-600 hover:text-brand-800 transition-colors"
                    >
                      View company &#8250;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
