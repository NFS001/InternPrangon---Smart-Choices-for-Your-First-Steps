import React, { useState } from 'react';
import Logo from './Logo';
import Avatar from './Avatar';
import { SearchInput } from './Input';

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const navLinks = [
  { label: 'Find Internships', href: '#' },
  { label: 'Companies',        href: '#' },
  { label: 'Reviews',          href: '#' },
  { label: 'Leaderboard',      href: '#' },
];

interface NavbarProps {
  variant?: 'student' | 'company' | 'admin';
  notifCount?: number;
  userName?: string;
}

export default function Navbar({ variant = 'student', notifCount = 3, userName = 'Riya Hossain' }: NavbarProps) {
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full h-16 bg-white border-b border-neutral-200 flex items-center px-5 gap-4 shrink-0">
      <Logo size="sm" />

      {/* Desktop nav */}
      {variant === 'student' && (
        <nav className="hidden md:flex items-center gap-0.5 ml-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}

      {variant === 'company' && (
        <nav className="hidden md:flex items-center gap-0.5 ml-2">
          {['Dashboard', 'My Internships', 'Applicants', 'Company Profile'].map((label) => (
            <a key={label} href="#" className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors">{label}</a>
          ))}
        </nav>
      )}

      {variant === 'admin' && (
        <nav className="hidden md:flex items-center gap-0.5 ml-2">
          {['Dashboard', 'Verifications', 'Reviews', 'Companies', 'Users'].map((label) => (
            <a key={label} href="#" className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors">{label}</a>
          ))}
        </nav>
      )}

      {/* Search */}
      <div className="flex-1 max-w-xs ml-auto">
        <SearchInput
          placeholder="Search internships…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors" aria-label="Notifications">
          <BellIcon />
          {notifCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors" aria-label="User menu">
          <Avatar name={userName} size="sm" status="online" />
          <span className="hidden lg:block text-sm font-medium text-neutral-700">{userName.split(' ')[0]}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden w-9 h-9 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 rounded-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
    </header>
  );
}
