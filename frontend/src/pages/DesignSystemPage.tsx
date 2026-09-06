import React, { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════
   INTERNPRANGON — DESIGN SYSTEM
   Stage 1: Brand Direction & Component Library
   ═══════════════════════════════════════════════════════════════ */

/* ─── Logo Mark SVG ────────────────────────────────────────── */
export function LogoMark({ size = 40, variant = 'color' }: { size?: number; variant?: 'color' | 'white' | 'dark' }) {
  const bg = variant === 'white' ? 'white' : variant === 'dark' ? '#2e1065' : '#7c3aed';
  const fill1 = variant === 'white' ? '#7c3aed' : variant === 'dark' ? '#c4b5fd' : 'white';
  const fill2 = variant === 'white' ? '#f59e0b' : '#fbbf24';
  const r = size * 0.25;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx={r} fill={bg} />
      {/* Three ascending bars — career steps */}
      <rect x="8"  y="25" width="7" height="8"  rx="1.5" fill={fill1} opacity="0.55" />
      <rect x="17" y="18" width="7" height="15" rx="1.5" fill={fill1} opacity="0.78" />
      <rect x="26" y="10" width="7" height="23" rx="1.5" fill={fill1} />
      {/* Amber accent dot top-right of tallest bar */}
      <circle cx="29.5" cy="8" r="2.5" fill={fill2} />
    </svg>
  );
}

/* ─── Wordmark ─────────────────────────────────────────────── */
function Wordmark({ size = 'md', variant = 'default' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; variant?: 'default' | 'white' }) {
  const sz = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl', xl: 'text-5xl' }[size];
  const dark = variant === 'white' ? 'text-white' : 'text-neutral-900';
  const violet = variant === 'white' ? 'text-brand-300' : 'text-brand-600';
  return (
    <div className={`flex items-center gap-0 font-extrabold tracking-tight ${sz}`}>
      <span className={`font-display italic ${dark}`} style={{ fontVariationSettings: "'opsz' 144, 'wght' 800" }}>
        Intern
      </span>
      <span className={`font-sans not-italic ${violet}`}>Prangon</span>
      <span className="w-[0.2em] h-[0.2em] rounded-full bg-accent-400 ml-[0.1em] mb-[0.3em] shrink-0" />
    </div>
  );
}

/* ─── Section wrapper ──────────────────────────────────────── */
function Section({ id, num, label, title, desc, children }: { id: string; num: string; label: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-24 scroll-mt-[88px]">
      <div className="mb-10 pb-6 border-b border-neutral-200">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent-600 mb-2">{num} — {label}</p>
        <h2 className="font-display italic text-4xl font-bold text-neutral-900 mb-3" style={{ fontVariationSettings: "'opsz' 72, 'wght' 700" }}>{title}</h2>
        {desc && <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

/* ─── Subsection label ─────────────────────────────────────── */
function Sub({ label }: { label: string }) {
  return <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-neutral-400 mb-4 mt-10">{label}</p>;
}

/* ─── Showcase frame ───────────────────────────────────────── */
function Frame({ label, children, dark = false }: { label: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">{label}</p>
      <div className={['rounded-2xl border p-6', dark ? 'bg-brand-950 border-brand-800' : 'bg-neutral-50 border-neutral-200'].join(' ')}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   01 — BRAND
   ═══════════════════════════════════════════════════════════════ */
function BrandSection() {
  return (
    <Section id="brand" num="01" label="Brand" title="InternPrangon Identity"
      desc="A distinctive visual identity for Bangladesh's first dedicated internship discovery platform. The brand communicates opportunity, growth, and first career steps — confident without being corporate.">

      {/* Logo Mark */}
      <Sub label="Logo Mark" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Standard',     bg: 'bg-neutral-50 border border-neutral-200',    el: <LogoMark size={64} variant="color" /> },
          { label: 'On Brand',     bg: 'bg-brand-600',                               el: <LogoMark size={64} variant="white" /> },
          { label: 'On Dark',      bg: 'bg-brand-950',                               el: <LogoMark size={64} variant="dark" /> },
          { label: 'On Amber',     bg: 'bg-accent-400',                              el: <LogoMark size={64} variant="color" /> },
        ].map((v) => (
          <div key={v.label} className={`flex flex-col items-center justify-center gap-3 py-8 rounded-2xl ${v.bg}`}>
            {v.el}
            <p className="text-[10px] font-semibold text-neutral-500 mix-blend-difference" style={{ mixBlendMode: 'normal', opacity: 0.5 }}>{v.label}</p>
          </div>
        ))}
      </div>

      {/* Wordmark */}
      <Sub label="Wordmark" />
      <div className="space-y-4 mb-8">
        <Frame label="Primary Wordmark (with mark)">
          <div className="flex items-center gap-4">
            <LogoMark size={48} />
            <Wordmark size="lg" />
          </div>
        </Frame>
        <Frame label="Wordmark on Dark" dark>
          <div className="flex items-center gap-4">
            <LogoMark size={48} variant="dark" />
            <Wordmark size="lg" variant="white" />
          </div>
        </Frame>
        <Frame label="Compact / Nav size">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <LogoMark size={32} />
              <Wordmark size="sm" />
            </div>
            <span className="text-neutral-300">|</span>
            <Wordmark size="sm" />
          </div>
        </Frame>
      </div>

      {/* Tagline */}
      <Sub label="Tagline Lockup" />
      <Frame label="Full brand lockup">
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-3">
            <LogoMark size={56} />
            <Wordmark size="lg" />
          </div>
          <p className="text-sm text-neutral-400 font-medium tracking-[0.08em] pl-1 italic">
            "Smart Choices for Your First Steps"
          </p>
        </div>
      </Frame>

      {/* Brand values */}
      <Sub label="Brand Personality" />
      <div className="grid grid-cols-3 gap-3">
        {[
          { trait: 'Confident', note: 'Speaks with authority — not arrogance.' },
          { trait: 'Editorial', note: 'Curated, purposeful, high signal-to-noise.' },
          { trait: 'Warm',      note: 'Approachable to students, respectful of their ambition.' },
          { trait: 'Modern',    note: 'Forward-looking, not dated or corporate.' },
          { trait: 'Honest',    note: 'Real reviews, real data, no spin.' },
          { trait: 'Purposeful',note: 'Every element earns its place.' },
        ].map((v) => (
          <div key={v.trait} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <p className="text-sm font-extrabold text-neutral-900 mb-1">{v.trait}</p>
            <p className="text-xs text-neutral-400 leading-relaxed">{v.note}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   02 — COLOR SYSTEM
   ═══════════════════════════════════════════════════════════════ */

function ColorSwatch({ name, hex, usage, light = false }: { name: string; hex: string; usage: string; light?: boolean }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(hex).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }
  return (
    <button onClick={copy} className="group text-left w-full" title={`Copy ${hex}`}>
      <div className="h-14 rounded-xl mb-2 border border-black/8 transition-transform group-hover:scale-[1.02] duration-150" style={{ background: hex }} />
      <p className={`text-xs font-bold mb-0.5 ${light ? 'text-neutral-700' : 'text-neutral-900'}`}>{name}</p>
      <p className="text-[10px] font-mono text-neutral-400">{copied ? 'Copied!' : hex}</p>
      <p className="text-[9px] text-neutral-400 mt-0.5 leading-snug">{usage}</p>
    </button>
  );
}

function PaletteRow({ label, swatches }: { label: string; swatches: { name: string; hex: string; usage: string; light?: boolean }[] }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-neutral-500 mb-4">{label}</p>
      <div className="grid grid-cols-5 gap-3 lg:grid-cols-10">
        {swatches.map((s) => <ColorSwatch key={s.name} {...s} />)}
      </div>
    </div>
  );
}

function ColorSection() {
  return (
    <Section id="color" num="02" label="Color System" title="Color Palette"
      desc="A restrained, intentional palette. Violet communicates ambition and creative confidence. Amber signals opportunity and first light. Together they create a distinctive identity far from generic SaaS blue.">

      <PaletteRow label="Brand — Violet" swatches={[
        { name: 'Brand 50',  hex: '#f5f3ff', usage: 'Subtle tints',       light: true },
        { name: 'Brand 100', hex: '#ede9fe', usage: 'Hover fills',        light: true },
        { name: 'Brand 200', hex: '#ddd6fe', usage: 'Active fills',       light: true },
        { name: 'Brand 300', hex: '#c4b5fd', usage: 'Borders',            light: true },
        { name: 'Brand 400', hex: '#a78bfa', usage: 'Decorative',         light: true },
        { name: 'Brand 500', hex: '#8b5cf6', usage: 'Secondary UI' },
        { name: 'Brand 600', hex: '#7c3aed', usage: '↑ Primary action' },
        { name: 'Brand 700', hex: '#6d28d9', usage: 'Hover state' },
        { name: 'Brand 800', hex: '#5b21b6', usage: 'Active state' },
        { name: 'Brand 900', hex: '#4c1d95', usage: 'Dark surfaces' },
      ]} />

      <PaletteRow label="Accent — Amber" swatches={[
        { name: 'Amber 50',  hex: '#fffbeb', usage: 'Subtle tints',    light: true },
        { name: 'Amber 100', hex: '#fef3c7', usage: 'Alert fills',     light: true },
        { name: 'Amber 200', hex: '#fde68a', usage: 'Highlights',      light: true },
        { name: 'Amber 300', hex: '#fcd34d', usage: 'Badges',          light: true },
        { name: 'Amber 400', hex: '#fbbf24', usage: 'Decorative',      light: true },
        { name: 'Amber 500', hex: '#f59e0b', usage: '↑ CTA / Energy' },
        { name: 'Amber 600', hex: '#d97706', usage: 'Hover CTA' },
        { name: 'Amber 700', hex: '#b45309', usage: 'Active CTA' },
        { name: 'Amber 800', hex: '#92400e', usage: 'Dark text' },
        { name: 'Amber 900', hex: '#78350f', usage: 'Very dark' },
      ]} />

      <PaletteRow label="Neutral — Slate" swatches={[
        { name: 'Neutral 50',  hex: '#f8fafc', usage: 'Page bg',     light: true },
        { name: 'Neutral 100', hex: '#f1f5f9', usage: 'Surface',     light: true },
        { name: 'Neutral 200', hex: '#e2e8f0', usage: 'Borders',     light: true },
        { name: 'Neutral 300', hex: '#cbd5e1', usage: 'Dividers',    light: true },
        { name: 'Neutral 400', hex: '#94a3b8', usage: 'Icons',       light: true },
        { name: 'Neutral 500', hex: '#64748b', usage: 'Muted text' },
        { name: 'Neutral 600', hex: '#475569', usage: 'Secondary text' },
        { name: 'Neutral 700', hex: '#334155', usage: 'Body text' },
        { name: 'Neutral 800', hex: '#1e293b', usage: 'Headings' },
        { name: 'Neutral 900', hex: '#0f172a', usage: 'Display' },
      ]} />

      {/* Semantic */}
      <Sub label="Semantic Colors" />
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'Success', bg: '#f0fdf4', border: '#bbf7d0', dot: '#16a34a', label: 'Positive states, acceptance, verification' },
          { name: 'Warning', bg: '#fffbeb', border: '#fde68a', dot: '#d97706', label: 'Alerts, deadline proximity, caution' },
          { name: 'Danger',  bg: '#fef2f2', border: '#fecaca', dot: '#dc2626', label: 'Errors, rejection, destructive actions' },
          { name: 'Info',    bg: '#eff6ff', border: '#bfdbfe', dot: '#2563eb', label: 'Neutral notices, informational states' },
        ].map((s) => (
          <div key={s.name} className="rounded-xl border p-4" style={{ background: s.bg, borderColor: s.border }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full" style={{ background: s.dot }} />
              <span className="text-sm font-bold text-neutral-900">{s.name}</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-snug">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Usage in context */}
      <Sub label="Color Usage in Context" />
      <div className="rounded-2xl bg-brand-950 p-8 flex items-center justify-between gap-6">
        <div>
          <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">Platform Insight</p>
          <p className="font-display italic text-2xl text-white mb-1" style={{ fontVariationSettings: "'opsz' 72, 'wght' 600" }}>1,200+ verified internships</p>
          <p className="text-brand-300 text-sm">Updated every week across Bangladesh</p>
        </div>
        <button className="h-11 px-6 bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold rounded-full transition-colors shrink-0">
          Browse Now
        </button>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   03 — TYPOGRAPHY
   ═══════════════════════════════════════════════════════════════ */
function TypographySection() {
  const scale = [
    { tag: 'Display',     style: { fontFamily: "'Fraunces', Georgia, serif", fontWeight: 800, fontSize: '72px', lineHeight: '1.0', letterSpacing: '-0.03em', fontStyle: 'italic', fontVariationSettings: "'opsz' 144, 'wght' 800" }, text: 'Smart Choices', sub: 'Fraunces · 72px · 800 italic · −3% tracking' },
    { tag: 'H1',          style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '48px', lineHeight: '1.08', letterSpacing: '-0.025em' }, text: 'Find Your Internship', sub: 'Plus Jakarta Sans · 48px · 800 · −2.5%' },
    { tag: 'H2',          style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '36px', lineHeight: '1.1', letterSpacing: '-0.02em' }, text: 'Featured Companies', sub: 'Plus Jakarta Sans · 36px · 800 · −2%' },
    { tag: 'H3',          style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '24px', lineHeight: '1.25', letterSpacing: '-0.01em' }, text: 'Frontend Developer Intern', sub: 'Plus Jakarta Sans · 24px · 700 · −1%' },
    { tag: 'H4',          style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '18px', lineHeight: '1.3', letterSpacing: '-0.005em' }, text: 'ByteForge Solutions · Dhaka', sub: 'Plus Jakarta Sans · 18px · 700' },
    { tag: 'Body Large',  style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: '18px', lineHeight: '1.7' }, text: 'Discover internships that match your skills, track your applications, and take your first confident career step with InternPrangon.', sub: 'Plus Jakarta Sans · 18px · 400 · 1.7 leading' },
    { tag: 'Body',        style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: '15px', lineHeight: '1.65' }, text: 'ByteForge Solutions is looking for a talented Frontend Developer Intern to join our product team. You will work closely with senior engineers to build user-facing features for our flagship SaaS product.', sub: 'Plus Jakarta Sans · 15px · 400 · 1.65 leading' },
    { tag: 'Body Small',  style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: '13px', lineHeight: '1.6' }, text: 'Applications close February 28, 2024. Only shortlisted candidates will be contacted within 5 business days of the deadline.', sub: 'Plus Jakarta Sans · 13px · 400 · 1.6 leading' },
    { tag: 'Caption',     style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: '11px', lineHeight: '1.5' }, text: 'Posted 2 days ago · Remote · 3 months · BDT 15,000/mo', sub: 'Plus Jakarta Sans · 11px · 500' },
    { tag: 'Label',       style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '10px', lineHeight: '1.4', letterSpacing: '0.12em', textTransform: 'uppercase' as const }, text: 'Application Deadline', sub: 'Plus Jakarta Sans · 10px · 700 · +12% tracking · uppercase' },
    { tag: 'Button',      style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '14px', lineHeight: '1', letterSpacing: '0.01em' }, text: 'Apply Now', sub: 'Plus Jakarta Sans · 14px · 700 · +1%' },
    { tag: 'Mono',        style: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: '13px', lineHeight: '1.6' }, text: 'BDT 15,000 / month  ·  3 months  ·  id: bf-intern-001', sub: 'JetBrains Mono · 13px · 500 · data & code' },
  ];

  return (
    <Section id="typography" num="03" label="Typography" title="Type System"
      desc="Fraunces as the editorial display face — optical-size aware, characterful at large sizes. Plus Jakarta Sans for all UI text — humanist, friendly, and highly readable. JetBrains Mono for data labels and code.">
      <div className="space-y-0">
        {scale.map((t, i) => (
          <div key={t.tag} className={`flex items-baseline gap-6 py-6 ${i < scale.length - 1 ? 'border-b border-neutral-100' : ''}`}>
            <div className="w-24 shrink-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-neutral-400">{t.tag}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p style={t.style} className="text-neutral-900">{t.text}</p>
            </div>
            <div className="w-64 shrink-0 hidden xl:block">
              <p className="text-[9px] text-neutral-400 font-mono leading-snug">{t.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   04 — SPACING & GRID
   ═══════════════════════════════════════════════════════════════ */
function SpacingSection() {
  const steps = [
    { token: '1', px: 4,   tw: 'p-1'  },
    { token: '2', px: 8,   tw: 'p-2'  },
    { token: '3', px: 12,  tw: 'p-3'  },
    { token: '4', px: 16,  tw: 'p-4'  },
    { token: '5', px: 20,  tw: 'p-5'  },
    { token: '6', px: 24,  tw: 'p-6'  },
    { token: '8', px: 32,  tw: 'p-8'  },
    { token: '10',px: 40,  tw: 'p-10' },
    { token: '12',px: 48,  tw: 'p-12' },
    { token: '16',px: 64,  tw: 'p-16' },
    { token: '20',px: 80,  tw: 'p-20' },
    { token: '24',px: 96,  tw: 'p-24' },
  ];
  return (
    <Section id="spacing" num="04" label="Spacing & Grid" title="Spacing System"
      desc="A 4px base grid. Generous whitespace is a design decision — use it intentionally. Content max-width is 1280px with 32px page margin (64px on wide screens). Section padding is 80–128px vertically.">
      <Sub label="Spacing Scale (4px base)" />
      <div className="space-y-2 mb-10">
        {steps.map((s) => (
          <div key={s.token} className="flex items-center gap-4">
            <span className="w-16 text-[10px] font-mono text-neutral-400 text-right shrink-0">{s.px}px</span>
            <div className="h-5 bg-brand-500 rounded" style={{ width: s.px }} />
            <span className="text-[10px] font-mono text-neutral-400">{s.tw}</span>
          </div>
        ))}
      </div>

      <Sub label="Grid & Layout" />
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Max Content Width', value: '1280px', note: 'max-w-7xl' },
          { label: 'Page Margin', value: '32–64px', note: 'px-8 to px-16' },
          { label: 'Section Padding', value: '80–128px', note: 'py-20 to py-32' },
          { label: 'Card Gap', value: '16–24px', note: 'gap-4 to gap-6' },
          { label: 'Form Spacing', value: '16px', note: 'space-y-4' },
          { label: 'Nav Height', value: '72px', note: 'h-[72px]' },
        ].map((g) => (
          <div key={g.label} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1">{g.label}</p>
            <p className="text-xl font-extrabold text-neutral-900">{g.value}</p>
            <p className="text-[10px] font-mono text-neutral-400 mt-1">{g.note}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   05 — BUTTONS
   ═══════════════════════════════════════════════════════════════ */
function ButtonsSection() {
  return (
    <Section id="buttons" num="05" label="Components" title="Buttons"
      desc="Four variants across three sizes. States are explicit — loading uses a spinner, disabled reduces opacity and cursor. Never use hover colour alone to signal state.">

      <Sub label="Variants" />
      <Frame label="Primary — Violet fill">
        <div className="flex items-center gap-4 flex-wrap">
          <button className="h-8  px-4 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-full transition-colors active:scale-95">Small</button>
          <button className="h-10 px-6 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-full transition-colors active:scale-95">Medium</button>
          <button className="h-12 px-8 text-base font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-full transition-colors active:scale-95">Large</button>
          <button className="h-10 px-6 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-full transition-colors active:scale-95 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            With Icon
          </button>
        </div>
      </Frame>

      <Frame label="CTA — Amber fill (primary call to action)">
        <div className="flex items-center gap-4 flex-wrap">
          <button className="h-8  px-4 text-xs font-bold text-white bg-accent-500 hover:bg-accent-600 rounded-full transition-colors active:scale-95">Small</button>
          <button className="h-10 px-6 text-sm font-bold text-white bg-accent-500 hover:bg-accent-600 rounded-full transition-colors active:scale-95">Apply Now</button>
          <button className="h-12 px-8 text-base font-bold text-white bg-accent-500 hover:bg-accent-600 rounded-full transition-colors active:scale-95">Browse Internships</button>
        </div>
      </Frame>

      <Frame label="Secondary — Outlined">
        <div className="flex items-center gap-4 flex-wrap">
          <button className="h-8  px-4 text-xs font-semibold text-brand-700 border-[1.5px] border-brand-300 hover:bg-brand-50 rounded-full transition-colors">Small</button>
          <button className="h-10 px-6 text-sm font-semibold text-brand-700 border-[1.5px] border-brand-300 hover:bg-brand-50 rounded-full transition-colors">Secondary</button>
          <button className="h-12 px-8 text-base font-semibold text-brand-700 border-[1.5px] border-brand-300 hover:bg-brand-50 rounded-full transition-colors">Large</button>
        </div>
      </Frame>

      <Frame label="Tertiary — Ghost / text only">
        <div className="flex items-center gap-4 flex-wrap">
          <button className="h-8  px-4 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors">Small</button>
          <button className="h-10 px-6 text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors">Tertiary</button>
          <button className="h-10 px-6 text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors flex items-center gap-1.5">
            Learn more
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </Frame>

      <Frame label="Destructive — Danger">
        <div className="flex items-center gap-4 flex-wrap">
          <button className="h-10 px-6 text-sm font-bold text-white bg-danger-600 hover:bg-danger-700 rounded-full transition-colors active:scale-95">Delete Review</button>
          <button className="h-10 px-6 text-sm font-semibold text-danger-700 border-[1.5px] border-danger-300 hover:bg-danger-50 rounded-full transition-colors">Reject Company</button>
        </div>
      </Frame>

      <Sub label="Button States (Medium Primary)" />
      <Frame label="State showcase">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-center">
            <button className="h-10 px-6 text-sm font-bold text-white bg-brand-600 rounded-full">Default</button>
            <p className="text-[9px] text-neutral-400 mt-2 uppercase tracking-wider">Default</p>
          </div>
          <div className="text-center">
            <button className="h-10 px-6 text-sm font-bold text-white bg-brand-700 rounded-full ring-2 ring-brand-400 ring-offset-2">Focus</button>
            <p className="text-[9px] text-neutral-400 mt-2 uppercase tracking-wider">Focus</p>
          </div>
          <div className="text-center">
            <button className="h-10 px-6 text-sm font-bold text-white bg-brand-800 rounded-full scale-95">Active</button>
            <p className="text-[9px] text-neutral-400 mt-2 uppercase tracking-wider">Active</p>
          </div>
          <div className="text-center">
            <button disabled className="h-10 px-6 text-sm font-bold text-white bg-brand-600 rounded-full opacity-40 cursor-not-allowed">Disabled</button>
            <p className="text-[9px] text-neutral-400 mt-2 uppercase tracking-wider">Disabled</p>
          </div>
          <div className="text-center">
            <button className="h-10 px-6 text-sm font-bold text-white bg-brand-600 rounded-full flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Loading
            </button>
            <p className="text-[9px] text-neutral-400 mt-2 uppercase tracking-wider">Loading</p>
          </div>
        </div>
      </Frame>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   06 — INPUTS
   ═══════════════════════════════════════════════════════════════ */
function InputsSection() {
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [select, setSelect] = useState('');
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState('remote');

  return (
    <Section id="inputs" num="06" label="Components" title="Form Inputs"
      desc="Inputs use a restrained style: white background, neutral border at rest, violet ring on focus. Error states use danger-red border with helper text. All inputs have explicit labels — never placeholder-only.">

      <div className="grid grid-cols-2 gap-8">
        {/* Text input states */}
        <div>
          <Sub label="Text Input" />
          <div className="space-y-3">
            {/* Default */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Full Name</label>
              <input type="text" placeholder="Riya Hossain" className="w-full h-11 px-4 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white placeholder:text-neutral-400 transition-all" />
              <p className="text-[10px] text-neutral-400 mt-1">Default</p>
            </div>
            {/* Focus — simulated */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">University</label>
              <input type="text" defaultValue="Bangladesh University of Engineering" className="w-full h-11 px-4 text-sm border-transparent rounded-xl bg-white outline-none ring-2 ring-brand-400 transition-all" />
              <p className="text-[10px] text-neutral-400 mt-1">Focus</p>
            </div>
            {/* Error */}
            <div>
              <label className="block text-xs font-bold text-danger-700 mb-1.5">Email Address</label>
              <input type="text" defaultValue="riya.hossain" className="w-full h-11 px-4 text-sm border border-danger-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-danger-400 bg-white bg-danger-50 transition-all" />
              <p className="text-[10px] text-danger-600 mt-1">Enter a valid email address</p>
            </div>
            {/* Disabled */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1.5">Student ID <span className="text-[9px] normal-case font-normal">(read-only)</span></label>
              <input type="text" disabled value="STU-2024-0884" className="w-full h-11 px-4 text-sm border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-400 cursor-not-allowed" />
              <p className="text-[10px] text-neutral-400 mt-1">Disabled</p>
            </div>
          </div>
        </div>

        <div>
          {/* Search */}
          <Sub label="Search Input" />
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input type="text" placeholder="Search by role, company, or skill…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 text-sm border border-neutral-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-neutral-400 transition-all" />
          </div>

          {/* Select */}
          <Sub label="Select / Dropdown" />
          <div className="mb-6">
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">Work Type</label>
            <div className="relative">
              <select value={select} onChange={(e) => setSelect(e.target.value)}
                className="w-full h-11 pl-4 pr-10 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none text-neutral-700 transition-all">
                <option value="">Select work type…</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </span>
            </div>
          </div>

          {/* Checkbox */}
          <Sub label="Checkbox & Radio" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {[
                { label: 'Paid internships',   checked: true  },
                { label: 'Unpaid internships', checked: false },
                { label: 'Remote only',        checked: true  },
              ].map((c) => (
                <label key={c.label} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={['w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-colors', c.checked ? 'bg-brand-600 border-brand-600' : 'bg-white border-neutral-300 group-hover:border-brand-400'].join(' ')}>
                    {c.checked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                  </div>
                  <span className="text-xs text-neutral-700">{c.label}</span>
                </label>
              ))}
            </div>
            <div className="space-y-2">
              {['Remote', 'On-site', 'Hybrid'].map((v) => (
                <label key={v} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={['w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors', radio === v.toLowerCase().replace('-', '') ? 'border-brand-600' : 'border-neutral-300 group-hover:border-brand-400'].join(' ')}>
                    {radio === v.toLowerCase().replace('-', '') && <div className="w-2 h-2 rounded-full bg-brand-600" />}
                  </div>
                  <span className="text-xs text-neutral-700">{v}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <Sub label="File Upload — Resume" />
      <Frame label="Resume upload component">
        <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-brand-400 hover:bg-brand-50/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-neutral-800 mb-1">Drop your resume here, or <span className="text-brand-600">browse</span></p>
          <p className="text-xs text-neutral-400">PDF, DOC, DOCX · Max 5MB</p>
        </div>
      </Frame>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   07 — CARDS
   ═══════════════════════════════════════════════════════════════ */
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= rating ? '#f59e0b' : 'none'} stroke={n <= rating ? '#f59e0b' : '#cbd5e1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function CardsSection() {
  return (
    <Section id="cards" num="07" label="Components" title="Cards & Content"
      desc="Cards share a consistent anatomy: white bg, 16px border-radius, neutral border, subtle shadow on hover, 24px internal padding. Variants differ only in content structure — not in visual treatment.">

      <Sub label="Internship Card — List View" />
      <Frame label="Default + Urgent deadline variant">
        <div className="space-y-3">
          {/* Standard card */}
          <div className="group flex items-center gap-5 px-5 py-4 border border-neutral-200 rounded-2xl bg-white hover:border-neutral-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-extrabold border border-black/5 bg-brand-50 text-brand-700 shrink-0">BF</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-neutral-900 group-hover:text-brand-700 transition-colors">Frontend Developer Intern</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-success-50 text-success-700 border border-success-200 rounded-full">Paid</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">ByteForge Solutions</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-[11px] text-neutral-400">📍 Dhaka, BD</span>
                <span className="text-[11px] text-neutral-400">🕐 3 months</span>
                <span className="text-[11px] text-neutral-400">Remote</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-success-700">BDT 15,000/mo</span>
              <button className="h-9 px-5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-full transition-colors whitespace-nowrap">Apply Now</button>
            </div>
          </div>
          {/* Urgent card */}
          <div className="group flex items-center gap-5 px-5 py-4 border border-danger-200 rounded-2xl bg-danger-50/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-extrabold border border-black/5 bg-green-50 text-green-700 shrink-0">DN</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-neutral-900 group-hover:text-brand-700 transition-colors">Data Analyst Intern</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-danger-50 text-danger-600 border border-danger-200 rounded-full animate-pulse">Closing Soon</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-success-50 text-success-700 border border-success-200 rounded-full">Paid</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">DataNest BD · <span className="text-danger-600 font-semibold">5 days left</span></p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[11px] text-neutral-400">📍 Chittagong, BD</span>
                <span className="text-[11px] text-neutral-400">🕐 6 months</span>
                <span className="text-[11px] text-neutral-400">On-site</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-success-700">BDT 12,000/mo</span>
              <button className="h-9 px-5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-full transition-colors whitespace-nowrap">Apply Now</button>
            </div>
          </div>
        </div>
      </Frame>

      <Sub label="Company Card — Grid View" />
      <Frame label="Default + Featured variant">
        <div className="grid grid-cols-2 gap-4">
          {/* Standard */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold border border-black/5 bg-brand-50 text-brand-700">BF</div>
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-full">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                Verified
              </span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-brand-700 transition-colors mb-1">ByteForge Solutions</h3>
            <p className="text-xs text-neutral-400 mb-3">Software · Dhaka, BD · 51–200 employees</p>
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-1.5">
                <StarRating rating={5} size={11} />
                <span className="text-xs font-bold text-neutral-800">4.7</span>
                <span className="text-[10px] text-neutral-400">(38)</span>
              </div>
              <span className="text-xs font-semibold text-brand-600">3 open roles</span>
            </div>
          </div>
          {/* Featured */}
          <div className="bg-brand-950 border border-brand-800 rounded-2xl p-5 cursor-pointer group relative overflow-hidden">
            <div className="absolute top-2 right-3 text-[9px] font-extrabold uppercase tracking-widest text-accent-400">Featured</div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold border border-white/10 bg-brand-800 text-brand-200 mb-3">CB</div>
            <h3 className="text-sm font-bold text-white group-hover:text-brand-200 transition-colors mb-1">CloudBase</h3>
            <p className="text-xs text-brand-400 mb-3">Cloud & DevOps · Dhaka, BD</p>
            <div className="flex items-center justify-between pt-3 border-t border-brand-800">
              <div className="flex items-center gap-1.5">
                <StarRating rating={5} size={11} />
                <span className="text-xs font-bold text-white">4.8</span>
              </div>
              <span className="text-xs font-semibold text-accent-400">2 open roles</span>
            </div>
          </div>
        </div>
      </Frame>

      <Sub label="Review Card" />
      <Frame label="Internship experience + Interview experience">
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold bg-brand-50 text-brand-700 border border-black/5 shrink-0">BF</div>
              <div>
                <p className="text-xs font-semibold text-neutral-700">ByteForge Solutions · Frontend Developer Intern</p>
                <p className="text-[10px] text-neutral-400">3 months · Remote · Jan 2024</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <StarRating rating={5} size={12} />
                  <span className="text-xs font-bold text-neutral-800">5.0</span>
                </div>
              </div>
              <span className="ml-auto px-2.5 py-0.5 text-[10px] font-bold bg-success-50 text-success-700 border border-success-200 rounded-full shrink-0">Paid · BDT 15k</span>
            </div>
            <p className="text-sm font-bold text-neutral-900 mb-2">Best internship experience — actually wrote production code on day one.</p>
            <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">I was genuinely surprised by how much ownership they gave me. By week two I had a PR merged into main. The team treated me like a real developer, not an intern fetching coffee.</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
              <div className="flex gap-1.5">
                {['React', 'Mentorship', 'Remote'].map((t) => <span key={t} className="px-2 py-0.5 text-[9px] font-semibold bg-neutral-100 text-neutral-500 rounded-full border border-neutral-200">{t}</span>)}
              </div>
              <span className="text-[10px] text-neutral-400">— CS Student, BUET</span>
            </div>
          </div>
        </div>
      </Frame>

      <Sub label="Supporting Components" />
      <div className="grid grid-cols-3 gap-4">
        {/* Notification item */}
        <Frame label="Notification item">
          <div className="space-y-3">
            {[
              { icon: '✓', color: 'text-success-600 bg-success-100', title: 'Application Accepted!', sub: 'ByteForge Solutions · 2m ago', unread: true },
              { icon: '⏰', color: 'text-accent-600 bg-accent-100', title: 'Deadline in 5 days', sub: 'DataNest BD · 1h ago', unread: true },
              { icon: '✗', color: 'text-danger-600 bg-danger-100', title: 'Application declined', sub: 'TechNova Ltd · 2d ago', unread: false },
            ].map((n) => (
              <div key={n.title} className={['flex items-start gap-3 p-3 rounded-xl', n.unread ? 'bg-brand-50 border border-brand-100' : 'bg-neutral-50'].join(' ')}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${n.color}`}>{n.icon}</span>
                <div>
                  <p className="text-xs font-bold text-neutral-900">{n.title}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{n.sub}</p>
                </div>
                {n.unread && <span className="w-2 h-2 rounded-full bg-brand-500 ml-auto mt-1 shrink-0" />}
              </div>
            ))}
          </div>
        </Frame>

        {/* Application status */}
        <Frame label="Application status tracker">
          <div className="space-y-3">
            {[
              { role: 'Frontend Dev Intern', company: 'ByteForge',  status: 'Accepted',  bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-200' },
              { role: 'Software Eng Intern', company: 'TechNova',   status: 'Under Review',bg: 'bg-brand-50',  text: 'text-brand-700',  border: 'border-brand-200' },
              { role: 'Marketing Intern',    company: 'GrowthHub',  status: 'Rejected',  bg: 'bg-danger-50',  text: 'text-danger-700', border: 'border-danger-200' },
              { role: 'Data Analyst Intern', company: 'DataNest',   status: 'Applied',   bg: 'bg-neutral-100',text: 'text-neutral-600',border: 'border-neutral-200' },
            ].map((a) => (
              <div key={a.role} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-800 truncate">{a.role}</p>
                  <p className="text-[10px] text-neutral-400">{a.company}</p>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${a.bg} ${a.text} ${a.border}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </Frame>

        {/* Avatar + Rating */}
        <div className="space-y-4">
          <Frame label="Avatars">
            <div className="flex items-center gap-3">
              {[
                { i: 'RH', c: '#7c3aed', bg: '#f5f3ff', size: 'w-8 h-8 text-xs' },
                { i: 'TI', c: '#059669', bg: '#f0fdf4', size: 'w-10 h-10 text-sm' },
                { i: 'ZH', c: '#d97706', bg: '#fffbeb', size: 'w-12 h-12 text-base' },
              ].map((a) => (
                <div key={a.i} className={`${a.size} rounded-full flex items-center justify-center font-extrabold border-2 border-white`} style={{ background: a.bg, color: a.c }}>
                  {a.i}
                </div>
              ))}
              {/* Stack */}
              <div className="flex -space-x-2 ml-2">
                {['#f5f3ff', '#f0fdf4', '#fffbeb'].map((bg, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white" style={{ background: bg }} />
                ))}
                <div className="w-8 h-8 rounded-full bg-neutral-900 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">+12</div>
              </div>
            </div>
          </Frame>
          <Frame label="Star Rating">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <StarRating rating={r} size={14} />
                  <span className="text-xs text-neutral-500">{r}.0</span>
                </div>
              ))}
            </div>
          </Frame>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   08 — FEEDBACK
   ═══════════════════════════════════════════════════════════════ */
function FeedbackSection() {
  const [toastVisible, setToastVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Section id="feedback" num="08" label="Components" title="Feedback & Alerts"
      desc="Alerts, toasts, modals, and confirmation dialogs. Consistent icon+color language: green for success, amber for warning, red for error, blue for info.">

      <Sub label="Alert Variants" />
      <div className="space-y-3 mb-8">
        {[
          { variant: 'success', bg: 'bg-success-50', border: 'border-success-200', icon: '#16a34a', dot: 'bg-success-500', title: 'Application submitted!', body: 'Your application to ByteForge Solutions has been sent. You will be notified within 5 business days.' },
          { variant: 'warning', bg: 'bg-accent-50',  border: 'border-accent-200',  icon: '#d97706', dot: 'bg-accent-500',  title: 'Deadline approaching',   body: 'Your application for Data Analyst Intern at DataNest BD closes in 5 days. Complete it now.' },
          { variant: 'error',   bg: 'bg-danger-50',  border: 'border-danger-200',  icon: '#dc2626', dot: 'bg-danger-500',  title: 'Verification required',   body: 'Your uploaded resume could not be parsed. Please upload a valid PDF or DOCX file under 5MB.' },
          { variant: 'info',    bg: 'bg-info-50',    border: 'border-info-200',    icon: '#2563eb', dot: 'bg-info-500',    title: 'Profile incomplete',      body: 'Add your university and expected graduation year to improve your application visibility by 3×.' },
        ].map((a) => (
          <div key={a.variant} className={`flex items-start gap-4 px-5 py-4 rounded-2xl border ${a.bg} ${a.border}`}>
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.dot}`} />
            <div>
              <p className="text-sm font-bold text-neutral-900 mb-0.5">{a.title}</p>
              <p className="text-xs text-neutral-600 leading-relaxed">{a.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <Sub label="Badges" />
      <Frame label="Badge variants">
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Verified',     bg: 'bg-brand-50',   text: 'text-brand-700',   border: 'border-brand-200' },
            { label: 'Paid',         bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-200' },
            { label: 'Unpaid',       bg: 'bg-accent-50',  text: 'text-accent-700',  border: 'border-accent-200' },
            { label: 'Remote',       bg: 'bg-info-50',    text: 'text-info-700',    border: 'border-info-200' },
            { label: 'On-site',      bg: 'bg-neutral-100',text: 'text-neutral-700', border: 'border-neutral-200' },
            { label: 'Hybrid',       bg: 'bg-neutral-100',text: 'text-neutral-700', border: 'border-neutral-200' },
            { label: 'Closing Soon', bg: 'bg-danger-50',  text: 'text-danger-600',  border: 'border-danger-200' },
            { label: 'New',          bg: 'bg-brand-600',  text: 'text-white',        border: 'border-transparent' },
          ].map((b) => (
            <span key={b.label} className={`px-3 py-1 text-xs font-bold rounded-full border ${b.bg} ${b.text} ${b.border}`}>{b.label}</span>
          ))}
        </div>
      </Frame>

      {/* Contributor badges */}
      <Sub label="Contributor Badges" />
      <Frame label="Gamification / contributor points badges">
        <div className="flex items-center gap-6">
          {[
            { name: 'First Review',  pts: '50 pts',  icon: '✍', color: '#7c3aed', bg: '#f5f3ff' },
            { name: 'Top Reviewer',  pts: '500 pts', icon: '🏅', color: '#d97706', bg: '#fffbeb' },
            { name: 'Verified Intern',pts: '200 pts', icon: '✓', color: '#059669', bg: '#f0fdf4' },
            { name: 'Explorer',      pts: '100 pts', icon: '🔍', color: '#0284c7', bg: '#eff6ff' },
          ].map((b) => (
            <div key={b.name} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl border-2" style={{ background: b.bg, borderColor: b.color + '40' }}>
                {b.icon}
              </div>
              <p className="text-xs font-bold text-neutral-800 text-center">{b.name}</p>
              <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full" style={{ background: b.bg, color: b.color }}>{b.pts}</span>
            </div>
          ))}
        </div>
      </Frame>

      {/* Toast */}
      <Sub label="Toast Notification" />
      <Frame label="Toast (dismissible)">
        <div className="flex items-start gap-3 bg-neutral-900 text-white px-5 py-4 rounded-2xl shadow-xl max-w-sm">
          <div className="w-6 h-6 rounded-full bg-success-500 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Resume uploaded</p>
            <p className="text-xs text-neutral-400 mt-0.5">Riya_Hossain_Resume.pdf · 284 KB</p>
          </div>
          <button className="text-neutral-500 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </Frame>

      {/* Modal trigger */}
      <Sub label="Modal & Confirmation Dialog" />
      <Frame label="Apply modal (click to preview)">
        <button
          onClick={() => setModalOpen(true)}
          className="h-10 px-6 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-full transition-colors"
        >
          Open Apply Modal
        </button>
      </Frame>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Apply to Frontend Developer Intern</h3>
                <p className="text-xs text-neutral-500 mt-0.5">ByteForge Solutions · Dhaka, BD</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 p-1.5 rounded-lg transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <div>
                  <p className="text-xs font-semibold text-neutral-800">Riya_Hossain_Resume.pdf</p>
                  <p className="text-[10px] text-neutral-400">Uploaded Jan 12 · 284 KB</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1.5">Cover Letter (optional)</label>
                <textarea rows={3} placeholder="Tell ByteForge why you are a great fit…" className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none placeholder:text-neutral-400" />
              </div>
            </div>
            <div className="px-6 pb-6 flex items-center justify-end gap-2.5">
              <button onClick={() => setModalOpen(false)} className="h-10 px-5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">Cancel</button>
              <button onClick={() => setModalOpen(false)} className="h-10 px-7 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-full transition-all active:scale-95">Submit Application</button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   09 — NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
function NavigationSection() {
  const [navTab, setNavTab] = useState('internships');
  const [sideTab, setSideTab] = useState('overview');

  return (
    <Section id="navigation" num="09" label="Components" title="Navigation"
      desc="Public navbar is minimal and typographic. Student sidebar is structured and information-dense. Both share the same brand language but differ in information architecture.">

      <Sub label="Public Navbar — Desktop" />
      <Frame label="Default scrolled state">
        <div className="bg-white border-b border-neutral-100 rounded-xl overflow-hidden">
          <div className="px-6 h-[64px] flex items-center gap-8">
            <div className="flex items-center gap-2 shrink-0">
              <LogoMark size={30} />
              <Wordmark size="sm" />
            </div>
            <nav className="flex items-center gap-1 flex-1">
              {['Internships', 'Companies', 'Reviews', 'About'].map((link) => (
                <button key={link}
                  onClick={() => setNavTab(link.toLowerCase())}
                  className={['relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors', navTab === link.toLowerCase() ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'].join(' ')}>
                  {link}
                  {navTab === link.toLowerCase() && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-accent-500 rounded-full" />}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2 shrink-0">
              <button className="h-8 px-4 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">Log in</button>
              <button className="h-8 px-4 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-full transition-colors">Sign up</button>
            </div>
          </div>
        </div>
      </Frame>

      <Sub label="Student Sidebar — Dashboard" />
      <Frame label="Sidebar navigation with active states">
        <div className="flex gap-0 h-72 rounded-xl overflow-hidden border border-neutral-200">
          {/* Sidebar */}
          <div className="w-52 bg-neutral-50 border-r border-neutral-200 p-3 shrink-0">
            <div className="flex items-center gap-2.5 px-2 py-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">RH</div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Riya Hossain</p>
                <p className="text-[9px] text-neutral-400">BUET, CSE</p>
              </div>
            </div>
            <div className="space-y-0.5">
              {[
                { id: 'overview',      label: 'Overview',      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { id: 'internships',   label: 'Browse',        icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                { id: 'applications',  label: 'My Applications',icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { id: 'saved',         label: 'Saved',         icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
                { id: 'reviews',       label: 'My Reviews',    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
                { id: 'profile',       label: 'Profile',       icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              ].map((item) => (
                <button key={item.id} onClick={() => setSideTab(item.id)}
                  className={['w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all text-left', sideTab === item.id ? 'bg-brand-600 text-white' : 'text-neutral-600 hover:bg-neutral-200'].join(' ')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {/* Content preview */}
          <div className="flex-1 p-6 bg-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-neutral-400 mb-3">
              {sideTab.charAt(0).toUpperCase() + sideTab.slice(1)} — preview area
            </p>
            <p className="text-sm text-neutral-400">Sidebar is interactive — click to switch sections</p>
          </div>
        </div>
      </Frame>

      <Sub label="Tabs Component" />
      <Frame label="Horizontal tabs with active underline">
        <div>
          <div className="flex border-b border-neutral-200 gap-0">
            {['Description', 'Qualifications', 'Responsibilities'].map((t, i) => (
              <button key={t}
                className={['px-5 py-3 text-sm font-semibold relative transition-colors', i === 1 ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'].join(' ')}>
                {t}
                {i === 1 && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
              </button>
            ))}
          </div>
          <div className="pt-5">
            <p className="text-sm text-neutral-600 leading-relaxed">Currently enrolled in a CS, Software Engineering, or related degree program. Strong foundation in HTML, CSS, and JavaScript (ES6+). Familiarity with React or Vue.js.</p>
          </div>
        </div>
      </Frame>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10 — DATA DISPLAY
   ═══════════════════════════════════════════════════════════════ */
function DataSection() {
  const [page, setPage] = useState(2);

  return (
    <Section id="data" num="10" label="Components" title="Data Display"
      desc="Tables, pagination, and filter controls for company dashboards and admin views. Typography stays consistent with the rest of the system — no special table fonts.">

      <Sub label="Data Table — Applicant Tracker" />
      <Frame label="Company / HR applicant table">
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                {['Applicant', 'Role', 'Applied', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-neutral-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {[
                { name: 'Riya Hossain',  initials: 'RH', role: 'Frontend Dev Intern',    date: 'Jan 14, 2024', status: 'Accepted',    sc: 'bg-success-50 text-success-700 border-success-200' },
                { name: 'Tanvir Islam',  initials: 'TI', role: 'Frontend Dev Intern',    date: 'Jan 13, 2024', status: 'Under Review',sc: 'bg-brand-50 text-brand-700 border-brand-200' },
                { name: 'Nasrin Akter',  initials: 'NA', role: 'Software Eng Intern',    date: 'Jan 12, 2024', status: 'Shortlisted', sc: 'bg-accent-50 text-accent-700 border-accent-200' },
                { name: 'Mostafa Karim', initials: 'MK', role: 'Frontend Dev Intern',    date: 'Jan 11, 2024', status: 'Rejected',    sc: 'bg-danger-50 text-danger-700 border-danger-200' },
              ].map((row) => (
                <tr key={row.name} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">{row.initials}</div>
                      <span className="text-sm font-semibold text-neutral-900">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{row.role}</td>
                  <td className="px-4 py-3 text-xs text-neutral-400">{row.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${row.sc}`}>{row.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Frame>

      <Sub label="Pagination" />
      <Frame label="Page navigation">
        <div className="flex items-center gap-1">
          <button className="h-9 px-3 text-sm text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          {[1, 2, 3, 4, 5].map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={['h-9 w-9 text-sm font-semibold rounded-lg transition-colors', page === p ? 'bg-brand-600 text-white' : 'text-neutral-500 hover:bg-neutral-100'].join(' ')}>
              {p}
            </button>
          ))}
          <span className="px-2 text-neutral-300 text-sm">…</span>
          <button className="h-9 w-9 text-sm font-semibold text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors">12</button>
          <button className="h-9 px-3 text-sm text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </Frame>

      <Sub label="Filter Controls" />
      <Frame label="Filter pill group + active state">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-neutral-500 mr-1">Work type:</span>
            {['All', 'Remote', 'On-site', 'Hybrid'].map((f, i) => (
              <button key={f} className={['h-8 px-4 text-xs font-semibold rounded-full border transition-all', i === 1 ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'].join(' ')}>{f}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-neutral-500 mr-1">Stipend:</span>
            {['All', 'Paid', 'Unpaid'].map((f, i) => (
              <button key={f} className={['h-8 px-4 text-xs font-semibold rounded-full border transition-all', i === 0 ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'].join(' ')}>{f}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-neutral-500 mr-1">Active filters:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 rounded-full">
              Remote
              <button className="hover:text-danger-600 transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </span>
            <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">Clear all</button>
          </div>
        </div>
      </Frame>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR NAV
   ═══════════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: 'brand',      label: 'Brand Identity',   num: '01' },
  { id: 'color',      label: 'Color System',      num: '02' },
  { id: 'typography', label: 'Typography',        num: '03' },
  { id: 'spacing',    label: 'Spacing & Grid',    num: '04' },
  { id: 'buttons',    label: 'Buttons',           num: '05' },
  { id: 'inputs',     label: 'Form Inputs',       num: '06' },
  { id: 'cards',      label: 'Cards & Content',   num: '07' },
  { id: 'feedback',   label: 'Feedback & Alerts', num: '08' },
  { id: 'navigation', label: 'Navigation',        num: '09' },
  { id: 'data',       label: 'Data Display',      num: '10' },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function DesignSystemPage() {
  const [active, setActive] = useState('brand');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* ── Page Hero ── */}
      <div className="bg-brand-950 border-b border-brand-800">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <LogoMark size={48} variant="dark" />
                <Wordmark size="md" variant="white" />
              </div>
              <h1 className="font-display italic text-4xl text-white mb-2" style={{ fontVariationSettings: "'opsz' 72, 'wght' 700" }}>
                Design System
              </h1>
              <p className="text-brand-300 text-sm">Stage 1 — Brand Direction &amp; Component Library</p>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-brand-900/60 border border-brand-700 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-extrabold text-white">10</p>
                <p className="text-[10px] text-brand-400 mt-0.5">Component Sections</p>
              </div>
              <div className="bg-brand-900/60 border border-brand-700 rounded-xl px-5 py-3 text-center">
                <p className="font-display italic text-xl text-accent-400" style={{ fontVariationSettings: "'opsz' 36, 'wght' 700" }}>Fraunces</p>
                <p className="text-[10px] text-brand-400 mt-0.5">Display Typeface</p>
              </div>
              <div className="bg-brand-900/60 border border-brand-700 rounded-xl px-5 py-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <span className="w-3 h-3 rounded-full bg-brand-500" />
                  <span className="w-3 h-3 rounded-full bg-accent-400" />
                  <span className="w-3 h-3 rounded-full bg-neutral-400" />
                </div>
                <p className="text-[10px] text-brand-400">Violet · Amber · Slate</p>
              </div>
              <div className="bg-brand-900/60 border border-brand-700 rounded-xl px-5 py-3 text-center">
                <p className="text-lg font-extrabold text-white">4px</p>
                <p className="text-[10px] text-brand-400 mt-0.5">Base Grid</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex gap-0">
          {/* Sticky sidebar */}
          <aside className="w-52 shrink-0 hidden lg:block">
            <div className="sticky top-[72px] pt-10 pr-6 pb-16 h-[calc(100vh-72px)] overflow-y-auto">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-neutral-400 mb-4">Sections</p>
              <nav className="space-y-0.5">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={['w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl transition-all duration-150', active === item.id ? 'bg-brand-50 text-brand-700' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'].join(' ')}
                  >
                    <span className={['text-[9px] font-mono shrink-0', active === item.id ? 'text-brand-500' : 'text-neutral-300'].join(' ')}>{item.num}</span>
                    <span className="text-xs font-semibold truncate">{item.label}</span>
                    {active === item.id && <span className="w-1.5 h-1.5 rounded-full bg-accent-400 ml-auto shrink-0" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Divider */}
          <div className="w-px bg-neutral-200 shrink-0 hidden lg:block" />

          {/* Main content */}
          <main className="flex-1 min-w-0 pt-14 pb-24 lg:pl-10">
            <BrandSection />
            <ColorSection />
            <TypographySection />
            <SpacingSection />
            <ButtonsSection />
            <InputsSection />
            <CardsSection />
            <FeedbackSection />
            <NavigationSection />
            <DataSection />
          </main>
        </div>
      </div>
    </div>
  );
}
