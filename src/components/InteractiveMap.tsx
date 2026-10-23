import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Property } from '../types';
import { formatCompactPrice, formatPrice } from '../utils/currency';
import { useApp } from '../context/AppContext';

interface InteractiveMapProps {
  properties: Property[];
  highlightedPropertyId?: string | null;
  onSelectProperty?: (id: string) => void;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  highlightedPropertyId,
  onSelectProperty,
  className = 'h-full w-full'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const { openPropertyDetail } = useApp();

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center on East Africa (Mbale HQ vicinity): ~1.0784, 34.1756
    const map = L.map(mapContainerRef.current, {
      center: [1.0784, 34.1756],
      zoom: 3,
      scrollWheelZoom: true,
      zoomControl: true
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const validProps = properties.filter((p) => p.coordinates && p.coordinates.lat && p.coordinates.lng);
    if (validProps.length === 0) return;

    const bounds = L.latLngBounds([]);

    validProps.forEach((prop) => {
      const isSelected = highlightedPropertyId === prop.id;
      const priceText = formatCompactPrice(prop.price, prop.currency, prop.listingType, prop.rentalPeriod);
      const isSale = prop.listingType === 'Sale';

      const customIcon = L.divIcon({
        className: 'custom-map-marker-container',
        html: `
          <div class="cursor-pointer transition-transform duration-200 hover:scale-110 ${isSelected ? 'scale-115 z-50' : ''}" style="white-space: nowrap;">
            <div style="background-color: ${isSelected ? '#0f172a' : isSale ? '#0f172a' : '#047857'}; color: white; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 2px solid white; display: flex; align-items: center; gap: 4px;">
              <span>${priceText}</span>
            </div>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 15]
      });

      const marker = L.marker([prop.coordinates.lat, prop.coordinates.lng], { icon: customIcon });

      // Build popup HTML
      const popupHtml = `
        <div style="width: 240px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="position: relative; height: 130px; width: 100%; overflow: hidden; border-radius: 8px 8px 0 0;">
            <img src="${prop.images[0]}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 8px; left: 8px; background: rgba(15, 23, 42, 0.85); color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
              ${prop.listingType}
            </span>
          </div>
          <div style="padding: 12px;">
            <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">
              ${prop.country} · ${prop.propertyType}
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${prop.title}
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 4px;">
              ${formatPrice(prop.price, prop.currency, prop.listingType, prop.rentalPeriod)}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              ${prop.bedrooms > 0 ? `${prop.bedrooms} Beds · ` : ''}${prop.neighborhood || prop.district}
            </div>
            <button id="map-popup-btn-${prop.id}" style="width: 100%; margin-top: 8px; padding: 6px; background-color: #0f172a; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              View Property Details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 260,
        className: 'sheltered-property-popup'
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`map-popup-btn-${prop.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            openPropertyDetail(prop.id);
          });
        }
      });

      marker.on('click', () => {
        if (onSelectProperty) onSelectProperty(prop.id);
      });

      marker.addTo(map);
      markersRef.current[prop.id] = marker;
      bounds.extend([prop.coordinates.lat, prop.coordinates.lng]);
    });

    if (validProps.length > 0) {
      if (validProps.length === 1) {
        map.setView([validProps[0].coordinates.lat, validProps[0].coordinates.lng], 13);
      } else {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    }
  }, [properties, highlightedPropertyId, onSelectProperty, openPropertyDetail]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-md backdrop-blur-xs font-semibold">
        Global Map View · HQ Mbale, Uganda
      </div>
    </div>
  );
};
