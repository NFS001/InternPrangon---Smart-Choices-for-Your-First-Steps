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
