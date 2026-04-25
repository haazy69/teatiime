"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { NearbyRequest } from "@/types";

// Fix Leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  userCoords: { lat: number; lng: number } | null;
  requests: NearbyRequest[];
  onRequestClick?: (request: NearbyRequest) => void;
}

export default function MapView({ userCoords, requests, onRequestClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !userCoords) return;

    // Clean up previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Create new map
    const map = L.map(mapRef.current).setView(
      [userCoords.lat, userCoords.lng],
      14
    );

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // User marker
    const userIcon = L.divIcon({
      html: `
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [24, 24],
      className: "user-marker",
    });

    L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup("<strong>You are here</strong>");

    // Request markers
    requests.forEach((req) => {
      const lat = (req as any).lat;
      const lng = (req as any).lng;

      if (lat && lng) {
        const activityEmojis: Record<string, string> = {
          tea: "🍵",
          coffee: "☕",
          lunch: "🍱",
          snacks: "🥟",
          smoke: "🚬",
          walk: "🚶",
        };

        const requestIcon = L.divIcon({
          html: `
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: #000000;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              cursor: pointer;
            ">
              ${activityEmojis[req.activity] || "☕"}
            </div>
          `,
          iconSize: [36, 36],
          className: "request-marker",
        });

        const marker = L.marker([lat, lng], { icon: requestIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: system-ui;">
              <strong style="text-transform: capitalize;">${req.activity}</strong>
              <br><small>${req.creator_name}</small>
              ${req.note ? `<br><small>${req.note}</small>` : ""}
            </div>`
          );

        if (onRequestClick) {
          marker.on("click", () => {
            onRequestClick(req);
          });
        }
      }
    });

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userCoords, requests, onRequestClick]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl"
      style={{ position: "relative", zIndex: 0, minHeight: "400px" }}
    />
  );
}