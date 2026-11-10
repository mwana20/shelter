import React, { useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { ListPropertyPage } from './pages/ListPropertyPage';
import { SavedHomesPage } from './pages/SavedHomesPage';
import { AreasPage } from './pages/AreasPage';
import { AgentsPage } from './pages/AgentsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { MyShelteredPage } from './pages/MyShelteredPage';
import { SignInPage } from './pages/SignInPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MyPaymentsPage } from './pages/MyPaymentsPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { refreshAuthenticatedSession } from './services/authApi';

// Modals
import { ImageGalleryModal } from './components/ImageGalleryModal';
import { ScheduleViewingModal } from './components/ScheduleViewingModal';
import { ContactAgentModal } from './components/ContactAgentModal';
import { ReportListingModal } from './components/ReportListingModal';
import { ComparisonModal } from './components/ComparisonModal';
import { AuthModal } from './components/AuthModal';
import { FloatingActions } from './components/FloatingActions';

const AppContent: React.FC = () => {
  const { currentPage, isAuthenticated, isAuthReady, currentUser, isAdmin, logout, setCurrentPage } = useApp();
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    const handleExternalNavigation = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;

      const destination = new URL(link.href, window.location.href);
      if (
        (destination.protocol === 'http:' || destination.protocol === 'https:') &&
        destination.origin !== window.location.origin
      ) {
        void logout(true);
      }
    };

    document.addEventListener('click', handleExternalNavigation, true);
    return () => document.removeEventListener('click', handleExternalNavigation, true);
  }, [logout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshTimer = window.setInterval(() => {
      void refreshAuthenticatedSession().catch(() => {
        void logoutRef.current();
      });
    }, 10 * 60 * 1000);

    return () => window.clearInterval(refreshTimer);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || currentPage !== 'sign-in') return;
    setCurrentPage(isAdmin
      ? 'admin'
      : currentUser.role === 'buyer' || currentUser.role === 'tenant'
        ? 'my-sheltered'
        : 'seller-dashboard');
  }, [currentPage, currentUser.role, isAdmin, isAuthReady, isAuthenticated, setCurrentPage]);

  const renderRestoringSession = () => (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
        <span>Restoring your Sheltered session...</span>
      </div>
    </div>
  );

  const accessDenied = (
    <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-bold text-slate-900">Access denied</h1>
      <p className="mt-2 text-sm text-slate-600">Your account does not have permission to view this portal.</p>
      <button
        type="button"
        onClick={() => setCurrentPage('seller-dashboard')}
        className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Return to your portal
      </button>
    </section>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'search':
        return <SearchPage />;
      case 'buy':
        return (
          <SearchPage
            initialListingType="Sale"
            title="Properties for Sale Worldwide"
            subtitle="Explore verified houses, villas, condominiums, and land plots for sale across international markets."
          />
        );
      case 'rent':
        return (
          <SearchPage
            initialListingType="Rent"
            title="Properties for Rent Worldwide"
            subtitle="Explore apartments, serviced condominiums, and luxury short-term rental homes globally."
          />
        );
      case 'commercial':
        return (
          <SearchPage
            title="Commercial Properties & Offices Worldwide"
            subtitle="Explore office buildings, retail shops, business premises, and industrial warehouses."
          />
        );
      case 'land':
        return (
          <SearchPage
            title="Residential & Agricultural Land Worldwide"
            subtitle="Discover verified titled building plots, farmland, and prime investment acreage."
          />
        );
      case 'property-detail':
        return <PropertyDetailPage />;
      case 'list-property':
        return <ListPropertyPage />;
      case 'seller-dashboard':
      case 'my-sheltered':
        if (!isAuthReady) return renderRestoringSession();
        if (!isAuthenticated) return <SignInPage />;
        if (isAdmin) return <AdminDashboardPage />;
        return currentUser.role === 'buyer' || currentUser.role === 'tenant'
          ? <MyShelteredPage />
          : <SellerDashboardPage />;
      case 'sign-in':
        return <SignInPage />;
      case 'create-account':
        return <RegisterPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      case 'reset-password':
        return <ResetPasswordPage />;
      case 'email-verification':
        return <EmailVerificationPage />;
      case 'admin':
      case 'admin-dashboard':
        if (!isAuthReady) return renderRestoringSession();
        if (!isAuthenticated) return <SignInPage />;
        return isAdmin ? <AdminDashboardPage /> : accessDenied;
      case 'my-payments':
        if (!isAuthReady) return renderRestoringSession();
        return isAuthenticated ? <MyPaymentsPage /> : <SignInPage />;
      case 'saved':
        if (!isAuthReady) return renderRestoringSession();
        return isAuthenticated ? <SavedHomesPage /> : <SignInPage />;
      case 'areas':
      case 'explore':
        return <AreasPage />;
      case 'agents':
        return <AgentsPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'terms':
        return <TermsOfServicePage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      default:
        return <HomePage />;
    }
  };

  const isAuthenticationPage = [
    'sign-in',
    'create-account',
    'forgot-password',
    'reset-password',
    'email-verification'
  ].includes(currentPage);
  const isPortalPage = [
    'seller-dashboard',
    'my-sheltered',
    'my-payments',
    'saved',
    'admin',
    'admin-dashboard'
  ].includes(currentPage);
  const showAuthCopyright = isAuthenticationPage || (isPortalPage && isAuthReady && !isAuthenticated);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Navbar />
      <main className="flex-1">{renderCurrentPage()}</main>
      {showAuthCopyright ? (
        <footer className="shrink-0 px-4 py-3 text-center text-[11px] text-slate-500">
          © 2026 Sheltered Global Real Estate Marketplace. All rights reserved.
        </footer>
      ) : !isAuthenticationPage && !isPortalPage ? (
        <Footer />
      ) : null}

      {/* Floating Quick WhatsApp Chat & Back to Top Arrow */}
      <FloatingActions showWhatsApp={!isAuthenticationPage && !isPortalPage} />

      {/* Global Modals */}
      <ImageGalleryModal />
      <ScheduleViewingModal />
      <ContactAgentModal />
      <ReportListingModal />
      <ComparisonModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
