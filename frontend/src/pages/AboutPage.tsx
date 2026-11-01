import React from "react"
import type { Navigate } from "../data/index"

interface Props {
  navigate?: Navigate
}

export default function AboutPage({ navigate }: Props) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-24 font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* ── Background Aura Glows ── */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[380px] bg-indigo-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-96 left-1/4 w-[500px] h-[340px] bg-orange-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO & ORIGIN STORY
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14">
        <div className="max-w-3xl mb-10">
          {/* Category Pill */}
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-amber-50 text-[#F97316] border border-amber-200/80 mb-4 shadow-2xs">
            OUR ORIGIN STORY
          </span>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.08] mb-6">
            Built by students,{" "}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] bg-clip-text text-transparent">
              for students.
            </span>
          </h1>

          {/* Editorial Story Copy */}
          <div className="space-y-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            <p>
              InternPrangon started in 2026 inside a software engineering
              classroom at BRAC University. Like thousands of undergraduates
              across Bangladesh, our founding team experienced firsthand the
              exhausting frustration of hunting for verified internships:
              obscure listings scattered across unstructured Facebook groups,
              ghost postings on LinkedIn comments, and zero transparency about
              team culture or compensation.
            </p>
            <p className="text-slate-800 font-medium">
              Worse yet, talented students were regularly subjected to unpaid
              exploitation masquerading as full-time jobs with zero mentorship.
              So we built what we wished existed: a singular, high-trust
              ecosystem uniting Bangladesh’s ambitious student talent with
              verified partner employers.
            </p>
          </div>
        </div>

        {/* Hero Media Element: 16:9 Lifestyle Photo */}
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden relative shadow-xl border border-slate-200/80 bg-slate-900 group">
          <img
            src="/students_lab_collab.jpg"
            alt="Students collaborating at BRAC University campus tech lab in Mohakhali, Dhaka"
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Glass Anchor Badge */}
          <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Born in Mohakhali, Dhaka · 2026</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. PLATFORM IMPACT METRICS (ELEVATED 4-COLUMN RIBBON)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Metric 1 */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Listings
              </span>
              <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                💼
              </span>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                1,200+
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Updated weekly from verified companies
              </p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Verified Employers
              </span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
                🏢
              </span>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                380+
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Trade licenses & corporate registration verified
              </p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Registered Students
              </span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
                🎓
              </span>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                8,400+
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Representing 25+ universities nationwide
              </p>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Platform Founded
              </span>
              <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-sm font-bold">
                🇧🇩
              </span>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                2026
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Mohakhali, Dhaka, Bangladesh
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. PROBLEM VS. SOLUTION BENTO COMPARISON
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">
            THE PARADIGM SHIFT
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            Fixing a broken system for good.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Card: The Broken Status Quo */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-200/70 p-8 sm:p-10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-xs">
                  ✕
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
                  The Broken Status Quo
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">
                Finding an internship shouldn't be a maze.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-8">
                Traditional job boards treat interns as an afterthought, forcing
                undergraduates to navigate opaque processes and risk their
                career beginnings.
              </p>

              <div className="space-y-4">
                {[
                  "Listings scattered across unstructured Facebook groups, Discord servers, and LinkedIn comments",
                  "No reliable mechanism to verify corporate legitimacy or internship mentorship culture",
                  "Unpaid roles masquerading as full-time jobs with zero stipends and zero mentorship",
                  "Fake glassdoor-style corporate reviews authored or edited directly by HR marketing teams",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ✕
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-rose-100/80">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Result: 68% of students report internship burnout or fraud
              </span>
            </div>
          </div>

          {/* Right Card: The InternPrangon Standard */}
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col justify-between border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-400/30">
                  ✓
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  The InternPrangon Standard
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">
                One verified platform. Complete transparency.
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed mb-8">
                We empower students with clear stipend visibility, verified
                employer screening, and uncensored peer testimonials.
              </p>

              <div className="space-y-4">
                {[
                  "100% Verified companies (business trade license & office address checked upfront by admins)",
                  "Uncensored peer reviews and interview guides from actual student interns",
                  "Transparent stipends shown openly before you ever spend time drafting an application",
                  "1-Click universal application with real-time status tracking from submission to offer",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-400/40">
                      ✓
                    </span>
                    <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/10 relative">
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                Outcome: 100% verified opportunities with zero ghost listings
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. DUAL WORKFLOW: HOW INTERNPRANGON WORKS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#F97316] uppercase tracking-widest block mb-2">
            STREAMLINED WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            How InternPrangon works
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            A parallel, transparent pipeline engineered for students and
            corporate teams alike.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* For Students Pipeline */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                🎓
              </span>
              <h3 className="text-xl font-bold text-slate-900">For Students</h3>
            </div>

            <div className="space-y-6 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:border-l-2 before:border-dashed before:border-indigo-200">
              {[
                {
                  step: "01",
                  title: "Create Profile & Resume",
                  desc: "Input your university, technical skills, and upload your resume once. Our smart profile system auto-formats your credentials.",
                },
                {
                  step: "02",
                  title: "Discover Verified Roles",
                  desc: "Filter opportunities by stipend range, remote/on-site modes, tech stack, and authentic student satisfaction scores.",
                },
                {
                  step: "03",
                  title: "1-Click Universal Apply",
                  desc: "Apply instantly to leading tech enterprises and startups without filling the same 20-question form repeatedly.",
                },
                {
                  step: "04",
                  title: "Real-time Status Tracking",
                  desc: "Receive live notifications whenever recruiters view your application, schedule interviews, or extend formal offers.",
                },
              ].map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md shadow-indigo-500/20 ring-4 ring-white">
                    {item.step}
                  </div>
                  <div className="pt-1">
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Employers Pipeline */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-sm font-bold">
                🏢
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                For Employers
              </h3>
            </div>

            <div className="space-y-6 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:border-l-2 before:border-dashed before:border-orange-200">
              {[
                {
                  step: "01",
                  title: "Build Company Profile",
                  desc: "Register your organization, showcase your engineering culture, tech stack, and submit business documents for rapid verification.",
                },
                {
                  step: "02",
                  title: "Post Internship Listings",
                  desc: "Publish transparent internship roles specifying real stipends, mentorship leads, project scopes, and hiring deadlines.",
                },
                {
                  step: "03",
                  title: "Review Pre-screened Applicants",
                  desc: "Access verified student profiles from BUET, BRACU, NSU, DU, and top institutes with standardized resumes and GitHub links.",
                },
                {
                  step: "04",
                  title: "Instant Status Updates & Offers",
                  desc: "Shortlist candidates, trigger interview invitations, and extend formal internship offers directly through the dashboard.",
                },
              ].map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md shadow-orange-500/20 ring-4 ring-white">
                    {item.step}
                  </div>
                  <div className="pt-1">
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. GUIDING PRINCIPLES
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">
            CORE ETHOS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            Our Guiding Principles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Principle 1 */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl mb-5">
              👁️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Transparency First
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Stipends, student ratings, and working conditions are always
              visible before applying. Undergraduates deserve clarity before
              committing their time and ambition.
            </p>
          </div>

          {/* Principle 2 */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl mb-5">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Verified, Not Assumed
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Strict employer screening and manual trade-license verification
              ensure zero ghost jobs, scam listings, or unpaid exploitation
              across our catalog.
            </p>
          </div>

          {/* Principle 3 */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl mb-5">
              👥
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Community Owned
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A peer-powered movement driven by genuine student contributions,
              anonymous workplace reviews, and shared interview knowledge across
              Bangladesh.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. FOUNDING TEAM SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#F97316] uppercase tracking-widest block mb-2">
            THE CAPSTONE INITIATIVE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            Made by BRAC Students
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            A software engineering capstone project that grew into a national
            student movement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Nafis Uddin Chowdhury",
              role: "Project Lead & Full Stack",
              dept: "B.Sc. in CSE, BRAC University",
              image: "/team_nafis.jpg",
              github: "https://github.com/NFS001",
              linkedin:
                "https://www.linkedin.com/in/nafis-uddin-chowdhury-49bb71348/",
            },
            {
              name: "Md. Muhtasim Fuad",
              role: "Database & QA Engineer",
              dept: "B.Sc. in CSE, BRAC University",
              image: "/team_fuad.jpg",
              github: "https://github.com/mfd-7",
              linkedin: "https://www.linkedin.com/in/real-muhtasim-fuad/",
            },
            {
              name: "Syed Kawnain Tahmid Billah",
              role: "Backend & System Architect",
              dept: "B.Sc. in CSE, BRAC University",
              image: "/team_tahmid.jpg",
              github: "https://github.com/kawnaintahmidbillah-arch",
              linkedin:
                "https://www.linkedin.com/in/syed-kawnain-tahmid-billah-725768337/",
            },
            {
              name: "Tasnim Eva",
              role: "UI/UX & Frontend Lead",
              dept: "B.Sc. in CSE, BRAC University",
              image: "/team_eva.jpg",
              github: "https://github.com/tasnim-eva",
              linkedin: "",
            },
          ].map((member, idx) => (
            <div
              key={idx}
              className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Rounded Squircle Photo Container */}
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4 relative shadow-2xs">
                  {member.image ? (
                    <>
                      <img
                        src={member.image}
                        alt={`${member.name} — ${member.role}`}
                        className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-300"
                      />
                      {/* Hover Social Icon Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noreferrer"
                            className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-slate-900 flex items-center justify-center shadow-md transition-transform hover:scale-110"
                            aria-label="GitHub Profile"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                          </a>
                        )}
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="w-10 h-10 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110"
                            aria-label="LinkedIn Profile"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-100 to-slate-200/80 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-4">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-indigo-600 font-black text-xl mb-2">
                        TE
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Empty Canvas
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="font-extrabold text-[#0F172A] text-base group-hover:text-indigo-600 transition-colors">
                  {member.name}
                </h3>
                <p className="text-xs font-bold text-indigo-600 mt-0.5">
                  {member.role}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  {member.dept}
                </p>

                {/* Persistent Quick Links */}
                <div className="flex items-center gap-2 mt-3.5">
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      aria-label={`${member.name} GitHub`}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      <span>GitHub</span>
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] text-xs font-bold transition-colors cursor-pointer"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Core Contributor</span>
                <span className="text-emerald-600 font-bold">2026 Cohort</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Attribution Pill */}
        <div className="mt-10 text-center">
          <span className="inline-block px-5 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200/80 shadow-2xs">
            🎓 Advised by faculty at the Department of Computer Science &
            Engineering, BRAC University.
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. FINAL CALL TO ACTION BANNER
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-indigo-500/20">
          {/* Subtle Orange Accent Glow Wave */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500/20 text-[#F97316] border border-orange-500/30 mb-3">
                TAKE THE NEXT LEAP
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Ready to take your first professional step?
              </h2>
              <p className="text-sm sm:text-base text-indigo-200 mt-3 max-w-xl">
                Join 8,400+ students and discover verified, paid internships
                across Bangladesh with transparent culture insights.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => navigate?.("register", { as: "student" })}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-sm shadow-lg shadow-orange-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Create Free Student Account</span>
                <span>↗</span>
              </button>
              <button
                onClick={() => navigate?.("internships")}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer flex items-center justify-center"
              >
                Browse 1,200+ Internships
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
