import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  Map,
  List,
  Columns,
  X,
  Filter,
  MapPin,
  Globe,
  SlidersHorizontal,
  Coins,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/PropertyCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { ALL_AMENITIES } from '../data/mockProperties';
import { ListingType, PropertyType } from '../types';
import { POPULAR_COUNTRIES, COUNTRY_ADMIN_CONFIGS, GLOBAL_LOCATIONS } from '../data/mockLocations';

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
  const { availableProperties, filters, setFilters, resetFilters, userCurrency, t } = useApp();

  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);

  // Sync initialListingType if provided
  React.useEffect(() => {
    if (initialListingType && filters.listingType !== initialListingType) {
      setFilters((prev) => ({ ...prev, listingType: initialListingType }));
    }
  }, [initialListingType, setFilters]);

  // Dynamic regions for selected country
  const countryNode = GLOBAL_LOCATIONS.find(
    (n) => n.name.toLowerCase() === (filters.country || '').toLowerCase()
  );
  const availableRegions = countryNode?.children || [];

  // Compute filtered properties
  const filteredProperties = useMemo(() => {
    return availableProperties.filter((item) => {
      // 1. Listing Type
      if (filters.listingType && filters.listingType !== 'All') {
        if (item.listingType !== filters.listingType) return false;
      }

      // 2. Country
      if (filters.country && filters.country !== '' && filters.country !== 'All') {
        if (item.country.toLowerCase() !== filters.country.toLowerCase()) {
          return false;
        }
      }

      // 3. Region or District
      if (filters.region && filters.region !== '') {
        const regLower = filters.region.toLowerCase();
        const itemText = (item.region + ' ' + item.district + ' ' + (item.neighborhood || '')).toLowerCase();
        if (!itemText.includes(regLower)) return false;
      }

      // 4. Property Category
      if (filters.propertyType && filters.propertyType !== '') {
        if (item.propertyType.toLowerCase() !== filters.propertyType.toLowerCase()) {
          return false;
        }
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
        if (item.bedrooms < Number(filters.bedrooms)) return false;
      }

      // 8. Bathrooms
      if (filters.bathrooms && filters.bathrooms !== 'Any') {
        if (item.bathrooms < Number(filters.bathrooms)) return false;
      }

      // 9. Amenities
      if (filters.amenities && filters.amenities.length > 0) {
        const hasAll = filters.amenities.every((am) => item.features.includes(am));
        if (!hasAll) return false;
      }

      // 10. Search query text
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase();
        const full = (
          item.title +
          ' ' +
          item.description +
          ' ' +
          item.country +
          ' ' +
          item.region +
          ' ' +
          item.district +
          ' ' +
          (item.neighborhood || '') +
          ' ' +
          item.locationDetails
        ).toLowerCase();
        if (!full.includes(q)) return false;
      }

      return true;
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

  const activeFiltersCount =
    (filters.country && filters.country !== 'All' ? 1 : 0) +
    (filters.region ? 1 : 0) +
    (filters.propertyType ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.bedrooms && filters.bedrooms !== 'Any' ? 1 : 0) +
    filters.amenities.length;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Top Filter Bar */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Left Controls: Country, Type, Search Input */}
            <div className="flex items-center flex-wrap gap-2 flex-1">
              {/* Buy / Rent / All */}
              <select
                value={filters.listingType || 'All'}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    listingType: e.target.value as ListingType | 'All'
                  }))
                }
                className="text-xs font-semibold px-2.5 py-1.5 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
              >
                <option value="All">Buy & Rent</option>
                <option value="Sale">Buy</option>
                <option value="Rent">Rent</option>
              </select>

              {/* Country Selector */}
              <select
                value={filters.country || 'All'}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    country: e.target.value === 'All' ? '' : e.target.value,
                    region: ''
                  }))
                }
                className="text-xs font-semibold px-2.5 py-1.5 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
              >
                <option value="All">{t('all_countries')}</option>
                {POPULAR_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Property Category */}
              <select
                value={filters.propertyType || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, propertyType: e.target.value }))
                }
                className="text-xs font-semibold px-2.5 py-1.5 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-800"
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

              {/* Price Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPriceDropdownOpen(!priceDropdownOpen)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 border rounded-lg transition cursor-pointer whitespace-nowrap ${
                    filters.minPrice || filters.maxPrice
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-neutral-300 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5 text-neutral-500" />
                  <span>
                    {filters.minPrice || filters.maxPrice
                      ? `${filters.minPrice ? filters.minPrice.toLocaleString() : '0'} – ${filters.maxPrice ? filters.maxPrice.toLocaleString() : t('price_any')}`
                      : t('price_filter_title')}
                  </span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {priceDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white border border-neutral-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
                      <span className="text-xs font-bold text-neutral-900">
                        {t('price_filter_title')} ({userCurrency})
                      </span>
                      {(filters.minPrice || filters.maxPrice) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, minPrice: undefined, maxPrice: undefined }));
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          {t('reset_filters')}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                          {t('price_min_placeholder')}
                        </label>
                        <input
                          type="number"
                          value={filters.minPrice ?? ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              minPrice: e.target.value ? Number(e.target.value) : undefined
                            }))
                          }
                          placeholder="0"
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                          {t('price_max_placeholder')}
                        </label>
                        <input
                          type="number"
                          value={filters.maxPrice ?? ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              maxPrice: e.target.value ? Number(e.target.value) : undefined
                            }))
                          }
                          placeholder={t('price_any')}
                          className="w-full text-xs p-2 border border-neutral-300 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        {t('price_quick_ranges')}
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFilters((prev) => ({ ...prev, minPrice: undefined, maxPrice: 100000 }))}
                          className="text-[11px] py-1 px-2 rounded-md bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-left font-medium cursor-pointer"
                        >
                          {t('price_under_100k')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilters((prev) => ({ ...prev, minPrice: 100000, maxPrice: 500000 }))}
                          className="text-[11px] py-1 px-2 rounded-md bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-left font-medium cursor-pointer"
                        >
                          {t('price_100k_500k')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilters((prev) => ({ ...prev, minPrice: 500000, maxPrice: 1000000 }))}
                          className="text-[11px] py-1 px-2 rounded-md bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-left font-medium cursor-pointer"
                        >
                          {t('price_500k_1m')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilters((prev) => ({ ...prev, minPrice: 1000000, maxPrice: undefined }))}
                          className="text-[11px] py-1 px-2 rounded-md bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-left font-medium cursor-pointer"
                        >
                          {t('price_above_1m')}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPriceDropdownOpen(false)}
                      className="w-full py-2 bg-slate-950 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition mt-2 cursor-pointer"
                    >
                      {t('apply_price_filter')}
                    </button>
                  </div>
                )}
              </div>

              {/* Text Search Bar */}
              <div className="relative flex-1 min-w-[160px]">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filters.searchQuery || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                  placeholder={t('search_placeholder')}
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-neutral-300 rounded-lg bg-neutral-50"
                />
              </div>

              {/* More Filters Modal Trigger */}
              <button
                type="button"
                onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                  activeFiltersCount > 0
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-neutral-300 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t('filters_label')}</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1 bg-white text-slate-900 text-[10px] px-1 rounded-full font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 px-2 py-1 cursor-pointer"
                  title={t('reset_filters')}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('reset_filters')}</span>
                </button>
              )}
            </div>

            {/* Right: View Mode Switcher */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  viewMode === 'split'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
            </div>
          </div>

          {/* More Filters Drawer */}
          {moreFiltersOpen && (
            <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
              {/* Bedrooms & Bathrooms */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-800">Bedrooms & Bathrooms</span>
                <div className="flex gap-2">
                  <select
                    value={filters.bedrooms || 'Any'}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        bedrooms: e.target.value === 'Any' ? 'Any' : Number(e.target.value)
                      }))
                    }
                    className="w-1/2 text-xs border border-neutral-300 rounded-lg p-2 bg-neutral-50"
                  >
                    <option value="Any">Any Beds</option>
                    <option value="1">1+ Beds</option>
                    <option value="2">2+ Beds</option>
                    <option value="3">3+ Beds</option>
                    <option value="4">4+ Beds</option>
                    <option value="5">5+ Beds</option>
                  </select>

                  <select
                    value={filters.bathrooms || 'Any'}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        bathrooms: e.target.value === 'Any' ? 'Any' : Number(e.target.value)
                      }))
                    }
                    className="w-1/2 text-xs border border-neutral-300 rounded-lg p-2 bg-neutral-50"
                  >
                    <option value="Any">Any Baths</option>
                    <option value="1">1+ Baths</option>
                    <option value="2">2+ Baths</option>
                    <option value="3">3+ Baths</option>
                    <option value="4">4+ Baths</option>
                  </select>
                </div>
              </div>

              {/* Price Constraints */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-800">
                  {t('price_filter_title')} ({userCurrency})
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minPrice: e.target.value ? Number(e.target.value) : undefined
                      }))
                    }
                    placeholder={t('price_min_placeholder')}
                    className="w-1/2 text-xs border border-neutral-300 rounded-lg p-2 bg-neutral-50"
                  />
                  <span className="text-neutral-400">–</span>
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: e.target.value ? Number(e.target.value) : undefined
                      }))
                    }
                    placeholder={t('price_max_placeholder')}
                    className="w-1/2 text-xs border border-neutral-300 rounded-lg p-2 bg-neutral-50"
                  />
                </div>
              </div>

              {/* Amenities Checklist */}
              <div className="space-y-2 sm:col-span-3">
                <span className="text-xs font-bold text-neutral-800">Amenities & Features</span>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_AMENITIES.map((am) => (
                    <button
                      key={am}
                      type="button"
                      onClick={() => toggleAmenity(am)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                        filters.amenities.includes(am)
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {am}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* VIEW 1: SPLIT VIEW (Listings on Left, Leaflet Map on Right) */}
        {viewMode === 'split' && (
          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-125px)]">
            {/* Left Property Cards Scroll Panel */}
            <div className="w-full lg:w-1/2 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    {title || 'Properties for Sale & Rent Worldwide'}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Showing <span className="font-semibold text-neutral-800 tabular-nums">{filteredProperties.length}</span> verified properties matching criteria
                  </p>
                </div>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8">
                  <MapPin className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-neutral-800">No properties match your filter</h3>
                  <p className="text-xs text-neutral-500 mt-1">Try resetting your country or price filters.</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProperties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      onHover={(id) => setHighlightedPropertyId(id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Map View */}
            <div className="hidden lg:block lg:w-1/2 h-full sticky top-0 border-l border-neutral-200">
              <InteractiveMap
                properties={filteredProperties}
                highlightedPropertyId={highlightedPropertyId}
                onSelectProperty={(id) => setHighlightedPropertyId(id)}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: FULL GRID VIEW */}
        {viewMode === 'list' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  {title || 'Global Property Listings'}
                </h2>
                <p className="text-xs text-neutral-500">
                  {filteredProperties.length} properties discovered worldwide
                </p>
              </div>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 p-8">
                <MapPin className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-neutral-800">No properties match your filter</h3>
                <p className="text-xs text-neutral-500 mt-1">Try resetting your filters to explore global listings.</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: FULL MAP VIEW */}
        {viewMode === 'map' && (
          <div className="flex-1 h-[calc(100vh-125px)] w-full">
            <InteractiveMap
              properties={filteredProperties}
              highlightedPropertyId={highlightedPropertyId}
              onSelectProperty={(id) => setHighlightedPropertyId(id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
