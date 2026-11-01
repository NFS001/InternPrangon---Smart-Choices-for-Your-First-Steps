import React from "react"
import { LogoMark } from "../ds/Logo"

interface AuthSideShowcaseProps {
  testimonialQuote?: string
  testimonialAuthor?: string
}

export default function AuthSideShowcase({
  testimonialQuote = "InternPrangon took away the stress of searching Facebook groups. Applied to Brain Station 23 and heard back in 48 hours.",
  testimonialAuthor = "Tahmina Akter · BUET CSE '26 (Software Engineer Intern)",
}: AuthSideShowcaseProps) {
  return (
    <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden shrink-0 border-r border-slate-800/80">
      {/* Ambient background glows and mesh */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Bangladesh University Campus Silhouette / Architectural Grid */}
      <svg
        className="absolute bottom-0 right-0 left-0 w-full opacity-10 pointer-events-none"
        viewBox="0 0 600 180"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 180 L0 140 L30 140 L30 120 L45 100 L60 120 L60 140 L110 140 L110 110 L130 90 L150 110 L150 140 L210 140 L210 80 L230 60 L250 80 L250 140 L310 140 L310 95 L330 75 L350 95 L350 140 L420 140 L420 105 L440 85 L460 105 L460 140 L520 140 L520 115 L540 95 L560 115 L560 140 L600 140 L600 180 Z" />
        <line
          x1="0"
          y1="140"
          x2="600"
          y2="140"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Top Brand Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <LogoMark size={38} variant="white" />
          <div className="flex items-center">
            <span className="font-extrabold text-2xl tracking-tight text-white font-sans">
              Intern
            </span>
            <span className="font-sans text-2xl font-black tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent ml-[2px]">
              Prangon
            </span>
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 ml-1 mb-2 shrink-0 shadow-sm shadow-orange-400/50" />
          </div>
        </div>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[11px] font-mono text-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Bangladesh's #1 Early-Career Network
        </div>
      </div>

      {/* Mid-Section Value Proposition */}
      <div className="relative z-10 my-10 space-y-6">
        <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Your bridge from university to your first real engineering role.
        </h2>
        <p className="text-sm text-indigo-100/80 leading-relaxed max-w-md">
          Say goodbye to untracked Facebook messages and unverified job posts.
          Connect directly with hiring managers across Bangladesh's top tech
          companies.
        </p>

        {/* Key Trust Highlights */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-xs shrink-0 mt-0.5">
              ✓
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                100% Verified Employers
              </div>
              <div className="text-xs text-indigo-200/70">
                Trade licenses, physical offices & official corporate domains
                authenticated.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-xs shrink-0 mt-0.5">
              💰
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Guaranteed, Transparent Stipends
              </div>
              <div className="text-xs text-indigo-200/70">
                Every listing publishes exact monthly stipends and perks
                upfront. No surprises.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 text-xs shrink-0 mt-0.5">
              ⚡
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                1-Click Universal Applications
              </div>
              <div className="text-xs text-indigo-200/70">
                Apply instantly with your verified student profile, university
                crest & GitHub record.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Testimonial Bento Card */}
      <div className="relative z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
            {"★".repeat(5)}
          </div>
          <p className="text-xs text-white/95 leading-relaxed font-medium italic">
            "{testimonialQuote}"
          </p>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-orange-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              TA
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {testimonialAuthor.split("·")[0].trim()}
              </div>
              <div className="text-[10px] text-indigo-200">
                {testimonialAuthor.split("·").slice(1).join("·").trim()}
              </div>
            </div>
          </div>
        </div>

        {/* Micro footer accreditation */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-indigo-300/60 font-mono">
          <span>Trusted by 45+ Universities</span>
          <span>BUET · BRAC · NSU · DU · IUT</span>
        </div>
      </div>
    </div>
  )
}
