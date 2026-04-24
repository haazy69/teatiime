"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import BottomNav from "@/components/BottomNav";
import {
  Plus,
  LogOut,
  X,
  Loader,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  MapPin,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet map to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl overflow-hidden mb-6 h-64 sm:h-96 bg-gray-100 flex items-center justify-center border-2 border-gray-200">
      <div className="text-center">
        <Loader className="w-8 h-8 animate-spin text-ink mx-auto mb-2" />
        <p className="text-smoke text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

interface NearbyRequest {
  id: string;
  activity: string;
  distance_m: number;
  note: string | null;
  created_at: string;
  creator_id: string;
  participant_count: number;
}

export default function MapPage() {
  const router = useRouter();
  const [nearbyRequests, setNearbyRequests] = useState<NearbyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activity, setActivity] = useState("coffee");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setError(null);
        const supabase = createClient();

        // Get user
        const { data: { user: userData } } = await supabase.auth.getUser();
        if (!userData) {
          router.push("/auth/signin");
          return;
        }
        setUser(userData);

        // Get location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (err) => {
              console.warn("Location error:", err);
              // Default location if geolocation fails
              setUserLocation({ lat: 28.6139, lng: 77.209 }); // Delhi
            }
          );
        } else {
          setUserLocation({ lat: 28.6139, lng: 77.209 });
        }

        // Fetch requests
        const { data, error: fetchError } = await supabase
          .from("requests")
          .select(
            `*,
             participant_count:request_participants(count)`
          )
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(20);

        if (fetchError) {
          setError("Failed to load requests");
          return;
        }

        if (data) {
          setNearbyRequests(
            data.map((r: any) => ({
              ...r,
              participant_count: r.participant_count?.[0]?.count || 0,
            }))
          );
        }

        setLoading(false);
      } catch (err) {
        setError("An error occurred");
        console.error("Error:", err);
        setLoading(false);
      }
    };

    initializeApp();
  }, [router]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!activity) {
      setCreateError("Please select an activity");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity,
          note: note || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create request");
      }

      setCreateSuccess(true);

      setTimeout(() => {
        setActivity("coffee");
        setNote("");
        setCreateError(null);
        setCreateSuccess(false);
        setShowCreateModal(false);
        refreshRequests();
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      setCreateError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const refreshRequests = async () => {
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("requests")
        .select(
          `*,
           participant_count:request_participants(count)`
        )
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(20);

      if (fetchError) {
        setError("Failed to refresh");
        return;
      }

      if (data) {
        setNearbyRequests(
          data.map((r: any) => ({
            ...r,
            participant_count: r.participant_count?.[0]?.count || 0,
          }))
        );
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/auth/signin");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleJoinRequest = async (requestId: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase.from("request_participants").insert({
        request_id: requestId,
        user_id: user.id,
      });

      if (error) throw error;
      alert("Joined! 🎉");
      refreshRequests();
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to join");
    }
  };

  const getActivityEmoji = (activity: string) => {
    const emojis: Record<string, string> = {
      tea: "🍵",
      coffee: "☕",
      smoke: "🚬",
      lunch: "🍱",
      snacks: "🥟",
      walk: "🚶",
    };
    return emojis[activity] || "☕";
  };

  return (
    <main className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cream border-b border-smoke/10 px-4 py-4">
        <div className="max-w-[600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
              TeaTime
            </h1>
            <p className="text-smoke text-xs sm:text-sm">Find people nearby</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-smoke/10 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-smoke" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[600px] mx-auto px-4 py-4">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Map */}
        {userLocation && (
          <MapComponent
            userLocation={userLocation}
            requests={nearbyRequests}
            getActivityEmoji={getActivityEmoji}
          />
        )}

        {/* Add Request Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-ink to-ink/90 text-cream px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl active:scale-95 transition-all min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add New Request</span>
          <span className="sm:hidden">Add Request</span>
        </button>

        {/* Requests List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-ink">
              Available Now
            </h2>
            <button
              onClick={refreshRequests}
              className="p-2 hover:bg-smoke/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-smoke" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin text-ink mx-auto mb-2" />
              <p className="text-smoke text-sm">Loading requests...</p>
            </div>
          ) : nearbyRequests.length === 0 ? (
            <div className="card p-8 text-center">
              <MapPin className="w-10 h-10 text-smoke/30 mx-auto mb-2" />
              <p className="text-smoke text-sm font-medium">No requests nearby</p>
              <p className="text-ash text-xs">Be the first to create one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {nearbyRequests.map((req) => (
                <div key={req.id} className="card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-cream text-lg flex-shrink-0">
                      {getActivityEmoji(req.activity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink capitalize">
                        {req.activity}
                      </p>
                      <p className="text-xs text-ash">
                        {Math.round(req.distance_m / 100) * 100}m away •{" "}
                        {req.participant_count} joined
                      </p>
                    </div>
                  </div>
                  {req.note && (
                    <p className="text-xs text-smoke mb-2 line-clamp-2">
                      💬 {req.note}
                    </p>
                  )}
                  <button
                    onClick={() => handleJoinRequest(req.id)}
                    className="w-full text-sm font-medium text-matcha hover:bg-matcha/5 py-2 rounded transition-colors"
                  >
                    Join Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center sm:justify-center p-4">
          <div
            className="absolute inset-0 -z-10"
            onClick={() => !creating && setShowCreateModal(false)}
          />

          <div className="card w-full sm:max-w-[440px] rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-ink">Create</h2>
              <button
                onClick={() => !creating && setShowCreateModal(false)}
                className="p-2 hover:bg-smoke/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-smoke" />
              </button>
            </div>

            {createSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-matcha mx-auto mb-3" />
                <h3 className="font-semibold text-ink mb-1">Created! 🎉</h3>
                <p className="text-sm text-smoke">People will see your request</p>
              </div>
            ) : (
              <>
                {createError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {createError}
                  </div>
                )}

                <form onSubmit={handleCreateRequest} className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">
                      Activity
                    </label>
                    <select
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                      disabled={creating}
                      className="w-full px-3 py-2 border border-smoke/20 rounded-lg bg-cream text-ink"
                    >
                      <option value="coffee">☕ Coffee</option>
                      <option value="tea">🍵 Tea</option>
                      <option value="lunch">🍱 Lunch</option>
                      <option value="snacks">🥟 Snacks</option>
                      <option value="walk">🚶 Walk</option>
                      <option value="smoke">🚬 Smoke</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">
                      Note (optional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value.slice(0, 200))}
                      placeholder="What's on your mind?"
                      maxLength={200}
                      disabled={creating}
                      className="w-full px-3 py-2 border border-smoke/20 rounded-lg bg-cream text-ink h-16 resize-none"
                    />
                    <p className="text-xs text-ash mt-1">{note.length}/200</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      disabled={creating}
                      className="flex-1 px-3 py-2 border border-smoke/20 rounded-lg font-medium text-ink hover:bg-smoke/5 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 px-3 py-2 bg-ink text-cream rounded-lg font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {creating ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Creating
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
