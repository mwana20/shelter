import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Map,
  List,
  Columns,
  X,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/PropertyCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { ALL_AMENITIES } from '../data/mockProperties';
import { GLOBAL_COUNTRIES } from '../data/globalLocations';
import { mockAreas } from '../data/mockAreas';
import { ListingType } from '../types';
import { useTranslation } from '../i18n/translations';

interface SearchPageProps {
  initialListingType?: ListingType | 'All';
  title?: string;
  subtitle?: string;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialListingType,
  title,
  subtitle
}) => {
  const { availableProperties, filters, setFilters, resetFilters } = useApp();
  const t = useTranslation();

  // View mode: 'split' (side-by-side on desktop), 'list' (cards grid), 'map' (full map)
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  // Sync initialListingType if provided by parent (e.g. Buy or Rent page)
  React.useEffect(() => {
    if (initialListingType && filters.listingType !== initialListingType) {
      setFilters((prev) => ({ ...prev, listingType: initialListingType }));
    }
  }, [initialListingType, setFilters]);

  // Compute filtered properties
  const filteredProperties = useMemo(() => {
    return availableProperties.filter((item) => {
      // 1. Listing Type
      if (filters.listingType && filters.listingType !== 'All') {
        if (item.listingType !== filters.listingType) return false;
      }

      // 2. Country
      if (filters.country && filters.country !== '') {
        if ((item.country ?? 'Uganda') !== filters.country) return false;
      }

      // 3. Area
      if (filters.area && filters.area !== '') {
        if (item.area !== filters.area) return false;
      }

      // 4. Property Type
      if (filters.propertyType && filters.propertyType !== '') {
        if (item.propertyType !== filters.propertyType) return false;
      }

      // 5. Min Price
      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        if (item.price < filters.minPrice) return false;
      }

      // 6. Max Price
      if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
        if (item.price > filters.maxPrice) return false;
      }

      // 7. Bedrooms
      if (filters.bedrooms && filters.bedrooms !== 'Any') {
        const requiredBeds = Number(filters.bedrooms);
        if (item.bedrooms < requiredBeds) return false;
      }

      // 8. Bathrooms
      if (filters.bathrooms && filters.bathrooms !== 'Any') {
        const requiredBaths = Number(filters.bathrooms);
        if (item.bathrooms < requiredBaths) return false;
      }

      // 9. Amenities
      if (filters.amenities && filters.amenities.length > 0) {
        const hasAll = filters.amenities.every((amenity) =>
          item.features.includes(amenity)
        );
        if (!hasAll) return false;
      }

      // 10. Free-text Search Query
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesLocation = item.locationDetails.toLowerCase().includes(q) || item.area.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocation && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
      if (filters.sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (filters.sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (filters.sortBy === 'views') {
        return b.viewsCount - a.viewsCount;
      }
      // recommended: featured first, then saves count
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.savesCount - a.savesCount;
    });
  }, [availableProperties, filters]);

  const toggleAmenity = (amenity: string) => {
    setFilters((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const activeFilterCount =
    (filters.listingType && filters.listingType !== 'All' ? 1 : 0) +
    (filters.country ? 1 : 0) +
    (filters.area ? 1 : 0) +
    (filters.propertyType ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.bedrooms && filters.bedrooms !== 'Any' ? 1 : 0) +
    (filters.bathrooms && filters.bathrooms !== 'Any' ? 1 : 0) +
    filters.amenities.length +
    (filters.searchQuery ? 1 : 0);
  const locationOptions = mockAreas.filter(
    (location) => !filters.country || location.country === filters.country
  );
  const countryOptions = Array.from(new Set([
    ...GLOBAL_COUNTRIES,
    ...availableProperties.map((property) => property.country ?? 'Uganda')
  ])).sort((a, b) => a.localeCompare(b));

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50/50">
      {/* Top Filter Bar (Sticky Zillow style) */}
      <div className="sticky top-18 z-30 bg-white border-b border-neutral-200/90 shadow-xs px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Quick Filters Group */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative min-w-[180px] max-w-xs flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t('Search city, district, address...')}
                value={filters.searchQuery || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-neutral-50/60 focus:bg-white"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Buy / Rent */}
            <select
              value={filters.listingType || 'All'}
              onChange={(e) => setFilters((prev) => ({ ...prev, listingType: e.target.value as any }))}
              className="text-xs font-semibold border border-neutral-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="All">{t('Buy & Rent')}</option>
              <option value="Sale">{t('For Sale')}</option>
              <option value="Rent">{t('For Rent')}</option>
            </select>

            {/* Country */}
            <select
              value={filters.country || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value, area: '' }))}
              className="text-xs font-semibold border border-neutral-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="">{t('All Countries')}</option>
              {countryOptions.map((countryName) => (
                <option key={countryName} value={countryName}>{countryName}</option>
              ))}
            </select>

            {/* Area */}
            <select
              value={filters.area || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, area: e.target.value }))}
              className="text-xs font-semibold border border-neutral-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="">{t('All Locations')}</option>
              {locationOptions.map((location) => (
                <option key={`${location.country}:${location.id}`} value={location.id}>
                  {location.name} · {location.country}
                </option>
              ))}
            </select>

            {/* Property Type */}
            <select
              value={filters.propertyType || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, propertyType: e.target.value }))}
              className="text-xs font-semibold border border-neutral-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white hidden sm:inline-block"
            >
              <option value="">{t('All Types')}</option>
              <option value="House">{t('Houses')}</option>
              <option value="Apartment">{t('Apartments')}</option>
              <option value="Villa">{t('Villas')}</option>
              <option value="Townhouse">{t('Townhouses')}</option>
              <option value="Bungalow">{t('Bungalows')}</option>
              <option value="Land">{t('Land / Plots')}</option>
              <option value="Commercial Property">{t('Commercial')}</option>
            </select>

            {/* Bedrooms */}
            <select
              value={filters.bedrooms || 'Any'}
              onChange={(e) => setFilters((prev) => ({ ...prev, bedrooms: e.target.value as any }))}
              className="text-xs font-semibold border border-neutral-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white hidden md:inline-block"
            >
              <option value="Any">{t('Beds: Any')}</option>
              <option value="1">1+ {t('Bed')}</option>
              <option value="2">2+ {t('Beds')}</option>
              <option value="3">3+ {t('Beds')}</option>
              <option value="4">4+ {t('Beds')}</option>
              <option value="5">5+ {t('Beds')}</option>
            </select>

            {/* More Filters Toggle */}
            <button
              type="button"
              onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
              className={`flex items-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border transition ${
                moreFiltersOpen || filters.amenities.length > 0
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('More Filters')}</span>
              {filters.amenities.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {filters.amenities.length}
                </span>
              )}
            </button>

            {/* Reset Filters */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-neutral-500 hover:text-rose-600 flex items-center gap-1 py-1.5 px-2 rounded hover:bg-neutral-100 transition"
                title={t('Reset all filters')}
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">{t('Reset')}</span>
              </button>
            )}
          </div>

          {/* Right Layout View Mode Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 text-neutral-600">
              <button
                onClick={() => setViewMode('split')}
                title={t('Split View (List + Map)')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'split' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
                } hidden lg:inline-flex`}
              >
                <Columns className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title={t('List View')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'list' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                title={t('Map View')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'map' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
                }`}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable "More Filters" Drawer */}
        {moreFiltersOpen && (
          <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2">
            {/* Price Ranges */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">{t('Price Filter (UGX)')}</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-neutral-500">{t('Min Price')}</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minPrice: e.target.value ? Number(e.target.value) : undefined
                      }))
                    }
                    className="w-full text-xs border border-neutral-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-500">{t('Max Price')}</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000000"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: e.target.value ? Number(e.target.value) : undefined
                      }))
                    }
                    className="w-full text-xs border border-neutral-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">{t('Bathrooms')}</h4>
              <div className="flex gap-1.5">
                {['Any', '1', '2', '3', '4'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setFilters((prev) => ({ ...prev, bathrooms: b as any }))}
                    className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition ${
                      filters.bathrooms === b || (b === 'Any' && !filters.bathrooms)
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {b === 'Any' ? t('Any') : `${b}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities Checklist */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  {t('Amenities & Facilities')}
                </h4>
                {filters.amenities.length > 0 && (
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, amenities: [] }))}
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    {t('Clear Amenities')}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_AMENITIES.map((amenity) => {
                  const checked = filters.amenities.includes(amenity);
                  return (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none hover:text-neutral-900"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                      />
                      <span className="truncate">{amenity}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Results Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title & Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-neutral-200/80 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-serif-display">
              {title ? t(title) : (filters.listingType === 'Rent' ? t('Rental Properties') : t('Property Listings'))}
            </h1>
            <p className="text-xs font-semibold text-neutral-500 mt-0.5">
              {filteredProperties.length} {t(filteredProperties.length === 1 ? 'Property' : 'Properties')} {t('Matching Your Criteria')}
              {filters.area ? ` ${t('in')} ${filters.area}` : ''}
              {filters.country ? `, ${filters.country}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-neutral-500">{t('Sort by:')}</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
              className="text-xs font-bold border border-neutral-200 rounded-lg py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="recommended">{t('Recommended')}</option>
              <option value="newest">{t('Newest First')}</option>
              <option value="price-asc">{t('Price: Low to High')}</option>
              <option value="price-desc">{t('Price: High to Low')}</option>
              <option value="views">{t('Most Viewed')}</option>
            </select>
          </div>
        </div>

        {/* View Mode Implementations */}

        {/* 1. SPLIT VIEW (List + Interactive Map) */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
            {/* Left Property List */}
            <div className="lg:col-span-7 xl:col-span-7 overflow-y-auto pr-1 space-y-4">
              {filteredProperties.length === 0 ? (
                <EmptyResults resetFilters={resetFilters} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onHover={setHighlightedPropertyId}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Sticky Interactive Map */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-5 h-[calc(100vh-180px)] sticky top-38">
              <InteractiveMap
                properties={filteredProperties}
                highlightedPropertyId={highlightedPropertyId}
                onSelectProperty={setHighlightedPropertyId}
                className="h-full w-full"
              />
            </div>
          </div>
        )}

        {/* 2. LIST VIEW (Cards Grid) */}
        {viewMode === 'list' && (
          <div>
            {filteredProperties.length === 0 ? (
              <EmptyResults resetFilters={resetFilters} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onHover={setHighlightedPropertyId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. MAP VIEW (Full-Screen Map) */}
        {viewMode === 'map' && (
          <div className="h-[75vh] w-full rounded-2xl overflow-hidden shadow-lg border border-neutral-200">
            <InteractiveMap
              properties={filteredProperties}
              highlightedPropertyId={highlightedPropertyId}
              onSelectProperty={setHighlightedPropertyId}
              className="h-full w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyResults: React.FC<{ resetFilters: () => void }> = ({ resetFilters }) => {
  const t = useTranslation();
  return <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 space-y-4 max-w-md mx-auto my-8">
    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
      <Filter className="w-6 h-6" />
    </div>
    <h3 className="text-base font-bold text-neutral-800">{t('No matching properties found')}</h3>
    <p className="text-xs text-neutral-500 leading-relaxed">
      {t('Try loosening your price filters, selecting "All Locations", or clearing amenities to see more properties.')}
    </p>
    <button
      onClick={resetFilters}
      className="bg-slate-950 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition"
    >
      {t('Reset All Filters')}
    </button>
  </div>
};
