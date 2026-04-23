"use client";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { X, Loader, AlertCircle } from "lucide-react";

interface UserRequest {
  id: string;
  activity: string;
  note: string | null;
  distance_m?: number;
  status: string;
  created_at: string;
  expires_at: string;
  participant_count?: number;
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch requests from server-side API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setError(null);
        setLoading(true);

        // Call server-side API route
        const response = await fetch("/api/requests", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("You need to be logged in to view your requests.");
          } else if (response.status === 404) {
            setError("API endpoint not found. Check your server configuration.");
          } else {
            setError("Failed to load your requests. Please try again.");
          }
          setLoading(false);
          return;
        }

        const result = await response.json();

        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        if (result.data) {
          setRequests(
            result.data.map((r: any) => ({
              ...r,
              participant_count: r.participant_count?.[0]?.count || 0,
            }))
          );
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Network error. Please check your connection and try again.");
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Handle cancelling a request
  const handleCancel = async (id: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || "Failed to cancel request. Please try again.");
        return;
      }

      // Remove from UI
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Cancel error:", err);
      setError("Network error while cancelling. Please try again.");
    }
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
    <main className="min-h-screen pb-24 px-4 pt-6 safe-top">
      <div className="max-w-[440px] mx-auto">
        <h1 className="text-3xl font-display tracking-tight text-ink mb-2">
          My Requests
        </h1>
        <p className="text-smoke text-sm mb-6">
          Posts you've made that are still active.
        </p>

        {/* Error Banner */}
        {error && (
          <div className="card p-4 bg-red-50 border border-red-200 mb-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 text-sm font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-ink" />
          </div>
        ) : requests.length === 0 ? (
          /* Empty State */
          <div className="card p-8 text-center">
            <p className="text-smoke text-sm mb-3">No active requests yet.</p>
            <p className="text-xs text-ash">
              Create one from the map to get started.
            </p>
          </div>
        ) : (
          /* Requests List */
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-cream text-lg">
                      {activityEmojis[req.activity] || "☕"}
                    </div>
                    <div>
                      <p className="font-medium text-ink capitalize">
                        {req.activity}
                      </p>
                      <p className="text-xs text-ash">
                        {req.participant_count || 0}{" "}
                        {req.participant_count === 1 ? "person" : "people"} joined
                      </p>
                    </div>
                  </div>
                  {req.status === "open" && (
                    <button
                      onClick={() => handleCancel(req.id)}
                      className="p-2 hover:bg-smoke/10 rounded transition-colors"
                      title="Cancel request"
                      aria-label="Cancel request"
                    >
                      <X className="w-4 h-4 text-smoke" />
                    </button>
                  )}
                </div>

                {req.note && (
                  <p className="text-sm text-smoke mb-2">{req.note}</p>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-ash">
                    {new Date(req.created_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wide ${
                      req.status === "open"
                        ? "bg-matcha/15 text-matcha"
                        : req.status === "completed"
                          ? "bg-matcha/15 text-matcha"
                          : "bg-smoke/15 text-smoke"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}