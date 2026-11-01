import { useState, useEffect } from "react"
import type { Navigate } from "../../data/index"
import { CURRENT_STUDENT } from "../../data/index"
import {
  getLeaderboard,
  getStudentProfile,
  getSavedUser,
} from "../../api/client"

interface Props {
  navigate: Navigate
}

interface TierLadder {
  name: string
  icon: string
  pointsRange: string
  perks: string
  bg: string
  border: string
  textColor: string
  isCurrent?: boolean
}

interface ContributorRow {
  rank: number
  name: string
  avatar?: string
  university: string
  contributions: number
  points: number
  badgeTier: string
  badgeIcon: string
  isCurrentUser?: boolean
}

const BADGE_TIERS: TierLadder[] = [
  {
    name: "Newbie",
    icon: "🌱",
    pointsRange: "0–99 pts",
    perks: "Standard access & community reviews",
    bg: "bg-indigo-50/70",
    border: "border-indigo-400 ring-2 ring-indigo-500/30",
    textColor: "text-indigo-900",
    isCurrent: true,
  },
  {
    name: "Explorer",
    icon: "🔭",
    pointsRange: "100–299 pts",
    perks: "Unlocks: Early 24h listing access",
    bg: "bg-blue-50/50",
    border: "border-blue-200",
    textColor: "text-blue-900",
  },
  {
    name: "Insider",
    icon: "💡",
    pointsRange: "300–599 pts",
    perks: "Unlocks: Verified Reviewer badge",
    bg: "bg-amber-50/50",
    border: "border-amber-200",
    textColor: "text-amber-900",
  },
  {
    name: "Veteran",
    icon: "⚡",
    pointsRange: "600–999 pts",
    perks: "Unlocks: Direct recruiter intro highlight",
    bg: "bg-orange-50/50",
    border: "border-orange-200",
    textColor: "text-orange-900",
  },
  {
    name: "Elite",
    icon: "🏆",
    pointsRange: "1000+ pts",
    perks: "Unlocks: Profile featured on homepage",
    bg: "bg-purple-50/50",
    border: "border-purple-200",
    textColor: "text-purple-900",
  },
]

const DEFAULT_LEADERBOARD: ContributorRow[] = [
  {
    rank: 1,
    name: "Tahmid R.",
    university: "BRAC University",
    contributions: 4,
    points: 113,
    badgeTier: "Explorer",
    badgeIcon: "🔭",
  },
  {
    rank: 2,
    name: "Anika S.",
    university: "BUET",
    contributions: 1,
    points: 30,
    badgeTier: "Newbie",
    badgeIcon: "🌱",
  },
  {
    rank: 3,
    name: "Nafis Uddin Chowdhury (You)",
    avatar: "/team_nafis.jpg",
    university: "BRAC University",
    contributions: 1,
    points: 25,
    badgeTier: "Newbie",
    badgeIcon: "🌱",
    isCurrentUser: true,
  },
  {
    rank: 4,
    name: "Tanvir H.",
    university: "IUT",
    contributions: 1,
    points: 20,
    badgeTier: "Newbie",
    badgeIcon: "🌱",
  },
  {
    rank: 5,
    name: "Sadia K.",
    university: "Dhaka University",
    contributions: 1,
    points: 15,
    badgeTier: "Newbie",
    badgeIcon: "🌱",
  },
  {
    rank: 6,
    name: "Farhan A.",
    university: "North South University",
    contributions: 1,
    points: 10,
    badgeTier: "Newbie",
    badgeIcon: "🌱",
  },
]

export default function ContributorsPage({ navigate }: Props) {
  const [timeFilter, setTimeFilter] = useState<"All-Time" | "This Month">(
    "This Month",
  )
  const [points, setPoints] = useState(25)
  const [badge, setBadge] = useState("Newbie")
  const [rows, setRows] = useState<ContributorRow[]>(DEFAULT_LEADERBOARD)

  const savedUser = getSavedUser()
  const studentName = savedUser?.name || CURRENT_STUDENT.name

  useEffect(() => {
    getStudentProfile()
      .then((res) => {
        if (res.profile) {
          setPoints(res.profile.points ?? 25)
          setBadge(res.profile.badge ?? "Newbie")
        }
      })
      .catch(() => {})

    getLeaderboard(20)
      .then((res) => {
        if (res.leaderboard && res.leaderboard.length > 0) {
          const mapped: ContributorRow[] = res.leaderboard.map((item, idx) => {
            const isMe = item.name === studentName || idx === 2
            return {
              rank: item.rank || idx + 1,
              name: isMe ? `${studentName} (You)` : item.name,
              avatar: isMe ? "/team_nafis.jpg" : undefined,
              university: isMe ? "BRAC University" : "University Student",
              contributions: Math.max(1, Math.round(item.points / 30)),
              points: item.points,
              badgeTier: item.badge || "Newbie",
              badgeIcon:
                item.badge === "Elite"
                  ? "🏆"
                  : item.badge === "Veteran"
                    ? "⚡"
                    : item.badge === "Insider"
                      ? "💡"
                      : item.badge === "Explorer"
                        ? "🔭"
                        : "🌱",
              isCurrentUser: isMe,
            }
          })
          setRows(mapped)
        }
      })
      .catch(() => {
        setRows(DEFAULT_LEADERBOARD)
      })
  }, [studentName])

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-10 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          Contributors & Leaderboard
        </h1>
        <p className="text-slate-500 text-sm lg:text-base mt-1">
          Share verified internship reviews, interview insights, and stipend
          data to unlock elite recruitment perks.
        </p>
      </div>

      {/* 1. Personal Contribution Status Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Avatar + Student Info */}
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-400/50 shadow-md shrink-0">
              <img
                src="/team_nafis.jpg"
                alt="Nafis"
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = "none"
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-orange-500 flex items-center justify-center font-bold text-white text-lg">
                NU
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {studentName}
                </h2>
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-700/50">
                  You
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                BRAC University · Department of CSE
              </p>
            </div>
          </div>

          {/* Center: Two-tone Gradient Progress Bar */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300">
                Progress:{" "}
                <strong className="text-white">{points} / 100 pts</strong>
              </span>
              <span className="text-amber-400 font-medium">
                {Math.max(0, 100 - points)} points to Explorer tier
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 p-0.5 overflow-hidden border border-slate-700/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-orange-500 transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.max(10, (points / 100) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Right: Badge Pill + Action Button */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Tier
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold mt-0.5">
                <span>
                  🌱 {badge} ({points} pts)
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("write-review")}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
            >
              + Write a Review (+30 pts)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Badge Tier Ladder (5-Stage Horizontal Matrix) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span>Badge Tier Ladder</span>
          <span className="text-xs font-normal text-slate-500">
            (5 Progression Levels)
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {BADGE_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${tier.bg} ${tier.border} shadow-xs hover:shadow-md`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{tier.icon}</span>
                  {tier.isCurrent && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                      Your Tier
                    </span>
                  )}
                </div>

                <h3 className={`font-bold text-sm ${tier.textColor}`}>
                  {tier.name}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {tier.pointsRange}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/50">
                <p className="text-[11px] text-slate-600 leading-snug font-medium">
                  {tier.perks}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Top Contributors Leaderboard Table */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Top Contributors
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rankings refresh daily based on verified university reviews and
              interview reports.
            </p>
          </div>

          {/* Monthly Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 self-start sm:self-auto">
            <button
              onClick={() => setTimeFilter("This Month")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === "This Month"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeFilter("All-Time")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === "All-Time"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All-Time
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">University</th>
                <th className="py-3 px-3 text-center">Contributions</th>
                <th className="py-3 px-3 text-right">Points</th>
                <th className="py-3 px-3 text-right">Badge Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const isRank1 = row.rank === 1
                const isRank2 = row.rank === 2
                const isRank3 = row.rank === 3

                return (
                  <tr
                    key={row.rank}
                    className={`transition-colors ${
                      row.isCurrentUser
                        ? "bg-indigo-50/70 border-l-4 border-l-indigo-600 font-semibold"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3">
                      {isRank1 ? (
                        <span
                          className="text-base"
                          title="1st Place Gold Medal"
                        >
                          🥇
                        </span>
                      ) : isRank2 ? (
                        <span
                          className="text-base"
                          title="2nd Place Silver Medal"
                        >
                          🥈
                        </span>
                      ) : isRank3 ? (
                        <span
                          className="text-base"
                          title="3rd Place Bronze Medal"
                        >
                          🥉
                        </span>
                      ) : (
                        <span className="font-bold text-slate-500 text-xs pl-1">
                          #{row.rank}
                        </span>
                      )}
                    </td>

                    {/* Student */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-[11px] shrink-0 overflow-hidden ${
                            isRank1
                              ? "bg-amber-100 text-amber-800 border-2 border-amber-400 shadow-xs"
                              : isRank2
                                ? "bg-slate-200 text-slate-700 border border-slate-300"
                                : row.isCurrentUser
                                  ? "border-2 border-indigo-400"
                                  : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {row.avatar ? (
                            <img
                              src={row.avatar}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            row.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            row.isCurrentUser
                              ? "text-indigo-950 font-bold"
                              : "text-slate-800 font-medium"
                          }`}
                        >
                          {row.name}
                        </span>
                      </div>
                    </td>

                    {/* University */}
                    <td className="py-3.5 px-3 text-slate-500 font-medium">
                      {row.university}
                    </td>

                    {/* Contributions */}
                    <td className="py-3.5 px-3 text-center text-slate-700 font-semibold">
                      {row.contributions}
                    </td>

                    {/* Points */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="font-extrabold text-slate-900 text-xs">
                        {row.points} pts
                      </span>
                    </td>

                    {/* Badge Tier */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <span>{row.badgeIcon}</span>
                        <span>{row.badgeTier}</span>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. "How to Earn Points" Action Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          How to Earn Contributor Points
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Write a Review */}
          <div
            onClick={() => navigate("write-review")}
            className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">✍️</span>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                  +30 pts
                </span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                Write a Verified Review
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Share authentic pros, cons, and culture insights.
              </p>
            </div>
            <p className="text-xs font-semibold text-indigo-600 mt-3 flex items-center gap-1">
              <span>Write Review</span>
              <span>→</span>
            </p>
          </div>

          {/* Action 2: Share Interview Experience */}
          <div
            onClick={() => navigate("write-review")}
            className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🎙️</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                  +20 pts
                </span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                Share Interview Experience
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Help peers understand technical rounds and questions.
              </p>
            </div>
            <p className="text-xs font-semibold text-indigo-600 mt-3 flex items-center gap-1">
              <span>Share Insights</span>
              <span>→</span>
            </p>
          </div>

          {/* Action 3: Contribute Stipend Data */}
          <div
            onClick={() => navigate("write-review")}
            className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💰</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  +10 pts
                </span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                Contribute Stipend Data
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Democratize pay transparency for student interns.
              </p>
            </div>
            <p className="text-xs font-semibold text-indigo-600 mt-3 flex items-center gap-1">
              <span>Submit Pay Data</span>
              <span>→</span>
            </p>
          </div>

          {/* Action 4: Complete Profile & Resume */}
          <div
            onClick={() => navigate("profile")}
            className="bg-emerald-50/30 rounded-2xl border border-emerald-200/80 p-4 shadow-xs flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📄</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  +15 pts
                </span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                Complete Profile & Resume
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Upload resume and verify student credentials.
              </p>
            </div>
            <p className="text-xs font-bold text-emerald-700 mt-3 flex items-center gap-1">
              <span>Completed</span>
              <span>✓</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
