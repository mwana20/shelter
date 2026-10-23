import React from 'react';
import { MapPin, ArrowRight, Building, Globe, CheckCircle2 } from 'lucide-react';
import { GLOBAL_DESTINATIONS } from '../data/mockProperties';
import { useApp } from '../context/AppContext';

export const AreasPage: React.FC = () => {
  const { availableProperties, applyQuickSearch } = useApp();

  const handleSelectDestination = (country: string, name: string) => {
    applyQuickSearch({ country, district: name });
  };

  return (
    <div className="bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Globe className="w-4 h-4" />
            <span>Worldwide Real Estate Market Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-serif-display">
            Explore Global Destinations & Property Hubs
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Discover verified family residences, waterfront luxury retreats, and commercial opportunities across world markets. Headquarters located in Mbale City, Uganda with active international listings.
          </p>
        </div>

        {/* Global Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {GLOBAL_DESTINATIONS.map((dest) => {
            const destProps = availableProperties.filter(
              (p) => p.country.toLowerCase() === dest.country.toLowerCase()
            );
            const saleCount = destProps.filter((p) => p.listingType === 'Sale').length;
            const rentCount = destProps.filter((p) => p.listingType === 'Rent').length;

            return (
              <div
                key={dest.id}
                className="bg-white rounded-3xl overflow-hidden border border-neutral-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-60 overflow-hidden bg-neutral-900">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
                        {dest.country}
                      </span>
                      <h3 className="text-xl font-bold font-serif-display">{dest.name}</h3>
                      <p className="text-xs text-slate-300 line-clamp-1">{dest.tagline}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {dest.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100 text-xs">
                      <div className="p-2.5 bg-neutral-50 rounded-xl">
                        <span className="text-[11px] text-neutral-500 font-medium block">Properties for Sale</span>
                        <span className="text-sm font-bold text-neutral-900 tabular-nums">
                          {saleCount} Available
                        </span>
                      </div>
                      <div className="p-2.5 bg-neutral-50 rounded-xl">
                        <span className="text-[11px] text-neutral-500 font-medium block">Rental Homes</span>
                        <span className="text-sm font-bold text-neutral-900 tabular-nums">
                          {rentCount} Available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => handleSelectDestination(dest.country, dest.name)}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Explore {dest.name} Listings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
