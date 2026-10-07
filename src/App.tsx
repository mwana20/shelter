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

// Modals
import { ImageGalleryModal } from './components/ImageGalleryModal';
import { ScheduleViewingModal } from './components/ScheduleViewingModal';
import { ContactAgentModal } from './components/ContactAgentModal';
import { ReportListingModal } from './components/ReportListingModal';
import { ComparisonModal } from './components/ComparisonModal';
import { AuthModal } from './components/AuthModal';

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
            title="Homes for Sale in Mukono"
            subtitle="Explore verified houses, villas, and bungalows for sale across Mukono District."
          />
        );
      case 'rent':
        return (
          <SearchPage
            initialListingType="Rent"
            title="Find a Home to Rent in Mukono"
            subtitle="Explore apartments and rental houses across Seeta, Sonde, and Mukono town."
          />
        );
      case 'new-listings':
        return (
          <SearchPage
            title="New Homes in Mukono"
            subtitle="Recently listed houses and properties in Mukono added within the last 7 days."
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
        return <AdminDashboardPage />;
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
