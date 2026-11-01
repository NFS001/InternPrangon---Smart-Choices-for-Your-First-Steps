import { useState, useEffect } from "react"
import type { Navigate } from "../../data/index"
import { CompanyLogo } from "../../components/common/CompanyLogos"
import { getMyBookmarks, removeBookmark } from "../../api/client"

interface Props {
  navigate: Navigate
}

function urgencyLabel(daysLeft: number): { label: string color: string } {
  if (daysLeft === 0)
    return {
      label: "Deadline today",
      color: "text-red-700 bg-red-50 border-red-200",
    }
  if (daysLeft === 1)
    return {
      label: "Deadline tomorrow",
      color: "text-red-700 bg-red-50 border-red-200",
    }
  if (daysLeft <= 3)
    return {
      label: `Deadline in ${daysLeft} days`,
      color: "text-orange-700 bg-orange-50 border-orange-200",
    }
  if (daysLeft <= 7)
    return {
      label: `Deadline in ${daysLeft} days`,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    }
  return {
    label: `${daysLeft} days left`,
    color: "text-slate-600 bg-slate-100 border-slate-200",
  }
}

interface SavedItem {
  id: number
  backendId: string
  role: string
  company: string
  tags: string[]
  type: string
  paid: boolean
  stipend: string
  daysLeft: number
}

const DEFAULT_SAVED: SavedItem[] = [
  {
    id: 1,
    backendId: "saved-bs23",
    role: "Frontend React Engineer Intern",
    company: "Brain Station 23",
    tags: ["React", "TypeScript", "Tailwind CSS"],
    type: "Hybrid",
    paid: true,
    stipend: "BDT 25,000/mo",
    daysLeft: 5,
  },
]

export default function SavedPage({ navigate }: Props) {
  const [savedList, setSavedList] = useState<SavedItem[]>(DEFAULT_SAVED)

  useEffect(() => {
    getMyBookmarks()
      .then((res) => {
        if (res.bookmarks && res.bookmarks.length > 0) {
          const items = res.bookmarks
            .filter((b) => b.internship)
            .map((b, idx) => {
              const daysLeft = Math.max(
                0,
                Math.ceil(
                  (new Date(b.internship.deadline).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                ),
              )
              return {
                id: idx + 100,
                backendId: b.internship._id,
                role: b.internship.title,
                company: "Brain Station 23",
                tags: [b.internship.type, b.internship.mode],
                type: b.internship.mode,
                paid: b.internship.type === "Paid",
                stipend:
                  b.internship.type === "Paid" ? "BDT 25,000/mo" : "Unpaid",
                daysLeft,
              }
            })
          setSavedList(items.length > 0 ? items : DEFAULT_SAVED)
        }
      })
      .catch(() => {
        setSavedList(DEFAULT_SAVED)
      })
  }, [])

  const handleUnsave = (backendId: string) => {
    setSavedList((prev) => prev.filter((item) => item.backendId !== backendId))
    if (backendId) {
      removeBookmark(backendId).catch(() => {})
    }
  }

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          Saved Roles
        </h1>
        <p className="text-slate-500 text-sm lg:text-base mt-1">
          Review bookmarked internship openings and apply before application
          deadlines close.
        </p>
      </div>

      {savedList.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">🔖</div>
          <h2 className="text-base font-bold text-slate-800">
            No saved roles yet
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Browse open internships and click the bookmark icon to save roles
            for quick review.
          </p>
          <button
            onClick={() => navigate("internships")}
            className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Explore Internships
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedList.map((internship) => {
            const urgency = urgencyLabel(internship.daysLeft)
            return (
              <div
                key={internship.backendId || internship.id}
                className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <CompanyLogo
                    name={internship.company}
                    size={46}
                    className="shadow-xs shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-bold text-slate-900 text-sm md:text-base leading-snug">
                          {internship.role}
                        </h2>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5">
                          {internship.company} · {internship.type}
                        </p>
                      </div>

                      <button
                        onClick={() => handleUnsave(internship.backendId)}
                        className="text-amber-500 hover:text-red-500 transition-colors p-1"
                        title="Remove bookmark"
                      >
                        <svg
                          className="w-5 h-5 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z" />
                        </svg>
                      </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {internship.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                        {internship.stipend}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${urgency.color}`}
                      >
                        {urgency.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() =>
                      navigate("internship-detail", { id: internship.id })
                    }
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    1-Click Apply →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
