import React, { useState, useEffect } from "react"
import type { Navigate } from "../../data/index"
import { LogoMark } from "../../pages/DesignSystemPage"
import { getSavedUser } from "../../api/client"

interface PublicNavProps {
  currentPage: string
  onNavigate: Navigate
  loggedIn?: boolean
  onLogout?: () => void
  onOpenAuth?: (mode: "login" | "signup") => void
}

const NAV_LINKS = [
  { id: "internships", label: "Internships" },
  { id: "companies", label: "Companies" },
  { id: "reviews", label: "Reviews" },
  { id: "about", label: "About" },
]

export default function PublicNav({
  currentPage,
  onNavigate,
  loggedIn,
  onLogout,
  onOpenAuth,
}: PublicNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const savedUser = getSavedUser()
  const isAdmin = Boolean(loggedIn && savedUser && savedUser.role === "admin")
  const isCompany = Boolean(
    loggedIn && savedUser && savedUser.role === "company",
  )
  const isStudent = Boolean(
    loggedIn && savedUser && savedUser.role === "student",
  )
  const initials = savedUser?.name
    ? savedUser.name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "IP"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [currentPage])

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  function go(page: string, data?: Record<string, unknown>) {
    onNavigate(page, data)
    setMenuOpen(false)
  }

  return (
    <header
      className={[
        "sticky top-0 z-50 bg-[#fafaf9]/95 backdrop-blur-md transition-all duration-300",
        scrolled
          ? "shadow-sm border-b border-neutral-200/80"
          : "border-b border-neutral-200/50",
      ].join(" ")}
    >
      {/* ── Main bar ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-[60px] md:h-[68px] flex items-center gap-4 md:gap-10">
        {/* Logo */}
        <button
          onClick={() => go("home")}
          className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
          aria-label="InternPrangon home"
        >
          <LogoMark size={32} />
          <div className="flex items-center">
            <span
              className="font-display italic text-[18px] md:text-[20px] font-extrabold text-slate-900 tracking-tight transition-colors"
              style={{ fontVariationSettings: "'opsz' 36, 'wght' 800" }}
            >
              Intern
            </span>
            <span className="font-sans not-italic text-[18px] md:text-[20px] font-black tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent ml-[2px]">
              Prangon
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 ml-0.5 mb-1.5 shrink-0 shadow-sm shadow-orange-500/40" />
          </div>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1.5 flex-1">
          {NAV_LINKS.map((link) => {
            const active =
              currentPage === link.id ||
              (link.id === "companies" && currentPage === "company-detail") ||
              (link.id === "internships" && currentPage === "internship-detail")
            return (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className={[
                  "relative px-3.5 py-2 text-[14.5px] font-semibold transition-all duration-150 rounded-lg flex flex-col items-center cursor-pointer",
                  active
                    ? "text-indigo-600 font-bold"
                    : "text-slate-600 hover:text-[#0F172A] hover:bg-slate-100/60",
                ].join(" ")}
              >
                <span>{link.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#6366F1] rounded-full shadow-[0_1px_4px_rgba(99,102,241,0.5)]" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Outlined button: + Post an Internship (ONLY WHEN LOGGED IN BY A COMPANY) */}
          {isCompany && (
            <button
              onClick={() => go("co-internships", { action: "create" })}
              className="flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50/70 border border-indigo-200/90 hover:border-indigo-400 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <span className="font-extrabold text-sm">+</span>
              <span>Post an Internship</span>
            </button>
          )}

          {loggedIn ? (
            <div className="flex items-center gap-2">
              {/* Interactive Profile Pill: Purple 'NU' badge + 'Dashboard ▾' */}
              <button
                onClick={() =>
                  go(
                    isAdmin
                      ? "admin-dashboard"
                      : isCompany
                        ? "co-dashboard"
                        : "dashboard",
                  )
                }
                className="flex items-center gap-2 h-9 px-3.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 text-xs font-bold text-slate-800 transition-all shadow-xs cursor-pointer group"
                aria-label="Dashboard Menu"
              >
                <div className="w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-[9px] font-black shadow-xs">
                  {initials || "NU"}
                </div>
                <span>Dashboard</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-slate-400 group-hover:text-slate-700 transition-colors"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* Ghost Log out button */}
              <button
                onClick={onLogout}
                className="h-9 px-3 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 rounded-full transition-colors cursor-pointer"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => (onOpenAuth ? onOpenAuth("login") : go("login"))}
                className="text-slate-700 hover:text-indigo-600 font-semibold px-4 py-2 transition cursor-pointer text-sm"
              >
                Log in
              </button>
              <button
                onClick={() =>
                  onOpenAuth
                    ? onOpenAuth("signup")
                    : go("register", { as: "student" })
                }
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition cursor-pointer text-sm"
              >
                Sign up free
              </button>
            </div>
          )}
        </div>

        {/* Mobile right: login hint + hamburger */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          {!loggedIn && (
            <button
              onClick={() => (onOpenAuth ? onOpenAuth("login") : go("login"))}
              className="text-slate-700 hover:text-indigo-600 font-semibold px-3 py-1.5 transition text-sm cursor-pointer"
            >
              Log in
            </button>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile slide-down menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 shadow-xl">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const active = currentPage === link.id
              return (
                <button
                  key={link.id}
                  onClick={() => go(link.id)}
                  className={[
                    "w-full text-left px-4 py-3 text-base font-medium rounded-xl transition-colors",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-neutral-700 hover:bg-neutral-50",
                  ].join(" ")}
                >
                  {link.label}
                </button>
              )
            })}
          </div>

          <div className="border-t border-neutral-100 px-4 py-3">
            {isAdmin ? (
              <div className="flex gap-2">
                <button
                  onClick={() => go("admin-dashboard")}
                  className="flex-1 h-10 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
                >
                  Admin Dashboard
                </button>
                <button
                  onClick={() => {
                    onLogout?.()
                    setMenuOpen(false)
                  }}
                  className="flex-1 h-10 text-sm font-semibold text-neutral-600 border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : isCompany ? (
              <div className="flex gap-2">
                <button
                  onClick={() => go("co-dashboard")}
                  className="flex-1 h-10 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors"
                >
                  Company Portal
                </button>
                <button
                  onClick={() => {
                    onLogout?.()
                    setMenuOpen(false)
                  }}
                  className="flex-1 h-10 text-sm font-semibold text-neutral-600 border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : isStudent ? (
              <div className="flex gap-2">
                <button
                  onClick={() => go("dashboard")}
                  className="flex-1 h-10 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    onLogout?.()
                    setMenuOpen(false)
                  }}
                  className="flex-1 h-10 text-sm font-semibold text-neutral-600 border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    if (onOpenAuth) onOpenAuth("login")
                    else go("login")
                  }}
                  className="flex-1 h-10 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    if (onOpenAuth) onOpenAuth("signup")
                    else go("register", { as: "student" })
                  }}
                  className="flex-1 h-10 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
                >
                  Sign up free
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
