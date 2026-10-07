import React from 'react';
import { Heart, Scale, Trash2, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatUGX } from '../utils/format';

export const SavedHomesPage: React.FC = () => {
  const {
    properties,
    savedPropertyIds,
    toggleSaveProperty,
    toggleCompareProperty,
    isCompared,
    setCompareModalOpen,
    openPropertyDetail,
    setScheduleModalProperty,
    setContactModalProperty,
    setCurrentPage
  } = useApp();

  const savedProperties = properties.filter((p) => savedPropertyIds.includes(p.id));

  return (
    <div className="bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Heart className="w-4 h-4 fill-rose-600" />
              <span>Wishlist & Shortlist</span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 font-serif-display">
              Saved Homes
            </h1>
            <p className="text-xs font-semibold text-neutral-500 mt-0.5">
              {savedProperties.length} {savedProperties.length === 1 ? 'Home' : 'Homes'} Saved for Inspection in Mukono
            </p>
          </div>

          {savedProperties.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCompareModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <Scale className="w-4 h-4" />
                <span>Compare Saved Homes</span>
              </button>
            </div>
          )}
        </div>

        {savedProperties.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-neutral-200/90 max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">You haven't saved any homes yet</h3>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
              Click the heart icon on any Mukono house or apartment listing to keep track of your favorites and compare their features.
            </p>
            <button
              onClick={() => setCurrentPage('search')}
              className="bg-slate-950 text-white text-xs font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition inline-flex items-center gap-2"
            >
              <span>Explore Mukono Properties</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((property) => {
              const compared = isCompared(property.id);

              return (
                <div
                  key={property.id}
                  className="rounded-2xl bg-white border border-neutral-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                >
                  <div
                    className="relative aspect-16/10 cursor-pointer overflow-hidden group"
                    onClick={() => openPropertyDetail(property.id)}
                  >
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                      {property.listingType === 'Sale' ? 'For Sale' : 'For Rent'}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveProperty(property.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-600 hover:bg-white transition shadow-sm"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div onClick={() => openPropertyDetail(property.id)} className="cursor-pointer">
                      <p className="text-lg font-bold text-neutral-900">
                        {formatUGX(property.price, property.listingType)}
                      </p>
                      <h4 className="text-sm font-semibold text-neutral-800 line-clamp-1 mt-0.5">
                        {property.title}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-1">
                        📍 {property.area}, Mukono
                      </p>
                      <div className="flex gap-3 text-xs text-neutral-600 mt-3 pt-3 border-t border-neutral-100">
                        <span>🛏️ {property.bedrooms} Beds</span>
                        <span>🚿 {property.bathrooms} Baths</span>
                        {property.sqft && <span>📐 {property.sqft} sq ft</span>}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setScheduleModalProperty(property)}
                          className="py-2 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Home</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setContactModalProperty(property)}
                          className="py-2 px-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Contact</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCompareProperty(property.id)}
                        className={`w-full py-1.5 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition ${
                          compared
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>{compared ? 'In Comparison List' : 'Add to Compare'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
