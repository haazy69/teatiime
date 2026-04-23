"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import type { Coords } from "@/hooks/useLocation";
import type { NearbyRequest } from "@/types";

// Lazy load to avoid SSR issues
const Map = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

interface MapViewProps {
  userCoords?: Coords | null;
  requests: NearbyRequest[];
  onRequestClick?: (request: NearbyRequest) => void;
}

// Custom pin icons
const createIcon = (emoji: string) => {
  const html = `
    <div style="
      width: 44px;
      height: 44px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(10, 10, 10, 0.15);
      border: 2px solid #0a0a0a;
    ">
      ${emoji}
    </div>
  `;

  return L.divIcon({ html, iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -22] });
};

const userIcon = createIcon("📍");

const activityEmojis: Record<string, string> = {
  tea: "🍵",
  coffee: "☕",
  smoke: "🚬",
  lunch: "🍱",
  snacks: "🥟",
  walk: "🚶",
};

export default function MapView({ userCoords, requests, onRequestClick }: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !userCoords) {
    return (
      <div className="w-full h-full bg-paper flex items-center justify-center text-smoke text-sm">
        Loading map...
      </div>
    );
  }

  return (
    <Map center={[userCoords.lat, userCoords.lng]} zoom={16} className="h-full w-full rounded-2xl overflow-hidden">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
        maxZoom={19}
      />

      {/* your location */}
      <Marker position={[userCoords.lat, userCoords.lng]} icon={userIcon}>
        <Popup>
          <div className="text-xs font-medium">You are here</div>
        </Popup>
      </Marker>

      {/* nearby requests */}
      {requests.map((req) => (
        <Marker
          key={req.id}
          position={[req.lat, req.lng]}
          icon={createIcon(activityEmojis[req.activity] || "☕")}
          eventHandlers={{
            click: () => onRequestClick?.(req),
          }}
        >
          <Popup>
            <div className="text-center">
              <p className="font-medium text-sm">{req.creator_name}</p>
              <p className="text-xs text-smoke">{req.activity}</p>
              <p className="text-[11px] text-ash mt-1">{Math.round(req.distance_m)}m away</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </Map>
  );
}
