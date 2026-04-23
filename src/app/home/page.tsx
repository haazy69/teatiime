"use client";
import { useState, useEffect } from "react";
import { unstable_noStore } from "next/cache";
import { createClient } from "@/lib/supabase-browser";
import { useLocation } from "@/hooks/useLocation";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import MapView from "@/components/MapView";
import CreateRequestSheet from "@/components/CreateRequestSheet";
import IncomingRequestPopup from "@/components/IncomingRequestPopup";
import BottomNav from "@/components/BottomNav";
import { Plus, Loader } from "lucide-react";
import type { NearbyRequest, Profile } from "@/types";

unstable_noStore();

export default function HomePage() {
  const { coords, loading: locationLoading } = useLocation();
  const [requests, setRequests] = useState<NearbyRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NearbyRequest | null>(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const { notifications, latest, dismissLatest } = useRealtimeNotifications(profile?.id || null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // load profile
  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, []);

  // fetch nearby requests
  useEffect(() => {
    if (!coords) return;

    const fetchRequests = async () => {
      setRequestsLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.rpc("requests_nearby", {
        lat: coords.lat,
        lng: coords.lng,
        radius_m: 2000,
      });

      setRequestsLoading(false);

      if (!error && data) {
        setRequests(data);
      }
    };

    fetchRequests();

    // refresh every 10 seconds
    const id = setInterval(fetchRequests, 10_000);
    return () => clearInterval(id);
  }, [coords]);

  // realtime updates to requests
  useEffect(() => {
    if (!profile?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel("requests:all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests" },
        () => {
          // refetch on any change
          if (coords) {
            supabase
              .rpc("requests_nearby", {
                lat: coords.lat,
                lng: coords.lng,
                radius_m: 2000,
              })
              .then(({ data }) => {
                if (data) setRequests(data);
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coords, profile?.id]);

  // find request object for incoming notification
  const latestRequest = latest?.request_id ? requests.find((r) => r.id === latest.request_id) : null;

  return (
    <main className="h-screen grid md:grid-cols-3 gap-0">
      {/* Map - takes 2 columns on desktop */}
      <div className="md:col-span-2 relative h-screen md:h-auto">
        {locationLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-paper z-40">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-ink mx-auto mb-3" />
              <p className="text-sm text-smoke">Getting your location...</p>
            </div>
          </div>
        ) : (
          <MapView
            userCoords={coords}
            requests={requests}
            onRequestClick={setSelectedRequest}
          />
        )}

        {/* create button - floating */}
        <button
          onClick={() => setShowCreateSheet(true)}
          className="absolute bottom-24 md:bottom-4 right-4 z-40 w-16 h-16 rounded-full bg-ember text-cream shadow-deep flex items-center justify-center hover:shadow-lift transition-shadow active:scale-95"
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* loading indicator */}
        {requestsLoading && (
          <div className="absolute top-4 left-4 z-40 card px-3 py-2 flex items-center gap-2">
            <Loader className="w-3 h-3 animate-spin text-ink" />
            <span className="text-xs font-medium text-smoke">Updating...</span>
          </div>
        )}

        {/* selected request detail card */}
        {selectedRequest && (
          <div className="absolute bottom-20 left-4 right-4 z-40 card p-4 animate-slide-up md:hidden">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-cream text-lg">
                  {["tea", "coffee", "lunch", "snacks", "smoke", "walk"].includes(selectedRequest.activity)
                    ? (
                        {
                          tea: "🍵",
                          coffee: "☕",
                          lunch: "🍱",
                          snacks: "🥟",
                          smoke: "🚬",
                          walk: "🚶",
                        } as Record<string, string>
                      )[selectedRequest.activity]
                    : "☕"}
                </div>
                <p className="font-medium text-ink">{selectedRequest.creator_name}</p>
              </div>
              {selectedRequest.note && <p className="text-sm text-smoke">{selectedRequest.note}</p>}
            </div>
            <p className="text-xs text-ash mb-3">
              {Math.round(selectedRequest.distance_m)}m away • {selectedRequest.participant_count} joined
            </p>
            <button
              onClick={() => {
                setSelectedRequest(null);
                setShowCreateSheet(false);
              }}
              className="btn-primary btn-ember w-full text-sm"
            >
              Join them →
            </button>
          </div>
        )}
      </div>

      {/* Sidebar - requests list on desktop */}
      <div className="hidden md:flex flex-col bg-bone border-l border-ink/10 h-screen">
        {/* Header */}
        <div className="p-4 border-b border-ink/10">
          <h2 className="font-display text-lg">Nearby</h2>
          <p className="text-xs text-ash mt-1">{requests.length} active</p>
        </div>

        {/* Requests list */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1 no-scrollbar">
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-ash">No one nearby yet</p>
              <p className="text-xs text-ash/60 mt-2">Try creating a request to start</p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`card p-3 cursor-pointer transition-all ${
                  selectedRequest?.id === req.id
                    ? "ring-2 ring-ember bg-cream"
                    : "hover:shadow-lift"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-cream text-sm flex-shrink-0">
                    {["tea", "coffee", "lunch", "snacks", "smoke", "walk"].includes(req.activity)
                      ? (
                          {
                            tea: "🍵",
                            coffee: "☕",
                            lunch: "🍱",
                            snacks: "🥟",
                            smoke: "🚬",
                            walk: "🚶",
                          } as Record<string, string>
                        )[req.activity]
                      : "☕"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-ink truncate">{req.creator_name}</p>
                    <p className="text-xs text-ash truncate">{Math.round(req.distance_m)}m away</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <span className="chip text-xs">{req.activity}</span>
                      {req.participant_count > 0 && (
                        <span className="chip text-xs bg-matcha/10 text-matcha">
                          +{req.participant_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom nav - mobile only */}
      <BottomNav className="md:hidden" unreadCount={unreadCount} />

      {/* sheets + popups */}
      <CreateRequestSheet
        isOpen={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        userCoords={coords}
        onSuccess={() => {
          // refresh requests
          if (coords) {
            const supabase = createClient();
            supabase
              .rpc("requests_nearby", {
                lat: coords.lat,
                lng: coords.lng,
                radius_m: 2000,
              })
              .then(({ data }) => {
                if (data) setRequests(data);
              });
          }
        }}
      />

      <IncomingRequestPopup
        notification={latest}
        request={latestRequest}
        onDismiss={dismissLatest}
      />
    </main>
  );
}
