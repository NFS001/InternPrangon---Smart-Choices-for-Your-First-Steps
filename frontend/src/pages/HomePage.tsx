import React, { useState } from "react";
import { type Navigate } from "../data/index";
import { getSavedUser } from "../api/client";
import { CompanyLogo } from "../components/common/CompanyLogos";
import { StudentAvatar } from "../components/common/StudentAvatars";

interface Props {
  navigate: Navigate;
  loggedIn?: boolean;
}

interface FeaturedOpportunity {
  id: number;
  company: string;
  role: string;
  mode: string;
  duration: string;
  stipend: string;
  tags: string[];
  daysLeft: number;
  featured: boolean;
  saved?: boolean;
}

const OPPORTUNITIES: FeaturedOpportunity[] = [
  {
    id: 1,
    company: "Brain Station 23",
    role: "Software Engineer Intern (Backend & Cloud)",
    mode: "Remote",
    duration: "3 months",
    stipend: "BDT 22,000/mo",
    tags: ["Node.js", "Go", "AWS", "Microservices"],
    daysLeft: 14,
    featured: true,
  },
  {
    id: 2,
    company: "Chaldal",
    role: "Data Analyst & Growth Intern",
    mode: "Remote",
    duration: "4 months",
    stipend: "BDT 18,000/mo",
    tags: ["Python", "SQL", "Tableau", "Metrics"],
    daysLeft: 18,
    featured: true,
  },
  {
    id: 3,
    company: "Square",
    role: "Software Quality Assurance Intern",
    mode: "On-site",
    duration: "6 months",
    stipend: "BDT 20,000/mo",
    tags: ["Selenium", "Test Automation", "Cypress"],
    daysLeft: 9,
    featured: true,
  },
  {
    id: 4,
    company: "Pathao",
    role: "Mobile App Developer Intern (Flutter)",
    mode: "Remote",
    duration: "3 months",
    stipend: "BDT 25,000/mo",
    tags: ["Flutter", "Dart", "REST API", "Maps"],
    daysLeft: 12,
    featured: true,
  },
  {
    id: 5,
    company: "bKash Limited",
    role: "Fintech Cybersecurity Intern",
    mode: "On-site",
    duration: "6 months",
    stipend: "BDT 24,000/mo",
    tags: ["Network Security", "PCI-DSS", "Audit"],
    daysLeft: 22,
    featured: true,
  },
  {
    id: 6,
    company: "Optimizely",
    role: "Product Design (UI/UX) Intern",
    mode: "Remote",
    duration: "4 months",
    stipend: "BDT 22,000/mo",
    tags: ["Figma", "Design Systems", "Prototyping"],
    daysLeft: 16,
    featured: true,
  },
];

const CATEGORIES = [
  { name: "Engineering", count: 42 },
  { name: "Design", count: 18 },
  { name: "Marketing", count: 24 },
  { name: "Finance", count: 15 },
  { name: "Data & AI", count: 31 },
  { name: "Operations", count: 12 },
];

const STATS = [
  {
    value: "1,200+",
    label: "Active Internships",
    iconBg: "from-blue-500 to-indigo-600",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    value: "380+",
    label: "Verified Companies",
    iconBg: "from-purple-500 to-violet-600",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    value: "8,400+",
    label: "Students Registered",
    iconBg: "from-amber-500 to-orange-600",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    value: "92%",
    label: "Placement Rate",
    iconBg: "from-emerald-500 to-teal-600",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    num: "01",
    title: "Create your profile",
    desc: "Build a verified profile highlighting your university, skills, and standardized resume.",
    icon: "👤",
  },
  {
    num: "02",
    title: "Discover opportunities",
    desc: "Filter through verified paid opportunities tailored precisely to your field of study.",
    icon: "🔍",
  },
  {
    num: "03",
    title: "Apply in one click",
    desc: "Send your application directly into hiring managers' ATS pipelines with zero hassle.",
    icon: "⚡",
  },
  {
    num: "04",
    title: "Land your internship",
    desc: "Get shortlisted, interview with confidence, and step onto your career launchpad.",
    icon: "🚀",
  },
];

const REVIEWS = [
  {
    name: "Tahmina Akter",
    university: "BUET, CSE 3rd Year",
    text: "InternPrangon made it remarkably painless to find a paid remote internship. I applied to 4 verified companies and received 3 interviews within 5 days. Landed my dream cloud role at Brain Station 23!",
    badge: "Explorer",
    points: "240 pts",
  },
  {
    name: "Rakib Hasan",
    university: "Dhaka University, BBA 4th Year",
    text: "As a business major, navigating real corporate openings was always stressful. The verified stipend indicators and anonymous workplace reviews gave me complete transparency before interviewing.",
    badge: "Insider",
    points: "480 pts",
  },
  {
    name: "Nusrat Jahan",
    university: "North South University, CS",
    text: "The contributor badge system is genuinely rewarding. Writing authentic company reviews leveled up my badge tier, giving my profile high priority when HR screened candidates.",
    badge: "Veteran",
    points: "820 pts",
  },
];

const BADGES = [
  { icon: "🌱", tier: "Newbie", points: "0–99 pts", desc: "Just getting started. Complete your profile and explore opportunities." },
  { icon: "🔭", tier: "Explorer", points: "100–299 pts", desc: "Actively contributing reviews and tracking applications." },
  { icon: "💡", tier: "Insider", points: "300–599 pts", desc: "A trusted community voice sharing transparent stipend insights." },
  { icon: "⚡", tier: "Veteran", points: "600–999 pts", desc: "Experienced mentor unlocking recruiter spotlight placement." },
  { icon: "🏆", tier: "Elite", points: "1000+ pts", desc: "Leaderboard icon recognized by premier hiring partners nationwide.", glow: true },
];

export default function HomePage({ navigate, loggedIn }: Props) {
  const isAuth = loggedIn ?? Boolean(getSavedUser());
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [savedIds, setSavedIds] = useState<number[]>([1, 4]);

  const toggleSave = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSearch = () => {
    const term = searchQuery.trim();
    navigate("internships", {
      search: term,
      mode: locationFilter !== "All" ? locationFilter : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* ── Background Aura Glows ── */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[500px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-28 right-1/4 translate-x-1/3 w-[550px] h-[450px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[1200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* ═══════════════════════════════════════════════════════════════
          2. HERO & DYNAMIC SEARCH SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
          {/* Trust Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-indigo-100 shadow-sm text-xs font-semibold text-indigo-700 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Over 380+ Verified Companies Hiring Fall 2026</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-black tracking-tight text-[#0F172A] leading-[1.08] mb-6">
            Smart choices.{" "}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#EA580C] font-display italic">
              First steps.
              {/* Dynamic Accent Brush Underline */}
              <svg
                className="absolute -bottom-2.5 left-0 w-full h-3.5 text-[#F97316]/75"
                viewBox="0 0 250 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 9.5C54.5 3.5 158 2 247 7.5"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed mb-10">
            Bangladesh's most trusted internship platform. Find paid, verified opportunities matched to your skills.
          </p>

          {/* ── Massive Glassmorphic Combined Search Bar ── */}
          <div className="w-full max-w-3xl bg-white/85 backdrop-blur-xl rounded-2xl md:rounded-full border border-white/80 p-2 sm:p-2.5 shadow-[0_15px_45px_rgba(99,102,241,0.12)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all hover:shadow-[0_20px_50px_rgba(99,102,241,0.18)]">
            {/* Input 1: Roles, Companies, Skills */}
            <div className="flex items-center gap-3 px-4 py-2.5 flex-1 min-w-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search roles, companies, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
              />
            </div>

            {/* Subtle Vertical Dividing Line */}
            <div className="hidden sm:block w-[1px] h-8 bg-slate-200/90 mx-1 shrink-0" />

            {/* Input 2: Location or Mode Dropdown */}
            <div className="flex items-center gap-2 px-3 py-2 shrink-0 border-t sm:border-t-0 border-slate-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer pr-2"
              >
                <option value="All">All Locations</option>
                <option value="Remote">Remote Only</option>
                <option value="On-site">On-site (Dhaka)</option>
              </select>
            </div>

            {/* Search Button (Solid Violet) */}
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] text-white font-bold px-8 py-3.5 rounded-xl md:rounded-full shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] shrink-0 text-sm sm:text-base cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Search</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          {/* Search Category Chips with Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-8">
            <span className="text-xs font-semibold text-slate-400 mr-1 uppercase tracking-wider">Popular:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate("internships", { category: cat.name })}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-slate-200/70 hover:border-indigo-300 text-xs font-medium text-slate-700 hover:text-indigo-600 transition-all shadow-xs hover:shadow-sm cursor-pointer"
              >
                <span>{cat.name}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. FLOATING STATS BANNER
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-20 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-[0_15px_45px_rgba(15,23,42,0.06)] p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {STATS.map((stat, idx) => (
              <div key={stat.label} className={`flex items-center gap-4 ${idx > 0 ? "pt-4 sm:pt-0 sm:pl-6" : ""}`}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.iconBg} flex items-center justify-center text-white shadow-md shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">{stat.value}</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. FEATURED OPPORTUNITIES SECTION (3x2 Grid)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                Live Feed
              </span>
              <span className="text-xs text-slate-400 font-medium">Updated 10m ago</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Featured opportunities
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hand-picked, high-growth internships with transparent stipends from verified hiring partners.
            </p>
          </div>

          <button
            onClick={() => navigate("internships")}
            className="inline-flex items-center gap-1 text-sm font-bold text-[#6366F1] hover:text-[#4F46E5] hover:underline cursor-pointer group shrink-0"
          >
            <span>View all opportunities</span>
            <span className="transition-transform group-hover:translate-x-1">↗</span>
          </button>
        </div>

        {/* 3x2 Grid of Detailed Opportunity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OPPORTUNITIES.map((item) => {
            const isSaved = savedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => navigate("internship-detail", { id: item.id })}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/70 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(99,102,241,0.1)] hover:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500 cursor-pointer"
              >
                {/* Header: Logo, Featured Badge, Bookmark */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <CompanyLogo name={item.company} size={48} />
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px]">
                        ★ Featured
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleSave(item.id, e)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                          isSaved
                            ? "bg-rose-50 border-rose-200 text-rose-500"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-400 hover:text-slate-600"
                        }`}
                        aria-label="Save internship"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Title & Company */}
                  <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.role}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-semibold text-slate-700">{item.company}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0284C7" className="shrink-0">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>

                  {/* Work Mode & Duration Pills */}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {item.mode} • {item.duration}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ⏳ {item.daysLeft} days left
                    </span>
                  </div>

                  {/* Skill Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-[11px] font-medium bg-slate-100/80 text-slate-600 px-2.5 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Compensation Pill & Apply Prompt */}
                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold text-xs shadow-xs">
                    💰 {item.stipend}
                  </div>
                  <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Apply Now <span>&rarr;</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. HOW INTERNPRANGON WORKS (4 Horizontal Steps)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white/60 border-y border-slate-200/60 py-16 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mt-3">
              How InternPrangon works
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Four simple steps from signup to your first day.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {STEPS.map((step, idx) => (
              <div
                key={step.num}
                className="relative bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-start"
              >
                {/* Bubble Shape Number */}
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-lg font-black text-indigo-600 shadow-xs mb-4">
                  {step.num}
                </div>

                <h3 className="text-base font-bold text-[#0F172A] mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{step.desc}</p>

                {/* Connecting arrow indicator for desktop */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                    &rarr;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. TESTIMONIALS SECTION & BADGES SYSTEM
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Testimonials Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#F97316] uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            Real Student Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mt-3">
            Students love it
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Hear from community members who landed verified roles across Dhaka and remote hubs.
          </p>
        </div>

        {/* Carousel / Glass Cards for Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {REVIEWS.map((rev) => (
            <div
              key={rev.name}
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <StudentAvatar name={rev.name} size={42} />
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">{rev.name}</p>
                    <p className="text-xs text-slate-500">{rev.university}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  ★ {rev.badge}
                </span>
                <span className="text-xs font-semibold text-slate-400">{rev.points}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Callout Segment: Earn your badge. Build your reputation ── */}
        <div className="bg-gradient-to-br from-white via-indigo-50/30 to-orange-50/20 rounded-3xl border border-indigo-100 p-8 sm:p-12 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center">
            {/* Left: Headline & Orange Button */}
            <div className="max-w-xl">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#F97316]">
                Community Contributor Rewards
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mt-2 leading-snug">
                Earn your badge.
                <br />
                Build your reputation.
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mt-4">
                InternPrangon rewards students who give back. Submit verified company ratings, share interview experiences, and answer community questions to earn contributor points.
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Higher badge tiers unlock recruiter spotlights, early-access listings, and exclusive mentor meetups.
              </p>

              <button
                onClick={() => navigate("register")}
                className="mt-8 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition-all text-sm sm:text-base cursor-pointer flex items-center gap-2"
              >
                <span>Start earning points</span>
                <span>↗</span>
              </button>
            </div>

            {/* Right: Matrix of Card Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full lg:w-[460px]">
              {BADGES.map((b) => (
                <div
                  key={b.tier}
                  className={[
                    "rounded-2xl p-4 border transition-all flex flex-col justify-between",
                    b.glow
                      ? "col-span-1 sm:col-span-2 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border-amber-300 ring-2 ring-amber-400/40 shadow-md"
                      : "bg-white/90 border-slate-200/80 shadow-xs",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-[#0F172A]">{b.tier}</p>
                        {b.glow && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-amber-400 text-slate-900">
                            Elite Tier
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-indigo-600">{b.points}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. FOOTER BANNER & DIRECTORY
          ═══════════════════════════════════════════════════════════════ */}
      {/* Large CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] p-10 sm:p-16 text-center text-white overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-orange-500/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Your first step starts here.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-lg">
              Join 8,400+ university students stepping into paid, verified career opportunities with top technology companies today.
            </p>
            <button
              onClick={() => navigate("internships")}
              className="bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold px-9 py-4 rounded-xl shadow-xl shadow-orange-500/30 transition-all text-base cursor-pointer"
            >
              Browse internships
            </button>
          </div>
        </div>
      </section>

      {/* Footer Directory */}
      <footer className="bg-[#0F172A] text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-1 mb-3">
                <span className="font-display italic text-white text-xl font-extrabold">Intern</span>
                <span className="font-sans font-black text-[#F97316] text-xl">Prangon</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] ml-0.5" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mb-4">
                Smart choices for your first steps. Connecting ambitious students with verified employers across Bangladesh.
              </p>
            </div>

            {/* Platform links */}
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</p>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => navigate("internships")} className="hover:text-white transition-colors cursor-pointer">Browse internships</button></li>
                <li><button onClick={() => navigate("companies")} className="hover:text-white transition-colors cursor-pointer">Company directory</button></li>
                <li><button onClick={() => navigate("reviews")} className="hover:text-white transition-colors cursor-pointer">Company reviews</button></li>
                <li><button onClick={() => navigate("about")} className="hover:text-white transition-colors cursor-pointer">About InternPrangon</button></li>
              </ul>
            </div>

            {/* For Students links */}
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-4">For Students</p>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => navigate("register", { as: "student" })} className="hover:text-white transition-colors cursor-pointer">Create student profile</button></li>
                <li><button onClick={() => navigate("applications")} className="hover:text-white transition-colors cursor-pointer">Track applications</button></li>
                <li><button onClick={() => navigate("contributors")} className="hover:text-white transition-colors cursor-pointer">Contributor leaderboard</button></li>
                <li><button onClick={() => navigate("saved")} className="hover:text-white transition-colors cursor-pointer">Saved opportunities</button></li>
              </ul>
            </div>

            {/* For Companies links */}
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-4">For Companies</p>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => navigate("register", { as: "company" })} className="hover:text-white transition-colors cursor-pointer">Post an internship</button></li>
                <li><button onClick={() => navigate("co-verification")} className="hover:text-white transition-colors cursor-pointer">Employer verification</button></li>
                <li><button onClick={() => navigate("co-internships")} className="hover:text-white transition-colors cursor-pointer">Manage listings</button></li>
                <li><button onClick={() => navigate("co-applicants")} className="hover:text-white transition-colors cursor-pointer">Applicant pipeline</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; 2026 InternPrangon. All rights reserved. Built with care by students of BRAC.</p>
            <div className="flex gap-4">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span>&bull;</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
