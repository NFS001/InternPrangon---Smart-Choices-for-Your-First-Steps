import React, { useState, useEffect } from 'react';
import type { Navigate } from '../data/index';
import { getAllReviews, getAllInterviewExperiences, getSavedUser } from '../api/client';

/* ─── Data ──────────────────────────────────────────────────── */
type ReviewType = 'experience' | 'interview';

interface Review {
  id: number;
  type: ReviewType;
  company: string;
  companyLogo: string;
  companyLogoColor: string;
  companyLogoBg: string;
  role: string;
  rating?: number;
  duration?: string;
  location?: string;
  stipend?: string;
  paid?: boolean;
  date: string;
  title: string;
  body: string;
  pros?: string[];
  cons?: string[];
  wouldReturn?: boolean;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  outcome?: 'Accepted' | 'Rejected' | 'Pending' | 'Withdrew';
  rounds?: string[];
  anonymous: string;
  helpful: number;
  tags: string[];
}

const REVIEWS: Review[] = [
  {
    id: 1, type: 'experience',
    company: 'ByteForge Solutions', companyLogo: 'BF', companyLogoColor: '#2845e2', companyLogoBg: '#eff4ff',
    role: 'Frontend Developer Intern', rating: 5, duration: '3 months', location: 'Remote',
    stipend: 'BDT 15,000/mo', paid: true, date: 'Jan 2024',
    title: 'Best internship experience — actually wrote production code on day one.',
    body: "I was genuinely surprised by how much ownership they gave me. By week two I had a PR merged into main. The team treated me like a real developer, not an intern fetching coffee. My mentor spent two hours with me every Friday doing code review and teaching me things they don't teach in university. The tech stack is modern and the codebase is actually clean. Highly recommend.",
    pros: ['Real code, real responsibility', 'Excellent mentorship culture', 'Flexible remote hours', 'Modern tech stack'],
    cons: ['Communication sometimes falls between Slack and email', 'No formal onboarding document'],
    wouldReturn: true, helpful: 24,
    anonymous: 'CS Student, BUET', tags: ['React', 'Mentorship', 'Remote'],
  },
  {
    id: 2, type: 'interview',
    company: 'TechNova Ltd', companyLogo: 'TN', companyLogoColor: '#7c3aed', companyLogoBg: '#f5f3ff',
    role: 'Software Engineer Intern',
    date: 'Dec 2023', difficulty: 'Hard', outcome: 'Accepted',
    title: 'Rigorous technical process — but fair and well structured.',
    body: "Three rounds. First was a 30-min phone screen with HR. Second was a two-hour live coding session on HackerRank — DSA heavy, two medium problems. Third was a system design discussion with two senior engineers. They asked about database schema, API design, and how I'd handle scale. I was nervous but they were patient and gave hints when I was stuck. Offer came in 5 days.",
    rounds: ['HR Phone Screen', 'Live Coding (HackerRank)', 'System Design Interview'],
    helpful: 18, anonymous: 'CSE Student, SUST', tags: ['DSA', 'System Design', 'Live Coding'],
  },
  {
    id: 3, type: 'experience',
    company: 'CloudBase', companyLogo: 'CB', companyLogoColor: '#0284c7', companyLogoBg: '#eff6ff',
    role: 'Backend Developer Intern', rating: 5, duration: '6 months', location: 'Remote',
    stipend: 'BDT 20,000/mo', paid: true, date: 'Nov 2023',
    title: 'Startup pace, startup learning — I shipped features to thousands of users.',
    body: "CloudBase moves fast and expects you to move with them. There's no handholding but there's also no ceiling. Within a month I was writing Django views, working with Redis, and deploying to AWS. The CTO personally reviewed my first few PRs. It's not for everyone — if you want structured training this isn't it. But if you want to throw yourself in and learn fast, it's incredible.",
    pros: ['Huge autonomy', 'Direct access to senior engineers', 'Competitive stipend', 'Real production impact'],
    cons: ['Steep learning curve from day one', 'Docs are sparse for internal systems'],
    wouldReturn: true, helpful: 31,
    anonymous: 'Software Engineering Student, NSU', tags: ['Backend', 'AWS', 'Startup'],
  },
  {
    id: 4, type: 'interview',
    company: 'PixelCraft Studio', companyLogo: 'PC', companyLogoColor: '#f97316', companyLogoBg: '#fff7ed',
    role: 'UI/UX Designer Intern',
    date: 'Oct 2023', difficulty: 'Medium', outcome: 'Accepted',
    title: 'Portfolio review + live design challenge. Authentic and relaxed.',
    body: "They asked me to walk through two projects from my portfolio for about 30 minutes — focusing on the decisions I made, not just the outputs. Then a 45-min live design challenge in Figma: redesign a checkout flow for mobile. They watched in real-time and asked questions as I went. Felt less like an exam and more like a real design crit. I got feedback on my portfolio regardless of outcome.",
    rounds: ['Portfolio Review', 'Live Figma Challenge', 'Culture Fit Chat'],
    helpful: 13, anonymous: 'Design Student, Daffodil University', tags: ['Figma', 'Portfolio', 'Design Challenge'],
  },
  {
    id: 5, type: 'experience',
    company: 'DataNest BD', companyLogo: 'DN', companyLogoColor: '#059669', companyLogoBg: '#f0fdf4',
    role: 'Data Analyst Intern', rating: 4, duration: '6 months', location: 'On-site (Chittagong)',
    stipend: 'BDT 12,000/mo', paid: true, date: 'Aug 2023',
    title: 'Great for building real data skills. Less great for flexibility.',
    body: "The work was genuinely interesting — real client datasets, real deliverables. I built dashboards in Tableau that the client actually used. The commute to Chittagong was the hardest part. Fully on-site with fixed hours. The team is smart and supportive, but the pace can feel slow compared to startup environments. Good fit if you want structured analyst experience.",
    pros: ['Real client projects', 'Strong Python and SQL learning', 'Supportive senior analysts'],
    cons: ['Fully on-site, no flexibility', 'Commute dependent on location', 'Slow approval process for new ideas'],
    wouldReturn: false, helpful: 9,
    anonymous: 'Statistics Student, CU', tags: ['Python', 'Tableau', 'On-site'],
  },
  {
    id: 6, type: 'interview',
    company: 'ByteForge Solutions', companyLogo: 'BF', companyLogoColor: '#2845e2', companyLogoBg: '#eff4ff',
    role: 'Frontend Developer Intern',
    date: 'Jan 2024', difficulty: 'Easy', outcome: 'Accepted',
    title: 'Friendly and focused on how you think, not what you memorize.',
    body: "One round — a 60-min video call. First 15 mins was about my background and why I wanted to intern there. Then they shared their screen and walked through a real component from their codebase and asked how I'd improve it. No algorithmic puzzles, no whiteboard DSA. Just real frontend thinking. They valued curiosity and communication over raw knowledge. Got the offer the next day.",
    rounds: ['Video Call: Background + Code Review'],
    helpful: 22, anonymous: 'CS Student, IUT', tags: ['Frontend', 'Code Review', 'Friendly'],
  },
  {
    id: 7, type: 'experience',
    company: 'GrowthHub Agency', companyLogo: 'GH', companyLogoColor: '#d97706', companyLogoBg: '#fffbeb',
    role: 'Marketing Intern', rating: 3, duration: '3 months', location: 'Hybrid (Sylhet)',
    paid: false, date: 'Sep 2023',
    title: 'Unpaid but you do learn real marketing if you push for it.',
    body: "Unpaid, which stings. But if you're in Sylhet and looking for a portfolio piece in digital marketing, it's legitimate. The team gave me real campaigns to run — not just scheduling posts but thinking about the strategy. I had to push to get feedback but when I did it was valuable. Would have been a much better experience with a stipend.",
    pros: ['Real campaigns on real client accounts', 'Good portfolio value for marketing students'],
    cons: ['No stipend', 'Feedback is inconsistent', 'Some disorganization in project management'],
    wouldReturn: false, helpful: 6,
    anonymous: 'Business Student, Shahjalal University', tags: ['Marketing', 'Unpaid', 'Portfolio'],
  },
];

/* ─── Helpers ───────────────────────────────────────────────── */
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= rating ? '#f59e0b' : 'none'} stroke={n <= rating ? '#f59e0b' : '#cbd5e1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Easy:   { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  Medium: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  Hard:   { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
};

const OUTCOME_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Accepted: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  Rejected: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  Pending:  { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  Withdrew: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
};

/* ─── Experience Card ───────────────────────────────────────── */
function ExperienceCard({ review, expanded, onToggle }: { review: Review; expanded: boolean; onToggle: () => void }) {
  return (
    <article className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-md transition-all duration-200 animate-fade-up">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-neutral-100">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold border border-black/5 shrink-0" style={{ background: review.companyLogoBg, color: review.companyLogoColor }}>
            {review.companyLogo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-neutral-500">{review.company} · {review.role}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{review.duration} · {review.location} · {review.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={['px-2.5 py-0.5 text-[10px] font-bold rounded-full border', review.paid ? 'bg-success-50 text-success-700 border-success-200' : 'bg-accent-50 text-accent-700 border-accent-200'].join(' ')}>
                  {review.paid ? (review.stipend ?? 'Paid') : 'Unpaid'}
                </span>
              </div>
            </div>
            {review.rating !== undefined && (
              <div className="flex items-center gap-1.5 mt-2">
                <StarRating rating={review.rating} size={13} />
                <span className="text-xs font-bold text-neutral-800">{review.rating}.0</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <h3 className="text-base font-bold text-neutral-900 mb-3 leading-snug">{review.title}</h3>
        <p className="text-sm text-neutral-600 leading-relaxed">
          {expanded ? review.body : review.body.slice(0, 220) + (review.body.length > 220 ? '…' : '')}
        </p>
        {review.body.length > 220 && (
          <button onClick={onToggle} className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {expanded && review.pros && (
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-success-600 mb-2">Pros</p>
              <ul className="space-y-1.5">
                {review.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-neutral-700">
                    <span className="mt-0.5 w-3.5 h-3.5 rounded-full bg-success-100 flex items-center justify-center shrink-0">
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            {review.cons && (
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-danger-600 mb-2">Cons</p>
                <ul className="space-y-1.5">
                  {review.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-neutral-700">
                      <span className="mt-0.5 w-3.5 h-3.5 rounded-full bg-danger-100 flex items-center justify-center shrink-0">
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {expanded && review.wouldReturn !== undefined && (
          <div className={['mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border', review.wouldReturn ? 'bg-success-50 text-success-700 border-success-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'].join(' ')}>
            {review.wouldReturn ? '✓ Would intern here again' : '✗ Would not return'}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {review.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 text-neutral-500 rounded-full border border-neutral-200">{tag}</span>
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-neutral-400">— {review.anonymous}</span>
          <button className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-neutral-600 transition-colors">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            {review.helpful} helpful
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Interview Card ────────────────────────────────────────── */
function InterviewCard({ review, expanded, onToggle }: { review: Review; expanded: boolean; onToggle: () => void }) {
  const diff = review.difficulty ? DIFFICULTY_COLORS[review.difficulty] : null;
  const out = review.outcome ? OUTCOME_COLORS[review.outcome] : null;

  return (
    <article className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-md transition-all duration-200 animate-fade-up">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-neutral-100">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold border border-black/5 shrink-0" style={{ background: review.companyLogoBg, color: review.companyLogoColor }}>
            {review.companyLogo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-neutral-500">{review.company} · {review.role}</p>
                <p className="text-xs text-neutral-400 mt-0.5">Interview experience · {review.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {diff && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border" style={{ background: diff.bg, color: diff.text, borderColor: diff.border }}>
                    {review.difficulty}
                  </span>
                )}
                {out && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border" style={{ background: out.bg, color: out.text, borderColor: out.border }}>
                    {review.outcome}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <h3 className="text-base font-bold text-neutral-900 mb-3 leading-snug">{review.title}</h3>

        {review.rounds && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {review.rounds.map((r, i) => (
              <React.Fragment key={r}>
                <span className="px-2.5 py-1 text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded-full">{r}</span>
                {i < review.rounds!.length - 1 && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <p className="text-sm text-neutral-600 leading-relaxed">
          {expanded ? review.body : review.body.slice(0, 220) + (review.body.length > 220 ? '…' : '')}
        </p>
        {review.body.length > 220 && (
          <button onClick={onToggle} className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {review.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 text-neutral-500 rounded-full border border-neutral-200">{tag}</span>
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-neutral-400">— {review.anonymous}</span>
          <button className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-neutral-600 transition-colors">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            {review.helpful} helpful
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── ReviewsPage ───────────────────────────────────────────── */
export default function ReviewsPage({ navigate }: { navigate?: Navigate }) {
  const [tab, setTab] = useState<'all' | 'experience' | 'interview'>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [allReviews, setAllReviews] = useState<Review[]>(REVIEWS);

  useEffect(() => {
    Promise.all([
      getAllReviews().catch(() => ({ reviews: [] })),
      getAllInterviewExperiences().catch(() => ({ interviewExperiences: [] })),
    ]).then(([revRes, intRes]) => {
      const liveReviews: Review[] = (revRes.reviews || []).map((r, idx) => {
        const logo = r.company ? r.company.slice(0, 2).toUpperCase() : 'CO';
        const dateStr = new Date(r.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          year: 'numeric',
        });
        return {
          id: 10000 + idx,
          type: 'experience' as const,
          company: r.company || 'Partner Company',
          companyLogo: logo,
          companyLogoColor: '#2845e2',
          companyLogoBg: '#eff4ff',
          role: 'Intern',
          rating: r.rating,
          duration: 'Internship',
          location: 'Bangladesh',
          paid: true,
          date: dateStr,
          title: r.comment.length > 70 ? `${r.comment.slice(0, 70)}...` : r.comment,
          body: r.comment,
          pros: ['Real hands-on experience', 'Verified anonymous student review'],
          cons: [],
          wouldReturn: r.rating >= 4,
          helpful: 1,
          anonymous: 'Verified Student, InternPrangon',
          tags: [r.industry || 'Experience', 'Student Voice'],
        };
      });

      const liveInterviews: Review[] = (intRes.interviewExperiences || []).map((ie, idx) => {
        const logo = ie.company ? ie.company.slice(0, 2).toUpperCase() : 'CO';
        const dateStr = new Date(ie.datePosted).toLocaleDateString(undefined, {
          month: 'short',
          year: 'numeric',
        });
        return {
          id: 20000 + idx,
          type: 'interview' as const,
          company: ie.company || 'Partner Company',
          companyLogo: logo,
          companyLogoColor: '#7c3aed',
          companyLogoBg: '#f5f3ff',
          role: 'Intern Applicant',
          date: dateStr,
          difficulty: 'Medium' as const,
          outcome: 'Accepted' as const,
          title: ie.questions.length > 70 ? `${ie.questions.slice(0, 70)}...` : ie.questions,
          body: ie.questions,
          rounds: ['Technical Interview', 'Behavioral Discussion'],
          helpful: 1,
          anonymous: 'Verified Student, InternPrangon',
          tags: ['Interview', 'Questions'],
        };
      });

      setAllReviews([...liveReviews, ...liveInterviews, ...REVIEWS]);
    });
  }, []);

  const filtered = allReviews.filter((r) => {
    const matchTab = tab === 'all' || r.type === tab;
    const matchSearch =
      !search ||
      r.company.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase()) ||
      (r.tags && r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    return matchTab && matchSearch;
  });

  const ratingList = allReviews.filter((r) => r.rating);
  const avgRating =
    ratingList.length > 0
      ? (ratingList.reduce((acc, r) => acc + (r.rating ?? 0), 0) / ratingList.length).toFixed(1)
      : '4.8';
  const experienceCount = allReviews.filter((r) => r.type === 'experience').length;
  const interviewCount = allReviews.filter((r) => r.type === 'interview').length;
  const outcomeList = allReviews.filter((r) => r.outcome);
  const acceptRate =
    outcomeList.length > 0
      ? Math.round(
          (allReviews.filter((r) => r.outcome === 'Accepted').length / outcomeList.length) * 100
        )
      : 85;

  return (
    <div className="animate-page-enter bg-white min-h-screen">
      {/* ── Header ── */}
      <section className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-8 pt-14 pb-10">
          <div className="flex items-end justify-between gap-8">
            <div className="max-w-xl animate-fade-up delay-100">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-accent-500 mb-3">Student Voices</p>
              <h1 className="text-5xl font-extrabold text-neutral-900 leading-tight tracking-tight mb-4">
                Real reviews.<br />
                <span className="text-brand-600">Honest experiences.</span>
              </h1>
              <p className="text-neutral-500 text-base leading-relaxed">
                Anonymous reviews from students who've interned. No filters, no spin — just what it's actually like.
              </p>
            </div>

            {/* Stats */}
            <div className="hidden lg:grid grid-cols-3 gap-4 shrink-0 animate-fade-up delay-200">
              {[
                { value: avgRating, label: 'Avg. Rating' },
                { value: `${experienceCount}`, label: 'Experiences' },
                { value: `${acceptRate}%`, label: 'Accept Rate' },
              ].map((s) => (
                <div key={s.label} className="text-center px-6 py-4 bg-neutral-50 rounded-2xl border border-neutral-200 min-w-[90px]">
                  <p className="text-2xl font-extrabold text-neutral-900">{s.value}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center gap-4 flex-wrap animate-fade-up delay-300">
            <div className="flex items-center gap-1 bg-neutral-100 rounded-full p-1">
              {([
                { id: 'all',        label: 'All Reviews' },
                { id: 'experience', label: 'Internship Experiences' },
                { id: 'interview',  label: 'Interview Experiences' },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={['px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150', tab === t.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'].join(' ')}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative ml-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search company or role…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 pr-4 text-xs bg-white border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-neutral-400 w-52"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex gap-10">
          {/* Main feed */}
          <div className="flex-1 min-w-0 space-y-4">
            <p className="text-sm text-neutral-500 font-medium mb-6">
              <span className="font-bold text-neutral-900">{filtered.length}</span> review{filtered.length !== 1 ? 's' : ''}
            </p>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-base font-bold text-neutral-500">No reviews found</p>
                <button onClick={() => { setSearch(''); setTab('all'); }} className="mt-1 h-9 px-5 text-sm font-semibold text-brand-600 border border-brand-200 rounded-full hover:bg-brand-50 transition-colors">Clear filters</button>
              </div>
            )}

            {filtered.map((review, i) => (
              <div key={review.id} style={{ animationDelay: `${i * 60}ms` }}>
                {review.type === 'experience' ? (
                  <ExperienceCard
                    review={review}
                    expanded={expanded === review.id}
                    onToggle={() => setExpanded(expanded === review.id ? null : review.id)}
                  />
                ) : (
                  <InterviewCard
                    review={review}
                    expanded={expanded === review.id}
                    onToggle={() => setExpanded(expanded === review.id ? null : review.id)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-[88px] space-y-5">
              {/* Write a review CTA */}
              <div className="bg-brand-950 rounded-2xl p-5 text-white">
                <h3 className="text-sm font-extrabold mb-2">Share your experience</h3>
                <p className="text-xs text-brand-200 leading-relaxed mb-4">Help fellow students by sharing your honest internship or interview experience. 100% anonymous.</p>
                <button
                  onClick={() => {
                    const user = getSavedUser();
                    navigate?.(user ? 'write-review' : 'login');
                  }}
                  className="w-full h-9 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-full transition-all duration-150 active:scale-95"
                >
                  Write a Review
                </button>
              </div>

              {/* Top rated companies */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-400 mb-4">Top Rated</h3>
                <div className="space-y-3">
                  {[
                    { name: 'CloudBase', rating: 4.8, logo: 'CB', logoBg: '#eff6ff', logoColor: '#0284c7' },
                    { name: 'ByteForge', rating: 4.7, logo: 'BF', logoBg: '#eff4ff', logoColor: '#2845e2' },
                    { name: 'Insight Analytics', rating: 4.6, logo: 'IA', logoBg: '#f5f3ff', logoColor: '#6d28d9' },
                    { name: 'DataNest BD', rating: 4.5, logo: 'DN', logoBg: '#f0fdf4', logoColor: '#059669' },
                  ].map((c) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold border border-black/5 shrink-0" style={{ background: c.logoBg, color: c.logoColor }}>
                        {c.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-800 truncate">{c.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                          <span className="text-[10px] font-bold text-neutral-700">{c.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anonymous note */}
              <div className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  <span className="font-bold text-neutral-700">100% Anonymous.</span> InternPrangon never reveals reviewer identities to companies. Reviews may be moderated for inappropriate content.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
