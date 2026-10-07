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
import { ListingType } from '../types';

export const HomePage: React.FC = () => {
  const {
    availableProperties,
    applyQuickSearch,
    setCurrentPage,
    setSelectedAreaFilter,
    setFilters
  } = useApp();

  // Hero Search Local State
  const [listingType, setListingType] = useState<ListingType>('Sale');
  const [area, setArea] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('Any');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyQuickSearch({
      listingType,
      area: area || undefined,
      propertyType: propertyType || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      bedrooms: bedrooms === 'Any' ? 'Any' : Number(bedrooms)
    });
  };

  const handleAreaClick = (areaName: string) => {
    setSelectedAreaFilter(areaName);
    applyQuickSearch({ area: areaName });
  };

  const featuredHomes = availableProperties.filter((p) => p.featured).slice(0, 6);
  const newHomes = availableProperties.filter((p) => p.isNew).slice(0, 3);
  const forSaleHomes = availableProperties.filter((p) => p.listingType === 'Sale').slice(0, 3);
  const forRentHomes = availableProperties.filter((p) => p.listingType === 'Rent').slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[640px] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950">
        {/* Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
            alt="Mukono Modern Residential Property"
            className="w-full h-full object-cover opacity-100 filter brightness-100 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/0 to-white/0" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>Mukono District's Dedicated Property Marketplace</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-serif-display max-w-3xl mx-auto leading-tight">
              Find Your Next Home in Mukono
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Explore houses, apartments, and properties for sale or rent across Mukono. Verified land titles, physical site inspections, and trusted local brokers.
            </p>
          </div>

          {/* Large Hero Property Search Component */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 text-left border border-white/20 max-w-4xl mx-auto mt-6">
            {/* "I want to" Tab Toggle */}
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-3">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mr-2 hidden sm:inline">
                I want to:
              </span>
              <button
                type="button"
                onClick={() => setListingType('Sale')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  listingType === 'Sale'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                Buy Property
              </button>
              <button
                type="button"
                onClick={() => setListingType('Rent')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  listingType === 'Rent'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                Rent Property
              </button>
            </div>

            {/* Filter Inputs Grid */}
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Location in Mukono</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="">All Mukono Areas</option>
                    <option value="Mukono Municipality">Mukono Municipality</option>
                    <option value="Mukono Town">Mukono Town</option>
                    <option value="Seeta">Seeta</option>
                    <option value="Namugongo">Namugongo</option>
                    <option value="Sonde">Sonde</option>
                    <option value="Kyetume">Kyetume</option>
                    <option value="Namanoga">Namanoga</option>
                    <option value="Goma">Goma</option>
                    <option value="Katosi">Katosi</option>
                    <option value="Nakisunga">Nakisunga</option>
                    <option value="Wantoni">Wantoni</option>
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="">Any Type</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Bungalow">Bungalow</option>
                  <option value="Land">Land / Plot</option>
                  <option value="Commercial Property">Commercial Property</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {listingType === 'Sale' ? 'Max Price (UGX)' : 'Max Monthly Rent (UGX)'}
                </label>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="">No Maximum</option>
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
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Bedrooms</label>
                <div className="flex gap-2">
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-24 text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-2 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Any">Any</option>
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
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 text-white text-left">
            <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-800">
              <p className="text-xl font-extrabold text-emerald-400">{availableProperties.length}+</p>
              <p className="text-[11px] text-slate-400 font-medium">Verified Mukono Listings</p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-800">
              <p className="text-xl font-extrabold text-white">8 Localities</p>
              <p className="text-[11px] text-slate-400 font-medium">Seeta to Katosi Lakefront</p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-800">
              <p className="text-xl font-extrabold text-white">100%</p>
              <p className="text-[11px] text-slate-400 font-medium">Inspected Land Titles</p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-xl border border-slate-800">
              <p className="text-xl font-extrabold text-emerald-400">0%</p>
              <p className="text-[11px] text-slate-400 font-medium">Advance Viewing Fees</p>
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
              <span>Handpicked Residences</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 font-serif-display">
              Featured Homes
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Top-rated houses and apartments with exceptional construction quality in Mukono.
            </p>
          </div>
          <button
            onClick={() => {
              setFilters((prev) => ({ ...prev, listingType: 'All' }));
              setCurrentPage('search');
            }}
            className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 transition"
          >
            <span>View all {availableProperties.length} properties</span>
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
              <span>Recently Added to Market</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 font-serif-display">
              New Listings in Mukono
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Freshly listed properties added in the past 7 days. Be the first to schedule an inspection.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('new-listings')}
            className="text-xs font-bold text-slate-900 hover:text-amber-700 flex items-center gap-1 transition"
          >
            <span>Browse all new homes</span>
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
              Homes for Sale in Mukono
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Own a permanent home with ready Private Mailo or Freehold title deeds.
            </p>
          </div>
          <button
            onClick={() => {
              applyQuickSearch({ listingType: 'Sale' });
              setCurrentPage('buy');
            }}
            className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 transition"
          >
            <span>Explore all homes for sale</span>
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
              Homes for Rent in Mukono
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Move into secure gated compounds, serviced apartments, and standalone bungalows.
            </p>
          </div>
          <button
            onClick={() => {
              applyQuickSearch({ listingType: 'Rent' });
              setCurrentPage('rent');
            }}
            className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 transition"
          >
            <span>Explore all rentals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forRentHomes.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* 6. EXPLORE MUKONO NEIGHBORHOODS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Neighborhood Guides
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 font-serif-display">
            Explore Mukono Districts & Towns
          </h2>
          <p className="text-sm text-neutral-500">
            Find the right area that matches your commute, school proximity, and lifestyle preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mockAreas.map((areaItem) => {
            const count = availableProperties.filter((p) => p.area === areaItem.id).length;
            return (
              <div
                key={areaItem.id}
                onClick={() => handleAreaClick(areaItem.id)}
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
                    <p className="text-[11px] text-slate-300 line-clamp-1">{areaItem.tagline}</p>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Available Listings:</span>
                      <strong className="text-neutral-900">{count || '3+'} properties</strong>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Average Home Price:</span>
                      <strong className="text-emerald-700">{areaItem.avgSalePrice}</strong>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Average Rent:</span>
                      <strong className="text-neutral-900">{areaItem.avgRentPrice}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-800 group-hover:text-emerald-700 transition-colors">
                    <span>Explore Homes</span>
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
              The Sheltered Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-display">
              Why Buyers & Tenants in Mukono Choose Sheltered
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Navigating land transactions and property in Uganda requires verified ownership, clear boundary markers, and zero tolerance for impersonation. We bring modern transparency to Kyaggwe and Mukono real estate.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm">Title Deed Verification</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every listed house or plot is verified against the Mukono Zonal Land Registry before receiving our verified seal.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm">No Viewing Fees</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict policy against preliminary booking fees. Tour any property in Seeta, Sonde, or Mukono town without upfront payments.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm">Direct Owner & Agent Access</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  One-tap WhatsApp messaging and direct phone calls with vetted, registered property consultants.
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
              For Property Owners & Agents
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display">
              Have a Property to Sell or Rent in Mukono?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Reach thousands of verified buyers, diaspora investors, and university families actively searching for homes in Mukono Municipality, Seeta, Sonde, and surrounding areas.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('list-property')}
            className="bg-white hover:bg-neutral-100 text-slate-950 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition shrink-0 flex items-center gap-2 hover:scale-102"
          >
            <span>List Your Property Now</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </section>
    </div>
  );
};
