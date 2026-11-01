import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LogoMark } from '../ds/Logo';

export type AuthMode = 'login' | 'signup';
export type UserRole = 'student' | 'employer';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  role?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onLoginSubmit: (email: string, password: string) => Promise<void>;
  onRegisterSubmit: (name: string, email: string, password: string, role: 'student' | 'company') => Promise<void>;
  onQuickSsoSuccess?: (role: 'student' | 'company' | 'admin') => void;
  error?: string;
  loading?: boolean;
}

const UNIVERSITIES = [
  'BRAC University',
  'BUET (Bangladesh University of Engineering and Technology)',
  'North South University',
  'University of Dhaka',
  'Islamic University of Technology',
  'Ahsanullah University of Science and Technology',
  'United International University',
  'Independent University, Bangladesh',
  'East West University',
  'Other Institution...',
];

const STUDY_YEARS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  'Final Year (Senior)',
  'Recent Graduate',
];

const INDUSTRIES = [
  'Software & Cloud',
  'Fintech & Digital Banking',
  'E-Commerce & Retail',
  'Logistics & Supply Chain',
  'Healthcare & Pharma',
  'Telecommunications',
  'Other Enterprise Sector',
];

export default function AuthModal({
  isOpen,
  onClose,
  mode,
  onModeChange,
  role = 'student',
  onRoleChange,
  onLoginSubmit,
  onRegisterSubmit,
  onQuickSsoSuccess,
  error,
  loading,
}: AuthModalProps) {
  const [internalRole, setInternalRole] = useState<UserRole>(role);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Student registration state
  const [studentName, setStudentName] = useState('');
  const [university, setUniversity] = useState('BRAC University');
  const [department, setDepartment] = useState('CSE');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year (Junior)');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentConfirm, setStudentConfirm] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Employer registration state
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('Software & Cloud');
  const [companyPassword, setCompanyPassword] = useState('');
  const [companyConfirm, setCompanyConfirm] = useState('');
  const [showCompanyPassword, setShowCompanyPassword] = useState(false);

  // Local validation and helper modals
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showSsoPicker, setShowSsoPicker] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Sync internal role with prop if provided
  useEffect(() => {
    if (role) setInternalRole(role);
  }, [role]);

  const activeRole = role || internalRole;

  const handleRoleChange = (newRole: UserRole) => {
    setInternalRole(newRole);
    onRoleChange?.(newRole);
    setValidationError(null);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset errors when mode changes
  useEffect(() => {
    setValidationError(null);
  }, [mode]);

  // Password strength meter
  const currentPassword =
    mode === 'login'
      ? loginPassword
      : activeRole === 'student'
      ? studentPassword
      : companyPassword;

  const passwordStrength = useMemo(() => {
    if (!currentPassword) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (currentPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(currentPassword)) score += 1;
    if (/[0-9]/.test(currentPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(currentPassword)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  }, [currentPassword]);

  // Real-time .ac.bd detection
  const isAcBdEligible = useMemo(() => {
    const norm = studentEmail.trim().toLowerCase();
    return norm.endsWith('.ac.bd') || norm.endsWith('.edu.bd') || norm.endsWith('.edu');
  }, [studentEmail]);

  // Personal email warning for company
  const isPersonalEmail = useMemo(() => {
    const norm = companyEmail.trim().toLowerCase();
    return (
      norm.includes('@gmail.com') ||
      norm.includes('@yahoo.com') ||
      norm.includes('@hotmail.com') ||
      norm.includes('@outlook.com')
    );
  }, [companyEmail]);

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!loginEmail.trim() || !loginPassword) {
      setValidationError('Please enter both email and password.');
      return;
    }
    await onLoginSubmit(loginEmail.trim(), loginPassword);
  };

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (activeRole === 'student') {
      if (!studentName.trim() || !studentEmail.trim() || !studentPassword) {
        setValidationError('Please fill in all required fields.');
        return;
      }
      if (studentPassword !== studentConfirm) {
        setValidationError('Passwords do not match.');
        return;
      }
      if (studentPassword.length < 6) {
        setValidationError('Password must be at least 6 characters.');
        return;
      }
      await onRegisterSubmit(studentName.trim(), studentEmail.trim(), studentPassword, 'student');
    } else {
      if (!companyName.trim() || !companyEmail.trim() || !companyPassword) {
        setValidationError('Please fill in all required company fields.');
        return;
      }
      if (companyPassword !== companyConfirm) {
        setValidationError('Passwords do not match.');
        return;
      }
      if (companyPassword.length < 6) {
        setValidationError('Password must be at least 6 characters.');
        return;
      }
      await onRegisterSubmit(companyName.trim(), companyEmail.trim(), companyPassword, 'company');
    }
  };

  // Quick 1-click SSO simulation
  const handleQuickSso = async (email: string, role: 'student' | 'company' | 'admin', name?: string) => {
    setShowSsoPicker(false);
    if (mode === 'login') {
      try {
        await onLoginSubmit(email, 'password123');
      } catch {
        onQuickSsoSuccess?.(role);
      }
    } else {
      try {
        await onRegisterSubmit(name || 'Demo User', email, 'password123', role === 'company' ? 'company' : 'student');
      } catch {
        onQuickSsoSuccess?.(role);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        // Close if click is outside modal card container
        if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      {/* Modal Card Container */}
      <div
        ref={cardRef}
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
      >
        {/* Top-Right Minimalist Close Button */}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition absolute top-5 right-5 cursor-pointer"
          aria-label="Close dialog"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Top Branding: Centered official InternPrangon logo */}
        <div className="flex flex-col items-center justify-center mb-5">
          <div className="flex items-center gap-2">
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
        </div>

        {/* Modal Mode Switcher (Tabbed Header) */}
        <div className="bg-slate-100 p-1 rounded-xl flex mb-6 relative">
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white shadow-xs text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => onModeChange('signup')}
            className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white shadow-xs text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create account
          </button>
        </div>

        {/* Error Notification */}
        {(error || validationError) && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200/80 px-4 py-2.5 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error || validationError}</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            MODE 1: LOG IN FORM STATE
            ══════════════════════════════════════════════════════════ */}
        {mode === 'login' ? (
          <div>
            <div className="mb-5 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                Welcome back
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Enter your email to access your applications and dashboard.
              </p>
            </div>

            {/* Fast 1-Click Social Sign-In */}
            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={() => setShowSsoPicker(true)}
                className="w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 shadow-sm transition cursor-pointer text-xs sm:text-sm"
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
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium text-slate-500">
                  Supports <strong className="font-mono text-slate-700">@g.bracu.ac.bd</strong>, <strong className="font-mono text-slate-700">@buet.ac.bd</strong> & all university emails
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200/90 w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-slate-400 absolute">
                or with email
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block" htmlFor="modal-login-email">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">✉</span>
                  <input
                    id="modal-login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@university.ac.bd"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700" htmlFor="modal-login-password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔒</span>
                  <input
                    id="modal-login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-900 placeholder:text-slate-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs"
                  >
                    {showLoginPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Remember me on this browser
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-60"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            {/* Switch Link */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onModeChange('signup')}
                  className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors cursor-pointer"
                >
                  Sign up free →
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════
             MODE 2: CREATE ACCOUNT FORM STATE
             ══════════════════════════════════════════════════════════ */
          <div>
            <div className="mb-4 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                Join InternPrangon
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Find paid internships or recruit verified university talent.
              </p>
            </div>

            {/* Role Selector: Segmented Switch */}
            <div className="bg-slate-100 p-1 rounded-xl flex mb-4 border border-slate-200/60">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRole === 'student'
                    ? 'bg-white shadow-xs text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🎓</span>
                <span>I am a Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('employer')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRole === 'employer'
                    ? 'bg-white shadow-xs text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🏢</span>
                <span>I am an Employer</span>
              </button>
            </div>

            {/* Student Registration Form */}
            {activeRole === 'student' ? (
              <form onSubmit={handleRegister} className="space-y-3">
                {/* Fast SSO */}
                <button
                  type="button"
                  onClick={() => setShowSsoPicker(true)}
                  className="w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer text-xs"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign up with Google (University Email)</span>
                </button>

                {/* Full Legal Name */}
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-700 block">Full Legal Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">👤</span>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Riya Hossain"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* University Autocomplete Dropdown */}
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-700 block">University / Institution</label>
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
                  >
                    {UNIVERSITIES.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {/* Dual Input Row: Department + Year of Study */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-700 block">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. CSE"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-700 block">Year of Study</label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full px-2 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
                    >
                      {STUDY_YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* University Email with real-time .ac.bd detection */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">University Email</label>
                    {isAcBdEligible && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                        🟢 Student Verification Eligible
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">✉</span>
                    <input
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="you@g.bracu.ac.bd / buet.ac.bd"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-700 block">Password</label>
                    <div className="relative">
                      <input
                        type={showStudentPassword ? 'text' : 'password'}
                        required
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"
                      >
                        {showStudentPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-700 block">Confirm</label>
                    <input
                      type="password"
                      required
                      value={studentConfirm}
                      onChange={(e) => setStudentConfirm(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* Live security meter bar */}
                {studentPassword.length > 0 && (
                  <div className="pt-0.5">
                    <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                      <span className="text-slate-400">Strength:</span>
                      <span className="font-bold text-slate-700">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'}`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
                    </div>
                  </div>
                )}

                {/* Submit: Sunset Orange button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-sm mt-3 disabled:opacity-60"
                >
                  {loading ? 'Creating Student Profile...' : 'Create Free Student Account'}
                </button>
              </form>
            ) : (
              /* Employer Registration Form */
              <form onSubmit={handleRegister} className="space-y-3">
                {/* Work Email */}
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-700 block">Work Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">✉</span>
                    <input
                      type="email"
                      required
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  {isPersonalEmail && (
                    <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">
                      ⚠️ Please use your official corporate domain for expedited verification.
                    </span>
                  )}
                </div>

                {/* Company Name */}
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-700 block">Company Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🏢</span>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Brain Station 23 / Chaldal"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* Industry Dropdown */}
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-700 block">Industry Sector</label>
                  <select
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-700 block">Password</label>
                    <div className="relative">
                      <input
                        type={showCompanyPassword ? 'text' : 'password'}
                        required
                        value={companyPassword}
                        onChange={(e) => setCompanyPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCompanyPassword(!showCompanyPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"
                      >
                        {showCompanyPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-700 block">Confirm</label>
                    <input
                      type="password"
                      required
                      value={companyConfirm}
                      onChange={(e) => setCompanyConfirm(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* Submit: Solid Indigo button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-sm mt-3 disabled:opacity-60"
                >
                  {loading ? 'Registering Company Profile...' : 'Register Company Account'}
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center space-y-2">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                By joining, you agree to our{' '}
                <button type="button" className="text-indigo-600 hover:underline">Terms</button>
                {' and '}
                <button type="button" className="text-indigo-600 hover:underline">Privacy Policy</button>.
              </p>

              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => onModeChange('login')}
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors cursor-pointer"
                >
                  Log in here →
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Mini Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your email and we'll send recovery instructions.
            </p>
            {forgotSent ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-xs text-emerald-800 font-semibold">
                Password recovery email sent!
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSent(true);
                  setTimeout(() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                    setForgotEmail('');
                  }, 2000);
                }}
                className="space-y-3"
              >
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@university.ac.bd"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                  >
                    Send Recovery
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Quick SSO Selector Modal */}
      {showSsoPicker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Google SSO Quick Connect</h3>
              <button
                onClick={() => setShowSsoPicker(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-500 my-2.5">
              Select an account to simulate instant authenticated SSO session:
            </p>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickSso('tahmina@buet.ac.bd', 'student', 'Tahmina Akter')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:bg-indigo-50 text-left transition flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-slate-900">Tahmina Akter</div>
                  <div className="text-[10px] text-slate-500">tahmina@buet.ac.bd (BUET)</div>
                </div>
                <span className="text-indigo-600 font-bold text-xs">Connect →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSso('riyad.hossain@g.bracu.ac.bd', 'student', 'Riyad Hossain')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:bg-indigo-50 text-left transition flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-slate-900">Riyad Hossain</div>
                  <div className="text-[10px] text-slate-500">riyad.hossain@g.bracu.ac.bd (BRACU)</div>
                </div>
                <span className="text-indigo-600 font-bold text-xs">Connect →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSso('recruiter@brainstation-23.com', 'company', 'Brain Station 23')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:bg-indigo-50 text-left transition flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-slate-900">Brain Station 23</div>
                  <div className="text-[10px] text-slate-500">recruiter@brainstation-23.com</div>
                </div>
                <span className="text-indigo-600 font-bold text-xs">Connect →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSso('admin@internprangon.com', 'admin', 'Superadmin')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:bg-indigo-50 text-left transition flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-slate-900">Superadmin (Nafis U.)</div>
                  <div className="text-[10px] text-slate-500">admin@internprangon.com</div>
                </div>
                <span className="text-indigo-600 font-bold text-xs">Connect →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
