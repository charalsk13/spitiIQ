import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapView = ({ apartments }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [37.9838, 23.7275], // Athens as default
        zoom: 6,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);
    }

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const valid = apartments.filter((a) => a.lat && a.lng);
    valid.forEach((a) => {
      const marker = L.marker([a.lat, a.lng]).addTo(mapInstanceRef.current);
      marker.bindPopup(`<b>${a.title || a.address || "Διαμέρισμα"}</b><br/>${a.address || ""}`);
      markersRef.current.push(marker);
    });

    if (valid.length > 0) {
      const bounds = L.latLngBounds(valid.map((a) => [a.lat, a.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      markersRef.current.forEach((m) => m.remove());
    };
  }, [apartments]);

  return <div ref={mapRef} className="map-container" aria-label="Χάρτης διαμερισμάτων" />;
};

export default MapView;
