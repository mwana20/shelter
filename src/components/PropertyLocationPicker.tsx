import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PropertyLocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (location: { lat: number; lng: number }) => void;
}

const defaultCenter: L.LatLngExpression = [1.0784, 34.1756];

export const PropertyLocationPicker: React.FC<PropertyLocationPickerProps> = ({
  latitude,
  longitude,
  onChange
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const hasLocation = latitude !== null && longitude !== null;
    const map = L.map(containerRef.current, {
      center: hasLocation ? [latitude, longitude] : defaultCenter,
      zoom: hasLocation ? 15 : 5
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const placeMarker = (location: L.LatLng) => {
      if (!markerRef.current) {
        markerRef.current = L.marker(location, {
          draggable: true,
          icon: L.divIcon({
            className: 'property-location-marker',
            html: '<span style="display:block;width:18px;height:18px;border:3px solid white;border-radius:50%;background:#dc2626;box-shadow:0 1px 5px #475569"></span>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          })
        }).addTo(map);
        markerRef.current.on('dragend', () => {
          const position = markerRef.current?.getLatLng();
          if (position) onChangeRef.current({ lat: position.lat, lng: position.lng });
        });
      } else {
        markerRef.current.setLatLng(location);
      }
      onChangeRef.current({ lat: location.lat, lng: location.lng });
    };

    if (hasLocation) {
      placeMarker(L.latLng(latitude, longitude));
    }

    map.on('click', (event: L.LeafletMouseEvent) => placeMarker(event.latlng));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || latitude === null || longitude === null) return;
    const location = L.latLng(latitude, longitude);
    if (!markerRef.current) {
      markerRef.current = L.marker(location, { draggable: true }).addTo(map);
    } else {
      markerRef.current.setLatLng(location);
    }
  }, [latitude, longitude]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Map for choosing the property location"
      className="h-72 w-full overflow-hidden rounded-lg border border-slate-300"
    />
  );
};
