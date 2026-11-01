import React, { useState, useEffect } from "react"
import type { Navigate } from "../../data/index"
import { LogoMark } from "../../pages/DesignSystemPage"
import {
  getSavedUser,
  getStudentProfile,
  getMyApplications,
  getMyBookmarks,
  getMyNotifications,
  type ApiUser,
} from "../../api/client"
import { CURRENT_STUDENT } from "../../data/index"

interface StudentSidebarProps {
  currentPage: string
  navigate: Navigate
  onLogout: () => void
  currentUser?: ApiUser | null
}

export default function StudentSidebar({
  currentPage,
  navigate,
  onLogout,
  currentUser,
}: StudentSidebarProps) {
  const user = currentUser ?? getSavedUser()
  const [profile, setProfile] = useState<{ points: number badge: string }>({
    points: 25,
    badge: "Newbie",
  })
  const [appCount, setAppCount] = useState(3)
  const [savedCount, setSavedCount] = useState(1)
  const [unreadNotif, setUnreadNotif] = useState(true)

  useEffect(() => {
    getStudentProfile()
      .then((res) => {
        if (res.profile) {
          setProfile({
            points:
              res.profile.points !== undefined && res.profile.points !== 0
                ? res.profile.points
                : 25,
            badge: res.profile.badge || "Newbie",
          })
        }
      })
      .catch(() => {})

    getMyApplications()
      .then((res) => {
        if (res.applications && res.applications.length > 0) {
          setAppCount(res.applications.length)
        }
      })
      .catch(() => {})

    getMyBookmarks()
      .then((res) => {
        if (res.bookmarks && res.bookmarks.length > 0) {
          setSavedCount(res.bookmarks.length)
        }
      })
      .catch(() => {})

    getMyNotifications()
      .then((res) => {
        const unread = (res.notifications || []).some((n) => !n.isRead)
        setUnreadNotif(unread)
      })
      .catch(() => {})
  }, [user?.id])

  const displayName = user?.name || CURRENT_STUDENT.name
  const universitySub = `${CURRENT_STUDENT.university} · ${CURRENT_STUDENT.department}`

  const navItems = [
    {
      id: "dashboard",
      label: "Overview",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: "internships",
      label: "Browse Internships",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      id: "saved",
      label: "Saved Roles",
      badge: savedCount > 0 ? String(savedCount) : "1",
      badgeClass: "bg-slate-100 text-slate-600",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: "applications",
      label: "My Applications",
      badge: String(appCount),
      badgeClass: "bg-indigo-100 text-indigo-700 font-black",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      id: "write-review",
      label: "Write a Review",
      chip: "+30 pts",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
    },
    {
      id: "contributors",
      label: "Contributors & Leaderboard",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      hasDot: unreadNotif,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* ── Desktop Fixed Sidebar (w-64) ── */}
      <aside className="hidden md:flex w-64 shrink-0 bg-white/90 backdrop-blur-md border-r border-slate-200/80 min-h-screen p-5 flex-col justify-between sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Top Branding Logo */}
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2.5 pb-5 border-b border-slate-100 group cursor-pointer w-full text-left"
            aria-label="InternPrangon home"
          >
            <LogoMark size={32} />
            <div className="flex items-center">
              <span
                className="font-display italic text-[18px] font-extrabold text-slate-900 tracking-tight"
                style={{ fontVariationSettings: "'opsz' 36, 'wght' 800" }}
              >
                Intern
              </span>
              <span className="font-sans not-italic text-[18px] font-black bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent ml-[2px]">
                Prangon
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 ml-0.5 mb-1.5 shrink-0 shadow-sm shadow-orange-500/40" />
            </div>
          </button>

          {/* Student Profile Mini-Pill (Top) */}
          <button
            onClick={() => navigate("profile")}
            className="w-full mt-4 mb-5 p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {/* Rounded-xl squircle avatar frame */}
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 shadow-2xs">
                <img
                  src="/team_nafis.jpg"
                  alt={displayName}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    // Fallback to gradient initials if image is missing
                    ;(e.target as HTMLElement).style.display = "none"
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                  {universitySub}
                </p>
              </div>
            </div>

            {/* Points Pill */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-bold">
                🌱 {profile.badge} · {profile.points} pts
              </span>
              <span className="text-slate-400 group-hover:text-indigo-600 font-bold transition-colors">
                ›
              </span>
            </div>
          </button>

          {/* Navigation Menu Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={[
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 text-xs sm:text-sm cursor-pointer",
                    active
                      ? "bg-indigo-50 text-indigo-600 font-semibold rounded-xl border-l-4 border-indigo-600 pl-3 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-xl font-medium",
                  ].join(" ")}
                >
                  <span
                    className={active ? "text-indigo-600" : "text-slate-400"}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full border border-slate-200/60 ${item.badgeClass}`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.chip && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 animate-pulse">
                      {item.chip}
                    </span>
                  )}

                  {item.hasDot && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Menu Section */}
        <div className="pt-4 border-t border-slate-200/80 space-y-1">
          <button
            onClick={() => navigate("profile")}
            className={[
              "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 text-xs sm:text-sm cursor-pointer",
              currentPage === "profile"
                ? "bg-indigo-50 text-indigo-600 font-semibold rounded-xl border-l-4 border-indigo-600 pl-3"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-xl font-medium",
            ].join(" ")}
          >
            <span
              className={
                currentPage === "profile" ? "text-indigo-600" : "text-slate-400"
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <span className="flex-1">My Profile & Settings</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400 hover:text-rose-600"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar (hidden on desktop) ── */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 h-16 px-2">
        {[
          {
            id: "dashboard",
            label: "Home",
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            ),
          },
          {
            id: "internships",
            label: "Browse",
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            ),
          },
          {
            id: "applications",
            label: "Applied",
            badge: appCount > 0,
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            ),
          },
          {
            id: "notifications",
            label: "Alerts",
            dot: unreadNotif,
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            ),
          },
          {
            id: "profile",
            label: "Profile",
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            ),
          },
        ].map((tab) => {
          const active = currentPage === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-1 py-1.5 relative transition-colors cursor-pointer",
                active
                  ? "text-indigo-600 font-bold"
                  : "text-slate-400 font-medium",
              ].join(" ")}
            >
              {tab.icon}
              {tab.badge && (
                <span className="absolute top-2 right-1/4 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
              )}
              {tab.dot && (
                <span className="absolute top-2 right-1/4 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
              <span className="text-[10px] leading-none">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
