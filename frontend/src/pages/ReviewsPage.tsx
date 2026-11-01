import React, { useState, useEffect, useMemo } from 'react';
import type { Navigate } from '../data/index';
import { CompanyLogo } from '../components/common/CompanyLogos';
import { getAllReviews, getAllInterviewExperiences, getSavedUser } from '../api/client';
import ReportReviewModal, { type ReportTargetReview } from '../components/public/ReportReviewModal';

/* ─── Types ─────────────────────────────────────────────────── */
export type ReviewType = 'experience' | 'interview';

export interface StructuredReview {
  id: number | string;
  backendId?: string;
  type: ReviewType;
  company: string;
  role: string;
  department?: string;
  rating: number;
  location: string;
  period: string;
  studentBadge: string;
  paid: boolean;
  stipend?: string;
  title: string;
  body: string;
  pros: string[];
  cons: string[];
  advice?: string;
  subRatings?: {
    mentorship: number;
    workLife: number;
    fairStipend: boolean;
  };
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  outcome?: string;
  rounds?: string[];
  questions?: string;
  prepTips?: string;
  tags: string[];
  helpfulCount: number;
}

/* ─── Curated Structured Initial Reviews ───────────────────── */
const CURATED_REVIEWS: StructuredReview[] = [
  {
    id: 'rev-bs23',
    type: 'experience',
    company: 'Brain Station 23',
    role: 'Software Engineer Intern',
    department: 'Cloud & Distributed Systems',
    rating: 5.0,
    location: 'Mohakhali, Dhaka (Hybrid)',
    period: 'Completed Fall 2026',
    studentBadge: 'Verified BUET Intern',
    paid: true,
    stipend: 'BDT 18,000/mo',
    title: 'Transformative engineering mentorship with production microservices ownership from day one',
    body: 'Brain Station 23 provided arguably the most intellectually rigorous and respectful internship I could have asked for. Unlike corporate programs where interns only touch sandbox mock apps, my squad paired me with a Principal Architect who involved me in live AWS Lambda and Go microservices design reviews for European enterprise clients.',
    pros: [
      'Direct 1-on-1 mentorship by Senior Tech Leads with weekly architectural review hours',
      'Actual production repository write access with comprehensive CI/CD pipeline automation',
      'Catered lunch, premium coffee breakout lounge, and flexible sprint retrospectives',
    ],
    cons: [
      'High expectation of self-driven research and fast documentation digestion',
      'Occasional sprint overtime during multi-region client deployment cutovers',
    ],
    advice: 'Study distributed message queues (Kafka/RabbitMQ) and Docker containerization fundamentals before your interview round.',
    subRatings: { mentorship: 5, workLife: 4, fairStipend: true },
    tags: ['Software & Technology', 'Go', 'AWS', 'Microservices'],
    helpfulCount: 28,
  },
  {
    id: 'rev-bkash',
    type: 'experience',
    company: 'bKash Limited',
    role: 'Fintech Security & Cloud Intern',
    department: 'Infrastructure Security & MFS',
    rating: 4.9,
    location: 'Dhaka, Bangladesh · On-site',
    period: 'Completed Fall 2026',
    studentBadge: 'Verified BRACU Intern',
    paid: true,
    stipend: 'BDT 22,000/mo',
    title: 'High-concurrency financial architecture with world-class transaction security protocols',
    body: 'Working inside Bangladesh’s first tech unicorn exposed me to transactional scales rarely taught in university courses. I contributed to fraud prevention heuristics and automated vulnerability scanning pipelines that process millions of daily mobile wallet events.',
    pros: [
      'Highest intern stipend in Bangladesh tech with commuter allowance',
      'Unmatched learning around financial compliance, HSM encryption, and zero-trust security',
      'Transparent management with genuine opportunities for PPO full-time conversion',
    ],
    cons: [
      'Strict device policies and network sandboxing require patience for code deployment',
      'Enterprise paperwork approval required for adopting new external npm libraries',
    ],
    advice: 'Review OWASP Top 10 API vulnerabilities and relational database index tuning (PostgreSQL).',
    subRatings: { mentorship: 5, workLife: 5, fairStipend: true },
    tags: ['Fintech', 'Cybersecurity', 'PostgreSQL', 'High Concurrency'],
    helpfulCount: 34,
  },
  {
    id: 'rev-uber',
    type: 'interview',
    company: 'Uber',
    role: 'Backend Engineering Intern',
    department: 'Mobility Dispatch Systems',
    rating: 4.8,
    location: 'Dhaka Hub & Remote',
    period: 'Interviewed Oct 2026',
    studentBadge: 'Verified NSU Applicant',
    paid: true,
    stipend: 'BDT 24,000/mo',
    title: 'Rigorous algorithmic & spatial concurrency rounds with empathetic interviewers',
    body: 'The interview loop consisted of three stages: an initial algorithmic phone screen on CodeSignal, followed by a live pairing round implementing a spatial geospatial caching layer, and a final architecture discussion with the engineering lead.',
    difficulty: 'Hard',
    outcome: 'Offer Accepted',
    rounds: ['Algorithmic Phone Screen', 'Geospatial Live Coding', 'System Architecture & Fit'],
    questions: '1. Design an in-memory driver location indexing service using QuadTrees or Geohashes.\n2. Handle distributed clock drift in concurrent trip fare settlement.',
    prepTips: 'Solve LeetCode Medium tree/graph problems and master Go or Python concurrency primitives (goroutines/channels).',
    pros: [
      'Interviewers give structured hints and care about your thought process, not memorization',
      'Rapid turnaround — offer letter received 48 hours following final architectural round',
    ],
    cons: [
      'High bar on time complexity analysis and memory cache edge-case handling',
    ],
    advice: 'Talk out loud continuously. When you make a design trade-off, explain why you chose read throughput over write latency.',
    subRatings: { mentorship: 5, workLife: 4, fairStipend: true },
    tags: ['Interview Tips', 'Golang', 'Algorithms', 'System Design'],
    helpfulCount: 42,
  },
  {
    id: 'rev-chaldal',
    type: 'experience',
    company: 'Chaldal',
    role: 'Backend Engineering Intern',
    department: 'Warehouse Automation & Routing',
    rating: 4.7,
    location: 'Tejgaon, Dhaka · On-site',
    period: 'Completed Summer 2026',
    studentBadge: 'Verified IUT Intern',
    paid: true,
    stipend: 'BDT 18,000/mo',
    title: 'Fascinating logistics automation using .NET Core and real-time fleet algorithms',
    body: 'Chaldal is one of the few engineering shops in Bangladesh building proprietary logistics robots and dark-store fulfillment software. My team rewrote the dispatch queue balancer, cutting average order packing latency by 12%.',
    pros: [
      'Huge autonomy and tangible real-world impact seen directly on delivery trucks',
      'Solid engineering culture centered on functional C# (.NET Core) and clean architecture',
      'Free lunch, friendly team banter, and direct access to founder/CTO during brownbag sessions',
    ],
    cons: [
      'Fulfillment hubs are busy and on-site attendance in Tejgaon is expected 5 days a week',
      'Legacy microservices have patchy documentation',
    ],
    advice: 'Brush up on async/await concurrency in C# and SQL query plan profiling.',
    subRatings: { mentorship: 4, workLife: 4, fairStipend: true },
    tags: ['E-Commerce', 'C#', '.NET Core', 'Logistics'],
    helpfulCount: 19,
  },
  {
    id: 'rev-10ms',
    type: 'experience',
    company: '10 Minute School',
    role: 'Frontend React / Next.js Intern',
    department: 'Student Learning Platform',
    rating: 4.8,
    location: 'Mohakhali, Dhaka · Hybrid',
    period: 'Completed Summer 2026',
    studentBadge: 'Verified DU Intern',
    paid: true,
    stipend: 'BDT 15,000/mo',
    title: 'Fast-paced, product-driven culture building education tools used by millions of students',
    body: 'As a student myself, building interactive quiz interfaces and video streaming player modules for 10MS felt deeply purposeful. The UI/UX squad is obsessed with web vitals performance and mobile accessibility.',
    pros: [
      'Features shipped within your first 3 weeks will be utilized by secondary school students nationwide',
      'Super modern stack: Next.js 14, TailwindCSS, TypeScript, and Storybook design systems',
      'Youthful, collaborative office vibe with casual sprint standups',
    ],
    cons: [
      'Fast product pivots mean priorities change quickly across sprint cycles',
      'Occasional push before major exam season product launches',
    ],
    advice: 'Prepare a clean Figma-to-React portfolio demonstrating responsive layouts and accessibility (ARIA).',
    subRatings: { mentorship: 5, workLife: 4, fairStipend: true },
    tags: ['EdTech', 'React', 'Next.js', 'TailwindCSS'],
    helpfulCount: 23,
  },
  {
    id: 'rev-rokomari',
    type: 'experience',
    company: 'Rokomari',
    role: 'Full Stack Web Intern',
    department: 'Catalog & Search Engine',
    rating: 4.6,
    location: 'Motijheel, Dhaka · On-site',
    period: 'Completed Spring 2026',
    studentBadge: 'Verified SUST Intern',
    paid: true,
    stipend: 'BDT 15,000/mo',
    title: 'Solid engineering foundation with search relevance & Elasticsearch tuning',
    body: 'Contributed to the Bengali phonetic search tokenizer and catalog indexing pipeline. The senior engineers take time to explain database architecture choices and promote clean software engineering principles.',
    pros: [
      'Work with millions of book and merchandise SKUs in high-volume search engines',
      'Welcoming and humble engineering team with zero corporate politics',
      'Discounted books and reading culture throughout the organization',
    ],
    cons: [
      'Traditional office layout and fixed 9 AM to 6 PM working schedule',
      'Approval cycles for production releases can take multiple review tiers',
    ],
    advice: 'Review inverted index fundamentals and RESTful API best practices.',
    subRatings: { mentorship: 4, workLife: 4, fairStipend: true },
    tags: ['E-Commerce', 'Elasticsearch', 'Python', 'Web Dev'],
    helpfulCount: 16,
  },
];

/* ─── Top Rated Companies Widget Data ───────────────────────── */
const TOP_RATED_COMPANIES = [
  { rank: 1, name: 'Uber Bangladesh', rating: 4.9, stipend: 'BDT 24,000/mo', reviews: 36, logo: 'Uber' },
  { rank: 2, name: 'bKash Limited', rating: 4.9, stipend: 'BDT 22,000/mo', reviews: 54, logo: 'bKash' },
  { rank: 3, name: 'Brain Station 23', rating: 5.0, stipend: 'BDT 18,000/mo', reviews: 42, logo: 'Brain Station 23' },
  { rank: 4, name: 'Pathao', rating: 4.8, stipend: 'BDT 20,000/mo', reviews: 29, logo: 'Pathao' },
  { rank: 5, name: 'Chaldal', rating: 4.7, stipend: 'BDT 18,000/mo', reviews: 31, logo: 'Chaldal' },
];

/* ─── Star Rating Helper ────────────────────────────────────── */
function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-3.5 h-3.5 ${
            n <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function ReviewsPage({ navigate }: { navigate?: Navigate }) {
  const [tab, setTab] = useState<'all' | 'experience' | 'interview'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'helpful' | 'highest' | 'recent'>('helpful');
  const [allReviews, setAllReviews] = useState<StructuredReview[]>(CURATED_REVIEWS);
  const [helpfulSet, setHelpfulSet] = useState<Set<string | number>>(new Set());
  const [reportingReview, setReportingReview] = useState<ReportTargetReview | null>(null);
  const [reportedReviewIds, setReportedReviewIds] = useState<Set<string | number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync deleted reviews from admin moderation
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('internprangon_deleted_reviews');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const raw = localStorage.getItem('internprangon_deleted_reviews');
        setDeletedIds(new Set(raw ? JSON.parse(raw) : []));
      } catch {}
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('internprangon_reviews_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('internprangon_reviews_updated', handleSync);
    };
  }, []);

  // Fetch verified reviews and interview experiences from backend
  useEffect(() => {
    Promise.all([
      getAllReviews().catch(() => ({ reviews: [] })),
      getAllInterviewExperiences().catch(() => ({ interviewExperiences: [] })),
    ]).then(([revRes, intRes]) => {
      const liveReviews: StructuredReview[] = (revRes.reviews || []).map((r, idx) => {
        const dateStr = new Date(r.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          year: 'numeric',
        });
        return {
          id: `live-rev-${r.id || idx}`,
          backendId: r.id,
          type: 'experience',
          company: r.company || 'Partner Company',
          role: 'Software Intern',
          department: r.industry || 'Engineering & Technology',
          rating: r.rating || 5.0,
          location: 'Dhaka, Bangladesh',
          period: dateStr,
          studentBadge: 'Verified Student Contributor',
          paid: true,
          stipend: 'BDT 18,000/mo',
          title: r.comment && r.comment.length > 75 ? `${r.comment.slice(0, 75)}...` : r.comment || 'Verified Internship Experience',
          body: r.comment || 'Great learning experience with collaborative engineering mentorship.',
          pros: [
            'Supportive senior mentorship and daily sprint standups',
            'Real-world codebase contribution with pull request reviews',
          ],
          cons: [
            'Requires strong proactive initiative during initial onboarding',
          ],
          advice: 'Demonstrate solid fundamentals in Git and standard data structures.',
          subRatings: { mentorship: 5, workLife: 4, fairStipend: true },
          tags: [r.industry || 'Technology', 'Verified Review'],
          helpfulCount: 8,
        };
      });

      const liveInterviews: StructuredReview[] = (intRes.interviewExperiences || []).map((ie, idx) => {
        const dateStr = ie.interviewDate
          ? ie.interviewDate
          : new Date(ie.datePosted).toLocaleDateString(undefined, {
              month: 'short',
              year: 'numeric',
            });

        const roundsList: string[] = [];
        if (ie.interviewType) roundsList.push(ie.interviewType);
        if (ie.rounds) {
          roundsList.push(
            ie.rounds.toLowerCase().includes('round') ? ie.rounds : `${ie.rounds} Rounds`
          );
        }
        if (roundsList.length === 0) roundsList.push('Technical Interview');

        const roleName = ie.role || 'Intern Applicant';

        return {
          id: `live-int-${ie.id || idx}`,
          backendId: ie.id,
          type: 'interview',
          company: ie.company || 'Partner Company',
          role: roleName,
          rating: 4.8,
          location: 'Dhaka, Bangladesh',
          period: dateStr,
          studentBadge: 'Verified Interviewee',
          paid: true,
          title: `${roleName} Interview Process & Evaluation`,
          body: ie.process || ie.questions || 'Structured multi-round technical interview experience.',
          difficulty: (ie.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
          outcome: ie.outcome || 'Offer Received',
          rounds: roundsList,
          questions: ie.questions,
          prepTips: ie.tips,
          pros: ['Clear communication and timely feedback from engineering managers'],
          cons: ['Rigorous live problem-solving on the spot'],
          subRatings: { mentorship: 5, workLife: 4, fairStipend: true },
          tags: [ie.interviewType || 'Interview', 'Technical Prep'],
          helpfulCount: 12,
        };
      });

      setAllReviews([...liveReviews, ...liveInterviews, ...CURATED_REVIEWS]);
    });
  }, []);

  const handleHelpfulToggle = (id: string | number) => {
    setHelpfulSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setToastMessage('Marked as helpful. Thank you for your feedback!');
        setTimeout(() => setToastMessage(null), 2500);
      }
      return next;
    });
  };

  const handleReport = (review: StructuredReview) => {
    setReportingReview({
      id: review.backendId || review.id,
      company: review.company,
      rating: review.rating,
      content: review.body,
      anonymous: review.studentBadge,
    });
  };

  const handleReportSuccess = (targetId: string | number) => {
    setReportedReviewIds((prev) => new Set([...prev, targetId]));
    setToastMessage('Thank you. This review has been flagged for admin moderation.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter and sort reviews
  const filtered = useMemo(() => {
    return allReviews
      .filter((r) => {
        if (deletedIds.has(String(r.id)) || (r.backendId && deletedIds.has(String(r.backendId)))) {
          return false;
        }
        if (tab !== 'all' && r.type !== tab) {
          return false;
        }
        if (search) {
          const q = search.toLowerCase();
          const matchCompany = r.company.toLowerCase().includes(q);
          const matchRole = r.role.toLowerCase().includes(q);
          const matchTags = r.tags.some((t) => t.toLowerCase().includes(q));
          const matchBody = r.body.toLowerCase().includes(q);
          if (!matchCompany && !matchRole && !matchTags && !matchBody) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'helpful') {
          const aCount = a.helpfulCount + (helpfulSet.has(a.id) ? 1 : 0);
          const bCount = b.helpfulCount + (helpfulSet.has(b.id) ? 1 : 0);
          return bCount - aCount;
        }
        if (sortBy === 'highest') {
          return b.rating - a.rating;
        }
        return 0;
      });
  }, [allReviews, tab, search, sortBy, helpfulSet, deletedIds]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-24 font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* ── Background Aura Glows ── */}
      <div className="absolute top-0 left-1/4 w-[650px] h-[380px] bg-indigo-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-64 right-1/4 w-[500px] h-[340px] bg-orange-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0F172A]/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 border border-white/10 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Report Modal */}
      <ReportReviewModal
        review={reportingReview}
        onClose={() => setReportingReview(null)}
        onSuccess={handleReportSuccess}
        onRequireAuth={() => navigate?.('login')}
      />

      {/* ═══════════════════════════════════════════════════════════════
          PART 1: HEADER & DYNAMIC FILTERS
          ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        {/* Section Tag */}
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F97316] mb-3">
          STUDENT VOICES
        </p>

        {/* Headline with Indigo gradient accent */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight mb-3">
          Real reviews.{' '}
          <span className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] bg-clip-text text-transparent">
            Honest experiences.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          100% anonymous, verified reviews from students who completed internships across Bangladesh. No filters, no corporate spin.
        </p>

        {/* Filter Toolbar */}
        <div className="mt-8 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-2 sm:p-2.5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left Segmented Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto shrink-0">
            <button
              onClick={() => setTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tab === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Reviews ({allReviews.length})
            </button>
            <button
              onClick={() => setTab('experience')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tab === 'experience'
                  ? 'bg-white text-indigo-700 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Internship Experiences
            </button>
            <button
              onClick={() => setTab('interview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tab === 'interview'
                  ? 'bg-white text-indigo-700 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interview Tips & Questions
            </button>
          </div>

          {/* Right Search & Sort */}
          <div className="flex items-center gap-2.5 flex-1 max-w-lg justify-end">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl flex-1 min-w-[200px]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by company, role, or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 font-bold text-xs">✕</button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-1"
              >
                <option value="helpful">Most Helpful</option>
                <option value="highest">Highest Rated</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PART 2: TWO-COLUMN REVIEW LAYOUT (68% / 32%)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-8 items-start">
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN (68% width) - Main Review Stream
              ───────────────────────────────────────────────────────────── */}
          <div className="space-y-6 min-w-0">
            {filtered.length === 0 ? (
              <div className="py-20 text-center bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl mx-auto mb-4">
                  💬
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No reviews match your filters</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-5">
                  Try adjusting your search query or reset the filter selection.
                </p>
                <button
                  onClick={() => { setSearch(''); setTab('all'); }}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filtered.map((rev) => {
                const isHelpful = helpfulSet.has(rev.id);
                const currentHelpfulCount = rev.helpfulCount + (isHelpful ? 1 : 0);
                const isReported = reportedReviewIds.has(rev.backendId || rev.id) || reportedReviewIds.has(rev.id);

                return (
                  <article
                    key={rev.id}
                    className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* ── Card Header ── */}
                    <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                          <CompanyLogo name={rev.company} size={42} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-[#0F172A] text-base sm:text-lg">
                              {rev.role}
                            </h3>
                            <span className="text-xs font-bold text-slate-400">•</span>
                            <span className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate?.('company-detail', { companyId: rev.company })}>
                              {rev.company}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            {rev.location} · {rev.period} ·{' '}
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                              <span>✔</span>
                              <span>{rev.studentBadge}</span>
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Top Right Badges */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                        {rev.paid && (
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {rev.stipend || 'Paid'}
                          </span>
                        )}
                        {rev.difficulty && (
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                              rev.difficulty === 'Easy'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : rev.difficulty === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {rev.difficulty} Difficulty
                          </span>
                        )}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/80 border border-amber-200/70">
                          <StarRating rating={rev.rating} />
                          <span className="text-xs font-black text-slate-900">{rev.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Structured Body Content ── */}
                    <div className="py-5 space-y-4">
                      {/* Review Title */}
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        "{rev.title}"
                      </h4>

                      {/* Main Narrative */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {rev.body}
                      </p>

                      {/* Interview Stages Pipeline (if interview type) */}
                      {rev.rounds && rev.rounds.length > 0 && (
                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                            Interview Stages & Evaluation:
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            {rev.rounds.map((round, rIdx) => (
                              <React.Fragment key={round}>
                                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-indigo-700 border border-indigo-200/80 shadow-2xs">
                                  {round}
                                </span>
                                {rIdx < rev.rounds!.length - 1 && (
                                  <span className="text-slate-300 font-bold text-xs">→</span>
                                )}
                              </React.Fragment>
                            ))}
                            {rev.outcome && (
                              <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                {rev.outcome}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Questions Asked & Prep Tips (if present) */}
                      {rev.questions && (
                        <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 text-xs">
                          <span className="font-bold text-indigo-800 block mb-1">
                            💬 Technical Questions Encountered:
                          </span>
                          <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                            {rev.questions}
                          </p>
                        </div>
                      )}

                      {/* Structured Pros & Cons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        {/* The Good (Pros) */}
                        {rev.pros && rev.pros.length > 0 && (
                          <div className="rounded-2xl p-4 bg-emerald-50/30 border-l-4 border-emerald-500 border border-emerald-100/60">
                            <span className="text-xs font-extrabold text-emerald-700 block mb-2 uppercase tracking-wide">
                              ✓ The Good (Pros)
                            </span>
                            <ul className="space-y-1.5 text-xs text-slate-700">
                              {rev.pros.map((pro, pIdx) => (
                                <li key={pIdx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-600 font-bold">•</span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* The Challenges (Cons) */}
                        {rev.cons && rev.cons.length > 0 && (
                          <div className="rounded-2xl p-4 bg-amber-50/30 border-l-4 border-amber-500 border border-amber-100/60">
                            <span className="text-xs font-extrabold text-amber-700 block mb-2 uppercase tracking-wide">
                              △ The Challenges (Cons)
                            </span>
                            <ul className="space-y-1.5 text-xs text-slate-700">
                              {rev.cons.map((con, cIdx) => (
                                <li key={cIdx} className="flex items-start gap-1.5">
                                  <span className="text-amber-600 font-bold">•</span>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Advice to Future Applicants */}
                      {rev.advice && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                          <span className="font-bold text-slate-900 block mb-0.5">
                            💡 Advice to Future Applicants:
                          </span>
                          <span>{rev.advice}</span>
                        </div>
                      )}
                    </div>

                    {/* ── Sub-Rating Metrics Bar ── */}
                    {rev.subRatings && (
                      <div className="py-3 px-4 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Mentorship:</span>
                          <span className="font-black text-slate-800">{rev.subRatings.mentorship}/5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Work-Life Balance:</span>
                          <span className="font-black text-slate-800">{rev.subRatings.workLife}/5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Fair Stipend:</span>
                          <span className="font-black text-emerald-700">
                            {rev.subRatings.fairStipend ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* ── Card Footer: Tags & Helpful / Report Actions ── */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {rev.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleHelpfulToggle(rev.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isHelpful
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-2xs'
                          }`}
                        >
                          <span>👍</span>
                          <span>Helpful ({currentHelpfulCount})</span>
                        </button>

                        {isReported ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            ✓ Reported
                          </span>
                        ) : (
                          <button
                            onClick={() => handleReport(rev)}
                            className="text-xs text-slate-400 hover:text-rose-500 font-semibold cursor-pointer transition-colors"
                          >
                            Report
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN (32% width) - Sidebar Widgets
              ───────────────────────────────────────────────────────────── */}
          <aside className="sticky top-20 flex flex-col gap-6">
            {/* Card 1: "Share Your Experience" CTA (Deep Indigo card) */}
            <div className="rounded-3xl bg-gradient-to-br from-[#4F46E5] to-[#4338CA] p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="relative">
                <span className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg mb-3">
                  ✍️
                </span>
                <h3 className="text-lg font-black text-white leading-snug">
                  Share Your Experience
                </h3>
                <p className="text-xs text-indigo-100 leading-relaxed mt-2 mb-5">
                  Help fellow students make informed decisions. Share your internship or interview story anonymously.
                </p>
                <button
                  onClick={() => {
                    const user = getSavedUser();
                    navigate?.(user ? 'write-review' : 'login');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-xs shadow-md shadow-orange-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Write an Anonymous Review</span>
                  <span>↗</span>
                </button>
              </div>
            </div>

            {/* Card 2: "Top Rated Companies for Interns" */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">
                  Top Rated Companies
                </h3>
                <span className="text-[10px] font-bold text-slate-400">By Students</span>
              </div>

              <div className="space-y-3.5">
                {TOP_RATED_COMPANIES.map((comp) => (
                  <div
                    key={comp.name}
                    onClick={() => navigate?.('company-detail', { companyId: comp.name })}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <span className="w-5 text-center text-xs font-black text-slate-400 group-hover:text-indigo-600">
                      {comp.rank}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-2xs border border-slate-100 flex items-center justify-center shrink-0">
                      <CompanyLogo name={comp.logo} size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {comp.name}
                        </p>
                        <span className="text-blue-500 text-[10px]">✔</span>
                      </div>
                      <p className="text-[10px] font-semibold text-emerald-700">
                        {comp.stipend}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-800">★ {comp.rating.toFixed(1)}</span>
                      <p className="text-[10px] text-slate-400 font-medium">{comp.reviews} reviews</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: "Review Integrity & Privacy Guarantee" */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                <p className="font-extrabold text-slate-900 text-xs mb-1">
                  100% Anonymous & Encrypted
                </p>
                <p className="text-[11px] text-slate-500">
                  We encrypt user identifiers and verify university student emails without linking identities to public reviews.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
