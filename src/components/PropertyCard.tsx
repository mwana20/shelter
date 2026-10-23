import React, { useState } from 'react';
import {
  Heart,
  Bed,
  Bath,
  Maximize,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Scale,
  Car,
  Video
} from 'lucide-react';
import { Property } from '../types';
import { formatDisplayPrice } from '../utils/format';
import { useApp } from '../context/AppContext';

interface PropertyCardProps {
  property: Property;
  onHover?: (id: string | null) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onHover }) => {
  const {
    openPropertyDetail,
    toggleSaveProperty,
    isSaved,
    toggleCompareProperty,
    isCompared,
    userCurrency,
    t
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const saved = isSaved(property.id);
  const compared = isCompared(property.id);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : property.images.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < property.images.length - 1 ? prev + 1 : 0));
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveProperty(property.id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompareProperty(property.id);
  };

  const isSoldOrRented =
    property.status === 'Sold' || property.status === 'Rented' || property.status === 'Leased';

  const priceObj = formatDisplayPrice(
    property.price,
    property.currency,
    userCurrency,
    property.listingType
  );

  return (
    <div
      onMouseEnter={() => onHover && onHover(property.id)}
      onMouseLeave={() => onHover && onHover(null)}
      onClick={() => openPropertyDetail(property.id)}
      className="group cursor-pointer rounded-3xl bg-white border border-neutral-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1.5"
    >
      {/* Property Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-900">
        <img
          src={property.images[activeImageIndex] || property.images[0]}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Status & Badges Overlay */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          <span
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg backdrop-blur-md shadow-xs ${
              property.listingType === 'Sale'
                ? 'bg-slate-950/90 text-white'
                : property.listingType === 'Rent'
                ? 'bg-emerald-700/90 text-white'
                : 'bg-indigo-700/90 text-white'
            }`}
          >
            {property.listingType === 'Sale'
              ? t('search_buy')
              : property.listingType === 'Rent'
              ? t('search_rent')
              : t('search_lease')}
          </span>

          {property.isNew && (
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-amber-500 text-slate-950 shadow-xs">
              NEW
            </span>
          )}

          {isSoldOrRented && (
            <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-rose-600 text-white">
              {property.status}
            </span>
          )}
        </div>

        {/* Favorite & Compare Action Buttons */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={handleCompareClick}
            title={compared ? 'Remove from comparison' : 'Compare property'}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
              compared
                ? 'bg-slate-900 text-white ring-2 ring-white'
                : 'bg-white/90 text-neutral-700 hover:bg-white hover:text-neutral-900'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleFavoriteClick}
            title={saved ? 'Remove from saved' : 'Save property'}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
              saved
                ? 'bg-rose-600 text-white ring-2 ring-white'
                : 'bg-white/90 text-neutral-700 hover:bg-white hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Multi-image Arrows (appear on hover when multiple images exist) */}
        {property.images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handlePrevImage}
              className="p-1.5 rounded-full bg-white/90 text-neutral-800 hover:bg-white shadow-md hover:scale-105 transition"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="p-1.5 rounded-full bg-white/90 text-neutral-800 hover:bg-white shadow-md hover:scale-105 transition"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 5-Photo Indicator & Video Badge */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 z-10">
          {property.videoUrl && (
            <span className="bg-slate-950/80 text-emerald-400 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide flex items-center gap-1 backdrop-blur-xs">
              <Video className="w-3 h-3" />
              <span>{t('video_badge')}</span>
            </span>
          )}
          <span className="bg-black/70 text-white px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide backdrop-blur-xs">
            {activeImageIndex + 1}/{property.images.length} {t('photos_label')}
          </span>
        </div>

        {/* Verified Badge */}
        {property.verified && (
          <div className="absolute bottom-2.5 left-3 bg-emerald-600/95 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('title_verified')}</span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price Header */}
          <div className="mb-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-extrabold tracking-tight text-neutral-900 font-serif-display">
                {priceObj.text}
              </h3>
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-100 px-2 py-0.5 rounded-md">
                {property.propertyType}
              </span>
            </div>
            {priceObj.subtext && (
              <p className="text-[11px] text-neutral-400 font-medium">
                {priceObj.subtext}
              </p>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm sm:text-base font-bold text-neutral-800 line-clamp-1 mb-1.5 group-hover:text-emerald-700 transition-colors">
            {property.title}
          </h4>

          {/* Location */}
          <div className="flex items-center text-xs text-neutral-500 mb-3.5 gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              <strong className="text-neutral-800">{property.country}</strong> · {property.neighborhood || property.district || property.region}
            </span>
          </div>

          {/* Specs Row */}
          <div className="flex items-center gap-4 text-xs font-medium text-neutral-600 pb-3 border-b border-neutral-100">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  <strong className="text-neutral-800">{property.bedrooms}</strong> {t('beds_label')}
                </span>
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  <strong className="text-neutral-800">{property.bathrooms}</strong> {t('baths_label')}
                </span>
              </span>
            )}
            {property.sqft ? (
              <span className="flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  <strong className="text-neutral-800">{property.sqft.toLocaleString()}</strong> {t('sqft_label')}
                </span>
              </span>
            ) : property.plotSize ? (
              <span className="flex items-center gap-1.5 truncate">
                <Maximize className="w-3.5 h-3.5 text-neutral-400" />
                <span className="truncate">{property.plotSize}</span>
              </span>
            ) : null}
            {property.parkingSpaces > 0 && (
              <span className="flex items-center gap-1.5 hidden sm:flex">
                <Car className="w-3.5 h-3.5 text-neutral-400" />
                <span>{property.parkingSpaces}</span>
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs text-neutral-500 line-clamp-2 mt-2.5 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3.5 flex items-center gap-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openPropertyDetail(property.id);
            }}
            className="flex-1 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition text-center shadow-xs cursor-pointer"
          >
            {t('view_property_btn')}
          </button>
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`py-2 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer ${
              saved
                ? 'border-rose-300 bg-rose-50 text-rose-700'
                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {saved ? t('saved_btn') : t('save_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};
