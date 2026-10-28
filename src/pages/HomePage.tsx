import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  Globe,
  ChevronRight,
  LogIn,
  UserPlus,
  Coins
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/PropertyCard';
import { GLOBAL_DESTINATIONS } from '../data/mockProperties';
import { mockAgents } from '../data/mockAgents';
import { ListingType, PropertyType } from '../types';
import { POPULAR_COUNTRIES, COUNTRY_ADMIN_CONFIGS, GLOBAL_LOCATIONS } from '../data/mockLocations';
import { propertyImages } from '../assets/propertyImages';

export const HomePage: React.FC = () => {
  const {
    availableProperties,
    applyQuickSearch,
    setCurrentPage,
    setFilters,
    t,
    userCurrency
  } = useApp();

  // Global Hero Search State
  const [listingType, setListingType] = useState<ListingType>('Sale');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Country dynamic options
  const countryNode = GLOBAL_LOCATIONS.find(
    (n) => n.name.toLowerCase() === selectedCountry.toLowerCase()
  );
  const availableRegions = countryNode?.children || [];
  const adminConfig =
    COUNTRY_ADMIN_CONFIGS[selectedCountry] || COUNTRY_ADMIN_CONFIGS.Uganda;

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyQuickSearch({
      listingType,
      country: selectedCountry === 'All' ? undefined : selectedCountry,
      region: selectedRegion || undefined,
      propertyType: propertyType || undefined,
      minPrice: minPrice ? Number(minPrice.replace(/,/g, '')) : undefined,
      maxPrice: maxPrice ? Number(maxPrice.replace(/,/g, '')) : undefined
    });
  };

  const handlePricePreset = (min?: number, max?: number) => {
    setMinPrice(min !== undefined ? min.toString() : '');
    setMaxPrice(max !== undefined ? max.toString() : '');
  };

  const handleDestinationClick = (country: string, name?: string) => {
    applyQuickSearch({
      country,
      district: name
    });
  };

  const handleCategoryClick = (cat: PropertyType, defaultType: ListingType = 'Sale') => {
    setFilters((prev) => ({
      ...prev,
      propertyType: cat,
      listingType: defaultType,
      country: ''
    }));
    setCurrentPage('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Group properties
  const featuredProperties = availableProperties.filter((p) => p.featured);
  const commercialAndLand = availableProperties.filter(
    (p) =>
      p.propertyType === 'Commercial Property' ||
      p.propertyType === 'Residential Land' ||
      p.propertyType === 'Farm & Agricultural Land' ||
      p.propertyType === 'Industrial Property'
  );

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* 1. HERO SECTION (Extends behind transparent header) */}
      <section className="relative min-h-[640px] lg:min-h-[700px] flex items-center justify-center overflow-hidden bg-slate-950 -mt-[88px] pt-28 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Background Photography with Reduced Darkness for High Visibility */}
        <div className="absolute inset-0 z-0">
          <img
            src={propertyImages.hero}
            alt="Global Real Estate Architecture"
            className="w-full h-full object-cover object-center brightness-95 contrast-105 scale-102 transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/35 to-slate-950/20" />
        </div>

        <div className="relative z-10 max-w-6xl w-full mx-auto text-center space-y-6">
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/25 text-white text-xs font-semibold tracking-wide shadow-md">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('hero_badge')}</span>
          </div>

          {/* Main Headline with Drop Shadow */}
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-serif-display max-w-4xl mx-auto leading-tight drop-shadow-md"
            style={{ textWrap: 'balance' }}
          >
            {t('hero_title')}
          </h1>

          <p className="text-sm sm:text-base text-slate-100 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-xs">
            {t('hero_subtitle')}
          </p>

          {/* Hero Authentication Buttons (Sign In & Create Account calls to action) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 pb-2">
            <button
              type="button"
              onClick={() => {
                setCurrentPage('sign-in');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-semibold transition shadow-sm hover:border-white/50 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-slate-200" />
              <span>{t('nav_sign_in')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentPage('create-account');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold transition shadow-md hover:shadow-lg cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>{t('nav_create_account')}</span>
            </button>
          </div>

          {/* Global Search Panel With Comprehensive Price Filters */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 text-left max-w-5xl mx-auto border border-neutral-100">
            {/* Buy / Rent Switcher */}
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-200 pb-3">
              <button
                type="button"
                onClick={() => setListingType('Sale')}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  listingType === 'Sale'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
              >
                {t('hero_buy_tab')}
              </button>
              <button
                type="button"
                onClick={() => setListingType('Rent')}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  listingType === 'Rent'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
              >
                {t('hero_rent_tab')}
              </button>
            </div>

            {/* Filter Fields Form */}
            <form onSubmit={handleHeroSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 1. Country */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                    {t('country_label')}
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        setSelectedRegion('');
                      }}
                      className="w-full text-xs font-semibold text-neutral-800 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="All">{t('all_countries')}</option>
                      {POPULAR_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. State / Region / District (Cascading) */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                    {selectedCountry !== 'All' ? adminConfig.labels.level1 : t('region_label')}
                  </label>
                  <div className="relative">
                    {availableRegions.length > 0 ? (
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full text-xs font-semibold text-neutral-800 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                      >
                        <option value="">{t('any_region')}</option>
                        {availableRegions.map((r) => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        placeholder={t('region_placeholder')}
                        className="w-full text-xs font-semibold text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    )}
                  </div>
                </div>

                {/* 3. Property Category */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                    {t('category_label')}
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full text-xs font-semibold text-neutral-800 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="">{t('all_categories')}</option>
                    <option value="House">{t('cat_house')}</option>
                    <option value="Apartment">{t('cat_apartment')}</option>
                    <option value="Villa">{t('cat_villa')}</option>
                    <option value="Townhouse">{t('cat_townhouse')}</option>
                    <option value="Residential Land">{t('cat_land')}</option>
                    <option value="Commercial Property">{t('cat_commercial')}</option>
                    <option value="Farm & Agricultural Land">{t('cat_farm')}</option>
                    <option value="Industrial Property">{t('cat_industrial')}</option>
                    <option value="Holiday Home">{t('cat_holiday')}</option>
                  </select>
                </div>

                {/* 4. Min & Max Price Filters */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                    {t('price_filter_title')} ({userCurrency})
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder={t('price_min_placeholder')}
                      className="w-full text-xs font-semibold text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder={t('price_max_placeholder')}
                      className="w-full text-xs font-semibold text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* 5. Search Action Button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition shadow-md hover:shadow-lg cursor-pointer h-[42px]"
                  >
                    <Search className="w-4 h-4" />
                    <span>{t('search_properties_btn')}</span>
                  </button>
                </div>
              </div>

              {/* Quick Price Preset Chips */}
              <div className="flex items-center flex-wrap gap-1.5 pt-1 text-xs">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-neutral-500" />
                  {t('price_quick_ranges')}:
                </span>
                <button
                  type="button"
                  onClick={() => handlePricePreset()}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer border ${
                    !minPrice && !maxPrice
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                  }`}
                >
                  {t('price_any')}
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset(0, 100000)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer border ${
                    minPrice === '0' && maxPrice === '100000'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                  }`}
                >
                  {t('price_under_100k')}
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset(100000, 500000)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer border ${
                    minPrice === '100000' && maxPrice === '500000'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                  }`}
                >
                  {t('price_100k_500k')}
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset(500000, 1000000)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer border ${
                    minPrice === '500000' && maxPrice === '1000000'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                  }`}
                >
                  {t('price_500k_1m')}
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset(1000000, undefined)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer border ${
                    minPrice === '1000000' && !maxPrice
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                  }`}
                >
                  {t('price_above_1m')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE THE WORLD DESTINATIONS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
              {t('destinations_tag')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight font-serif-display mt-1">
              {t('destinations_title')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              {t('destinations_subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCurrentPage('areas');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:text-emerald-700 transition cursor-pointer"
          >
            <span>{t('view_all_destinations')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GLOBAL_DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              onClick={() => handleDestinationClick(dest.country, dest.name)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-neutral-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col hover:-translate-y-1"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-neutral-900">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
                    {dest.country}
                  </span>
                  <h3 className="text-base font-bold font-serif-display">
                    {dest.name}
                  </h3>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 text-slate-900 text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {dest.listingCount} {t('available_units')}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {dest.description}
                </p>
                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 text-[11px]">
                    {t('popular_label')}: {dest.popularTypes.slice(0, 2).join(' · ')}
                  </span>
                  <span className="font-semibold text-neutral-900 group-hover:text-emerald-700 flex items-center gap-1">
                    {t('explore_action')} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED GLOBAL PROPERTIES */}
      <section className="py-16 bg-neutral-100 border-y border-neutral-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
                {t('featured_tag')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight font-serif-display mt-1">
                {t('featured_title')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {t('featured_subtitle')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFilters((prev) => ({ ...prev, listingType: 'All', country: '' }));
                setCurrentPage('search');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:text-emerald-700 transition cursor-pointer"
            >
              <span>{t('explore_all_listings')} ({availableProperties.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. COMMERCIAL & LAND INVESTMENT SHOWCASE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase">
              {t('commercial_tag')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight font-serif-display mt-1">
              {t('commercial_title')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              {t('commercial_subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleCategoryClick('Commercial Property')}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:text-indigo-700 transition cursor-pointer"
          >
            <span>{t('view_all_commercial')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commercialAndLand.slice(0, 3).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* 5. VERIFIED AGENTS & BROKERS DIRECTORY */}
      <section className="py-16 bg-white border-y border-neutral-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
                {t('brokers_tag')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight font-serif-display mt-1">
                {t('brokers_title')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {t('brokers_subtitle')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCurrentPage('agents');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:text-emerald-700 transition cursor-pointer"
            >
              <span>{t('view_all_brokers')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAgents.slice(0, 3).map((agent) => (
              <div
                key={agent.id}
                className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50 hover:bg-white hover:shadow-md transition space-y-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-14 h-14 rounded-full object-cover border border-neutral-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-neutral-900">{agent.name}</h4>
                      {agent.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-xs text-neutral-600 font-medium">{agent.company}</div>
                    <div className="text-[11px] text-neutral-400">
                      {agent.city}, {agent.country} · {agent.experienceYears} {t('years_experience')}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {agent.bio}
                </p>

                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-neutral-500">
                    {agent.activeListingsCount} {t('active_listings_count')}
                  </span>
                  <a
                    href={`tel:${agent.phone}`}
                    className="text-slate-900 hover:text-emerald-700 font-bold"
                  >
                    {t('contact_broker_btn')}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW SHELTERED WORKS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
            {t('how_works_tag')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight font-serif-display">
            {t('how_works_title')}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            {t('how_works_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-900">
              01
            </div>
            <h3 className="text-base font-bold text-neutral-900">{t('step1_title')}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {t('step1_desc')}
            </p>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-900">
              02
            </div>
            <h3 className="text-base font-bold text-neutral-900">{t('step2_title')}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {t('step2_desc')}
            </p>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-900">
              03
            </div>
            <h3 className="text-base font-bold text-neutral-900">{t('step3_title')}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {t('step3_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 7. LIST YOUR PROPERTY CTA BANNER */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-slate-950 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {t('cta_banner_tag')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif-display leading-tight">
              {t('cta_banner_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('cta_banner_desc')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setCurrentPage('sign-in');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-950 font-bold rounded-xl text-xs hover:bg-slate-100 transition shadow-md cursor-pointer"
            >
              {t('list_property_btn')}
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentPage('sign-in');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 border border-slate-700 text-white font-semibold rounded-xl text-xs hover:bg-slate-900 transition cursor-pointer"
            >
              {t('seller_dashboard_btn')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
