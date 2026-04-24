import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  userLocation: {
    lat: number;
    lng: number;
  };
  requests: Array<{
    id: string;
    activity: string;
    distance_m: number;
    note: string | null;
  }>;
  getActivityEmoji: (activity: string) => string;
}

export default function MapComponent({
  userLocation,
  requests,
  getActivityEmoji,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map
    const map = L.map(mapRef.current).setView(
      [userLocation.lat, userLocation.lng],
      13
    );

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add user marker
    const userIcon = L.divIcon({
      html: `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #000000;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
        ">
          📍
        </div>
      `,
      iconSize: [32, 32],
      className: "user-marker",
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup("<strong>You are here</strong>");

    // Add request markers
    requests.forEach((req, index) => {
      // Random offset for demo (in real app, use actual coordinates)
      const offsetLat = (Math.random() - 0.5) * 0.05;
      const offsetLng = (Math.random() - 0.5) * 0.05;

      const requestIcon = L.divIcon({
        html: `
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #000000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            cursor: pointer;
          ">
            ${getActivityEmoji(req.activity)}
          </div>
        `,
        iconSize: [40, 40],
        className: "request-marker",
      });

      const marker = L.marker(
        [userLocation.lat + offsetLat, userLocation.lng + offsetLng],
        { icon: requestIcon }
      ).addTo(map);

      // Popup content
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif;">
          <strong style="font-size: 16px; text-transform: capitalize;">${req.activity}</strong><br>
          <small style="color: #666;">
            ${Math.round(req.distance_m / 100) * 100}m away<br>
            ${req.note ? `Note: ${req.note}` : "No note"}
          </small>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [userLocation, requests, getActivityEmoji]);

  return (
    <div
      ref={mapRef}
      className="rounded-xl overflow-hidden mb-6 h-64 sm:h-96 border-2 border-gray-200 z-0"
      style={{ position: "relative" }}
    />
  );
}