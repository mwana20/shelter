import React from 'react';
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
import { SignInPage } from './pages/SignInPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';

// Modals
import { ImageGalleryModal } from './components/ImageGalleryModal';
import { ScheduleViewingModal } from './components/ScheduleViewingModal';
import { ContactAgentModal } from './components/ContactAgentModal';
import { ReportListingModal } from './components/ReportListingModal';
import { ComparisonModal } from './components/ComparisonModal';
import { AuthModal } from './components/AuthModal';
import { FloatingActions } from './components/FloatingActions';

const AppContent: React.FC = () => {
  const { currentPage } = useApp();

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
        return <SellerDashboardPage />;
      case 'sign-in':
        return <SignInPage />;
      case 'create-account':
        return <RegisterPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      case 'email-verification':
        return <EmailVerificationPage />;
      case 'saved':
        return <SavedHomesPage />;
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

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Navbar />
      <main className="flex-1">{renderCurrentPage()}</main>
      <Footer />

      {/* Floating Quick WhatsApp Chat & Back to Top Arrow */}
      <FloatingActions />

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
