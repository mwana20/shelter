import React, { useState, useEffect } from 'react';
import {
  Globe,
  Coins,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  Heart,
  LayoutDashboard,
  Building,
  Mail,
  User,
  Home,
  CreditCard,
  CalendarDays,
  Check,
  Receipt,
  ShieldCheck,
  Settings,
  House,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_CURRENCY_CODES, CurrencyCode, CURRENCIES } from '../utils/currency';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';

export const Navbar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    properties,
    enquiries,
    viewingRequests,
    savedPropertyIds,
    applyQuickSearch,
    setFilters,
    userLanguage,
    setUserLanguage,
    userCurrency,
    setUserCurrency,
    isAdmin,
    isAuthReady,
    isAuthenticated,
    currentUser,
    logout,
    t
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  // Lock body scroll when mobile drawer is open so the drawer can scroll smoothly to full length
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  // Close drawer and dropdowns whenever currentPage changes (including browser back/forward)
  useEffect(() => {
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);
    setCurrencyDropdownOpen(false);
  }, [currentPage]);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);
    setCurrencyDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (section: string) => {
    if (section === 'buy') {
      applyQuickSearch({ listingType: 'Sale' });
      navigateTo('buy');
    } else if (section === 'rent') {
      applyQuickSearch({ listingType: 'Rent' });
      navigateTo('rent');
    } else if (section === 'commercial') {
      setFilters((prev) => ({
        ...prev,
        propertyType: 'Commercial Property',
        listingType: 'All',
        country: ''
      }));
      navigateTo('search');
    } else if (section === 'land') {
      setFilters((prev) => ({
        ...prev,
        propertyType: 'Residential Land',
        listingType: 'Sale',
        country: ''
      }));
      navigateTo('search');
    } else if (section === 'explore') {
      navigateTo('areas');
    } else {
      navigateTo(section);
    }
  };

  const currentLangConfig =
    SUPPORTED_LANGUAGES.find((l) => l.code === userLanguage) || SUPPORTED_LANGUAGES[0];

  const isHomePage = currentPage === 'home';
  const isDashboardPage = ['seller-dashboard', 'my-sheltered', 'admin', 'admin-dashboard'].includes(currentPage);
  const isDashboardMenu = isAuthenticated && isDashboardPage;
  const isBuyerDashboard = currentUser.role === 'buyer' || currentUser.role === 'tenant';
  const dashboardMenuItems = isAdmin
    ? [
        { label: 'Location Locking & Payment Configuration', tab: 'locking', icon: <ShieldCheck className="h-4 w-4" /> },
        { label: 'Unlock Payments & Verification Queue', tab: 'payments', icon: <CreditCard className="h-4 w-4" /> },
        { label: 'Subscription Management', tab: 'subscriptions', icon: <Receipt className="h-4 w-4" /> },
        { label: `Property Inventory (${properties.length})`, tab: 'inventory', icon: <Home className="h-4 w-4" /> },
        { label: 'Listing Approvals', tab: 'moderation', icon: <Check className="h-4 w-4" /> }
      ]
    : isBuyerDashboard
      ? [
          { label: `Viewing Appointments (${viewingRequests.length})`, tab: 'viewings', icon: <CalendarDays className="h-4 w-4" /> },
          { label: `Enquiries (${enquiries.length})`, tab: 'enquiries', icon: <Mail className="h-4 w-4" /> },
          { label: `Saved Homes (${savedPropertyIds.length})`, tab: 'saved', icon: <Heart className="h-4 w-4" /> },
          { label: 'Account Profile', tab: 'profile', icon: <User className="h-4 w-4" /> }
        ]
      : [
          { label: 'Overview', tab: 'overview', icon: <LayoutDashboard className="h-4 w-4" /> },
          { label: `My Properties (${properties.length})`, tab: 'my-properties', icon: <Building className="h-4 w-4" /> },
          { label: `Enquiries (${enquiries.length})`, tab: 'enquiries', icon: <Mail className="h-4 w-4" /> },
          { label: 'Profile & Location', tab: 'agency-profile', icon: <User className="h-4 w-4" /> },
          { label: 'Verification Request', tab: 'verification-request', icon: <ShieldCheck className="h-4 w-4" /> },
          { label: 'Account Settings', tab: 'settings', icon: <Settings className="h-4 w-4" /> }
        ];
  const [isScrolled, setIsScrolled] = useState(false);

  const selectDashboardSection = (tab: string) => {
    window.dispatchEvent(new CustomEvent('sheltered-dashboard-section', { detail: tab }));
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = isHomePage && !isScrolled;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-md'
      }`}
    >
      {/* Main Navigation Bar */}
      <div className="mx-auto w-full max-w-none px-3 sm:px-4 xl:px-6">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 text-left shrink-0 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/30 text-white flex items-center justify-center font-serif-display font-bold text-lg shadow-sm group-hover:bg-white/25 transition">
              S
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white font-serif-display block leading-none drop-shadow-sm">
                {t('brand_name')}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-300 tracking-wider block mt-0.5 drop-shadow-xs">
                {t('brand_tagline')}
              </span>
            </div>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className={`${isDashboardPage ? 'hidden' : 'hidden lg:flex'} items-center gap-4 xl:gap-5 text-sm font-semibold text-slate-200`}>
            <button
              type="button"
              onClick={() => navigateTo('home')}
              aria-current={isHomePage ? 'page' : undefined}
              className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-xs ${
                isHomePage ? 'text-white font-bold' : ''
              }`}
            >
              <House className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('buy')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-xs ${
                currentPage === 'buy' ? 'text-white font-bold' : ''
              }`}
            >
              {t('nav_buy')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('rent')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-xs ${
                currentPage === 'rent' ? 'text-white font-bold' : ''
              }`}
            >
              {t('nav_rent')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('commercial')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-xs"
            >
              {t('nav_commercial')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('land')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-xs"
            >
              {t('nav_land')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('explore')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-xs"
            >
              {t('nav_explore')}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('subscription')}
              aria-current={currentPage === 'subscription' ? 'page' : undefined}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-xs ${
                currentPage === 'subscription' ? 'text-white font-bold' : ''
              }`}
            >
              Plans
            </button>
          </nav>

          {/* Zone 3: Selectors + Clean Auth Buttons + CTA */}
          <div className="hidden sm:flex items-center gap-2.5 lg:gap-3 shrink-0">
            {/* Language Selector Dropdown */}
            <div className={`relative ${isDashboardPage ? 'hidden' : ''}`}>
              <button
                type="button"
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setCurrencyDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/20 bg-slate-950/40 hover:bg-slate-900/60 backdrop-blur-md text-xs font-semibold text-white transition cursor-pointer"
                title={t('select_language')}
              >
                <Globe className="w-3.5 h-3.5 text-slate-300" />
                <span className="uppercase">{currentLangConfig.code}</span>
                <ChevronDown className="w-3 h-3 text-slate-300" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('select_language')}
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setUserLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{lang.flag}</span>
                        <span className="font-medium">{lang.nativeName}</span>
                      </span>
                      {userLanguage === lang.code && (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector Dropdown */}
            <div className={`relative ${isDashboardPage ? 'hidden' : ''}`}>
              <button
                type="button"
                onClick={() => {
                  setCurrencyDropdownOpen(!currencyDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/20 bg-slate-950/40 hover:bg-slate-900/60 backdrop-blur-md text-xs font-semibold text-white transition cursor-pointer"
                title={t('select_currency')}
              >
                <Coins className="w-3.5 h-3.5 text-slate-300" />
                <span>{userCurrency}</span>
                <ChevronDown className="w-3 h-3 text-slate-300" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('select_currency')}
                  </div>
                  {SUPPORTED_CURRENCY_CODES.map((code) => {
                    const cfg = CURRENCIES[code];
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setUserCurrency(code);
                          setCurrencyDropdownOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-bold w-7 text-slate-900">{cfg.symbol}</span>
                          <span>{cfg.name}</span>
                        </span>
                        {userCurrency === code && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Clean Persistent Authentication Buttons (Sign In & Create Account) */}
            <div className="flex items-center gap-2">
              {isAuthenticated && <button
                type="button"
                onClick={() => navigateTo('saved')}
                className="relative rounded-lg p-2 text-white hover:bg-white/15 transition"
                title="Saved properties"
                aria-label={`Saved properties (${savedPropertyIds.length})`}
              >
                <Heart className="h-4 w-4" />
                {savedPropertyIds.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-rose-500 px-1 text-[9px] leading-4 text-white">
                    {savedPropertyIds.length}
                  </span>
                )}
              </button>}
              {isAuthenticated && <button
                type="button"
                onClick={() => navigateTo('my-payments')}
                className="rounded-lg p-2 text-white hover:bg-white/15 transition"
                title="My Unlock Payments & Transaction History"
                aria-label="My Unlock Payments and Transaction History"
              >
                <Receipt className="h-4 w-4" />
              </button>}
              {isAdmin && <button
                type="button"
                onClick={() => navigateTo('admin')}
                className="rounded-lg p-2 text-white hover:bg-white/15 transition"
                title="Admin Console"
                aria-label="Admin Console"
              >
                <ShieldCheck className="h-4 w-4" />
              </button>}
              {isAuthReady && !isAuthenticated && <>
              <button
                type="button"
                onClick={() => navigateTo('sign-in')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition rounded-lg cursor-pointer"
              >
                {t('nav_sign_in')}
              </button>
              <button
                type="button"
                onClick={() => navigateTo('create-account')}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-lg transition shadow-sm cursor-pointer"
              >
                {t('nav_create_account')}
              </button>
              </>}
              {isAuthenticated && <button
                type="button"
                onClick={() => void logout()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition rounded-lg cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>}
            </div>

            {/* Primary Action Button: List Your Property */}
            <button
              type="button"
              onClick={() => navigateTo(isAuthenticated ? 'list-property' : 'sign-in')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-white" />
              <span>Add Property</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              aria-label="Back to home"
              aria-current={isHomePage ? 'page' : undefined}
              title="Back to home"
              className="p-2 text-white hover:bg-white/15 rounded-lg transition cursor-pointer"
            >
              <House className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/15 rounded-lg transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Right-to-Left Slide-Over Drawer (70% width) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop covering the 30% space, dismisses drawer on click */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container: 70% width, sliding in from right to left, full dynamic viewport height */}
          <div className="fixed inset-y-0 right-0 w-[70%] h-[100dvh] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300 ease-out border-l border-slate-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-serif-display font-bold text-sm shadow-xs">
                  S
                </div>
                <div>
                  <span className="font-extrabold text-sm text-slate-950 font-serif-display block leading-none">
                    {t('brand_name')}
                  </span>
                  <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">
                    {t('brand_tagline')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Navigation Body with smooth touch scrolling and generous bottom padding */}
            <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-4 space-y-4 pb-28">
              {isDashboardMenu ? (
                <nav aria-label="Dashboard navigation" className="flex flex-col space-y-1 text-sm font-semibold text-slate-800">
                  <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Dashboard</p>
                  {dashboardMenuItems.map((item) => (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => selectDashboardSection(item.tab)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-100 transition cursor-pointer"
                    >
                      <span className="text-slate-500">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              ) : (
                <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-800">
                  <button type="button" onClick={() => handleNavClick('buy')} className="px-3 py-2.5 text-left rounded-xl hover:bg-slate-100 transition cursor-pointer">
                    {t('nav_buy')}
                  </button>
                  <button type="button" onClick={() => handleNavClick('rent')} className="px-3 py-2.5 text-left rounded-xl hover:bg-slate-100 transition cursor-pointer">
                    {t('nav_rent')}
                  </button>
                  <button type="button" onClick={() => handleNavClick('commercial')} className="px-3 py-2.5 text-left rounded-xl hover:bg-slate-100 transition cursor-pointer">
                    {t('nav_commercial')}
                  </button>
                  <button type="button" onClick={() => handleNavClick('land')} className="px-3 py-2.5 text-left rounded-xl hover:bg-slate-100 transition cursor-pointer">
                    {t('nav_land')}
                  </button>
                  <button type="button" onClick={() => handleNavClick('explore')} className="px-3 py-2.5 text-left rounded-xl hover:bg-slate-100 transition cursor-pointer">
                    {t('nav_explore')}
                  </button>
                  <button type="button" onClick={() => navigateTo('subscription')} className="px-3 py-2.5 text-left rounded-xl hover:bg-slate-100 transition cursor-pointer">
                    Subscription plans
                  </button>
                </nav>
              )}

              {isDashboardMenu && (
                <div className="space-y-3 border-t border-slate-200 pt-3">
                  <p className="px-3 py-2 text-xs text-slate-600">
                    Signed in as <strong className="uppercase">{currentUser.role}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-center text-xs font-semibold text-white cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}

              {!isDashboardMenu && (
              <div className="pt-3 border-t border-slate-200 space-y-3">
                {/* Mobile Auth Buttons */}
                {isAuthReady && !isAuthenticated && <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => navigateTo('sign-in')}
                    className="w-full py-2.5 text-center text-xs font-semibold border border-slate-300 text-slate-800 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                  >
                    {t('nav_sign_in')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('create-account')}
                    className="w-full py-2.5 text-center text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                  >
                    {t('nav_create_account')}
                  </button>
                </div>}
                {isAuthenticated && <div className="space-y-2">
                  <p className="px-3 py-2 text-xs text-slate-600">Signed in as <strong className="uppercase">{currentUser.role}</strong></p>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="w-full py-2.5 text-center text-xs font-semibold bg-slate-950 text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>}

                {/* Language & Currency Selectors */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                    {t('select_language')} & {t('select_currency')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={userLanguage}
                      onChange={(e) => setUserLanguage(e.target.value)}
                      className="w-full text-xs py-2 px-2 border border-slate-200 rounded-xl bg-white font-medium"
                      aria-label={t('select_language')}
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.flag} {l.nativeName}
                        </option>
                      ))}
                    </select>

                    <select
                      value={userCurrency}
                      onChange={(e) => setUserCurrency(e.target.value as CurrencyCode)}
                      className="w-full text-xs py-2 px-2 border border-slate-200 rounded-xl bg-white font-bold"
                      aria-label={t('select_currency')}
                    >
                      {SUPPORTED_CURRENCY_CODES.map((c) => (
                        <option key={c} value={c}>
                          {c} ({CURRENCIES[c].symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons: Navigation to Payments, Admin, Dashboard */}
                <div className="pt-2 space-y-2">
                  {isAuthenticated && <button
                    type="button"
                    onClick={() => navigateTo('saved')}
                    className="w-full py-2.5 text-center text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition hover:bg-rose-100"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-600" />
                    <span>Saved Properties ({savedPropertyIds.length})</span>
                  </button>}

                  {isAuthenticated && <button
                    type="button"
                    onClick={() => navigateTo('my-payments')}
                    className="w-full py-2.5 text-center text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition hover:bg-emerald-100"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                    <span>My Unlock Payments</span>
                  </button>}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => navigateTo('admin')}
                      className="w-full py-2.5 text-center text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition hover:bg-amber-100"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Admin Console</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigateTo('sign-in')}
                    className="w-full py-2.5 text-center text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer transition"
                  >
                    {t('nav_dashboard')}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('sign-in')}
                    className="w-full py-2.5 text-center text-xs font-semibold bg-slate-950 text-white hover:bg-slate-900 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>Add Property</span>
                  </button>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
