import React from 'react';
import { MapPin, ArrowRight, Home, Building2 } from 'lucide-react';
import { mockAreas } from '../data/mockAreas';
import { useApp } from '../context/AppContext';

export const AreasPage: React.FC = () => {
  const { availableProperties, applyQuickSearch, setSelectedAreaFilter } = useApp();

  const handleSelectArea = (areaId: string) => {
    setSelectedAreaFilter(areaId);
    applyQuickSearch({ area: areaId });
  };

  return (
    <div className="bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <MapPin className="w-4 h-4" />
            <span>Mukono District Neighborhood Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-serif-display">
            Explore Neighborhoods & Towns in Mukono
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            From the bustling university township of Mukono Municipality to the quiet suburban ridges of Sonde and lake-view retreats of Katosi. Compare price averages and available homes.
          </p>
        </div>

        {/* Neighborhood Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockAreas.map((area) => {
            const areaProps = availableProperties.filter((p) => p.area === area.id);
            const saleCount = areaProps.filter((p) => p.listingType === 'Sale').length;
            const rentCount = areaProps.filter((p) => p.listingType === 'Rent').length;

            return (
              <div
                key={area.id}
                className="bg-white rounded-3xl overflow-hidden border border-neutral-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={area.image}
                      alt={area.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold">{area.name}</h3>
                      <p className="text-xs text-slate-300 line-clamp-1">{area.tagline}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {area.description}
                    </p>

                    <div className="bg-neutral-50 rounded-2xl p-4 space-y-2 border border-neutral-100 text-xs">
                      <div className="flex justify-between text-neutral-600">
                        <span>Distance to Kampala:</span>
                        <strong className="text-neutral-900">{area.distanceFromKampala}</strong>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Average Sale Price:</span>
                        <strong className="text-emerald-700">{area.avgSalePrice}</strong>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Average Rent:</span>
                        <strong className="text-neutral-900">{area.avgRentPrice}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 font-semibold">
                        {saleCount} For Sale
                      </div>
                      <div className="p-2 bg-slate-100 text-slate-800 rounded-xl border border-slate-200 font-semibold">
                        {rentCount} For Rent
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleSelectArea(area.id)}
                    className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md"
                  >
                    <span>Browse All Homes in {area.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
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
