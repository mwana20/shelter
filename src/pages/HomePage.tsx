import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Home,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Key,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/PropertyCard';
import { mockAreas } from '../data/mockAreas';
import { GLOBAL_COUNTRIES } from '../data/globalLocations';
import { ListingType } from '../types';
import { useTranslation } from '../i18n/translations';

export const HomePage: React.FC = () => {
  const t = useTranslation();
  const {
    availableProperties,
    applyQuickSearch,
    setCurrentPage,
    setSelectedAreaFilter,
    setFilters
  } = useApp();

  // Hero Search Local State
  const [listingType, setListingType] = useState<ListingType>('Sale');
  const [country, setCountry] = useState<string>('');
  const [area, setArea] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('Any');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyQuickSearch({
      listingType,
      country: country || undefined,
      area: area || undefined,
      propertyType: propertyType || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      bedrooms: bedrooms === 'Any' ? 'Any' : Number(bedrooms)
    });
  };

  const spreadByMarket = (list: typeof availableProperties, limit: number) => {
    const candidates = list.filter((property) => property.featured);
    const selected = candidates.filter((property) => property.country === 'Uganda').slice(0, 2);
    const represented = new Set(selected.map((property) => property.country ?? 'Uganda'));
    for (const property of candidates.filter((candidate) => candidate.country !== 'Uganda')) {
      if (selected.length >= limit) break;
      const countryName = property.country ?? 'Uganda';
      if (!represented.has(countryName)) {
        selected.push(property);
        represented.add(countryName);
      }
    }
    for (const property of candidates) {
      if (selected.length >= limit) break;
      if (!selected.some((candidate) => candidate.id === property.id)) selected.push(property);
    }
    return selected;
  };
  const featuredHomes = spreadByMarket(availableProperties, 6);
  const newHomes = spreadByMarket(availableProperties.filter((p) => p.isNew), 3);
  const forSaleHomes = spreadByMarket(availableProperties.filter((p) => p.listingType === 'Sale'), 3);
  const forRentHomes = spreadByMarket(availableProperties.filter((p) => p.listingType === 'Rent'), 3);
  const representedCountries = new Set(availableProperties.map((property) => property.country ?? 'Uganda')).size;
  const representedLocations = new Set(
    availableProperties.map((property) => `${property.country ?? 'Uganda'}:${property.area}`)
  ).size;
  const heroAreas = mockAreas.filter((location) => !country || location.country === country);
  const featuredLocationGuides = [
    ...mockAreas.filter((location) => location.country === 'Uganda').slice(0, 2),
    ...mockAreas.filter((location) => location.country !== 'Uganda').slice(0, 2),
    ...mockAreas.filter((location) => location.country === 'Uganda').slice(2),
    ...mockAreas.filter((location) => location.country !== 'Uganda').slice(2)
  ];
  const countryOptions = Array.from(new Set([
    ...GLOBAL_COUNTRIES,
    ...availableProperties.map((property) => property.country ?? 'Uganda')
  ])).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[640px] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950">
        {/* Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
            alt={t('Contemporary home in the marketplace preview')}
            className="w-full h-full object-cover opacity-100 filter brightness-100 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/0 to-white/0" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>{t('Global property marketplace · from Uganda to worldwide markets')}</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-serif-display max-w-3xl mx-auto leading-tight">
              {t('Find Your Place in the World')}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              {t('Discover places to buy, sell, rent, or invest across Uganda and countries around the world. Supported markets expand as administrators activate new locations.')}
            </p>
          </div>

          {/* Large Hero Property Search Component */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 text-left border border-white/20 max-w-4xl mx-auto mt-6">
            {/* "I want to" Tab Toggle */}
            <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-neutral-100 pb-3">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mr-2 hidden sm:inline">
                {t('I want to:')}
              </span>
              <button
                type="button"
                onClick={() => setListingType('Sale')}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ${
                  listingType === 'Sale'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                {t('Buy Land')}
              </button>
              <button
                type="button"
                onClick={() => setListingType('Sale')}
                className="px-4 py-2 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 bg-neutral-100 text-neutral-600 hover:text-neutral-900"
              >
                <Home className="w-3.5 h-3.5" />
                {t('Sell Land')}
              </button>
              <button
                type="button"
                onClick={() => setListingType('Sale')}
                className="px-4 py-2 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 bg-neutral-100 text-neutral-600 hover:text-neutral-900"
              >
                <Home className="w-3.5 h-3.5" />
                {t('Buy a House')}
              </button>
              <button
                type="button"
                onClick={() => setListingType('Rent')}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ${
                  listingType === 'Rent'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                {t('Rent a House')}
              </button>
            </div>

            {/* Filter Inputs Grid */}
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('Country')}</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setArea('');
                    }}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="">{t('Any Country')}</option>
                    {countryOptions.map((countryName) => (
                      <option key={countryName} value={countryName}>{countryName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('Location')}</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="">{t('All Locations')}</option>
                    {heroAreas.map((location) => (
                      <option key={`${location.country}:${location.id}`} value={location.id}>
                        {location.name} · {location.country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('Property Type')}</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="">{t('Any Type')}</option>
                  <option value="House">{t('House')}</option>
                  <option value="Apartment">{t('Apartment')}</option>
                  <option value="Villa">{t('Villa')}</option>
                  <option value="Townhouse">{t('Townhouse')}</option>
                  <option value="Bungalow">{t('Bungalow')}</option>
                  <option value="Land">{t('Land / Plot')}</option>
                  <option value="Commercial Property">{t('Commercial Property')}</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {listingType === 'Sale' ? t('Max Price (UGX)') : t('Max Monthly Rent (UGX)')}
                </label>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="">{t('No Maximum')}</option>
                  {listingType === 'Sale' ? (
                    <>
                      <option value="150000000">Up to UGX 150 Million</option>
                      <option value="300000000">Up to UGX 300 Million</option>
                      <option value="500000000">Up to UGX 500 Million</option>
                      <option value="800000000">Up to UGX 800 Million</option>
                      <option value="1200000000">Up to UGX 1.2 Billion</option>
                    </>
                  ) : (
                    <>
                      <option value="600000">Up to UGX 600,000 / mo</option>
                      <option value="1000000">Up to UGX 1,000,000 / mo</option>
                      <option value="1500000">Up to UGX 1,500,000 / mo</option>
                      <option value="2500000">Up to UGX 2,500,000 / mo</option>
                    </>
                  )}
                </select>
              </div>

              {/* Bedrooms & Search Button */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('Bedrooms')}</label>
                <div className="flex gap-2">
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-24 text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-2 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Any">{t('Any')}</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>

                  <button
                    type="submit"
                    className="flex-1 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 hover:shadow-lg"
                  >
                    <Search className="w-4 h-4 text-emerald-400" />
                    <span>{t('Search')}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 text-white text-left">
            <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-800">
              <p className="text-xl font-extrabold text-emerald-400">{availableProperties.length}+</p>
                <p className="text-[11px] text-slate-400 font-medium">{t('Preview listings')}</p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-800">
              <p className="text-xl font-extrabold text-white">{representedLocations} Locations</p>
              <p className="text-[11px] text-slate-400 font-medium">{representedCountries} {t('countries represented')}</p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-800">
              <p className="text-xl font-extrabold text-white">100%</p>
                <p className="text-[11px] text-slate-400 font-medium">{t('Do your own title checks')}</p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-800">
              <p className="text-xl font-extrabold text-emerald-400">0%</p>
                <p className="text-[11px] text-slate-400 font-medium">{t('Never pay before verification')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED HOMES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>{t('Handpicked Residences')}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 font-serif-display">
              {t('Featured Homes')}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {t('Featured sample listings from Uganda and other supported markets.')}
            </p>
          </div>
          <button
            onClick={() => {
              setFilters((prev) => ({ ...prev, listingType: 'All' }));
              setCurrentPage('search');
            }}
            className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 transition"
          >
            <span>{t('View all')} {availableProperties.length} {t('properties')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredHomes.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* 3. NEW LISTINGS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-neutral-100/70 py-12 rounded-3xl border border-neutral-200/60">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 px-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{t('Recently Added to Market')}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 font-serif-display">
              {t('New Listings')}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {t('Freshly listed properties added in the past 7 days. Be the first to schedule an inspection.')}
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('new-listings')}
            className="text-xs font-bold text-slate-900 hover:text-amber-700 flex items-center gap-1 transition"
          >
            <span>{t('Browse all new homes')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
          {newHomes.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* 4. HOMES FOR SALE SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-serif-display">
              {t('Properties for Sale')}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {t('Browse homes, land, and other properties for sale across supported markets.')}
            </p>
          </div>
          <button
            onClick={() => {
              applyQuickSearch({ listingType: 'Sale' });
              setCurrentPage('buy');
            }}
            className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 transition"
          >
            <span>{t('Explore all homes for sale')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forSaleHomes.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* 5. HOMES FOR RENT SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-serif-display">
              {t('Homes for Rent')}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {t('Move into secure gated compounds, serviced apartments, and standalone bungalows.')}
            </p>
          </div>
          <button
            onClick={() => {
              applyQuickSearch({ listingType: 'Rent' });
              setCurrentPage('rent');
            }}
            className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 transition"
          >
            <span>{t('Explore all rentals')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forRentHomes.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* 6. FEATURED LOCATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {t('Featured Locations')}
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 font-serif-display">
            {t('Explore Uganda and the World')}
          </h2>
          <p className="text-sm text-neutral-500">
            {t('Browse sample locations across Uganda and selected international markets. Availability varies by location.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredLocationGuides.map((areaItem) => {
            const count = availableProperties.filter(
              (p) => p.area === areaItem.id && (p.country ?? 'Uganda') === areaItem.country
            ).length;
            return (
              <div
                key={`${areaItem.country}:${areaItem.id}`}
                onClick={() => {
                  setSelectedAreaFilter(areaItem.id);
                  applyQuickSearch({ country: areaItem.country, area: areaItem.id });
                }}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-neutral-200/90 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={areaItem.image}
                    alt={areaItem.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base">{areaItem.name}</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wide">{areaItem.country}</span>
                    <p className="text-[11px] text-slate-300 line-clamp-1">{areaItem.tagline}</p>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>{t('Available Listings:')}</span>
                      <strong className="text-neutral-900">{count} {t(count === 1 ? 'sample listing' : 'sample listings')}</strong>
                    </div>
                    <p className="text-[11px] text-neutral-500">{areaItem.region}</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-800 group-hover:text-emerald-700 transition-colors">
                    <span>{t('Explore Homes')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. WHY SHELTERED & BUYER PROTECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {t('The Sheltered Standard')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-display">
              {t('Why Buyers & Tenants Choose Sheltered')}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('Property checks differ by country. Sheltered helps people discover sample listings across supported markets, with local availability and verification depending on each location.')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm">{t('Title Deed Verification')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t("Always confirm ownership with the official land registry and qualified local professionals in the property's jurisdiction.")}
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm">{t('No Viewing Fees')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('Confirm viewing arrangements directly with the listing contact and never send money before independently verifying the property.')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm">{t('Direct Owner & Agent Access')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('One-tap WhatsApp messaging and direct phone calls with vetted, registered property consultants.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. LIST YOUR PROPERTY CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-slate-900 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">
              {t('For Property Owners & Agents')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display">
              {t('Have a Property to Sell or Rent?')}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              {t('Reach buyers, renters, and investors searching across Uganda and supported markets worldwide.')}
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('list-property')}
            className="bg-white hover:bg-neutral-100 text-slate-950 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition shrink-0 flex items-center gap-2 hover:scale-102"
          >
            <span>{t('List Your Property Now')}</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </section>
    </div>
  );
};
