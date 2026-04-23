"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { X, Loader } from "lucide-react";
import { ACTIVITIES, type Activity } from "@/types";
import type { Coords } from "@/hooks/useLocation";

interface CreateRequestSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords?: Coords | null;
  onSuccess?: () => void;
}

export default function CreateRequestSheet({
  isOpen,
  onClose,
  userCoords,
  onSuccess,
}: CreateRequestSheetProps) {
  const [activity, setActivity] = useState<Activity>("tea");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!userCoords) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error: err } = await supabase.from("requests").insert({
      creator_id: user.user.id,
      activity,
      note: note || null,
      location: { type: "Point", coordinates: [userCoords.lng, userCoords.lat] },
      location_label: `Nearby`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });

    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setNote("");
      setActivity("tea");
      onClose();
      onSuccess?.();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sheet safe-bottom animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl tracking-tight text-ink">What do you want?</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-smoke/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-ink" />
          </button>
        </div>

        {/* activity picker */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {ACTIVITIES.map((a) => (
            <button
              key={a.key}
              onClick={() => setActivity(a.key)}
              className={`p-4 rounded-lg border transition-all ${
                activity === a.key
                  ? "bg-ink text-cream border-ink"
                  : "bg-cream border-smoke/10 text-ink hover:border-smoke/30"
              }`}
            >
              <div className="text-2xl mb-2">{a.emoji}</div>
              <div className="text-xs font-medium">{a.label}</div>
            </button>
          ))}
        </div>

        {/* note input */}
        <textarea
          placeholder="Optional: 'Near the gate' or 'rooftop after 3'"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input mb-4 resize-none h-20"
        />

        {error && (
          <div className="bg-ember/15 border border-ember/30 rounded-lg p-3 text-sm text-ember mb-4">
            {error}
          </div>
        )}

        {/* submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary btn-ink mb-3 flex justify-between"
        >
          <span>{loading ? "Creating..." : "Post request"}</span>
          {loading && <Loader className="w-4 h-4 animate-spin" />}
        </button>

        <p className="text-center text-[11px] font-mono text-ash uppercase">
          Expires in 30 minutes • Nearby people will see it
        </p>
      </div>
    </>
  );
}
