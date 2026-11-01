import React, { useState, useEffect, useRef } from 'react';
import type { Navigate } from './data/index';

import PublicNav from './components/public/PublicNav';
import StudentSidebar from './components/student/StudentSidebar';
import CompanySidebar from './components/company/CompanySidebar';

import HomePage from './pages/HomePage';
import InternshipsPage from './pages/InternshipsPage';
import InternshipDetailPage from './pages/InternshipDetailPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import ReviewsPage from './pages/ReviewsPage';
import AboutPage from './pages/AboutPage';

import AuthModal, { type AuthMode, type UserRole } from './components/auth/AuthModal';

import AdminSidebar          from './components/admin/AdminSidebar';
import AdminDashboardPage    from './pages/admin/AdminDashboardPage';
import AdminCompaniesPage    from './pages/admin/AdminCompaniesPage';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import AdminReviewsPage      from './pages/admin/AdminReviewsPage';
import AdminActivityPage     from './pages/admin/AdminActivityPage';

import CoDashboardPage    from './pages/company/CoDashboardPage';
import CoApplicantsPage   from './pages/company/CoApplicantsPage';
import CoInternshipsPage  from './pages/company/CoInternshipsPage';
import CoProfilePage      from './pages/company/CoProfilePage';
import CoVerificationPage from './pages/company/CoVerificationPage';

import DashboardPage from './pages/student/DashboardPage';
import ProfilePage from './pages/student/ProfilePage';
import SavedPage from './pages/student/SavedPage';
import ApplicationsPage from './pages/student/ApplicationsPage';
import NotificationsPage from './pages/student/NotificationsPage';
import ContributorsPage from './pages/student/ContributorsPage';
import WriteReviewPage from './pages/student/WriteReviewPage';
import { clearAuth, getSavedUser, login, register, saveAuth, type ApiUser } from './api/client';

const PUBLIC_PAGES  = ['home', 'internships', 'internship-detail', 'companies', 'company-detail', 'reviews', 'about', 'login', 'register'];
const STUDENT_PAGES = ['dashboard', 'profile', 'saved', 'applications', 'notifications', 'contributors', 'write-review'];
const COMPANY_PAGES = ['co-dashboard', 'co-applicants', 'co-internships', 'co-profile', 'co-verification'];
const ADMIN_PAGES   = ['admin-dashboard', 'admin-companies', 'admin-verifications', 'admin-reviews', 'admin-activity'];

export default function App() {
  const [page, setPage] = useState(() => {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash && hash !== 'login' && hash !== 'register') return hash;
    return 'home';
  });
  const [pageData, setPageData] = useState<Record<string, unknown>>({});
  const [transitioning, setTransitioning] = useState(false);
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(() => getSavedUser());
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Unified Auth Modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [userRole, setUserRole] = useState<UserRole>('student');

  const openAuth = (mode: AuthMode = 'login', role: UserRole = 'student') => {
    setAuthMode(mode);
    setUserRole(role);
    setAuthError('');
    setIsAuthOpen(true);
  };

  const isNavigatingRef = useRef(false);

  const navigate: Navigate = (newPage, data = {}) => {
    // Intercept login and register navigation to pop up modal
    if (newPage === 'login') {
      openAuth('login');
      return;
    }
    if (newPage === 'register') {
      const targetRole = (data.as as UserRole) || 'student';
      openAuth('signup', targetRole);
      return;
    }

    if (newPage === page && JSON.stringify(data) === JSON.stringify(pageData)) return;
    isNavigatingRef.current = true;
    setPageData(data);
    window.location.hash = newPage;
    setTransitioning(true);
    setTimeout(() => {
      setPage(newPage);
      setPageData(data);
      setTransitioning(false);
      isNavigatingRef.current = false;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 160);
  };

  // Hash change listener
  useEffect(() => {
    const handleHash = () => {
      if (isNavigatingRef.current) return;
      const hash = window.location.hash.replace('#', '').trim();
      if (hash === 'login') {
        openAuth('login');
        return;
      }
      if (hash === 'register') {
        openAuth('signup', 'student');
        return;
      }
      if (hash && hash !== page) {
        setPage(hash);
        setPageData({});
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [page]);

  // Check initial hash for auth trigger
  useEffect(() => {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash === 'login') {
      openAuth('login');
    } else if (hash === 'register') {
      openAuth('signup', 'student');
    }
  }, []);

  async function handleLogin(email: string, password: string) {
    setAuthError('');
    setAuthLoading(true);
    try {
      const auth = await login(email, password);
      saveAuth(auth);
      setCurrentUser(auth.user);
      setIsAuthOpen(false);
      navigateForRole(auth.user.role);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegister(name: string, email: string, password: string, role: 'student' | 'company') {
    setAuthError('');
    setAuthLoading(true);
    try {
      const auth = await register(name, email, password, role);
      saveAuth(auth);
      setCurrentUser(auth.user);
      setIsAuthOpen(false);
      navigateForRole(auth.user.role);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  }

  function navigateForRole(role: ApiUser['role']) {
    if (role === 'admin') navigate('admin-dashboard');
    else if (role === 'company') navigate('co-dashboard');
    else navigate('dashboard');
  }

  function handleLogout() {
    clearAuth();
    setCurrentUser(null);
    navigate('home');
  }

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const isPublic  = PUBLIC_PAGES.includes(page);
  const isStudent = STUDENT_PAGES.includes(page);
  const isCompany = COMPANY_PAGES.includes(page);
  const isAdmin   = ADMIN_PAGES.includes(page);

  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans">
      {/* Public nav */}
      {isPublic && (
        <PublicNav
          currentPage={page}
          onNavigate={navigate}
          loggedIn={Boolean(currentUser)}
          onLogout={handleLogout}
          onOpenAuth={(mode) => openAuth(mode)}
        />
      )}

      {/* Student layout */}
      {isStudent && (
        <div className="flex min-h-screen bg-[#F8FAFC] relative selection:bg-indigo-500 selection:text-white">
          {/* Subtle Ambient Background Aura Glows */}
          <div className="fixed top-0 left-1/3 w-[650px] h-[380px] bg-indigo-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="fixed top-96 right-1/4 w-[500px] h-[340px] bg-orange-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />

          <StudentSidebar currentPage={page} navigate={navigate} onLogout={handleLogout} currentUser={currentUser} />
          <main className="flex-1 min-w-0 bg-transparent pb-16 md:pb-0 font-sans"
            style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.16s ease' }}
          >
            {page === 'dashboard'    && <DashboardPage    navigate={navigate} currentUser={currentUser} />}
            {page === 'profile'      && <ProfilePage      navigate={navigate} currentUser={currentUser} />}
            {page === 'saved'        && <SavedPage        navigate={navigate} />}
            {page === 'applications' && <ApplicationsPage navigate={navigate} />}
            {page === 'notifications'&& <NotificationsPage navigate={navigate} />}
            {page === 'contributors' && <ContributorsPage navigate={navigate} />}
            {page === 'write-review' && <WriteReviewPage  navigate={navigate} />}
          </main>
        </div>
      )}

      {/* Company layout */}
      {isCompany && (
        <div className="flex min-h-screen bg-[#F8FAFC] relative selection:bg-indigo-500 selection:text-white">
          {/* Subtle Ambient Background Aura Glows */}
          <div className="fixed top-0 left-1/3 w-[650px] h-[380px] bg-indigo-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="fixed top-96 right-1/4 w-[500px] h-[340px] bg-orange-500/8 rounded-full blur-[140px] pointer-events-none -z-10" />

          <CompanySidebar currentPage={page} navigate={navigate} onLogout={handleLogout} currentUser={currentUser} />
          <main className="flex-1 min-w-0 bg-transparent pb-16 md:pb-0 font-sans"
            style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.16s ease' }}
          >
            {page === 'co-dashboard'    && <CoDashboardPage    navigate={navigate} />}
            {page === 'co-applicants'   && <CoApplicantsPage   navigate={navigate} internshipId={pageData.internshipId as number | undefined} />}
            {page === 'co-internships'  && <CoInternshipsPage  navigate={navigate} />}
            {page === 'co-profile'      && <CoProfilePage      navigate={navigate} />}
            {page === 'co-verification' && <CoVerificationPage navigate={navigate} />}
          </main>
        </div>
      )}

      {/* Admin layout */}
      {isAdmin && (
        <div className="flex min-h-screen">
          <AdminSidebar currentPage={page} navigate={navigate} onLogout={handleLogout} />
          <main className="flex-1 min-w-0 bg-[#F8FAFC] pb-16 md:pb-0"
            style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.16s ease' }}
          >
            {page === 'admin-dashboard'      && <AdminDashboardPage    navigate={navigate} />}
            {page === 'admin-companies'      && <AdminCompaniesPage    navigate={navigate} />}
            {page === 'admin-verifications'  && <AdminVerificationsPage navigate={navigate} companyId={pageData.companyId as number | string | undefined} />}
            {page === 'admin-reviews'        && <AdminReviewsPage      navigate={navigate} reportId={pageData.reportId as string | undefined} />}
            {page === 'admin-activity'       && <AdminActivityPage     navigate={navigate} />}
          </main>
        </div>
      )}

      {/* Public pages */}
      {isPublic && (
        <div style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(6px)' : 'translateY(0)', transition: 'opacity 0.16s ease, transform 0.16s ease' }}>
          {(page === 'home' || page === 'login' || page === 'register') && (
            <HomePage navigate={navigate} loggedIn={Boolean(currentUser)} />
          )}
          {page === 'internships'       && <InternshipsPage navigate={navigate} initialSearch={(pageData.search as string) || (pageData.category as string) || ''} initialCategory={pageData.category as string} />}
          {page === 'internship-detail' && <InternshipDetailPage navigate={navigate} id={pageData.id as number | string | undefined} backendId={pageData.backendId as string | undefined} internshipData={pageData.internshipData as any} />}
          {page === 'companies'         && <CompaniesPage navigate={navigate} initialSearch={pageData.search as string} />}
          {page === 'company-detail'    && <CompanyDetailPage navigate={navigate} slug={(pageData.slug as string) || ''} backendId={pageData.backendId as string | undefined} />}
          {page === 'reviews'           && <ReviewsPage navigate={navigate} initialCompany={pageData.company as string} />}
          {page === 'about'             && <AboutPage navigate={navigate} />}
        </div>
      )}

      {/* Unified Auth Modal Dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthError('');
        }}
        mode={authMode}
        onModeChange={setAuthMode}
        role={userRole}
        onRoleChange={setUserRole}
        onLoginSubmit={handleLogin}
        onRegisterSubmit={handleRegister}
        onQuickSsoSuccess={(role) => {
          setIsAuthOpen(false);
          navigateForRole(role);
        }}
        error={authError}
        loading={authLoading}
      />
    </div>
  );
}
