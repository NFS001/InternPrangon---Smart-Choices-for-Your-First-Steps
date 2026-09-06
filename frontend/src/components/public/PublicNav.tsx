import React, { useState, useEffect } from 'react';
import type { Navigate } from '../../data/index';
import { LogoMark } from '../../pages/DesignSystemPage';
import { getSavedUser } from '../../api/client';

interface PublicNavProps {
  currentPage: string;
  onNavigate: Navigate;
  loggedIn?: boolean;
  onLogout?: () => void;
}

const NAV_LINKS = [
  { id: 'internships', label: 'Internships' },
  { id: 'companies',   label: 'Companies' },
  { id: 'reviews',     label: 'Reviews' },
  { id: 'about',       label: 'About' },
];

export default function PublicNav({ currentPage, onNavigate, loggedIn, onLogout }: PublicNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const savedUser = getSavedUser();
  // Admin should never show a student/system profile on public site
  const isAuthUser = Boolean(loggedIn && savedUser && savedUser.role !== 'admin');
  const initials = savedUser?.name
    ? savedUser.name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'IP';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [currentPage]);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function go(page: string, data?: Record<string, unknown>) {
    onNavigate(page, data);
    setMenuOpen(false);
  }

  return (
    <header
      className={[
        'sticky top-0 z-50 bg-[#fafaf9]/95 backdrop-blur-md transition-all duration-300',
        scrolled ? 'shadow-sm border-b border-neutral-200/80' : 'border-b border-neutral-200/50',
      ].join(' ')}
    >
      {/* ── Main bar ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-[60px] md:h-[68px] flex items-center gap-4 md:gap-10">

        {/* Logo */}
        <button
          onClick={() => go('home')}
          className="flex items-center gap-2.5 shrink-0 group"
          aria-label="InternPrangon home"
        >
          <LogoMark size={28} />
          <div className="flex items-center">
            <span
              className="font-display italic text-[17px] md:text-[19px] font-bold text-neutral-900 group-hover:text-brand-800 transition-colors"
              style={{ fontVariationSettings: "'opsz' 36, 'wght' 800" }}
            >
              Intern
            </span>
            <span className="font-sans not-italic text-[17px] md:text-[19px] font-extrabold text-brand-600 group-hover:text-brand-700 transition-colors">
              Prangon
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 ml-0.5 mb-1.5 shrink-0" />
          </div>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map((link) => {
            const active = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className={[
                  'relative px-3.5 py-2 text-[13.5px] font-medium transition-all duration-150 rounded-lg',
                  active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/70',
                ].join(' ')}
              >
                {link.label}
                {active && <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-accent-500 rounded-full" />}
              </button>
            );
          })}
          {/* Navigation links */}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center shrink-0">
          {isAuthUser ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => go('dashboard')}
                className="flex items-center gap-2 h-9 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50 rounded-full transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center text-white text-[9px] font-bold">{initials}</div>
                Dashboard
              </button>
              <button
                onClick={onLogout}
                className="h-9 px-4 text-sm font-semibold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => go('login')}
                className="h-9 px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => go('register', { as: 'student' })}
                className="h-9 px-5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-full transition-colors shadow-sm hover:shadow-md"
              >
                Sign up free
              </button>
            </div>
          )}
        </div>

        {/* Mobile right: login hint + hamburger */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          {!loggedIn && (
            <button
              onClick={() => go('login')}
              className="h-8 px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
            >
              Log in
            </button>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile slide-down menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 shadow-xl">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const active = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => go(link.id)}
                  className={[
                    'w-full text-left px-4 py-3 text-base font-medium rounded-xl transition-colors',
                    active ? 'bg-brand-50 text-brand-700' : 'text-neutral-700 hover:bg-neutral-50',
                  ].join(' ')}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="border-t border-neutral-100 px-4 py-3">
            {isAuthUser ? (
              <div className="flex gap-2">
                <button
                  onClick={() => go('dashboard')}
                  className="flex-1 h-10 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { onLogout?.(); setMenuOpen(false); }}
                  className="flex-1 h-10 text-sm font-semibold text-neutral-600 border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => go('login')}
                  className="flex-1 h-10 text-sm font-semibold text-neutral-700 border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => go('register', { as: 'student' })}
                  className="flex-1 h-10 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors"
                >
                  Sign up free
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
