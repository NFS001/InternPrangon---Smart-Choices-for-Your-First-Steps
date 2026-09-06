import React from 'react';

type LogoVariant = 'full' | 'full-white' | 'icon';
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
}

const sizeMap = {
  xs: { icon: 24, gap: 'gap-1.5', title: 'text-sm', sub: 'text-[7px]' },
  sm: { icon: 30, gap: 'gap-2',   title: 'text-base', sub: 'text-[8px]' },
  md: { icon: 38, gap: 'gap-2.5', title: 'text-xl',  sub: 'text-[9px]' },
  lg: { icon: 46, gap: 'gap-3',   title: 'text-2xl', sub: 'text-[10px]' },
  xl: { icon: 58, gap: 'gap-3.5', title: 'text-3xl', sub: 'text-[11px]' },
};

export default function Logo({ variant = 'full', size = 'md', className = '' }: LogoProps) {
  const s = sizeMap[size];
  const isDark = variant === 'full-white';

  const mark = (
    <svg
      width={s.icon}
      height={s.icon}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background */}
      <rect width="40" height="40" rx="10" fill="#2845E2" />
      {/* Staircase path — "first steps upward" */}
      <path
        d="M10 30 L10 22 L19 22 L19 14 L28 14"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Corner dots reinforcing the steps */}
      <circle cx="19" cy="22" r="1.5" fill="white" fillOpacity="0.5" />
      {/* Destination dot — accent orange */}
      <circle cx="28" cy="14" r="3.5" fill="#F97316" />
      <circle cx="28" cy="14" r="1.5" fill="white" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex ${className}`}>{mark}</div>;
  }

  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`}>
      {mark}
      <div className="flex flex-col">
        <span
          className={`font-bold leading-none tracking-tight ${s.title}`}
          style={{ color: isDark ? '#ffffff' : '#141852' }}
        >
          Intern
          <span style={{ color: '#2845E2' }}>Prangon</span>
        </span>
        <span
          className={`font-medium tracking-[0.14em] uppercase leading-none mt-[3px] ${s.sub}`}
          style={{ color: isDark ? '#97b5f8' : '#64748b' }}
        >
          Smart Choices
        </span>
      </div>
    </div>
  );
}
