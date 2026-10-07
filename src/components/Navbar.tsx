import React, { useState } from 'react';
import {
  Home,
  Heart,
  Scale,
  Menu,
  X,
  PlusCircle,
  User,
  Shield,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    savedPropertyIds,
    comparedPropertyIds,
    setCompareModalOpen,
    currentUser,
    setAuthModalOpen,
    isAdmin,
    setIsAdmin,
    applyQuickSearch,
    setFilters
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (section: string) => {
    if (section === 'buy') {
      applyQuickSearch({ listingType: 'Sale' });
      navigateTo('buy');
    } else if (section === 'rent') {
      applyQuickSearch({ listingType: 'Rent' });
      navigateTo('rent');
    } else if (section === 'houses') {
      setFilters((prev) => ({ ...prev, propertyType: 'House' }));
      navigateTo('search');
    } else if (section === 'apartments') {
      setFilters((prev) => ({ ...prev, propertyType: 'Apartment' }));
      navigateTo('search');
    } else if (section === 'land') {
      setFilters((prev) => ({ ...prev, propertyType: 'Land' }));
      navigateTo('search');
    } else if (section === 'new') {
      navigateTo('new-listings');
    } else {
      navigateTo(section);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-xs">
      {/* Top micro-bar for localization announcement */}
      <div className="bg-slate-900 text-slate-200 text-[11px] py-1 px-4 sm:px-8 flex justify-between items-center tracking-wide font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          <span>Uganda Christian University corridor & Mukono District Verified Registry</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <span>Mukono, Uganda (EAT)</span>
          <span className="hidden sm:inline">|</span>
          <button
            onClick={() => {
              setIsAdmin(!isAdmin);
              if (!isAdmin) navigateTo('admin');
            }}
            className={`hidden sm:flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[10px] transition ${
              isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3" />
            {isAdmin ? 'Admin View: Active' : 'Switch to Admin Portal'}
          </button>
        </div>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-900 transition-colors">
              <Home className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-neutral-900 font-serif-display uppercase">
                SHELTERED
              </span>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-500 -mt-1">
                Mukono · Uganda
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-neutral-600">
            <button
              onClick={() => handleNavClick('buy')}
              className={`px-3 py-1.5 rounded-lg transition hover:text-neutral-900 hover:bg-neutral-100 ${
                currentPage === 'buy' ? 'text-neutral-950 font-bold bg-neutral-100' : ''
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => handleNavClick('rent')}
              className={`px-3 py-1.5 rounded-lg transition hover:text-neutral-900 hover:bg-neutral-100 ${
                currentPage === 'rent' ? 'text-neutral-950 font-bold bg-neutral-100' : ''
              }`}
            >
              Rent
            </button>
            <button
              onClick={() => handleNavClick('houses')}
              className="px-3 py-1.5 rounded-lg transition hover:text-neutral-900 hover:bg-neutral-100"
            >
              Houses
            </button>
            <button
              onClick={() => handleNavClick('apartments')}
              className="px-3 py-1.5 rounded-lg transition hover:text-neutral-900 hover:bg-neutral-100"
            >
              Apartments
            </button>
            <button
              onClick={() => handleNavClick('land')}
              className="px-3 py-1.5 rounded-lg transition hover:text-neutral-900 hover:bg-neutral-100"
            >
              Land
            </button>
            <button
              onClick={() => handleNavClick('new')}
              className={`px-3 py-1.5 rounded-lg transition hover:text-neutral-900 hover:bg-neutral-100 flex items-center gap-1.5 ${
                currentPage === 'new-listings' ? 'text-neutral-950 font-bold bg-neutral-100' : ''
              }`}
            >
              New Listings
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </button>
            <button
              onClick={() => navigateTo('areas')}
              className={`px-3 py-1.5 rounded-lg transition hover:text-neutral-900 hover:bg-neutral-100 ${
                currentPage === 'areas' ? 'text-neutral-950 font-bold bg-neutral-100' : ''
              }`}
            >
              Explore Mukono
            </button>
            <button
              onClick={() => navigateTo('agents')}
              className={`px-3 py-1.5 rounded-lg transition hover:text-neutral-900 hover:bg-neutral-100 ${
                currentPage === 'agents' ? 'text-neutral-950 font-bold bg-neutral-100' : ''
              }`}
            >
              Agents
            </button>
            <button
              onClick={() => navigateTo('about')}
              className={`px-3 py-1.5 rounded-lg transition hover:text-neutral-900 hover:bg-neutral-100 ${
                currentPage === 'about' ? 'text-neutral-950 font-bold bg-neutral-100' : ''
              }`}
            >
              About
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className={`px-3 py-1.5 rounded-lg transition hover:text-neutral-900 hover:bg-neutral-100 ${
                currentPage === 'contact' ? 'text-neutral-950 font-bold bg-neutral-100' : ''
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden md:flex items-center gap-3">
            {/* Compare Button */}
            {comparedPropertyIds.length > 0 && (
              <button
                type="button"
                onClick={() => setCompareModalOpen(true)}
                className="relative p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition"
                title="Compare Properties"
              >
                <Scale className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {comparedPropertyIds.length}
                </span>
              </button>
            )}

            {/* Saved Properties */}
            <button
              type="button"
              onClick={() => navigateTo('saved')}
              className="relative p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Saved Properties"
            >
              <Heart className="w-4 h-4 text-rose-600 fill-rose-50" />
              <span>Saved</span>
              {savedPropertyIds.length > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5">
                  {savedPropertyIds.length}
                </span>
              )}
            </button>

            {/* User Profile / Sign In */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition text-xs font-semibold text-neutral-800"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="truncate max-w-[90px]">{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-xs font-bold text-neutral-900">{currentUser.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigateTo('my-sheltered');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition flex items-center justify-between"
                  >
                    <span>My Sheltered Dashboard</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Active</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigateTo('saved');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition"
                  >
                    Saved Homes ({savedPropertyIds.length})
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigateTo('admin');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    Admin Control Center
                  </button>
                  <div className="border-t border-neutral-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setAuthModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-50 transition"
                    >
                      Switch User / Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* List a Property Button */}
            <button
              type="button"
              onClick={() => navigateTo('list-property')}
              className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center gap-2 hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>List a Property</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => navigateTo('saved')}
              className="p-2 text-neutral-700 relative"
            >
              <Heart className="w-5 h-5 text-rose-600 fill-rose-50" />
              {savedPropertyIds.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {savedPropertyIds.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-neutral-100">
            <button
              onClick={() => handleNavClick('buy')}
              className="py-2.5 px-3 bg-neutral-100 rounded-xl text-center text-xs font-bold text-neutral-900"
            >
              Buy Homes
            </button>
            <button
              onClick={() => handleNavClick('rent')}
              className="py-2.5 px-3 bg-neutral-100 rounded-xl text-center text-xs font-bold text-neutral-900"
            >
              Rent Homes
            </button>
          </div>

          <div className="space-y-1 py-1 text-sm font-medium text-neutral-700">
            <button
              onClick={() => handleNavClick('houses')}
              className="w-full text-left py-2 px-2 hover:bg-neutral-50 rounded-lg"
            >
              Houses for Sale & Rent
            </button>
            <button
              onClick={() => handleNavClick('apartments')}
              className="w-full text-left py-2 px-2 hover:bg-neutral-50 rounded-lg"
            >
              Apartments in Mukono
            </button>
            <button
              onClick={() => handleNavClick('land')}
              className="w-full text-left py-2 px-2 hover:bg-neutral-50 rounded-lg"
            >
              Plots & Land with Title
            </button>
            <button
              onClick={() => handleNavClick('new')}
              className="w-full text-left py-2 px-2 hover:bg-neutral-50 rounded-lg flex items-center justify-between"
            >
              <span>New Listings</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">NEW</span>
            </button>
            <button
              onClick={() => navigateTo('areas')}
              className="w-full text-left py-2 px-2 hover:bg-neutral-50 rounded-lg"
            >
              Explore Mukono Areas
            </button>
            <button
              onClick={() => navigateTo('agents')}
              className="w-full text-left py-2 px-2 hover:bg-neutral-50 rounded-lg"
            >
              Property Agents & Brokers
            </button>
            <button
              onClick={() => navigateTo('my-sheltered')}
              className="w-full text-left py-2 px-2 hover:bg-neutral-50 rounded-lg"
            >
              My Sheltered Dashboard
            </button>
            <button
              onClick={() => navigateTo('admin')}
              className="w-full text-left py-2 px-2 hover:bg-neutral-50 rounded-lg text-amber-700 font-semibold flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </button>
            <button
              onClick={() => navigateTo('about')}
              className="w-full text-left py-2 px-2 hover:bg-neutral-50 rounded-lg"
            >
              About Sheltered Mukono
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className="w-full text-left py-2 px-2 hover:bg-neutral-50 rounded-lg"
            >
              Contact Support
            </button>
          </div>

          <div className="pt-3 border-t border-neutral-100 space-y-2">
            <button
              type="button"
              onClick={() => navigateTo('list-property')}
              className="w-full bg-slate-950 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>List Your Property</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalOpen(true);
              }}
              className="w-full border border-neutral-300 text-neutral-800 text-xs font-semibold py-2.5 rounded-xl text-center"
            >
              Account / Sign In ({currentUser.name})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
