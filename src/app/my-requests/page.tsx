"use client";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import ChatSheet from "@/components/ChatSheet";
import { createClient } from "@/lib/supabase-browser";
import { X, Loader, AlertCircle, MessageCircle, Users } from "lucide-react";

interface Participant {
  id: string;
  user_id: string;
  request_id: string;
  created_at: string;
  profile?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface UserRequest {
  id: string;
  activity: string;
  note: string | null;
  distance_m?: number;
  status: string;
  created_at: string;
  expires_at: string;
  participant_count?: number;
  participants?: Participant[];
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatPartner, setChatPartner] = useState<{
    id: string;
    name: string;
    requestId: string;
    activity: string;
  } | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Fetch requests with participants
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setError(null);
        setLoading(true);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("You need to be logged in to view your requests.");
          setLoading(false);
          return;
        }

        // Fetch requests with participants and their profiles
        const { data, error: fetchError } = await supabase
          .from("requests")
          .select(`
            *,
            participants:request_participants(
              id,
              user_id,
              request_id,
              created_at,
              profile:profiles!user_id(
                id,
                display_name,
                avatar_url
              )
            )
          `)
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Fetch error:", fetchError);
          setError("Failed to load your requests. Please try again.");
          setLoading(false);
          return;
        }

        if (data) {
          setRequests(
            data.map((r: any) => ({
              ...r,
              participant_count: r.participants?.length || 0,
              participants: r.participants || [],
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
    if (!confirm("Are you sure you want to cancel this request?")) return;

    try {
      setError(null);

      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("requests")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (updateError) {
        setError(updateError.message || "Failed to cancel request.");
        return;
      }

      // Remove from UI
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Cancel error:", err);
      setError("Network error while cancelling. Please try again.");
    }
  };

  // Handle opening chat with a participant
  const handleChatWithParticipant = (
    request: UserRequest,
    participant: Participant
  ) => {
    if (!participant.profile) {
      alert("Cannot start chat - participant info missing");
      return;
    }

    setChatPartner({
      id: participant.user_id,
      name: participant.profile.display_name || "User",
      requestId: request.id,
      activity: request.activity,
    });
    setShowChat(true);
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
                {/* Request Header */}
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

                {/* Note */}
                {req.note && (
                  <p className="text-sm text-smoke mb-3">{req.note}</p>
                )}

                {/* Participants Section with Chat Buttons */}
                {req.participants && req.participants.length > 0 && (
                  <div className="border-t border-smoke/10 pt-3 mt-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-smoke" />
                      <p className="text-xs font-medium text-smoke">
                        Joined ({req.participants.length})
                      </p>
                    </div>
                    <div className="space-y-2">
                      {req.participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between gap-2 p-2 bg-smoke/5 rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-matcha/20 flex items-center justify-center text-matcha text-xs font-medium flex-shrink-0">
                              {participant.profile?.display_name
                                ?.charAt(0)
                                .toUpperCase() || "U"}
                            </div>
                            <p className="text-sm font-medium text-ink truncate">
                              {participant.profile?.display_name || "User"}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleChatWithParticipant(req, participant)
                            }
                            className="px-3 py-1.5 bg-ink text-cream rounded-full text-xs font-medium hover:bg-ink/90 transition-colors flex items-center gap-1 flex-shrink-0"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Chat
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
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

      {/* Bottom Nav */}
      <BottomNav />

      {/* Chat Sheet */}
      {showChat && chatPartner && currentUserId && (
        <ChatSheet
          isOpen={showChat}
          onClose={() => {
            setShowChat(false);
            setChatPartner(null);
          }}
          requestId={chatPartner.requestId}
          otherUserId={chatPartner.id}
          otherUserName={chatPartner.name}
          currentUserId={currentUserId}
          activity={chatPartner.activity}
        />
      )}
    </main>
  );
}