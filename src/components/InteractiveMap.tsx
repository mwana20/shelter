import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Property } from '../types';
import { formatUGX, formatCompactUGX } from '../utils/format';
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

    // Center on Mukono Municipality: ~0.3533, 32.7554
    const map = L.map(mapContainerRef.current, {
      center: [0.3533, 32.7554],
      zoom: 12,
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
      const priceText = formatCompactUGX(prop.price, prop.listingType);
      const isSale = prop.listingType === 'Sale';

      const customIcon = L.divIcon({
        className: 'custom-map-marker-container',
        html: `
          <div class="cursor-pointer transition-transform duration-200 hover:scale-110 ${isSelected ? 'scale-115 z-50' : ''}" style="white-space: nowrap;">
            <div style="background-color: ${isSelected ? '#0f172a' : isSale ? '#047857' : '#0284c7'}; color: white; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 2px solid white; display: flex; align-items: center; gap: 4px;">
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
          <div style="position: relative; height: 130px; width: 100%; overflow: hidden;">
            <img src="${prop.images[0]}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 8px; left: 8px; background: rgba(15, 23, 42, 0.85); color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
              ${prop.listingType === 'Sale' ? 'For Sale' : 'For Rent'}
            </span>
          </div>
          <div style="padding: 12px;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">
              ${formatUGX(prop.price, prop.listingType)}
            </div>
            <div style="font-size: 12px; font-weight: 600; color: #334155; line-height: 1.3; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${prop.title}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
              📍 ${prop.area}, Mukono
            </div>
            <div style="display: flex; gap: 8px; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 10px;">
              ${prop.bedrooms > 0 ? `<span>🛏️ ${prop.bedrooms} Beds</span>` : ''}
              ${prop.bathrooms > 0 ? `<span>🚿 ${prop.bathrooms} Baths</span>` : ''}
            </div>
            <button id="view-prop-btn-${prop.id}" style="width: 100%; background: #0f172a; color: white; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; border: none; cursor: pointer; text-align: center;">
              View Details →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-prop-btn-${prop.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectProperty) onSelectProperty(prop.id);
            openPropertyDetail(prop.id);
          };
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
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [properties, highlightedPropertyId, onSelectProperty, openPropertyDetail]);

  // Pan to highlighted property if set
  useEffect(() => {
    if (!highlightedPropertyId || !mapInstanceRef.current) return;
    const targetProp = properties.find((p) => p.id === highlightedPropertyId);
    if (targetProp && targetProp.coordinates) {
      mapInstanceRef.current.panTo([targetProp.coordinates.lat, targetProp.coordinates.lng], {
        animate: true,
        duration: 0.6
      });
      const marker = markersRef.current[highlightedPropertyId];
      if (marker && !marker.isPopupOpen()) {
        marker.openPopup();
      }
    }
  }, [highlightedPropertyId, properties]);

  return (
    <div className={`relative ${className} rounded-2xl overflow-hidden shadow-inner border border-neutral-200`}>
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-neutral-200 text-xs font-semibold text-neutral-700 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
        Mukono District, Uganda
      </div>
    </div>
  );
};
