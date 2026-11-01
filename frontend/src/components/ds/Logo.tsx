import React from 'react';

export type LogoVariant = 'full' | 'full-white' | 'icon' | 'image';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  showSubtitle?: boolean;
}

const sizeMap = {
  xs: { icon: 24, gap: 'gap-1.5', title: 'text-sm', sub: 'text-[7px]', dot: 'w-1 h-1' },
  sm: { icon: 30, gap: 'gap-2',   title: 'text-base', sub: 'text-[8px]', dot: 'w-1.5 h-1.5' },
  md: { icon: 38, gap: 'gap-2.5', title: 'text-xl',  sub: 'text-[9px]', dot: 'w-1.5 h-1.5' },
  lg: { icon: 46, gap: 'gap-3',   title: 'text-2xl', sub: 'text-[10px]', dot: 'w-2 h-2' },
  xl: { icon: 56, gap: 'gap-3.5', title: 'text-3xl', sub: 'text-[11px]', dot: 'w-2.5 h-2.5' },
};

/* ─── Ascending Gradient Steps & Arrow Mark ──────────────────── */
export function LogoMark({
  size = 40,
  variant = 'color',
  className = '',
}: {
  size?: number;
  variant?: 'color' | 'white' | 'dark';
  className?: string;
}) {
  const isWhite = variant === 'white';
  const isDark = variant === 'dark';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`ipAscentGrad-${size}-${variant}`} x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isWhite ? '#c7d2fe' : isDark ? '#4f46e5' : '#312e81'} />
          <stop offset="40%" stopColor={isWhite ? '#a855f7' : '#6366f1'} />
          <stop offset="78%" stopColor={isWhite ? '#fdba74' : '#f97316'} />
          <stop offset="100%" stopColor={isWhite ? '#ffffff' : '#fb923c'} />
        </linearGradient>

        <linearGradient id={`ipArrowGlow-${size}-${variant}`} x1="8" y1="36" x2="42" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="35%" stopColor="#6366f1" />
          <stop offset="75%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>

      {/* Rounded container tile */}
      <rect
        width="48"
        height="48"
        rx="12"
        fill={isWhite ? 'rgba(255,255,255,0.1)' : isDark ? '#090d16' : '#0b0f19'}
      />

      {/* Ascending staircase frames: representing early steps */}
      {/* Step 1: Base */}
      <rect
        x="8"
        y="28"
        width="9"
        height="12"
        rx="2"
        stroke={isWhite ? '#cbd5e1' : '#4338ca'}
        strokeWidth="2"
        fill="none"
        opacity={isWhite ? 0.7 : 0.85}
      />
      {/* Step 2: Mid */}
      <rect
        x="17"
        y="20"
        width="10"
        height="20"
        rx="2"
        stroke={isWhite ? '#e2e8f0' : '#6366f1'}
        strokeWidth="2"
        fill="none"
        opacity={isWhite ? 0.85 : 0.95}
      />
      {/* Step 3: Tall */}
      <rect
        x="27"
        y="12"
        width="11"
        height="28"
        rx="2"
        stroke={isWhite ? '#fed7aa' : '#a855f7'}
        strokeWidth="2"
        fill="none"
        opacity={0.9}
      />

      {/* Upward-Forward Dynamic Staircase Arrow Path */}
      <path
        d="M 10 35 L 18 24 L 26 24 L 38 12"
        stroke={`url(#ipArrowGlow-${size}-${variant})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arrowhead pointing forward and upward */}
      <path
        d="M 41 9 L 30 11 L 34.5 15.5 Z"
        fill={`url(#ipAscentGrad-${size}-${variant})`}
        stroke={isWhite ? '#ffffff' : '#f97316'}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M 37.5 12.5 L 40 10"
        stroke="#fb923c"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Milestone dot */}
      <circle cx="40" cy="9.5" r="1.3" fill="#ffffff" />
    </svg>
  );
}

/* ─── Full Brand Logo Component ──────────────────────────────── */
export default function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
}: LogoProps) {
  const s = sizeMap[size];
  const isDark = variant === 'full-white';

  if (variant === 'image') {
    return (
      <img
        src="/internprangon_logo.jpg"
        alt="InternPrangon"
        className={`h-auto rounded-lg object-contain ${className}`}
        style={{ maxHeight: s.icon * 1.5 }}
      />
    );
  }

  const mark = (
    <LogoMark
      size={s.icon}
      variant={isDark ? 'white' : 'color'}
    />
  );

  if (variant === 'icon') {
    return <div className={`inline-flex shrink-0 ${className}`}>{mark}</div>;
  }

  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`}>
      {mark}
      <div className="flex flex-col">
        <div className="flex items-center">
          <span
            className={`font-display italic font-extrabold leading-none tracking-tight ${s.title}`}
            style={{
              color: isDark ? '#ffffff' : '#0f172a',
              fontVariationSettings: "'opsz' 48, 'wght' 800",
            }}
          >
            Intern
          </span>
          <span
            className={`font-sans not-italic font-black leading-none tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent ml-[2px] ${s.title}`}
          >
            Prangon
          </span>
          <span
            className={`rounded-full bg-gradient-to-r from-orange-500 to-amber-500 inline-block ml-0.5 mb-0.5 shrink-0 shadow-sm shadow-orange-500/40 ${s.dot}`}
          />
        </div>
        {showSubtitle && (
          <span
            className={`font-semibold tracking-[0.16em] uppercase leading-none mt-1 ${s.sub}`}
            style={{ color: isDark ? '#cbd5e1' : '#64748b' }}
          >
            Smart Choices for Your First Steps
          </span>
        )}
      </div>
    </div>
  );
}
