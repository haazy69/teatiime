"use client";

import { useState } from "react";
import { X, Plus, Loader, AlertCircle, CheckCircle } from "lucide-react";

interface CreateRequestSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords: { lat: number; lng: number } | null;
  onSuccess: () => void;
}

export default function CreateRequestSheet({
  isOpen,
  onClose,
  userCoords,
  onSuccess,
}: CreateRequestSheetProps) {
  const [activity, setActivity] = useState("coffee");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activity) {
      setError("Please select an activity");
      return;
    }

    try {
      setLoading(true);

      console.log("Submitting request:", { activity, note });

      const response = await fetch("/api/requests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity,
          note: note || null,
          latitude: userCoords?.lat,
          longitude: userCoords?.lng,
        }),
      });

      console.log("Response status:", response.status);

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned invalid response");
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create request");
      }

      // Success!
      setSuccess(true);

      setTimeout(() => {
        setActivity("coffee");
        setNote("");
        setSuccess(false);
        setError(null);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error creating request:", err);
      setError(err instanceof Error ? err.message : "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-end sm:items-center sm:justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 -z-10"
        onClick={() => !loading && onClose()}
      />

      {/* Modal */}
      <div className="bg-white w-full sm:max-w-[440px] rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-black">Create Request</h2>
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-black mb-1">Created! 🎉</h3>
            <p className="text-sm text-gray-600">
              People nearby will see your request
            </p>
          </div>
        ) : (
          <>
            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Activity Selection */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  What are you doing?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "coffee", label: "Coffee", emoji: "☕" },
                    { value: "tea", label: "Tea", emoji: "🍵" },
                    { value: "lunch", label: "Lunch", emoji: "🍱" },
                    { value: "snacks", label: "Snacks", emoji: "🥟" },
                    { value: "walk", label: "Walk", emoji: "🚶" },
                    { value: "smoke", label: "Smoke", emoji: "🚬" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setActivity(item.value)}
                      disabled={loading}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        activity === item.value
                          ? "border-black bg-black text-white"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-xs font-medium">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Add a note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 200))}
                  placeholder="e.g., 'Meet at the canteen'"
                  maxLength={200}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 transition resize-none h-20 text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {note.length}/200 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
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
  );
}