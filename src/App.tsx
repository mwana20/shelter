import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { ListPropertyPage } from './pages/ListPropertyPage';
import { SavedHomesPage } from './pages/SavedHomesPage';
import { MyShelteredPage } from './pages/MyShelteredPage';
import { AreasPage } from './pages/AreasPage';
import { AgentsPage } from './pages/AgentsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PolicyPage } from './pages/PolicyPage';

// Modals
import { ImageGalleryModal } from './components/ImageGalleryModal';
import { ScheduleViewingModal } from './components/ScheduleViewingModal';
import { ContactAgentModal } from './components/ContactAgentModal';
import { ReportListingModal } from './components/ReportListingModal';
import { ComparisonModal } from './components/ComparisonModal';
import { AuthModal } from './components/AuthModal';

const AppContent: React.FC = () => {
  const { currentPage, isAdmin, setCurrentPage } = useApp();

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
            subtitle="Explore verified houses, villas, land, and investment properties across Uganda and other countries."
          />
        );
      case 'rent':
        return (
          <SearchPage
            initialListingType="Rent"
            title="Find a Home to Rent"
            subtitle="Browse apartments, houses, and rentals in major cities and neighborhoods around the world."
          />
        );
      case 'new-listings':
        return (
          <SearchPage
            title="New Listings"
            subtitle="Recently published homes and properties from supported global markets."
          />
        );
      case 'property-detail':
        return <PropertyDetailPage />;
      case 'list-property':
        return <ListPropertyPage />;
      case 'saved':
        return <SavedHomesPage />;
      case 'my-sheltered':
        return <MyShelteredPage />;
      case 'areas':
        return <AreasPage />;
      case 'agents':
        return <AgentsPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'admin':
        return isAdmin ? <AdminDashboardPage /> : (
          <section className="min-h-[55vh] grid place-items-center px-6 text-center">
            <div className="max-w-lg space-y-3">
              <h1 className="text-2xl font-bold text-neutral-900">Administrator access required</h1>
              <p className="text-sm text-neutral-600">This preview does not provide an administrator session. Sign in through a configured authentication service to continue.</p>
              <button onClick={() => setCurrentPage('home')} className="text-sm font-semibold text-emerald-800 underline">Return to marketplace</button>
            </div>
          </section>
        );
      case 'privacy':
      case 'terms':
      case 'marketplace-policy':
        return <PolicyPage kind={currentPage} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Navbar />
      <main className="flex-1">{renderCurrentPage()}</main>
      <Footer />

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
