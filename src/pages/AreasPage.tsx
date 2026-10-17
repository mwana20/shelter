import React from 'react';
import { MapPin, ArrowRight, Home, Building2 } from 'lucide-react';
import { mockAreas } from '../data/mockAreas';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/translations';

export const AreasPage: React.FC = () => {
  const t = useTranslation();
  const { availableProperties, applyQuickSearch, setSelectedAreaFilter } = useApp();

  const handleSelectArea = (areaId: string) => {
    setSelectedAreaFilter(areaId);
    const area = mockAreas.find((location) => location.id === areaId);
    applyQuickSearch({ country: area?.country, area: areaId });
  };
  const featuredLocations = [
    ...mockAreas.filter((location) => location.country === 'Uganda').slice(0, 2),
    ...mockAreas.filter((location) => location.country !== 'Uganda').slice(0, 2),
    ...mockAreas.filter((location) => location.country === 'Uganda').slice(2),
    ...mockAreas.filter((location) => location.country !== 'Uganda').slice(2)
  ];

  return (
    <div className="bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <MapPin className="w-4 h-4" />
            <span>{t('Sample locations across supported markets')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-serif-display">
            {t('Explore Districts, Cities & Towns')}
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            {t('Browse sample listings in several Ugandan districts and selected locations around the world. Local availability depends on active listings.')}
          </p>
        </div>

        {/* Neighborhood Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredLocations.map((area) => {
            const areaProps = availableProperties.filter(
              (p) => p.area === area.id && (p.country ?? 'Uganda') === area.country
            );
            const saleCount = areaProps.filter((p) => p.listingType === 'Sale').length;
            const rentCount = areaProps.filter((p) => p.listingType === 'Rent').length;

            return (
              <div
                key={`${area.country}:${area.id}`}
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
                      <p className="text-[10px] font-semibold uppercase tracking-wide">{area.country}</p>
                      <p className="text-xs text-slate-300 line-clamp-1">{area.tagline}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {area.description}
                    </p>

                    <div className="bg-neutral-50 rounded-2xl p-4 space-y-2 border border-neutral-100 text-xs">
                      <p className="text-neutral-700 font-semibold">{area.region}</p>
                      <p className="text-neutral-500">{t('Preview data only; this is not an estimate of local market prices.')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 font-semibold">
                        {saleCount} {t('For Sale')}
                      </div>
                      <div className="p-2 bg-slate-100 text-slate-800 rounded-xl border border-slate-200 font-semibold">
                        {rentCount} {t('For Rent')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleSelectArea(area.id)}
                    className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md"
                  >
                    <span>{t('Browse Listings in')} {area.name}</span>
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
