"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import BottomNav from "@/components/BottomNav";
import { Plus, LogOut, MapPin, X } from "lucide-react";

interface NearbyUser {
  id: string;
  activity: string;
  distance: number;
  created_at: string;
}

export default function MapPage() {
  const router = useRouter();
  const [nearbyRequests, setNearbyRequests] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activity, setActivity] = useState("coffee");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch nearby requests
  useEffect(() => {
    const fetchNearbyRequests = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("requests")
          .select("id, activity, distance_m, created_at")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(20);

        if (data) {
          setNearbyRequests(
            data.map((r: any) => ({
              ...r,
              distance: Math.round(r.distance_m / 100) * 100,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching nearby requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyRequests();
  }, []);

  // Create new request
  const handleCreateRequest = async () => {
    if (!activity) {
      alert("Please select an activity");
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
        throw new Error("Failed to create request");
      }

      // Reset form and close modal
      setActivity("coffee");
      setNote("");
      setShowCreateForm(false);

      // Refresh nearby requests
      const supabase = createClient();
      const { data } = await supabase
        .from("requests")
        .select("id, activity, distance_m, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setNearbyRequests(
          data.map((r: any) => ({
            ...r,
            distance: Math.round(r.distance_m / 100) * 100,
          }))
        );
      }
    } catch (err) {
      console.error("Error creating request:", err);
      alert("Failed to create request");
    } finally {
      setCreating(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/signin");
  };

  const activityEmojis: Record<string, string> = {
    tea: "🍵",
    coffee: "☕",
    smoke: "🚬",
    lunch: "🍱",
    snacks: "🥟",
    walk: "🚶",
  };

  return (
    <main className="min-h-screen pb-24 px-4 pt-4 safe-top">
      <div className="max-w-[440px] mx-auto">
        {/* Header with logout */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display tracking-tight text-ink">Nearby</h1>
            <p className="text-smoke text-sm">People looking for activities</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-smoke/10 rounded transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5 text-smoke" />
          </button>
        </div>

        {/* Map placeholder */}
        <div className="card h-64 mb-6 flex items-center justify-center bg-gradient-to-br from-smoke/5 to-smoke/10 relative">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-smoke/30 mx-auto mb-2" />
            <p className="text-smoke text-sm">Map will render here</p>
            <p className="text-ash text-xs">Showing {nearbyRequests.length} nearby requests</p>
          </div>
        </div>

        {/* Floating Create Button */}
        <div className="fixed bottom-32 right-4 z-30">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-ink text-cream px-6 py-3 rounded-full font-medium shadow-lg hover:bg-ink/90 transition-all active:scale-95"
            aria-label="Create new request"
          >
            <Plus className="w-5 h-5" />
            Create Request
          </button>
        </div>

        {/* Nearby Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink mx-auto"></div>
            <p className="text-smoke text-sm mt-2">Loading nearby requests...</p>
          </div>
        ) : nearbyRequests.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-smoke text-sm mb-2">No requests nearby yet.</p>
            <p className="text-ash text-xs">Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-smoke px-2">Available Now</h2>
            {nearbyRequests.map((req) => (
              <div
                key={req.id}
                className="card p-4 cursor-pointer hover:bg-smoke/5 transition"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-cream text-lg flex-shrink-0">
                    {activityEmojis[req.activity] || "☕"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink capitalize">{req.activity}</p>
                    <p className="text-xs text-ash">{req.distance}m away</p>
                  </div>
                </div>
                <button className="w-full text-sm font-medium text-matcha hover:bg-matcha/5 py-2 rounded transition">
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="card m-4 w-full max-w-[440px] mx-auto p-6 rounded-t-3xl space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display">Create Request</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-smoke/10 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-smoke" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Activity</label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full px-3 py-2 border border-smoke/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink/20"
                >
                  <option value="coffee">☕ Coffee</option>
                  <option value="tea">🍵 Tea</option>
                  <option value="lunch">🍱 Lunch</option>
                  <option value="snacks">🥟 Snacks</option>
                  <option value="walk">🚶 Walk</option>
                  <option value="smoke">🚬 Smoke Break</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note... e.g., 'Let's meet at the park'"
                  maxLength={500}
                  className="w-full px-3 py-2 border border-smoke/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink/20 resize-none h-20 text-sm"
                />
                <p className="text-xs text-ash mt-1">{note.length}/500</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-3 border border-smoke/20 rounded-lg font-medium hover:bg-smoke/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequest}
                disabled={creating}
                className="flex-1 px-4 py-3 bg-ink text-cream rounded-lg font-medium hover:bg-ink/90 disabled:opacity-50 transition"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}