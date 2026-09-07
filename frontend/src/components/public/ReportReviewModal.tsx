import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { flagReview, getSavedUser } from "../../api/client";

export interface ReportTargetReview {
  id: string | number;
  company: string;
  rating?: number;
  content: string;
  anonymous?: string;
}

interface ReportReviewModalProps {
  review: ReportTargetReview | null;
  onClose: () => void;
  onSuccess: (reviewId: string | number) => void;
  onRequireAuth?: () => void;
}

const REPORT_REASONS = [
  {
    id: "Fake or misleading",
    label: "Fake or misleading",
    desc: "Contains false claims, fabricated experiences, or dishonest ratings.",
  },
  {
    id: "Spam",
    label: "Spam",
    desc: "Promotional material, irrelevant advertising, or repetitive text.",
  },
  {
    id: "Inappropriate content",
    label: "Inappropriate content",
    desc: "Offensive language, hate speech, harassment, or confidential information.",
  },
  {
    id: "Other",
    label: "Other",
    desc: "Any other violation of community guidelines.",
  },
];

export default function ReportReviewModal({
  review,
  onClose,
  onSuccess,
  onRequireAuth,
}: ReportReviewModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("Fake or misleading");
  const [customDetail, setCustomDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!review) return null;

  const user = getSavedUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg("Please sign in as a student to submit this report.");
      if (onRequireAuth) {
        setTimeout(onRequireAuth, 1200);
      }
      return;
    }

    if (user.role !== "student") {
      setErrorMsg("Only registered students can flag reviews for moderation.");
      return;
    }

    const finalReason =
      selectedReason === "Other" && customDetail.trim()
        ? `Other: ${customDetail.trim()}`
        : selectedReason;

    setSubmitting(true);

    try {
      const reviewIdStr = String(review.id);
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(reviewIdStr);

      if (isMongoId) {
        await flagReview(reviewIdStr, finalReason);
      } else {
        // Mock / demo reviews simulate successful flagging
        await new Promise((res) => setTimeout(res, 400));
      }

      onSuccess(review.id);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit report.";
      if (message.toLowerCase().includes("already reported") || message.includes("409")) {
        setErrorMsg("You have already reported this review.");
      } else if (message.toLowerCase().includes("own review")) {
        setErrorMsg("You cannot report your own review.");
      } else {
        setErrorMsg(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      style={{ minHeight: "100vh" }}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 leading-snug">Report Review</h3>
              <p className="text-xs text-neutral-500">Flag suspicious reviews for admin moderation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-1.5 -mr-1 -mt-1 rounded-lg hover:bg-neutral-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Review snippet preview */}
        <div className="px-6 py-3.5 bg-neutral-50 border-b border-neutral-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-neutral-800">{review.company}</span>
            <span className="text-neutral-400">— {review.anonymous || "Anonymous"}</span>
          </div>
          <p className="text-xs text-neutral-600 italic line-clamp-2 leading-relaxed">
            "{review.content}"
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {!user && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-amber-600">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Please sign in as a student to submit a report.</span>
              </div>
              {onRequireAuth && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequireAuth();
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] shrink-0 transition shadow-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          )}

          {user && user.role !== "student" && (
            <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-neutral-600 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-neutral-500">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Only registered student accounts can submit reports for moderation. (Signed in as: {user.role})</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Why are you reporting this review?
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === opt.id
                      ? "bg-red-50/50 border-red-300 ring-1 ring-red-300"
                      : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={opt.id}
                    checked={selectedReason === opt.id}
                    onChange={() => setSelectedReason(opt.id)}
                    className="mt-0.5 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-900">{opt.label}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === "Other" && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Additional explanation (optional):
              </label>
              <textarea
                value={customDetail}
                onChange={(e) => setCustomDetail(e.target.value)}
                placeholder="Provide details about why this review should be moderated…"
                rows={2}
                maxLength={500}
                className="w-full text-xs p-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent placeholder:text-neutral-400 resize-none"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Anonymity notice */}
          <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Review and report moderation remain anonymous to other students and companies.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-semibold text-neutral-700 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
