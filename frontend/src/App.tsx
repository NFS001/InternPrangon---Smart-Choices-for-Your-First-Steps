import React, { useState, useEffect } from 'react';
import type { Navigate } from './data/index';

import PublicNav from './components/public/PublicNav';
import StudentSidebar from './components/student/StudentSidebar';
import CompanySidebar from './components/company/CompanySidebar';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import InternshipsPage from './pages/InternshipsPage';
import InternshipDetailPage from './pages/InternshipDetailPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import ReviewsPage from './pages/ReviewsPage';
import AboutPage from './pages/AboutPage';

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

const PUBLIC_PAGES  = ['home', 'internships', 'internship-detail', 'companies', 'company-detail', 'reviews', 'about'];
const AUTH_PAGES    = ['login', 'register'];
const STUDENT_PAGES = ['dashboard', 'profile', 'saved', 'applications', 'notifications', 'contributors', 'write-review'];
const COMPANY_PAGES = ['co-dashboard', 'co-applicants', 'co-internships', 'co-profile', 'co-verification'];
const ADMIN_PAGES   = ['admin-dashboard', 'admin-companies', 'admin-verifications', 'admin-reviews', 'admin-activity'];

export default function App() {
  const [page, setPage] = useState('home');
  const [pageData, setPageData] = useState<Record<string, unknown>>({});
  const [transitioning, setTransitioning] = useState(false);
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(() => getSavedUser());
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const navigate: Navigate = (newPage, data = {}) => {
    if (newPage === page && JSON.stringify(data) === JSON.stringify(pageData)) return;
    setTransitioning(true);
    setTimeout(() => {
      setPage(newPage);
      setPageData(data);
      setTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 160);
  };

  async function handleLogin(email: string, password: string) {
    setAuthError('');
    setAuthLoading(true);
    try {
      const auth = await login(email, password);
      saveAuth(auth);
      setCurrentUser(auth.user);
      navigateForRole(auth.user.role);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegister(
    name: string,
    email: string,
    password: string,
    role: 'student' | 'company',
    extra?: { industry?: string; university?: string; year?: string }
  ) {
    setAuthError('');
    setAuthLoading(true);
    try {
      const auth = await register(name, email, password, role, extra);
      saveAuth(auth);
      setCurrentUser(auth.user);
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
  const isAuth    = AUTH_PAGES.includes(page);
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
        />
      )}

      {/* Auth pages — minimal wrapper */}
      {isAuth && (
        <div
          style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.16s ease' }}
        >
          {page === 'login'    && <LoginPage navigate={navigate} onLogin={navigateForRole} onSubmit={handleLogin} error={authError} loading={authLoading} />}
          {page === 'register' && <RegisterPage navigate={navigate} onLogin={navigateForRole} onSubmit={handleRegister} error={authError} loading={authLoading} as={(pageData.as as 'student' | 'company') ?? 'student'} />}
        </div>
      )}

      {/* Student layout */}
      {isStudent && (
        <div className="flex min-h-screen">
          <StudentSidebar currentPage={page} navigate={navigate} onLogout={handleLogout} currentUser={currentUser} />
          <main className="flex-1 min-w-0 bg-[#fafaf9] pb-16 md:pb-0"
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
        <div className="flex min-h-screen">
          <CompanySidebar currentPage={page} navigate={navigate} onLogout={handleLogout} currentUser={currentUser} />
          <main className="flex-1 min-w-0 bg-[#fafaf9] pb-16 md:pb-0"
            style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.16s ease' }}
          >
            {page === 'co-dashboard'    && <CoDashboardPage    navigate={navigate} />}
            {page === 'co-applicants'   && <CoApplicantsPage   navigate={navigate} internshipId={pageData.internshipId ? String(pageData.internshipId) : undefined} />}
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
          <main className="flex-1 min-w-0 bg-neutral-50 pb-16 md:pb-0"
            style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.16s ease' }}
          >
            {page === 'admin-dashboard'      && <AdminDashboardPage    navigate={navigate} />}
            {page === 'admin-companies'      && <AdminCompaniesPage    navigate={navigate} />}
            {page === 'admin-verifications'  && <AdminVerificationsPage navigate={navigate} companyId={pageData.companyId as number | undefined} />}
            {page === 'admin-reviews'        && <AdminReviewsPage      navigate={navigate} />}
            {page === 'admin-activity'       && <AdminActivityPage     navigate={navigate} />}
          </main>
        </div>
      )}

      {/* Public pages */}
      {isPublic && (
        <div style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(6px)' : 'translateY(0)', transition: 'opacity 0.16s ease, transform 0.16s ease' }}>
          {page === 'home'              && <HomePage navigate={navigate} />}
          {page === 'internships'       && <InternshipsPage navigate={navigate} />}
          {page === 'internship-detail' && <InternshipDetailPage navigate={navigate} id={Number(pageData.id ?? 1)} backendId={pageData.backendId as string | undefined} />}
          {page === 'companies'         && <CompaniesPage navigate={navigate} />}
          {page === 'company-detail'    && <CompanyDetailPage navigate={navigate} id={Number(pageData.id ?? 1)} backendId={pageData.backendId as string | undefined} companyName={pageData.companyName as string | undefined} />}
          {page === 'reviews'           && <ReviewsPage navigate={navigate} />}
          {page === 'about'             && <AboutPage />}
        </div>
      )}
    </div>
  );
}
