"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase-browser";
import { useLocation } from "@/hooks/useLocation";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import CreateRequestSheet from "@/components/CreateRequestSheet";
import IncomingRequestPopup from "@/components/IncomingRequestPopup";
import BottomNav from "@/components/BottomNav";
import ChatSheet from "@/components/ChatSheet";
import { Plus, Loader, MessageCircle } from "lucide-react";
import type { NearbyRequest, Profile } from "@/types";

// Dynamic import for MapView to prevent SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-paper">
      <div className="text-center">
        <Loader className="w-8 h-8 animate-spin text-ink mx-auto mb-3" />
        <p className="text-sm text-smoke">Loading map...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const { coords, loading: locationLoading } = useLocation();
  const [requests, setRequests] = useState<NearbyRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NearbyRequest | null>(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatPartner, setChatPartner] = useState<{
    id: string;
    name: string;
    requestId: string;
    activity: string;
  } | null>(null);

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
    const id = setInterval(fetchRequests, 10_000);
    return () => clearInterval(id);
  }, [coords]);

  // realtime updates
  useEffect(() => {
    if (!profile?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel("requests:all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests" },
        () => {
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

  const latestRequest = latest?.request_id ? requests.find((r) => r.id === latest.request_id) : null;

  const activityEmojis: Record<string, string> = {
    tea: "🍵",
    coffee: "☕",
    lunch: "🍱",
    snacks: "🥟",
    smoke: "🚬",
    walk: "🚶",
  };

  // Handler to open chat
  const handleOpenChat = () => {
    if (!selectedRequest || !profile?.id) return;
    
    setChatPartner({
      id: selectedRequest.creator_id,
      name: selectedRequest.creator_name,
      requestId: selectedRequest.id,
      activity: selectedRequest.activity,
    });
    setShowChat(true);
    setSelectedRequest(null);
  };

  // Handler to join request
  const handleJoinRequest = async () => {
    if (!selectedRequest || !profile?.id) return;

    try {
      const supabase = createClient();
      
      // Check if already joined
      const { data: existing } = await supabase
        .from("request_participants")
        .select("id")
        .eq("request_id", selectedRequest.id)
        .eq("user_id", profile.id)
        .single();

      if (existing) {
        alert("You've already joined this request!");
        return;
      }

      // Join the request
      const { error } = await supabase
        .from("request_participants")
        .insert({
          request_id: selectedRequest.id,
          user_id: profile.id,
        });

      if (error) throw error;

      alert("Joined! 🎉 You can now chat with " + selectedRequest.creator_name);
      
      // Auto-open chat after joining
      setChatPartner({
        id: selectedRequest.creator_id,
        name: selectedRequest.creator_name,
        requestId: selectedRequest.id,
        activity: selectedRequest.activity,
      });
      setShowChat(true);
      setSelectedRequest(null);
    } catch (err) {
      console.error("Error joining:", err);
      alert("Failed to join request");
    }
  };

  return (
    <main className="h-screen relative">
      {/* Map */}
      <div className="absolute inset-0">
        {locationLoading ? (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-black mx-auto mb-3" />
              <p className="text-sm text-gray-600">Getting your location...</p>
            </div>
          </div>
        ) : (
          <MapView
            userCoords={coords}
            requests={requests}
            onRequestClick={setSelectedRequest}
          />
        )}
      </div>

      {/* CREATE REQUEST BUTTON */}
      <button
        onClick={() => setShowCreateSheet(true)}
        className="fixed bottom-24 right-6 z-[100] flex items-center gap-2 bg-black text-white px-5 py-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all active:scale-95"
        style={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <Plus className="w-6 h-6" />
        <span className="font-semibold">Create Request</span>
      </button>

      {/* loading indicator */}
      {requestsLoading && (
        <div className="fixed top-4 left-4 z-50 bg-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Loader className="w-3 h-3 animate-spin text-black" />
          <span className="text-xs font-medium text-gray-700">Updating...</span>
        </div>
      )}

      {/* selected request detail card */}
      {selectedRequest && (
        <div className="fixed bottom-32 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl p-4 max-w-md mx-auto">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-lg">
                {activityEmojis[selectedRequest.activity] || "☕"}
              </div>
              <div>
                <p className="font-semibold text-black">{selectedRequest.creator_name}</p>
                <p className="text-xs text-gray-500 capitalize">{selectedRequest.activity}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedRequest(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {selectedRequest.note && (
            <p className="text-sm text-gray-600 mb-2">💬 {selectedRequest.note}</p>
          )}
          <p className="text-xs text-gray-500 mb-3">
            {Math.round(selectedRequest.distance_m)}m away • {selectedRequest.participant_count} joined
          </p>

          {/* Action Buttons - Join + Chat */}
          <div className="flex gap-2">
            <button
              onClick={handleJoinRequest}
              className="flex-1 bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Join Request
            </button>
            <button
              onClick={handleOpenChat}
              className="px-4 py-3 bg-white border-2 border-black text-black rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              title="Chat with creator"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <BottomNav unreadCount={unreadCount} />

      {/* Create Request Sheet */}
      <CreateRequestSheet
        isOpen={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        userCoords={coords}
        onSuccess={() => {
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

      {/* Incoming Request Popup */}
      <IncomingRequestPopup
        notification={latest}
        request={latestRequest}
        onDismiss={dismissLatest}
      />

      {/* Chat Sheet */}
      {showChat && chatPartner && profile && (
        <ChatSheet
          isOpen={showChat}
          onClose={() => {
            setShowChat(false);
            setChatPartner(null);
          }}
          requestId={chatPartner.requestId}
          otherUserId={chatPartner.id}
          otherUserName={chatPartner.name}
          currentUserId={profile.id}
          activity={chatPartner.activity}
        />
      )}
    </main>
  );
}