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
  ArrowLeft,
  Check,
  FileCheck,
  Video,
  CreditCard
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDisplayPrice, getWhatsAppLink, getTelLink } from '../utils/format';
import { PropertyCard } from '../components/PropertyCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { getLocalizedPropertyDescription, getLocalizedAmenity } from '../i18n/propertyDescriptions';

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
    openCheckout,
    userCurrency,
    userLanguage,
    showNotification,
    t
  } = useApp();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const property = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  if (!property) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-neutral-500">Property not found.</p>
        <button
          onClick={() => setCurrentPage('search')}
          className="mt-4 bg-slate-900 text-white text-xs font-semibold py-2 px-4 rounded-xl cursor-pointer"
        >
          {t('back_to_listings')}
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
      showNotification(t('link_copied_msg'), 'success');
    }
  };

  const openFullscreenGallery = (index: number = 0) => {
    setGalleryModalData({ images: property.images, initialIndex: index });
  };

  const priceObj = formatDisplayPrice(
    property.price,
    property.currency,
    userCurrency,
    property.listingType
  );

  // Localized property type label
  const localizedPropertyType = (() => {
    switch (property.propertyType) {
      case 'House':
        return t('cat_house');
      case 'Apartment':
        return t('cat_apartment');
      case 'Villa':
        return t('cat_villa');
      case 'Townhouse':
        return t('cat_townhouse');
      case 'Residential Land':
        return t('cat_land');
      case 'Commercial Property':
        return t('cat_commercial');
      case 'Farm & Agricultural Land':
        return t('cat_farm');
      case 'Industrial Property':
        return t('cat_industrial');
      case 'Holiday Home':
        return t('cat_holiday');
      default:
        return property.propertyType;
    }
  })();

  // Localized property description that changes when language changes
  const localizedDescription = getLocalizedPropertyDescription(
    property.id,
    userLanguage,
    property.description
  );

  // Localized amenity label
  const translateAmenity = (name: string): string => {
    return getLocalizedAmenity(name, userLanguage);
  };

  // Similar properties
  const similarHomes = properties
    .filter((p) => p.id !== property.id && (p.district === property.district || p.country === property.country))
    .slice(0, 3);

  return (
    <div className="bg-neutral-50/40 pb-20">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-neutral-200/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                setCurrentPage('search');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_listings')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t('share_property')}</span>
            </button>
            <button
              onClick={() => toggleCompareProperty(property.id)}
              className={`flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-xl border transition cursor-pointer ${
                compared ? 'bg-slate-900 text-white border-slate-900' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{compared ? t('compare_btn') : t('compare_btn')}</span>
            </button>
            <button
              onClick={() => toggleSaveProperty(property.id)}
              className={`flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-xl border transition cursor-pointer ${
                saved ? 'bg-rose-50 text-rose-700 border-rose-300' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{saved ? t('saved_btn') : t('save_btn')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* 1. MEDIA GALLERY */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                {t('verified_photos_badge')}
              </span>
              <span className="text-xs text-neutral-500">
                {t('photo_counter_label')} {activePhotoIndex + 1} {t('of_label')} {property.images.length}
              </span>
            </div>
            {property.videoUrl && (
              <a
                href="#property-video-section"
                className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1.5 transition"
              >
                <Video className="w-4 h-4 text-emerald-600" />
                <span>{t('jump_to_video')}</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* Main Stage Image (takes 3 cols on large) */}
            <div
              onClick={() => openFullscreenGallery(activePhotoIndex)}
              className="lg:col-span-3 relative h-[360px] sm:h-[480px] rounded-3xl overflow-hidden cursor-pointer group bg-neutral-900 shadow-md"
            >
              <img
                src={property.images[activePhotoIndex]}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

              {/* Status and Type Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-950/90 text-white shadow-sm backdrop-blur-md">
                  {property.listingType === 'Sale'
                    ? t('for_sale')
                    : property.listingType === 'Rent'
                    ? t('for_rent')
                    : t('for_lease')}
                </span>
                {property.verified && (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-600/90 text-white shadow-sm backdrop-blur-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('verified_title_badge')}</span>
                  </span>
                )}
                {property.status !== 'Available' && (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                    {property.status}
                  </span>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                type="button"
                className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-slate-950 font-bold text-xs py-2 px-4 rounded-xl backdrop-blur-md transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('fullscreen_gallery_btn')} ({property.images.length} {t('photos_label')})</span>
              </button>
            </div>

            {/* Side 4 Thumbnail Stack */}
            <div className="hidden lg:grid grid-cols-1 gap-2.5 h-[480px]">
              {property.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActivePhotoIndex(idx);
                    openFullscreenGallery(idx);
                  }}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer group bg-neutral-900 h-[114px] border-2 transition ${
                    idx === activePhotoIndex ? 'border-emerald-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Photo thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute bottom-1 right-2 text-[10px] font-bold text-white bg-black/60 px-1.5 rounded">
                    #{idx + 1}
                  </span>
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
                className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      {localizedPropertyType}
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-xs font-medium text-neutral-500">
                      {property.district}, {property.country}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-1 font-serif-display">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{property.locationDetails}, {property.district}, {property.country}</span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight font-serif-display">
                    {priceObj.text}
                  </p>
                  {priceObj.subtext && (
                    <p className="text-xs font-semibold text-neutral-400 mt-0.5">
                      {priceObj.subtext}
                    </p>
                  )}
                  {property.priceNegotiable && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                      {t('price_negotiable')}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-1">
                {property.bedrooms > 0 && (
                  <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-700">
                      <Bed className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-base font-extrabold text-neutral-900">{property.bedrooms}</span>
                      <p className="text-[11px] font-semibold text-neutral-500">{t('bedrooms_spec')}</p>
                    </div>
                  </div>
                )}

                {property.bathrooms > 0 && (
                  <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-700">
                      <Bath className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-base font-extrabold text-neutral-900">{property.bathrooms}</span>
                      <p className="text-[11px] font-semibold text-neutral-500">{t('bathrooms_spec')}</p>
                    </div>
                  </div>
                )}

                {property.parkingSpaces > 0 && (
                  <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-700">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-base font-extrabold text-neutral-900">{property.parkingSpaces}</span>
                      <p className="text-[11px] font-semibold text-neutral-500">{t('parking_spec')}</p>
                    </div>
                  </div>
                )}

                {(property.sqft || property.plotSize) && (
                  <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-700">
                      <Maximize className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <span className="text-sm font-extrabold text-neutral-900 truncate">
                        {property.sqft ? `${property.sqft.toLocaleString()} ${t('sqft_label')}` : property.plotSize}
                      </span>
                      <p className="text-[11px] font-semibold text-neutral-500">
                        {property.sqft ? t('building_area') : t('plot_size')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Title Deed Status Badge */}
              {property.titleDeedStatus && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900">
                  <FileCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <strong className="block text-emerald-950 font-bold">
                      {t('legal_ownership_title')}: {property.titleDeedStatus}
                    </strong>
                    <span className="text-emerald-800 text-[11px]">
                      {t('legal_ownership_desc')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. DEDICATED PROPERTY VIDEO PLAYER */}
            <div id="property-video-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 font-serif-display flex items-center gap-2">
                    <Video className="w-5 h-5 text-emerald-600" />
                    <span>{t('video_tour_title')}</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {t('video_tour_desc')}
                  </p>
                </div>
                <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded-md">
                  HD Stream
                </span>
              </div>

              {property.videoUrl ? (
                <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-black shadow-lg border border-neutral-800">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&controls=1&rel=0"
                    title={property.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-500">
                  Video tour currently being processed.
                </div>
              )}
            </div>

            {/* Property Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 font-serif-display">
                {t('property_desc_title')}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {localizedDescription}
              </p>
            </div>

            {/* Property Features & Amenities */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 font-serif-display">
                {t('property_features_title')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs font-semibold text-neutral-800"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{translateAmenity(feature)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 font-serif-display">
                  {t('location_map_title')}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {t('approx_location_desc')} ({property.district}, {property.country})
                </p>
              </div>

              <div className="h-72 w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-inner">
                <InteractiveMap
                  properties={[property]}
                  highlightedPropertyId={property.id}
                  className="h-full w-full"
                />
              </div>
            </div>

            {/* Trust, Safety and Anti-Fraud Banner */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>{t('buyer_protection_title')}</span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                {t('buyer_protection_desc')}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setReportModalProperty(property)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  {t('report_listing_btn')}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openCheckout({
                      purpose: 'verification_inspection',
                      title: `Official Title Search & Due Diligence (${property.title})`,
                      amount: 95000,
                      propertyId: property.id
                    })
                  }
                  className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t('request_title_search')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Agent Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xl space-y-6">
              {/* Agent Profile Summary */}
              <div className="flex items-center gap-4 pb-4 border-b border-neutral-100">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-neutral-900">{agent.name}</h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-neutral-500">{agent.company}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    {agent.areaSpecialty}
                  </p>
                </div>
              </div>

              {/* Schedule Viewing CTA */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setScheduleModalProperty(property)}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{t('schedule_site_visit')}</span>
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
                    <span>{t('call_direct')}</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setContactModalProperty(property)}
                  className="w-full border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold py-2.5 rounded-xl transition text-center cursor-pointer"
                >
                  {t('send_enquiry_btn')}
                </button>
              </div>

              {/* Agency Guarantees */}
              <div className="text-[11px] text-neutral-500 space-y-1.5 pt-2 border-t border-neutral-100">
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{t('licensed_firm')}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{t('title_search_verified')}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{t('zero_viewing_fees')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIMILAR HOMES */}
        {similarHomes.length > 0 && (
          <div className="mt-16 pt-12 border-t border-neutral-200">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-neutral-900 font-serif-display">
                {t('similar_properties_title')}
              </h3>
              <p className="text-xs text-neutral-500">
                {t('similar_properties_desc')}
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
