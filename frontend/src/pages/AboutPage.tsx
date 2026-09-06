import React from 'react';

/* ─── Team Member ───────────────────────────────────────────── */
function TeamMember({ initials, name, role, color, bg }: { initials: string; name: string; role: string; color: string; bg: string }) {
  return (
    <div className="flex flex-col items-center gap-3 animate-fade-up">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-extrabold border border-black/5" style={{ background: bg, color }}>
        {initials}
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-neutral-900">{name}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{role}</p>
      </div>
    </div>
  );
}

/* ─── Value ─────────────────────────────────────────────────── */
function Value({ icon, title, body, delay }: { icon: React.ReactNode; title: string; body: string; delay: string }) {
  return (
    <div className={`animate-fade-up ${delay}`}>
      <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 leading-relaxed">{body}</p>
    </div>
  );
}

/* ─── How It Works Step ─────────────────────────────────────── */
function HowStep({ num, title, body, delay }: { num: string; title: string; body: string; delay: string }) {
  return (
    <div className={`flex items-start gap-5 animate-fade-up ${delay}`}>
      <div className="w-10 h-10 rounded-full bg-brand-950 text-white flex items-center justify-center text-sm font-extrabold shrink-0">{num}</div>
      <div>
        <h3 className="text-base font-bold text-neutral-900 mb-1">{title}</h3>
        <p className="text-sm text-neutral-500 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

/* ─── AboutPage ─────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="animate-page-enter bg-white min-h-screen">

      {/* ── Hero / Mission ── */}
      <section className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-accent-500 mb-4 animate-fade-up delay-100">Our Story</p>
            <h1 className="text-[64px] font-extrabold text-neutral-900 leading-[1.02] tracking-tight mb-8 animate-fade-up delay-200">
              Built by students,<br />
              <span className="text-brand-600">for students.</span>
            </h1>
            <p className="text-xl text-neutral-500 leading-relaxed max-w-2xl animate-fade-up delay-300">
              InternPrangon started in 2023 inside a software engineering classroom at BUET. A group of students frustrated by scattered job boards, fake listings, and zero transparency about what internships were actually like.
            </p>
            <p className="text-xl text-neutral-500 leading-relaxed max-w-2xl mt-4 animate-fade-up delay-400">
              So we built what we wished existed.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-neutral-50 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="grid grid-cols-4 gap-6 divide-x divide-neutral-200">
            {[
              { value: '1,200+', label: 'Active listings', sub: 'updated weekly' },
              { value: '380+',   label: 'Verified companies', sub: 'identity confirmed' },
              { value: '8,400+', label: 'Registered students', sub: 'across Bangladesh' },
              { value: '2023',   label: 'Founded', sub: 'Dhaka, Bangladesh' },
            ].map((s, i) => (
              <div key={s.label} className={`text-center animate-fade-up`} style={{ animationDelay: `${i * 80}ms` }}>
                <p className="text-4xl font-extrabold text-brand-950">{s.value}</p>
                <p className="text-sm font-semibold text-neutral-700 mt-1">{s.label}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-2 gap-20 items-center">
          {/* Problem */}
          <div className="animate-fade-left delay-100">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-danger-500 mb-3">The Problem</p>
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-6 leading-tight">
              Finding a real internship<br />should not feel this hard.
            </h2>
            <div className="space-y-4">
              {[
                'Listings scattered across Facebook groups, LinkedIn, and notice boards',
                'No way to know if a company is real, verified, or has any internship culture',
                'Zero transparency about stipends or what the work actually involves',
                'No place to share or read interview experiences from peers',
                'Applications disappear into email inboxes with no tracking',
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-4 h-4 rounded-full bg-danger-100 flex items-center justify-center shrink-0">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </span>
                  <p className="text-sm text-neutral-600 leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div className="animate-fade-right delay-200">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-success-600 mb-3">The Solution</p>
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-6 leading-tight">
              One platform.<br />Full transparency.
            </h2>
            <div className="space-y-4">
              {[
                'Centralized listings from verified companies only — no spam, no fake postings',
                'Company verification system reviewed by InternPrangon admin team',
                'Transparent stipend information contributed anonymously by students',
                'Real interview experiences shared by students who\'ve been through the process',
                'Application tracking so you always know where you stand',
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-4 h-4 rounded-full bg-success-100 flex items-center justify-center shrink-0">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
                  <p className="text-sm text-neutral-600 leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-neutral-50 border-y border-neutral-100 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14 animate-fade-up delay-100">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-accent-500 mb-3">Platform</p>
            <h2 className="text-4xl font-extrabold text-neutral-900">How InternPrangon works</h2>
          </div>

          <div className="grid grid-cols-2 gap-16">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-600 mb-6">For Students</p>
              <div className="space-y-8">
                <HowStep num="1" title="Create your profile and upload your resume" body="Build your student profile once. Upload your resume. InternPrangon will use it across all your applications." delay="delay-100" />
                <HowStep num="2" title="Browse and filter verified internships" body="Search by role, company, location, stipend, duration, and work type. Every listing is from a verified company." delay="delay-200" />
                <HowStep num="3" title="Apply with one click" body="Apply directly through InternPrangon using your saved resume. No downloading and attaching the same file twenty times." delay="delay-300" />
                <HowStep num="4" title="Track and get notified" body="See the status of every application in one place. Get notified when companies respond." delay="delay-400" />
              </div>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-success-600 mb-6">For Companies</p>
              <div className="space-y-8">
                <HowStep num="1" title="Create your company profile" body="Register your company and submit verification documents. Our admin team reviews and approves within 48 hours." delay="delay-100" />
                <HowStep num="2" title="Post internship listings" body="Once verified, post detailed internship listings. Control who sees your roles and when they close." delay="delay-200" />
                <HowStep num="3" title="Review applicants" body="Browse applicant profiles, download resumes, and manage applications — all from your company dashboard." delay="delay-300" />
                <HowStep num="4" title="Update application status" body="Keep applicants informed with status updates. A respectful process builds your employer brand." delay="delay-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-14 animate-fade-up delay-100">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-accent-500 mb-3">What We Believe</p>
          <h2 className="text-4xl font-extrabold text-neutral-900">Our principles</h2>
        </div>
        <div className="grid grid-cols-3 gap-10">
          <Value delay="delay-100" title="Transparency first" body="Stipends, ratings, and reviews are always visible. Students deserve to know what they're applying for before they apply." icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          } />
          <Value delay="delay-200" title="Verified, not assumed" body="Every company on InternPrangon has passed our verification process. No unverified listings, no fake companies." icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          } />
          <Value delay="delay-300" title="Community owned" body="The knowledge on InternPrangon — reviews, stipend data, interview experiences — is contributed by students, for students." icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          } />
        </div>
      </section>

      {/* ── Team ── */}
      <section className="bg-neutral-50 border-y border-neutral-100 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12 animate-fade-up delay-100">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-accent-500 mb-3">The Team</p>
            <h2 className="text-4xl font-extrabold text-neutral-900">Made by BUET students</h2>
            <p className="text-neutral-500 mt-3 text-base">A software engineering capstone project that became a real platform.</p>
          </div>
          <div className="flex justify-center gap-12 flex-wrap">
            {[
              { initials: 'AR', name: 'Arafat Rahman',    role: 'Project Lead & Backend',   color: '#2845e2', bg: '#eff4ff' },
              { initials: 'NS', name: 'Nusrat Sultana',   role: 'UI/UX & Frontend',          color: '#f97316', bg: '#fff7ed' },
              { initials: 'TI', name: 'Tanvir Islam',     role: 'Backend & Database',        color: '#059669', bg: '#f0fdf4' },
              { initials: 'ZH', name: 'Zara Hossain',     role: 'Frontend & Testing',        color: '#7c3aed', bg: '#f5f3ff' },
              { initials: 'MK', name: 'Mostafa Karim',    role: 'DevOps & Infrastructure',   color: '#0284c7', bg: '#eff6ff' },
            ].map((member, i) => (
              <div key={member.name} style={{ animationDelay: `${i * 80 + 200}ms` }}>
                <TeamMember {...member} />
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-neutral-400 mt-10">
            Advised by faculty at the Department of Computer Science & Engineering, BUET.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="rounded-3xl bg-brand-950 px-12 py-14 flex items-center justify-between gap-8 overflow-hidden relative animate-scale-in delay-100">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-800/40 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-brand-900/60 translate-y-1/2" />
          <div className="relative">
            <h2 className="text-4xl font-extrabold text-white leading-tight max-w-lg">
              Ready to find your<br />
              <span className="text-accent-400">first internship?</span>
            </h2>
            <p className="text-brand-200 mt-3 text-base">Join 8,400+ students who found their opportunity on InternPrangon.</p>
          </div>
          <div className="relative shrink-0 flex gap-3">
            <button className="h-12 px-8 bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm rounded-xl transition-all duration-150 active:scale-95 shadow-lg shadow-accent-900/30">
              Create Free Account
            </button>
            <button className="h-12 px-8 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition-all duration-150 border border-white/20">
              Browse Internships
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-0">
            <span className="font-extrabold text-brand-950">INTERN</span>
            <span className="font-extrabold text-brand-600">prangon</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 ml-0.5 mb-1.5" />
          </div>
          <p className="text-xs text-neutral-400">© 2024 InternPrangon · Smart Choices for Your First Steps</p>
          <div className="flex gap-4 text-xs text-neutral-400">
            <a href="#" className="hover:text-neutral-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-neutral-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-neutral-700 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
