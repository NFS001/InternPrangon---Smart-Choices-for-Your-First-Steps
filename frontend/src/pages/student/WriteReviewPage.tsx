import { useState, useEffect } from "react";
import type { Navigate } from "../../data/index";
import { COMPANIES } from "../../data/index";
import {
  getCompanyDirectory,
  submitCompanyReview,
  submitCompanyStipend,
  submitInterviewExperience,
  type ApiCompanyDirectoryItem,
} from "../../api/client";

interface Props {
  navigate: Navigate;
}

type ReviewType = "Internship Experience" | "Interview Experience";
type InterviewTypeOption = "Online" | "Phone" | "On-site" | "Video call";
type DifficultyOption = "Easy" | "Medium" | "Hard";
type OutcomeOption = "Selected" | "Rejected" | "Waiting" | "Prefer not to say";

function StarRating({
  value,
  onChange,
  size = "medium",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "small" | "medium" | "large";
}) {
  const [hovered, setHovered] = useState(0);

  const starSizes = {
    small: "w-5 h-5",
    medium: "w-7 h-7",
    large: "w-9 h-9",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`${starSizes[size]} transition-transform hover:scale-110 focus:outline-none`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={(hovered || value) >= star ? "#f59e0b" : "none"}
            stroke={(hovered || value) >= star ? "#f59e0b" : "#d1d5db"}
            strokeWidth={1.5}
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function WriteReviewPage({ navigate }: Props) {
  const [reviewType, setReviewType] = useState<ReviewType>("Internship Experience");
  const [companyId, setCompanyId] = useState("");
  const [companiesList, setCompaniesList] = useState<Array<{ id: string; name: string }>>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Internship Experience State ──
  const [overallRating, setOverallRating] = useState(5);
  const [cultureRating, setCultureRating] = useState(4);
  const [mentorshipRating, setMentorshipRating] = useState(4);
  const [recommend, setRecommend] = useState<boolean | null>(true);
  const [unpaid, setUnpaid] = useState(false);
  const [headline, setHeadline] = useState("");
  const [experience, setExperience] = useState("");
  const [stipend, setStipend] = useState("");
  const [duration, setDuration] = useState("");

  // ── Interview Experience State ──
  const [role, setRole] = useState("");
  const [interviewType, setInterviewType] = useState<InterviewTypeOption>("Online");
  const [rounds, setRounds] = useState("2");
  const [difficulty, setDifficulty] = useState<DifficultyOption>("Medium");
  const [process, setProcess] = useState("");
  const [questions, setQuestions] = useState("");
  const [tips, setTips] = useState("");
  const [outcome, setOutcome] = useState<OutcomeOption>("Selected");
  const [interviewDate, setInterviewDate] = useState("");

  const reviewTypes: ReviewType[] = ["Internship Experience", "Interview Experience"];
  const interviewTypes: InterviewTypeOption[] = ["Online", "Phone", "On-site", "Video call"];
  const difficultyOptions: DifficultyOption[] = ["Easy", "Medium", "Hard"];
  const outcomeOptions: OutcomeOption[] = ["Selected", "Rejected", "Waiting", "Prefer not to say"];

  useEffect(() => {
    getCompanyDirectory({ limit: 100 })
      .then((res) => {
        if (res.companies && res.companies.length > 0) {
          const mapped = res.companies.map((c: ApiCompanyDirectoryItem) => ({
            id: c._id,
            name: c.companyName,
          }));
          setCompaniesList(mapped);
          if (mapped.length > 0) {
            setCompanyId(mapped[0].id);
          }
        } else {
          setCompaniesList(COMPANIES.map((c) => ({ id: String(c.id), name: c.name })));
        }
      })
      .catch(() => {
        setCompaniesList(COMPANIES.map((c) => ({ id: String(c.id), name: c.name })));
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) {
      setErrorMsg("Please select a company.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      if (reviewType === "Internship Experience") {
        if (!headline.trim() || !experience.trim()) {
          setErrorMsg("Please provide both a headline and your internship experience.");
          setSubmitting(false);
          return;
        }

        const reviewText = `${headline.trim()}: ${experience.trim()}`;
        await submitCompanyReview(companyId, overallRating || 5, reviewText);

        if (!unpaid && stipend) {
          const num = Number(stipend.replace(/[^0-9]/g, ""));
          if (!isNaN(num) && num > 0) {
            await submitCompanyStipend(companyId, num).catch(() => {});
          }
        }
      } else {
        // Interview Experience
        if (!role.trim()) {
          setErrorMsg("Please specify the position / internship role.");
          setSubmitting(false);
          return;
        }
        if (!process.trim()) {
          setErrorMsg("Please describe your interview process.");
          setSubmitting(false);
          return;
        }

        await submitInterviewExperience(companyId, {
          role: role.trim(),
          interviewType,
          rounds: rounds.trim() || "1",
          difficulty,
          process: process.trim(),
          questions: questions.trim() || process.trim(),
          tips: tips.trim(),
          outcome,
          interviewDate: interviewDate.trim(),
        });
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    const isInterview = reviewType === "Interview Experience";
    return (
      <div className="max-w-2xl mx-auto px-5 py-8 lg:px-8 lg:py-10">
        <div className="bg-success-50 border border-success-200 rounded-3xl p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-success-800 mb-2">
            {isInterview ? "Interview Experience Submitted!" : "Review Submitted!"}
          </h2>
          <p className="text-success-700 font-medium mb-1">
            You earned <span className="font-bold text-success-900">+5 contributor points</span> for your contribution.
          </p>
          <p className="text-success-600 text-sm mb-6">
            {isInterview
              ? "Your anonymous interview report helps university students prepare effectively and ace their hiring rounds."
              : "Your anonymous contribution helps thousands of university students make informed career choices."}
          </p>
          <div className="flex justify-center flex-wrap gap-3">
            <button
              onClick={() => navigate("reviews")}
              className="px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors text-sm shadow-sm"
            >
              View in Reviews →
            </button>
            <button
              onClick={() => navigate("contributors")}
              className="px-5 py-2.5 bg-success-600 text-white font-semibold rounded-xl hover:bg-success-700 transition-colors text-sm shadow-sm"
            >
              View Leaderboard
            </button>
            <button
              onClick={() => navigate("dashboard")}
              className="px-5 py-2.5 bg-white border border-success-300 text-success-800 font-semibold rounded-xl hover:bg-success-50 transition-colors text-sm shadow-sm"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isInterview = reviewType === "Interview Experience";

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 lg:px-8 lg:py-10">
      {/* Title */}
      <h1
        className="text-2xl text-brand-700 mb-2"
        style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic" }}
      >
        {isInterview ? "Write an Interview Experience" : "Write a Review"}
      </h1>
      <p className="text-neutral-500 text-sm mb-6">
        {isInterview
          ? "Help other students prepare for their interviews."
          : "Help other students make informed decisions."}
      </p>

      {/* Anonymity notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <span className="text-amber-500 text-lg flex-shrink-0">🔒</span>
        <div className="text-amber-900 text-sm">
          <p className="font-semibold">Your name will not be displayed.</p>
          <p className="text-xs text-amber-800/90 mt-0.5">
            {isInterview
              ? "Interview experiences are anonymous. Earn +5 points and level up your badge!"
              : "Reviews are fully anonymous. Earn +5 points and level up your contributor badge!"}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Company name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Company name <span className="text-danger-600">*</span>
          </label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
            className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          >
            <option value="">Select a company...</option>
            {companiesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Review type toggle */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Review type</label>
          <div className="flex gap-2">
            {reviewTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setReviewType(type);
                  setErrorMsg("");
                }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                  reviewType === type
                    ? "bg-brand-600 text-white border-brand-600 font-semibold shadow-sm"
                    : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* ─── INTERVIEW EXPERIENCE FIELDS ─── */}
        {isInterview ? (
          <>
            {/* Position / Internship role */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Position / Internship role <span className="text-danger-600">*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                placeholder="e.g. Software Engineering Intern"
                className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>

            {/* Interview type pills */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Interview type <span className="text-danger-600">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {interviewTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInterviewType(t)}
                    className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-colors ${
                      interviewType === t
                        ? "bg-brand-600 text-white border-brand-600 font-semibold shadow-sm"
                        : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of rounds */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Number of rounds
              </label>
              <input
                type="text"
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
                placeholder="e.g. 3"
                className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Difficulty <span className="text-danger-600">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {difficultyOptions.map((diff) => {
                  const isSelected = difficulty === diff;
                  const activeClass =
                    diff === "Easy"
                      ? "bg-emerald-600 text-white border-emerald-600 font-semibold shadow-sm"
                      : diff === "Medium"
                      ? "bg-amber-600 text-white border-amber-600 font-semibold shadow-sm"
                      : "bg-rose-600 text-white border-rose-600 font-semibold shadow-sm";

                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2.5 text-sm rounded-xl border transition-colors ${
                        isSelected
                          ? activeClass
                          : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interview process */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Interview process <span className="text-danger-600">*</span>
              </label>
              <textarea
                rows={4}
                value={process}
                onChange={(e) => setProcess(e.target.value)}
                required
                placeholder="Describe what happened during the interview, including the different rounds and what you were asked..."
                className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Questions asked */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Questions asked
              </label>
              <textarea
                rows={3}
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                placeholder="Share technical, behavioral, or other questions you remember..."
                className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Tips for future candidates */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Tips for future candidates
              </label>
              <textarea
                rows={3}
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                placeholder="What should another student prepare for before applying/interviewing?"
                className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Outcome
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {outcomeOptions.map((out) => (
                  <button
                    key={out}
                    type="button"
                    onClick={() => setOutcome(out)}
                    className={`py-2 px-3 text-xs sm:text-sm rounded-xl border transition-colors ${
                      outcome === out
                        ? "bg-brand-600 text-white border-brand-600 font-semibold shadow-sm"
                        : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {out}
                  </button>
                ))}
              </div>
            </div>

            {/* Interview date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Interview date (optional)
              </label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>

            {/* Submit Interview Experience Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {submitting
                ? "Submitting interview experience..."
                : "Submit anonymous interview experience (+5 points)"}
            </button>
          </>
        ) : (
          /* ─── INTERNSHIP EXPERIENCE FIELDS ─── */
          <>
            {/* Overall star rating */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Overall rating <span className="text-danger-600">*</span>
              </label>
              <StarRating value={overallRating} onChange={setOverallRating} size="large" />
              {overallRating > 0 && (
                <p className="text-xs text-neutral-400 mt-1">
                  {["", "Poor", "Below average", "Average", "Good", "Excellent"][overallRating]}
                </p>
              )}
            </div>

            {/* Headline */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Headline <span className="text-danger-600">*</span>
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                required
                placeholder="Summarize your experience in one line"
                className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>

            {/* Experience textarea */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Your experience <span className="text-danger-600">*</span>
              </label>
              <textarea
                rows={4}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
                placeholder="Describe your internship experience honestly..."
                className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Sub-ratings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Work culture</label>
                <StarRating value={cultureRating} onChange={setCultureRating} size="small" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Mentorship</label>
                <StarRating value={mentorshipRating} onChange={setMentorshipRating} size="small" />
              </div>
            </div>

            {/* Recommend */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Would you recommend?</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRecommend(true)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                    recommend === true
                      ? "bg-green-600 text-white border-green-600 font-semibold shadow-sm"
                      : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  👍 Yes
                </button>
                <button
                  type="button"
                  onClick={() => setRecommend(false)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                    recommend === false
                      ? "bg-red-600 text-white border-red-600 font-semibold shadow-sm"
                      : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  👎 No
                </button>
              </div>
            </div>

            {/* Stipend */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Stipend</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    disabled={unpaid}
                    placeholder="e.g. 15000"
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent disabled:bg-neutral-50 disabled:text-neutral-400"
                  />
                </div>
                <span className="text-sm text-neutral-500 flex-shrink-0">BDT/month</span>
                <label className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={unpaid}
                    onChange={(e) => {
                      setUnpaid(e.target.checked);
                      if (e.target.checked) setStipend("");
                    }}
                    className="w-4 h-4 accent-brand-600"
                  />
                  <span className="text-sm text-neutral-600">Unpaid</span>
                </label>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3 months"
                className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>

            {/* Submit Internship Review Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {submitting ? "Submitting review..." : "Submit anonymous review (+5 points)"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
