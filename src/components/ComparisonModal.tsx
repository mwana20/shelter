import React from 'react';
import { X, Check, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatUGX } from '../utils/format';
import { ALL_AMENITIES } from '../data/mockProperties';

export const ComparisonModal: React.FC = () => {
  const {
    compareModalOpen,
    setCompareModalOpen,
    comparedPropertyIds,
    toggleCompareProperty,
    clearComparison,
    properties,
    openPropertyDetail
  } = useApp();

  if (!compareModalOpen) return null;

  const comparedProperties = properties.filter((p) => comparedPropertyIds.includes(p.id));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
      onClick={() => setCompareModalOpen(false)}
    >
      <div
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl relative border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">
              Property Comparison
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Compare features, prices, and amenities across selected homes in Mukono
            </p>
          </div>
          <div className="flex items-center gap-3">
            {comparedProperties.length > 0 && (
              <button
                onClick={clearComparison}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
            <button
              onClick={() => setCompareModalOpen(false)}
              className="p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6">
          {comparedProperties.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-neutral-400 text-sm">No properties selected for comparison yet.</p>
              <p className="text-xs text-neutral-500">
                Click the compare scale icon on any property card to add it to this side-by-side view.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="p-3 w-40 text-neutral-400 font-semibold uppercase tracking-wider text-[11px] border-b border-neutral-200 bg-neutral-50/60 sticky left-0 z-10">
                      Metric
                    </th>
                    {comparedProperties.map((p) => (
                      <th
                        key={p.id}
                        className="p-3 min-w-[220px] max-w-[260px] border-b border-neutral-200 bg-neutral-50/60 align-top"
                      >
                        <div className="relative group">
                          <button
                            onClick={() => toggleCompareProperty(p.id)}
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 z-10"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-28 object-cover rounded-xl mb-2"
                          />
                          <h4 className="font-bold text-neutral-900 text-xs line-clamp-1">{p.title}</h4>
                          <p className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
                            {formatUGX(p.price, p.listingType)}
                          </p>
                          <button
                            onClick={() => {
                              setCompareModalOpen(false);
                              openPropertyDetail(p.id);
                            }}
                            className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white py-1 px-2 rounded-md font-semibold text-[11px] flex items-center justify-center gap-1"
                          >
                            View Details <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="p-3 font-semibold text-neutral-700 bg-neutral-50/40 sticky left-0 z-10">
                      Status / Purpose
                    </td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800 font-medium">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-bold">
                          {p.listingType === 'Sale' ? 'For Sale' : 'For Rent'} ({p.status})
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-neutral-700 bg-neutral-50/40 sticky left-0 z-10">
                      Location / Area
                    </td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800">
                        <strong>{p.area}</strong>
                        <p className="text-[11px] text-neutral-500 line-clamp-1">{p.locationDetails}</p>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-neutral-700 bg-neutral-50/40 sticky left-0 z-10">
                      Property Type
                    </td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800 font-medium">
                        {p.propertyType}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-neutral-700 bg-neutral-50/40 sticky left-0 z-10">
                      Bedrooms & Baths
                    </td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800">
                        {p.bedrooms} Beds · {p.bathrooms} Baths
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-neutral-700 bg-neutral-50/40 sticky left-0 z-10">
                      Building Size
                    </td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800">
                        {p.sqft ? `${p.sqft.toLocaleString()} sq ft` : 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-neutral-700 bg-neutral-50/40 sticky left-0 z-10">
                      Plot / Compound Size
                    </td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800">
                        {p.plotSize || 'Standard Plot'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-neutral-700 bg-neutral-50/40 sticky left-0 z-10">
                      Parking
                    </td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800">
                        {p.parkingSpaces > 0 ? `${p.parkingSpaces} vehicles` : 'Street parking'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-neutral-700 bg-neutral-50/40 sticky left-0 z-10">
                      Title Deed Status
                    </td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800 font-medium">
                        {p.titleDeedStatus || 'Ready Private Mailo'}
                      </td>
                    ))}
                  </tr>

                  {/* Amenities comparison section */}
                  {ALL_AMENITIES.slice(0, 8).map((amenity) => (
                    <tr key={amenity}>
                      <td className="p-3 font-medium text-neutral-600 bg-neutral-50/40 sticky left-0 z-10">
                        {amenity}
                      </td>
                      {comparedProperties.map((p) => {
                        const hasIt = p.features.includes(amenity);
                        return (
                          <td key={p.id} className="p-3 text-neutral-800">
                            {hasIt ? (
                              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                <Check className="w-4 h-4 text-emerald-500" /> Yes
                              </span>
                            ) : (
                              <span className="text-neutral-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
