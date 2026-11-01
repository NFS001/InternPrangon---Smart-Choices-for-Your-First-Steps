import React, { useState, useMemo } from 'react';
import type { Navigate } from '../../data/index';
import AuthSideShowcase from '../../components/auth/AuthSideShowcase';
import { LogoMark } from '../../components/ds/Logo';

interface Props {
  navigate: Navigate;
  onLogin: (as: 'student' | 'company' | 'admin') => void;
  onSubmit: (name: string, email: string, password: string, role: 'student' | 'company') => Promise<void>;
  error?: string;
  loading?: boolean;
  as?: 'student' | 'company';
}

const UNIVERSITIES = [
  { name: 'BUET (Bangladesh University of Engineering and Technology)', code: 'BUET', badge: '🏛️' },
  { name: 'BRAC University', code: 'BRACU', badge: '🎓' },
  { name: 'North South University', code: 'NSU', badge: '🏛️' },
  { name: 'University of Dhaka', code: 'DU', badge: '🎓' },
  { name: 'Islamic University of Technology', code: 'IUT', badge: '🏛️' },
  { name: 'Ahsanullah University of Science and Technology', code: 'AUST', badge: '🎓' },
  { name: 'United International University', code: 'UIU', badge: '🏛️' },
  { name: 'Independent University, Bangladesh', code: 'IUB', badge: '🎓' },
  { name: 'East West University', code: 'EWU', badge: '🏛️' },
  { name: 'Other University or Institute', code: 'OTHER', badge: '🎓' },
];

const STUDY_YEARS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  'Final Year (Senior)',
  'Recent Graduate (Within 12 Mo)',
  'Masters / Postgraduate',
];

const INDUSTRIES = [
  'Software & Cloud Technology',
  'Fintech & Digital Banking',
  'E-Commerce & Retail',
  'Logistics & Supply Chain',
  'Healthcare & Pharmaceuticals',
  'Telecommunications',
  'Design & Creative Media',
  'Other Enterprise Sector',
];

export default function RegisterPage({
  navigate,
  onLogin,
  onSubmit,
  error,
  loading,
  as: defaultRole,
}: Props) {
  const [role, setRole] = useState<'student' | 'company'>(defaultRole ?? 'student');

  // Student form fields
  const [studentName, setStudentName] = useState('');
  const [university, setUniversity] = useState('BRAC University');
  const [department, setDepartment] = useState('CSE');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year (Junior)');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentConfirm, setStudentConfirm] = useState('');

  // Company form fields
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('Software & Cloud Technology');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [companyPassword, setCompanyPassword] = useState('');
  const [companyConfirm, setCompanyConfirm] = useState('');

  // UI state toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localValidationErr, setLocalValidationErr] = useState<string | null>(null);
  const [showSsoModal, setShowSsoModal] = useState(false);

  // Live password strength calculation
  const activePassword = role === 'student' ? studentPassword : companyPassword;
  const passwordStrength = useMemo(() => {
    if (!activePassword) return { score: 0, label: '', color: 'bg-slate-200' };
    let s = 0;
    if (activePassword.length >= 8) s += 1;
    if (/[A-Z]/.test(activePassword)) s += 1;
    if (/[0-9]/.test(activePassword)) s += 1;
    if (/[^A-Za-z0-9]/.test(activePassword)) s += 1;

    if (s <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (s <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong (Secure)', color: 'bg-emerald-500' };
  }, [activePassword]);

  // Student email domain eligibility
  const isAcBdStudentEmail = useMemo(() => {
    const norm = studentEmail.trim().toLowerCase();
    return norm.endsWith('.ac.bd') || norm.endsWith('.edu.bd') || norm.endsWith('.edu');
  }, [studentEmail]);

  // Company personal email warning
  const isPersonalCompanyEmail = useMemo(() => {
    const norm = companyEmail.trim().toLowerCase();
    return (
      norm.includes('@gmail.com') ||
      norm.includes('@yahoo.com') ||
      norm.includes('@hotmail.com') ||
      norm.includes('@outlook.com')
    );
  }, [companyEmail]);

  // Form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalValidationErr(null);

    const name = role === 'student' ? studentName.trim() : (companyName.trim() || recruiterName.trim());
    const email = role === 'student' ? studentEmail.trim() : companyEmail.trim();
    const pass = role === 'student' ? studentPassword : companyPassword;
    const confirm = role === 'student' ? studentConfirm : companyConfirm;

    if (!name || !email || !pass) {
      setLocalValidationErr('Please fill in all required credentials.');
      return;
    }

    if (pass !== confirm) {
      setLocalValidationErr('Passwords do not match. Please re-enter.');
      return;
    }

    if (pass.length < 6) {
      setLocalValidationErr('Password must be at least 6 characters.');
      return;
    }

    await onSubmit(name, email, pass, role);
  }

  // Quick SSO Student simulation
  const handleQuickStudentSso = async (ssoEmail: string, ssoName: string) => {
    setStudentName(ssoName);
    setStudentEmail(ssoEmail);
    setStudentPassword('password123');
    setStudentConfirm('password123');
    setShowSsoModal(false);
    try {
      await onSubmit(ssoName, ssoEmail, 'password123', 'student');
    } catch {
      onLogin('student');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex selection:bg-indigo-500 selection:text-white">
      {/* ── Left Column: Brand Showcase & Social Proof (45% on desktop) ── */}
      <AuthSideShowcase
        testimonialQuote="InternPrangon made hiring engineering interns frictionless. We verified our trade license in 20 minutes and received 35+ top tier BUET and BRAC applicants."
        testimonialAuthor="Tanvir Ahmed · Head of Engineering Talent, Brain Station 23"
      />

      {/* ── Right Column: Interactive Form Canvas (55% on desktop) ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-14 xl:px-20 relative overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-lg mx-auto relative z-10">
          {/* Mobile Only Brand Mark */}
          <div
            onClick={() => navigate('home')}
            className="lg:hidden flex items-center justify-center gap-2.5 mb-6 cursor-pointer"
          >
            <LogoMark size={32} />
            <div className="flex items-center">
              <span className="font-sans font-extrabold text-2xl text-slate-900 tracking-tight">
                Intern
              </span>
              <span className="font-sans text-2xl font-black tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent ml-[2px]">
                Prangon
              </span>
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 ml-0.5 mb-1.5 shrink-0 shadow-sm" />
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              Join InternPrangon
            </h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Find paid, verified internships or recruit pre-screened university talent.
            </p>
          </div>

          {/* Role Switcher Toggle (High Contrast Segmented Pill) */}
          <div className="bg-slate-100 p-1 rounded-xl flex mb-6 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setLocalValidationErr(null);
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'student'
                  ? 'bg-white shadow-xs text-indigo-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🎓</span>
              <span>I am a Student</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('company');
                setLocalValidationErr(null);
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'company'
                  ? 'bg-white shadow-xs text-indigo-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🏢</span>
              <span>I am an Employer</span>
            </button>
          </div>

          {/* Student Form View */}
          {role === 'student' && (
            <div className="space-y-4">
              {/* Fast SSO Button for Student */}
              <button
                type="button"
                onClick={() => setShowSsoModal(true)}
                className="w-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 shadow-xs transition cursor-pointer text-xs md:text-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign up with Google (University Email)</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200/90 w-full" />
                <span className="bg-[#F8FAFC] px-3 text-[11px] font-medium text-slate-400 absolute">
                  or continue with student email registration
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {(error || localValidationErr) && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200/80 px-4 py-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error || localValidationErr}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* ── STUDENT FIELDS ── */}
            {role === 'student' ? (
              <>
                {/* Full Legal Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block" htmlFor="reg-name">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">👤</span>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Riya Hossain"
                      className="w-full pl-9 pr-4 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                    />
                  </div>
                </div>

                {/* University Searchable Select */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block" htmlFor="reg-univ">
                    University / Institution
                  </label>
                  <div className="relative">
                    <select
                      id="reg-univ"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs font-medium"
                    >
                      {UNIVERSITIES.map((u) => (
                        <option key={u.code} value={u.name}>
                          {u.badge} {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Department & Year (Dual row) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block" htmlFor="reg-dept">
                      Department
                    </label>
                    <input
                      id="reg-dept"
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. CSE, EEE, BBA"
                      className="w-full px-3 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block" htmlFor="reg-year">
                      Year of Study
                    </label>
                    <select
                      id="reg-year"
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs font-medium"
                    >
                      {STUDY_YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* University Email Address with .ac.bd Detection Chip */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block" htmlFor="reg-email">
                      University Email Address
                    </label>
                    {isAcBdStudentEmail && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Automatic Verification Eligible
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">✉</span>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="you@g.bracu.ac.bd / buet.ac.bd"
                      className="w-full pl-9 pr-4 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block" htmlFor="reg-pass">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="reg-pass"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        className="w-full px-3 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs p-1"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block" htmlFor="reg-confirm">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="reg-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={studentConfirm}
                        onChange={(e) => setStudentConfirm(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs p-1"
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Password Strength Meter */}
                {studentPassword.length > 0 && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                      <span className="text-slate-400">Password Security</span>
                      <span className="font-bold text-slate-700">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'}`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
                    </div>
                  </div>
                )}

                {/* Submit Button for Student (Sunset Orange) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F97316] hover:bg-orange-600 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-orange-200 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm mt-3 disabled:opacity-60"
                >
                  {loading ? 'Creating Student Profile...' : 'Create Free Student Account'}
                </button>
              </>
            ) : (
              /* ── COMPANY FIELDS ── */
              <>
                {/* Work Email with Personal Domain Warning */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block" htmlFor="c-work-email">
                      Corporate Work Email *
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">✉</span>
                    <input
                      id="c-work-email"
                      type="email"
                      required
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-9 pr-4 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                    />
                  </div>
                  {isPersonalCompanyEmail && (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center gap-1.5 mt-1">
                      <span>⚠️</span>
                      <span>Please use your official company domain for expedited verification.</span>
                    </div>
                  )}
                </div>

                {/* Company Legal Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block" htmlFor="c-legal-name">
                    Company Legal Name *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🏢</span>
                    <input
                      id="c-legal-name"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Brain Station 23 / Chaldal / ShopUp"
                      className="w-full pl-9 pr-4 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Industry Classification */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block" htmlFor="c-ind">
                    Industry Classification
                  </label>
                  <select
                    id="c-ind"
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs font-medium"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Company Website URL */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block" htmlFor="c-web">
                    Official Website URL
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🌐</span>
                    <input
                      id="c-web"
                      type="text"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full pl-9 pr-4 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Recruiter Full Name & Designation */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block" htmlFor="c-recruiter">
                    Talent Lead / Recruiter Full Name & Designation
                  </label>
                  <input
                    id="c-recruiter"
                    type="text"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    placeholder="e.g. Sarah Chowdhury (Head of Talent Acquisition)"
                    className="w-full px-3 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                  />
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block" htmlFor="c-pass">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="c-pass"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={companyPassword}
                        onChange={(e) => setCompanyPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        className="w-full px-3 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs p-1"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block" htmlFor="c-confirm">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="c-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={companyConfirm}
                        onChange={(e) => setCompanyConfirm(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs p-1"
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Password Strength Meter */}
                {companyPassword.length > 0 && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                      <span className="text-slate-400">Security Strength</span>
                      <span className="font-bold text-slate-700">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'}`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
                    </div>
                  </div>
                )}

                {/* Verified Employer Guarantee Banner */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs flex items-start gap-2.5 mt-2">
                  <span className="text-emerald-600 font-bold text-sm mt-0.5">✔</span>
                  <div className="leading-snug">
                    <strong className="block font-bold text-emerald-950">Verified Employer Guarantee</strong>
                    <span className="text-emerald-800 text-[11px]">
                      You can start drafting internships immediately while our compliance team authenticates your trade credentials.
                    </span>
                  </div>
                </div>

                {/* Submit Button for Company (Deep Indigo) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4F46E5] hover:bg-indigo-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm mt-3 disabled:opacity-60"
                >
                  {loading ? 'Registering Company Profile...' : 'Register Company Account'}
                </button>
              </>
            )}
          </form>

          {/* Terms & Footer */}
          <div className="mt-6 pt-5 border-t border-slate-200/90 text-center space-y-3">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              By continuing, you agree to InternPrangon's{' '}
              <button type="button" className="text-indigo-600 hover:underline font-medium">Terms of Service</button>
              {' and '}
              <button type="button" className="text-indigo-600 hover:underline font-medium">Privacy Policy</button>.
            </p>

            <p className="text-xs md:text-sm text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('login')}
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors cursor-pointer"
              >
                Log in here →
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Quick University SSO Credential Selector Modal */}
      {showSsoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 8.8L3.82 7 12 3.27 20.18 7 12 10.8zM4 12.7v5.6c0 3.2 3.6 5.7 8 5.7s8-2.5 8-5.7v-5.6l-8 3.6-8-3.6z" />
                </svg>
                <h3 className="text-sm font-bold text-slate-900">Sign Up with University SSO</h3>
              </div>
              <button
                onClick={() => setShowSsoModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Fast-track your registration with your authenticated institution account:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleQuickStudentSso('sabbir.ahmed@buet.ac.bd', 'Sabbir Ahmed')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Sabbir Ahmed</div>
                  <div className="font-mono text-[11px] text-slate-500">sabbir.ahmed@buet.ac.bd · BUET CSE</div>
                </div>
                <span className="font-bold text-orange-600">Register →</span>
              </button>

              <button
                onClick={() => handleQuickStudentSso('nafisa.islam@g.bracu.ac.bd', 'Nafisa Islam')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Nafisa Islam</div>
                  <div className="font-mono text-[11px] text-slate-500">nafisa.islam@g.bracu.ac.bd · BRAC Univ</div>
                </div>
                <span className="font-bold text-orange-600">Register →</span>
              </button>

              <button
                onClick={() => handleQuickStudentSso('fardin.hasan@northsouth.edu', 'Fardin Hasan')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Fardin Hasan</div>
                  <div className="font-mono text-[11px] text-slate-500">fardin.hasan@northsouth.edu · NSU ECE</div>
                </div>
                <span className="font-bold text-orange-600">Register →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
