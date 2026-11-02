import React, { useState } from 'react';
import type { Navigate } from '../../data/index';
import AuthSideShowcase from '../../components/auth/AuthSideShowcase';
import { LogoMark } from '../../components/ds/Logo';

interface Props {
  navigate: Navigate;
  onLogin: (as: 'student' | 'company' | 'admin') => void;
  onSubmit: (email: string, password: string) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export default function LoginPage({ navigate, onLogin, onSubmit, error, loading }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showSsoModal, setShowSsoModal] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    await onSubmit(email.trim(), password);
  }

  // Quick 1-click SSO Login Simulation
  const handleQuickSso = async (ssoEmail: string, ssoRole: 'student' | 'company' | 'admin') => {
    setEmail(ssoEmail);
    setPassword('password123');
    setShowSsoModal(false);
    try {
      await onSubmit(ssoEmail, 'password123');
    } catch {
      // If backend mock user doesn't exist, bypass via onLogin
      onLogin(ssoRole);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex selection:bg-indigo-500 selection:text-white">
      {/* ── Left Column: Brand Showcase & Social Proof (45% on desktop) ── */}
      <AuthSideShowcase
        testimonialQuote="InternPrangon took away the stress of searching Facebook groups. Applied to Brain Station 23 and heard back in 48 hours."
        testimonialAuthor="Tahmina Akter · BUET CSE '26 (Software Engineer Intern)"
      />

      {/* ── Right Column: Interactive Form Canvas (55% on desktop) ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-14 xl:px-20 relative overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md mx-auto relative z-10">
          {/* Mobile Only Brand Mark */}
          <div
            onClick={() => navigate('home')}
            className="lg:hidden flex items-center justify-center gap-2.5 mb-8 cursor-pointer"
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
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Enter your credentials to access your applications and dashboard.
            </p>
          </div>

          {/* Fast 1-Click Social / University SSO */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => setShowSsoModal(true)}
              className="w-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 shadow-xs transition cursor-pointer"
            >
              {/* Google Multi-Color SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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

            {/* Helper Badge */}
            <div className="flex items-center justify-center gap-1.5 text-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[11px] font-medium text-slate-500">
                Supports <strong className="font-mono text-slate-700">@g.bracu.ac.bd</strong>, <strong className="font-mono text-slate-700">@buet.ac.bd</strong> & all university domains
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-slate-200/90 w-full" />
            <span className="bg-[#F8FAFC] px-3 text-xs font-medium text-slate-400 absolute">
              or sign in with email
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200/80 px-4 py-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block" htmlFor="login-email">
                University or Work Email
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.ac.bd"
                  className="w-full pl-10 pr-4 py-3 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700" htmlFor="login-password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 text-xs md:text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Keep me signed in on this device for 30 days
                </span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                'Sign In to InternPrangon'
              )}
            </button>
          </form>

          {/* Bottom Switch Link */}
          <div className="mt-8 pt-6 border-t border-slate-200/90 text-center">
            <p className="text-xs md:text-sm text-slate-500">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => navigate('register')}
                className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors cursor-pointer"
              >
                Sign up for free →
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
                <h3 className="text-sm font-bold text-slate-900">University SSO Provider</h3>
              </div>
              <button
                onClick={() => setShowSsoModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Select your institution email to simulate Instant Google OAuth authentication:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleQuickSso('kawnain.tahmid.billah@g.bracu.ac.bd', 'student')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Syed Kawnain Tahmid Billah</div>
                  <div className="font-mono text-[11px] text-slate-500">kawnain.tahmid.billah@g.bracu.ac.bd · BRACU</div>
                </div>
                <span className="font-bold text-indigo-600">Connect →</span>
              </button>

              <button
                onClick={() => handleQuickSso('md.muhtasim.fuad1@g.bracu.ac.bd', 'student')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Md. Muhtasim Fuad</div>
                  <div className="font-mono text-[11px] text-slate-500">md.muhtasim.fuad1@g.bracu.ac.bd · BRACU</div>
                </div>
                <span className="font-bold text-indigo-600">Connect →</span>
              </button>

              <button
                onClick={() => handleQuickSso('chynafis10@gmail.com', 'student')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Nafis Uddin Chowdhury</div>
                  <div className="font-mono text-[11px] text-slate-500">chynafis10@gmail.com · Student</div>
                </div>
                <span className="font-bold text-indigo-600">Connect →</span>
              </button>

              <button
                onClick={() => handleQuickSso('eva@gmail.com', 'student')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Farhana Tasnim Eva</div>
                  <div className="font-mono text-[11px] text-slate-500">eva@gmail.com · BRACU</div>
                </div>
                <span className="font-bold text-indigo-600">Connect →</span>
              </button>

              <button
                onClick={() => handleQuickSso('recruiter@brainstation-23.com', 'company')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Brain Station 23 (Recruiter)</div>
                  <div className="font-mono text-[11px] text-slate-500">recruiter@brainstation-23.com · Verified</div>
                </div>
                <span className="font-bold text-indigo-600">Connect →</span>
              </button>

              <button
                onClick={() => handleQuickSso('admin@internprangon.com', 'admin')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Superadmin (Nafis U.)</div>
                  <div className="font-mono text-[11px] text-slate-500">admin@internprangon.com · Level 3</div>
                </div>
                <span className="font-bold text-indigo-600">Connect →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reset Account Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered institutional or employer email address and we'll send you a secure one-time reset link.
            </p>

            {forgotSent ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <div className="text-sm font-bold text-emerald-800">Password Reset Dispatched</div>
                <div className="text-xs text-emerald-600 mt-1">
                  Check your inbox for step-by-step instructions.
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@university.ac.bd"
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                  >
                    Send Recovery Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
