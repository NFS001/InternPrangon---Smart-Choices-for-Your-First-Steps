import { useState, useEffect } from "react";
import { type Navigate, INTERNSHIPS, COMPANIES } from "../data/index";
import { searchInternships } from "../api/client";

interface Props {
  navigate: Navigate;
}

const categories = ["Engineering", "Design", "Marketing", "Finance", "Data & AI", "Operations"];

const stats = [
  { value: "1200+", label: "Active internships" },
  { value: "380+", label: "Verified companies" },
  { value: "8400+", label: "Students registered" },
  { value: "92%", label: "Placement rate" },
];

const steps = [
  { num: "01", title: "Create your profile", desc: "Sign up and build a profile that showcases your skills, university, and goals." },
  { num: "02", title: "Discover opportunities", desc: "Browse hundreds of vetted internships filtered by role, location, and stipend." },
  { num: "03", title: "Apply in one click", desc: "Send your profile directly to hiring teams — no cover letters required." },
  { num: "04", title: "Land your internship", desc: "Get shortlisted, interview, and start your first real professional chapter." },
];

const reviews = [
  {
    name: "Tahmina Akter",
    university: "BUET, CSE 3rd Year",
    text: "InternPrangon made finding a real engineering internship so much easier. The interview experiences shared by seniors were gold.",
    badge: "Elite",
    initials: "TA",
  },
  {
    name: "Rakib Hasan",
    university: "DU, BBA 4th Year",
    text: "As a business student I was worried I had limited options. InternPrangon showed me how many marketing and finance roles exist. The company ratings helped me pick wisely.",
    badge: "Insider",
    initials: "RH",
  },
  {
    name: "Nusrat Jahan",
    university: "NSU, CSE Masters",
    text: "The contributor badge system is actually motivating. I wrote two company reviews and got points that boosted my profile visibility. Got shortlisted twice in the same week.",
    badge: "Veteran",
    initials: "NJ",
  },
];

const badges = [
  { icon: "🌱", tier: "Newbie", points: "0–99 pts", desc: "Just getting started. Complete your profile and explore the platform." },
  { icon: "🔭", tier: "Explorer", points: "100–299 pts", desc: "Actively exploring. You have reviewed companies and applied to roles." },
  { icon: "💡", tier: "Insider", points: "300–599 pts", desc: "A trusted voice. Your reviews and tips help the whole community." },
  { icon: "⚡", tier: "Veteran", points: "600–999 pts", desc: "Deeply embedded. Mentors newcomers and contributes quality content." },
  { icon: "🏆", tier: "Elite", points: "1000+ pts", desc: "Top of the leaderboard. Recognized by companies and the community alike." },
];

export default function HomePage({ navigate }: Props) {
  const [heroCards, setHeroCards] = useState<any[]>(INTERNSHIPS.slice(0, 4));
  const [featuredInternships, setFeaturedInternships] = useState<any[]>(INTERNSHIPS.filter((i) => i.featured === true));
  const companyTeaser = COMPANIES.slice(0, 8);

  useEffect(() => {
    searchInternships({ limit: 50, sortBy: 'createdAt', sortOrder: 'desc' })
      .then((res) => {
        if (res.internships && res.internships.length > 0) {
          const mapped = res.internships.map((bi: any, idx: number) => {
            const companyName = bi.company || "Enterprise Partner";
            const initials = companyName.trim().slice(0, 2).toUpperCase();
            let parsedStipend = bi.type === "Paid" ? "Paid" : "Unpaid";
            const stipendMatch = bi.description?.match(/Stipend:\s*([^\n]+)/i);
            if (stipendMatch) parsedStipend = stipendMatch[1].trim();

            return {
              id: idx + 1,
              backendId: bi._id,
              role: bi.title,
              company: companyName,
              logo: initials,
              logoBg: "#eff6ff",
              logoColor: "#2563eb",
              type: bi.mode,
              paid: bi.type === "Paid",
              stipend: parsedStipend,
              tags: [bi.type, bi.mode],
              featured: idx < 3,
            };
          });

          setHeroCards(mapped.slice(0, 4));
          setFeaturedInternships(mapped.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-20 lg:pb-24 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16 items-center">
        {/* Left */}
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="leading-none tracking-tight">
              <span className="block font-display italic text-neutral-900 text-[44px] md:text-[60px] lg:text-[76px]">Smart</span>
              <span className="block font-display italic text-neutral-900 text-[44px] md:text-[60px] lg:text-[76px]">choices.</span>
              <span className="block font-display italic text-amber-500 text-[44px] md:text-[60px] lg:text-[76px]">First steps.</span>
            </h1>
            <p className="mt-5 text-lg text-neutral-500 max-w-md">
              {"Bangladesh's most trusted internship platform. Find paid, verified opportunities matched to your skills and ambitions."}
            </p>
          </div>

          {/* Search bar */}
          <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-3 flex-1">
              <svg className="ml-3 w-5 h-5 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search roles, companies, skills…"
                className="flex-1 text-sm text-neutral-700 placeholder-neutral-400 outline-none bg-transparent py-2"
              />
            </div>
            <button className="bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-brand-800 transition-colors w-full sm:w-auto flex-shrink-0">
              Search
            </button>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => navigate("internships", { category: cat })}
                className="text-xs font-medium bg-white border border-neutral-200 text-neutral-600 px-4 py-2 rounded-full hover:border-brand-400 hover:text-brand-700 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("internships")}
              className="bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors text-center"
            >
              Browse internships &rarr;
            </button>
            <button
              onClick={() => navigate("register")}
              className="border border-neutral-300 text-neutral-700 font-medium px-6 py-3 rounded-xl hover:bg-neutral-100 transition-colors text-center"
            >
              Create free account
            </button>
          </div>
        </div>

        {/* Right — mini internship cards (desktop only) */}
        <div className="hidden lg:grid grid-cols-2 gap-4">
          {heroCards.map((internship) => (
            <button
              key={internship.backendId || internship.id}
              onClick={() => navigate("internship-detail", { id: internship.id, backendId: internship.backendId })}
              className="bg-white rounded-2xl border border-neutral-200 p-4 text-left hover:shadow-md hover:border-brand-200 transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mb-3"
                style={{ background: internship.logoBg, color: internship.logoColor }}
              >
                {internship.logo}
              </div>
              <p className="text-sm font-semibold text-neutral-900 leading-tight">{internship.role}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{internship.company}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{internship.type}</span>
                <span className="text-xs font-medium text-brand-700">{internship.paid ? internship.stipend : "Unpaid"}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-brand-950 py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={s.label} className={i < 2 ? "border-b border-brand-800 pb-6 md:border-b-0 md:pb-0" : ""}>
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-brand-300 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Opportunities ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">Featured opportunities</h2>
            <p className="text-neutral-500 mt-1">Hand-picked, high-quality internships from verified companies</p>
          </div>
          <button onClick={() => navigate("internships")} className="text-sm text-brand-700 font-medium hover:underline flex-shrink-0 ml-4">
            View all &rarr;
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredInternships.map((internship) => (
            <button
              key={internship.backendId || internship.id}
              onClick={() => navigate("internship-detail", { id: internship.id, backendId: internship.backendId })}
              className="bg-white rounded-2xl border border-neutral-200 p-6 text-left hover:shadow-lg hover:border-brand-200 transition-all flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ background: internship.logoBg, color: internship.logoColor }}
                >
                  {internship.logo}
                </div>
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">Featured</span>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">{internship.role}</h3>
                <p className="text-sm text-neutral-500 mt-0.5">{internship.company}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {internship.tags?.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span>{internship.type}</span>
                  <span>&bull;</span>
                  <span>{internship.duration}</span>
                </div>
                <span className="text-xs font-semibold text-brand-700">{internship.paid ? internship.stipend : "Unpaid"}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-y border-neutral-200 bg-white py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-neutral-900">How InternPrangon works</h2>
            <p className="text-neutral-500 mt-2">Four simple steps from signup to your first day</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                  <span className="text-lg font-bold text-brand-700">{step.num}</span>
                </div>
                <h3 className="font-semibold text-neutral-900">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Company directory teaser ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">Top companies hiring</h2>
            <p className="text-neutral-500 mt-1">Verified employers with active internship programs</p>
          </div>
          <button onClick={() => navigate("companies")} className="text-sm text-brand-700 font-medium hover:underline flex-shrink-0 ml-4">
            View all &rarr;
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {companyTeaser.map((company) => (
            <button
              key={company.id}
              onClick={() => navigate("company-detail", { id: company.id, companyName: company.name })}
              className="bg-white rounded-2xl border border-neutral-200 p-5 text-left hover:shadow-md hover:border-brand-200 transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm mb-3"
                style={{ background: company.logoBg, color: company.logoColor }}
              >
                {company.logo}
              </div>
              <p className="text-sm font-semibold text-neutral-900">{company.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{company.industry}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-amber-500 text-xs">&#9733;</span>
                <span className="text-xs font-medium text-neutral-700">{company.rating}</span>
                <span className="text-xs text-neutral-400">({company.reviewCount})</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Student voices ── */}
      <section className="bg-brand-50 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-neutral-900">Students love it</h2>
            <p className="text-neutral-500 mt-2">Hear from the community that trusts InternPrangon</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.name} className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                    {review.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{review.name}</p>
                    <p className="text-xs text-neutral-500">{review.university}</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">{review.text}</p>
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium self-start">
                  {review.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contributor system ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">Community contributor system</span>
            <h2 className="text-3xl font-bold text-neutral-900 mt-3">Earn your badge. Build your reputation.</h2>
            <p className="text-neutral-500 mt-4 leading-relaxed">
              InternPrangon rewards students who give back. Write company reviews, share interview experiences, refer friends, and help curate internship listings — every action earns you points and unlocks higher tiers.
            </p>
            <p className="text-neutral-500 mt-3 leading-relaxed">
              Higher badge tiers boost your profile visibility to recruiters and unlock exclusive early-access listings before they go public.
            </p>
            <button onClick={() => navigate("register")} className="mt-6 bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors">
              Start earning points &rarr;
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.tier}
                className={[
                  "rounded-2xl border p-5 flex flex-col gap-2",
                  badge.tier === "Elite"
                    ? "col-span-1 sm:col-span-2 bg-brand-50 border-brand-200"
                    : "bg-white border-neutral-200",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">{badge.tier}</p>
                    <p className="text-xs text-neutral-400">{badge.points}</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-brand-950 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center flex flex-col gap-6 items-center">
          <h2 className="font-display italic text-white leading-tight text-[32px] md:text-[44px] lg:text-[52px]">
            Your first step starts here.
          </h2>
          <p className="text-brand-300 text-lg max-w-lg">
            Join over 8,400 students who have found meaningful internships through InternPrangon. Free forever for students.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center">
            <button onClick={() => navigate("register")} className="bg-amber-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-amber-600 transition-colors text-base text-center">
              Create free account
            </button>
            <button onClick={() => navigate("internships")} className="border border-brand-600 text-brand-200 font-medium px-8 py-3.5 rounded-xl hover:bg-brand-900 transition-colors text-base text-center">
              Browse internships
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-neutral-900 py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-1 mb-3">
              <span className="font-display italic text-white text-lg">Intern</span>
              <span className="font-bold text-brand-400 text-lg">Prangon</span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              The most trusted internship platform in Bangladesh, connecting talented students with verified employers since 2024.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-4">Platform</p>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              {["Browse internships", "Company directory", "Leaderboard", "How it works"].map((l) => (
                <li key={l}><button className="hover:text-white transition-colors">{l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-4">For Students</p>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              {["Create profile", "Track applications", "Contributor badges", "Interview tips"].map((l) => (
                <li key={l}><button className="hover:text-white transition-colors">{l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-4">For Companies</p>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              {["Post internship", "Manage listings", "Find talent", "Verification"].map((l) => (
                <li key={l}><button className="hover:text-white transition-colors">{l}</button></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 text-center">
            &copy; 2024 InternPrangon. All rights reserved. Made with care for students of Bangladesh.
          </p>
        </div>
      </footer>
    </div>
  );
}
