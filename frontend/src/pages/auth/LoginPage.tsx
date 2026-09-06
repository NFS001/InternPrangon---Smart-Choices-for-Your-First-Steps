import { useState } from "react";
import { type Navigate } from "../../data/index";

interface Props {
  navigate: Navigate;
  onLogin: (as: "student" | "company" | "admin") => void;
  onSubmit: (email: string, password: string) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export default function LoginPage({ navigate, onLogin, onSubmit, error, loading }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(email, password);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-1 mb-8">
          <span className="font-display italic text-2xl text-neutral-900">Intern</span>
          <span className="font-bold text-2xl text-brand-700">Prangon</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="font-display italic text-3xl text-neutral-900">Welcome back</h1>
            <p className="text-sm text-neutral-500 mt-1">Sign in to your InternPrangon account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.ac.bd"
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700" htmlFor="password">Password</label>
                <button type="button" className="text-xs text-brand-600 hover:underline">Forgot password?</button>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-700 text-white font-semibold py-3 rounded-xl hover:bg-brand-800 disabled:opacity-60 transition-colors mt-1"
            >
              {loading ? "Signing in..." : "Log in"}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-xs">
            <p className="font-bold text-neutral-800 mb-2 flex items-center gap-1.5">
              <span>🔑</span> Demo Credentials:
            </p>
            <div className="space-y-1.5 text-neutral-600">
              <div className="flex items-center justify-between">
                <span><strong className="text-neutral-800">Admin:</strong> admin123@gmail.com (pw: admin123)</span>
                <button
                  type="button"
                  onClick={() => { setEmail("admin123@gmail.com"); setPassword("admin123"); }}
                  className="text-brand-700 font-semibold hover:underline"
                >
                  Fill
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span><strong className="text-neutral-800">Student:</strong> student@internprangon.com (pw: student123)</span>
                <button
                  type="button"
                  onClick={() => { setEmail("student@internprangon.com"); setPassword("student123"); }}
                  className="text-brand-700 font-semibold hover:underline"
                >
                  Fill
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span><strong className="text-neutral-800">Company:</strong> company@internprangon.com (pw: company123)</span>
                <button
                  type="button"
                  onClick={() => { setEmail("company@internprangon.com"); setPassword("company123"); }}
                  className="text-brand-700 font-semibold hover:underline"
                >
                  Fill
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400">or 1-click login</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {/* Role 1-click login buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => onSubmit("student@internprangon.com", "student123")}
              className="w-full bg-amber-500 text-white font-semibold py-2.5 rounded-xl hover:bg-amber-600 transition-colors text-sm"
            >
              Sign in as Demo Student
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => onSubmit("company@internprangon.com", "company123")}
              className="w-full border border-neutral-300 text-neutral-700 font-medium py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-sm"
            >
              Sign in as Demo Company
            </button>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-neutral-500">
            {"Don't have an account? "}
            <button
              type="button"
              onClick={() => navigate("register")}
              className="text-brand-700 font-medium hover:underline"
            >
              Sign up free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
