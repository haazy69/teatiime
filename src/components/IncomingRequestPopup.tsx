"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { X, Loader } from "lucide-react";
import type { AppNotification, NearbyRequest } from "@/types";

interface IncomingRequestPopupProps {
  notification: AppNotification | null;
  request?: NearbyRequest | null;
  onDismiss: () => void;
  onAccepted?: () => void;
}

export default function IncomingRequestPopup({
  notification,
  request,
  onDismiss,
  onAccepted,
}: IncomingRequestPopupProps) {
  const [loading, setLoading] = useState(false);
  const [declined, setDeclined] = useState(false);

  const handleAccept = async () => {
    if (!notification || !request) return;
    setLoading(true);

    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("request_participants").insert({
      request_id: request.id,
      user_id: user.user.id,
      status: "accepted",
    });

    setLoading(false);

    if (!error) {
      onAccepted?.();
      onDismiss();
    }
  };

  const handleDecline = () => {
    setDeclined(true);
    setTimeout(onDismiss, 300);
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(onDismiss, 8000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification || !request || declined) return null;

  const activityEmojis: Record<string, string> = {
    tea: "🍵",
    coffee: "☕",
    smoke: "🚬",
    lunch: "🍱",
    snacks: "🥟",
    walk: "🚶",
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 px-4 pt-safe transition-all duration-300 ${
        declined ? "opacity-0 translate-y-[-20px]" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="max-w-[440px] mx-auto">
        <div className="card mt-4 p-4 shadow-lift animate-slide-up">
          {/* header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-cream flex-shrink-0">
                {activityEmojis[request.activity] || "☕"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-ink truncate">{request.creator_name}</p>
                <p className="text-xs text-ash capitalize">{request.activity}</p>
              </div>
            </div>
            <button
              onClick={handleDecline}
              className="p-1 hover:bg-smoke/10 rounded transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-ash" />
            </button>
          </div>

          {/* note if exists */}
          {request.note && <p className="text-sm text-smoke mb-3 leading-snug">{request.note}</p>}

          {/* distance + meta */}
          <p className="text-xs text-ash mb-4">
            {Math.round(request.distance_m)}m away • {request.participant_count} joining
          </p>

          {/* actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="btn-primary btn-ember flex-1 text-sm py-3 flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Join"}
            </button>
            <button
              onClick={handleDecline}
              className="btn-ghost flex-1 text-sm py-3"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
