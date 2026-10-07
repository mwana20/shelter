import React, { useState } from 'react';
import {
  Heart,
  Scale,
  Share2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Car,
  ShieldCheck,
  Phone,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Play,
  ArrowLeft,
  Check,
  FileCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatUGX, getWhatsAppLink, getTelLink } from '../utils/format';
import { PropertyCard } from '../components/PropertyCard';
import { InteractiveMap } from '../components/InteractiveMap';

export const PropertyDetailPage: React.FC = () => {
  const {
    selectedPropertyId,
    properties,
    setCurrentPage,
    toggleSaveProperty,
    isSaved,
    toggleCompareProperty,
    isCompared,
    setGalleryModalData,
    setScheduleModalProperty,
    setContactModalProperty,
    setReportModalProperty,
    showNotification
  } = useApp();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const property = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  if (!property) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-neutral-500">Property not found.</p>
        <button
          onClick={() => setCurrentPage('search')}
          className="mt-4 bg-slate-900 text-white text-xs font-semibold py-2 px-4 rounded-lg"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const saved = isSaved(property.id);
  const compared = isCompared(property.id);
  const agent = property.agent;
  const whatsappUrl = getWhatsAppLink(agent.whatsapp, property.title);
  const telUrl = getTelLink(agent.phone);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showNotification('Property link copied to clipboard!', 'success');
    }
  };

  const openFullscreenGallery = (index: number = 0) => {
    setGalleryModalData({ images: property.images, initialIndex: index });
  };

  // Similar properties in same area
  const similarHomes = properties
    .filter((p) => p.id !== property.id && p.area === property.area)
    .slice(0, 3);

  return (
    <div className="bg-neutral-50/40 pb-20">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-neutral-200/80 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentPage('search')}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mukono Listings</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={() => toggleCompareProperty(property.id)}
              className={`flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg border transition ${
                compared ? 'bg-slate-900 text-white border-slate-900' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{compared ? 'Comparing' : 'Compare'}</span>
            </button>
            <button
              onClick={() => toggleSaveProperty(property.id)}
              className={`flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg border transition ${
                saved ? 'bg-rose-50 text-rose-700 border-rose-300' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* 1. HIGH VISUAL IMAGE GALLERY */}
        <div className="space-y-3 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* Hero Main Image (takes 3 cols on large) */}
            <div
              onClick={() => openFullscreenGallery(activePhotoIndex)}
              className="lg:col-span-3 relative h-[360px] sm:h-[480px] rounded-2xl overflow-hidden cursor-pointer group bg-neutral-900"
            >
              <img
                src={property.images[activePhotoIndex]}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

              {/* Status and Type Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-white shadow-sm backdrop-blur-md">
                  {property.listingType === 'Sale' ? 'For Sale' : 'For Rent'}
                </span>
                {property.verified && (
                  <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-600/90 text-white shadow-sm backdrop-blur-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Listing
                  </span>
                )}
                {property.status !== 'Available' && (
                  <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                    {property.status}
                  </span>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                type="button"
                className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-950 font-bold text-xs py-2 px-3.5 rounded-xl backdrop-blur-md transition shadow-md flex items-center gap-1.5"
              >
                View All {property.images.length} Photos
              </button>

              {property.videoUrl && (
                <div className="absolute bottom-4 left-4 bg-black/70 text-white font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Virtual Video Tour Available</span>
                </div>
              )}
            </div>

            {/* Side Thumbnail Stack (1 col on large) */}
            <div className="hidden lg:grid grid-cols-1 gap-3 h-[480px]">
              {property.images.slice(1, 4).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActivePhotoIndex(idx + 1);
                    openFullscreenGallery(idx + 1);
                  }}
                  className="relative rounded-xl overflow-hidden cursor-pointer group bg-neutral-900 h-[152px]"
                >
                  <img
                    src={img}
                    alt={`Photo thumbnail ${idx + 2}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {idx === 2 && property.images.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm">
                      +{property.images.length - 4} More
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Thumbnail Strip */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-2">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIndex(idx)}
                className={`relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                  idx === activePhotoIndex ? 'border-slate-950' : 'border-transparent opacity-70'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* 2. MAIN LAYOUT: DETAILS & CONTACT SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Property Details (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header: Title, Price & Address */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    {property.propertyType} in Mukono
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-1 font-serif-display">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{property.locationDetails}, {property.area}, Mukono District, Uganda</span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight font-serif-display">
                    {formatUGX(property.price, property.listingType)}
                  </p>
                  <p className="text-xs font-semibold text-neutral-400 mt-0.5">
                    {property.listingType === 'Sale' ? 'Asking Price (Negotiable)' : 'Monthly Rental Rate'}
                  </p>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                {property.bedrooms > 0 && (
                  <div className="p-3 bg-neutral-50 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-700">
                      <Bed className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-base font-extrabold text-neutral-900">{property.bedrooms}</span>
                      <p className="text-[11px] font-semibold text-neutral-500">Bedrooms</p>
                    </div>
                  </div>
                )}

                {property.bathrooms > 0 && (
                  <div className="p-3 bg-neutral-50 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-700">
                      <Bath className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-base font-extrabold text-neutral-900">{property.bathrooms}</span>
                      <p className="text-[11px] font-semibold text-neutral-500">Bathrooms</p>
                    </div>
                  </div>
                )}

                {property.parkingSpaces > 0 && (
                  <div className="p-3 bg-neutral-50 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-700">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-base font-extrabold text-neutral-900">{property.parkingSpaces}</span>
                      <p className="text-[11px] font-semibold text-neutral-500">Garages / Parking</p>
                    </div>
                  </div>
                )}

                {(property.sqft || property.plotSize) && (
                  <div className="p-3 bg-neutral-50 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-700">
                      <Maximize className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <span className="text-sm font-extrabold text-neutral-900 truncate">
                        {property.sqft ? `${property.sqft.toLocaleString()} sq ft` : property.plotSize}
                      </span>
                      <p className="text-[11px] font-semibold text-neutral-500">
                        {property.sqft ? 'House Area' : 'Plot Size'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Title Deed Status Badge */}
              {property.titleDeedStatus && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                  <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Land Title Status: <strong>{property.titleDeedStatus}</strong>. Free of legal encumbrances, registered in Mukono Zonal Land Registry.
                  </span>
                </div>
              )}
            </div>

            {/* Property Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 font-serif-display">
                Property Description
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Property Features & Amenities */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 font-serif-display">
                Property Features & Amenities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs font-semibold text-neutral-800"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 font-serif-display">
                  Location & Neighborhood
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Approximate geolocation in {property.area}, Mukono. Exact street address provided upon scheduling viewing.
                </p>
              </div>

              <div className="h-72 w-full rounded-xl overflow-hidden border border-neutral-200">
                <InteractiveMap
                  properties={[property]}
                  highlightedPropertyId={property.id}
                  className="h-full w-full"
                />
              </div>
            </div>

            {/* Trust, Safety and Anti-Fraud Banner */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Buyer & Tenant Protection Notice</span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Do not transfer money via Mobile Money (Airtel Money or MTN MoMo) to anyone prior to an in-person viewing and conducting an official search on the duplicate certificate of title at the <strong>Ministry Zonal Office (MZO) in Mukono</strong>. Sheltered staff will accompany you on your viewing.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalProperty(property)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
                >
                  Report suspicious listing or incorrect info →
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Agent Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-lg space-y-6">
              {/* Agent Profile Summary */}
              <div className="flex items-center gap-4 pb-4 border-b border-neutral-100">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-neutral-900">{agent.name}</h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-neutral-500">{agent.company}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {agent.experienceYears} yrs experience in Mukono
                  </p>
                </div>
              </div>

              {/* Schedule Viewing CTA */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setScheduleModalProperty(property)}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Schedule Physical Viewing</span>
                </button>

                {/* Instant WhatsApp & Call Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={telUrl}
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Agent</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setContactModalProperty(property)}
                  className="w-full border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold py-2.5 rounded-xl transition text-center"
                >
                  Send Online Message / Enquiry
                </button>
              </div>

              {/* Agency Guarantees */}
              <div className="text-[11px] text-neutral-500 space-y-1.5 pt-2 border-t border-neutral-100">
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Licensed Mukono real estate firm</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Title search assistance provided</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero upfront viewing fees</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIMILAR HOMES IN MUKONO */}
        {similarHomes.length > 0 && (
          <div className="mt-16 pt-12 border-t border-neutral-200">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-neutral-900 font-serif-display">
                More Homes in {property.area}
              </h3>
              <p className="text-xs text-neutral-500">
                Other verified properties available in the immediate neighborhood.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarHomes.map((simProp) => (
                <PropertyCard key={simProp.id} property={simProp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
