"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";

export interface Coords { lat: number; lng: number; accuracy?: number }

export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        setCoords(c);
        setError(null);
        setLoading(false);

        // push to backend (fire-and-forget)
        const supabase = createClient();
        supabase.rpc("update_my_location", { lat: c.lat, lng: c.lng }).then(() => {});
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
    // refresh every 2 minutes while app is open
    const id = setInterval(requestLocation, 120_000);
    return () => clearInterval(id);
  }, [requestLocation]);

  return { coords, error, loading, refresh: requestLocation };
}
