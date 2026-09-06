import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import { INTERNSHIPS, CURRENT_STUDENT } from "../../data/index";
import { getMyBookmarks, removeBookmark } from "../../api/client";

interface Props {
  navigate: Navigate;
}

function urgencyLabel(daysLeft: number): { label: string; color: string } {
  if (daysLeft === 0) return { label: "Deadline today", color: "text-red-600 bg-danger-50" };
  if (daysLeft === 1) return { label: "Deadline tomorrow", color: "text-red-600 bg-danger-50" };
  if (daysLeft <= 3) return { label: `Deadline in ${daysLeft} days`, color: "text-orange-600 bg-orange-50" };
  if (daysLeft <= 7) return { label: `Deadline in ${daysLeft} days`, color: "text-amber-600 bg-amber-50" };
  return { label: `${daysLeft} days left`, color: "text-neutral-600 bg-neutral-100" };
}

export default function SavedPage({ navigate }: Props) {
  const [savedList, setSavedList] = useState<Array<{
    id: number;
    backendId: string;
    role: string;
    company: string;
    logo: string;
    logoBg: string;
    logoColor: string;
    tags: string[];
    type: string;
    paid: boolean;
    stipend: string;
    daysLeft: number;
  }>>([]);

  useEffect(() => {
    getMyBookmarks()
      .then((res) => {
        const items = (res.bookmarks || [])
          .filter((b) => b.internship)
          .map((b, idx) => {
            const daysLeft = Math.max(
              0,
              Math.ceil(
                (new Date(b.internship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
            );
            return {
              id: idx + 100,
              backendId: b.internship._id,
              role: b.internship.title,
              company: "Company Partner",
              logo: b.internship.title.slice(0, 2).toUpperCase(),
              logoBg: "#f5f3ff",
              logoColor: "#7c3aed",
              tags: [b.internship.type, b.internship.mode],
              type: b.internship.mode,
              paid: b.internship.type === "Paid",
              stipend: b.internship.type === "Paid" ? "BDT 15,000/mo" : "Unpaid",
              daysLeft,
            };
          });
        setSavedList(items);
      })
      .catch(() => {
        setSavedList([]);
      });
  }, []);

  const handleUnsave = (backendId: string) => {
    setSavedList((prev) => prev.filter((item) => item.backendId !== backendId));
    if (backendId) {
      removeBookmark(backendId).catch(() => {});
    }
  };

  const saved = savedList;

  if (saved.length === 0) {
    return (
      <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-3xl mx-auto">
        <h1
          className="text-2xl text-brand-700 mb-8"
          style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic" }}
        >
          Saved Internships
        </h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🔖</div>
          <p className="text-neutral-600 font-medium mb-1">No saved internships yet.</p>
          <p className="text-neutral-400 text-sm">Browse and bookmark ones you like.</p>
          <button
            onClick={() => navigate("internships")}
            className="mt-6 px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors"
          >
            Browse internships
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 max-w-3xl mx-auto">
      <h1
        className="text-2xl text-brand-700 mb-2"
        style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic" }}
      >
        Saved Internships
      </h1>
      <p className="text-neutral-500 text-sm mb-8">{saved.length} saved</p>

      <div className="flex flex-col gap-4">
        {saved.map((internship) => {
          const urgency = urgencyLabel(internship.daysLeft);
          return (
            <div
              key={internship.id}
              className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {/* Logo */}
                <div
                  className="w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: internship.logoBg, color: internship.logoColor }}
                >
                  {internship.logo}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-neutral-800 text-base leading-tight">{internship.role}</h3>
                      <p className="text-neutral-500 text-sm mt-0.5">{internship.company}</p>
                    </div>
                    <button
                      onClick={() => handleUnsave(internship.backendId)}
                      className="text-amber-500 hover:text-danger-500 transition-colors flex-shrink-0 mt-0.5"
                      title="Remove bookmark"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
                      </svg>
                    </button>
                  </div>

                  {/* Tags: max 2 on mobile, 3 on desktop */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {internship.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {internship.tags[2] && (
                      <span className="hidden md:inline text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
                        {internship.tags[2]}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full">
                      {internship.type}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${urgency.color}`}>
                      {urgency.label}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {internship.paid ? internship.stipend : "Unpaid"}
                    </span>
                  </div>

                  {/* View details: full-width on mobile */}
                  <div className="mt-3">
                    <button
                      onClick={() => navigate("internship-detail", { id: internship.id })}
                      className="w-full md:w-auto md:float-right text-sm text-brand-600 font-medium hover:underline border border-brand-200 md:border-0 rounded-lg py-2 md:py-0 text-center md:text-right"
                    >
                      View details →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
