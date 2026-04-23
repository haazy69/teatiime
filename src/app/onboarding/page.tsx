"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useLocation } from "@/hooks/useLocation";
import { useRouter } from "next/navigation";
import { MapPin, Loader, Plus, Check } from "lucide-react";
import type { Office } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { coords, loading: locationLoading, error: locationError } = useLocation();
  const [step, setStep] = useState<"location" | "office" | "profile">("location");
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddOffice, setShowAddOffice] = useState(false);
  const [newOfficeName, setNewOfficeName] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Step 1: get location, fetch nearby offices
  useEffect(() => {
    if (!coords) return;
    setStep("office");

    const fetchNearby = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("offices_nearby", {
        lat: coords.lat,
        lng: coords.lng,
        radius_m: 2000,
      });

      if (!error && data) {
        setOffices(data);
      }
    };

    fetchNearby();
  }, [coords]);

  // Step 3: save profile + office selection
  const handleComplete = async () => {
    if (!displayName.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        office_id: selectedOffice,
      })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);

    setLoading(false);

    if (!error) {
      router.push("/home");
    }
  };

  // Add new office
  const handleAddOffice = async () => {
    if (!newOfficeName.trim() || !coords) return;
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("offices")
      .insert({
        name: newOfficeName,
        kind: "office",
        location: { type: "Point", coordinates: [coords.lng, coords.lat] },
        address: `Near your location (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`,
      })
      .select()
      .single();

    setLoading(false);

    if (!error && data) {
      setOffices((prev) => [data as Office, ...prev]);
      setSelectedOffice(data.id);
      setNewOfficeName("");
      setShowAddOffice(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col px-6 py-12 safe-top safe-bottom">
      <div className="mb-8">
        <div className="flex gap-2 mb-3">
          {["location", "office", "profile"].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                step === s || (step === "profile" && (s === "location" || s === "office"))
                  ? "bg-ink"
                  : "bg-ash/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Location */}
      {step === "location" && (
        <div className="flex-1 flex flex-col justify-center py-8 animate-slide-up">
          <h2 className="text-3xl font-display tracking-tight text-ink mb-3">Where are you?</h2>
          <p className="text-smoke text-base mb-8">
            We'll find who's nearby and suggest your office.
          </p>

          {locationError && (
            <div className="bg-ember/15 border border-ember/30 rounded-lg p-4 mb-6 text-sm text-ember">
              {locationError}
            </div>
          )}

          <div className="flex items-center gap-3 card p-6 justify-center mb-6">
            {locationLoading ? (
              <Loader className="w-5 h-5 animate-spin text-ink" />
            ) : coords ? (
              <>
                <MapPin className="w-5 h-5 text-matcha" />
                <div className="text-sm">
                  <p className="font-medium text-ink">{coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}</p>
                  <p className="text-xs text-ash">{coords.accuracy ? `±${Math.round(coords.accuracy)}m` : ""}</p>
                </div>
              </>
            ) : (
              <p className="text-smoke">Requesting location...</p>
            )}
          </div>

          {coords && (
            <button onClick={() => setStep("office")} className="btn-primary btn-ink">
              Continue →
            </button>
          )}
        </div>
      )}

      {/* STEP 2: Office Selection */}
      {step === "office" && (
        <div className="flex-1 flex flex-col justify-center py-8 animate-slide-up">
          <h2 className="text-3xl font-display tracking-tight text-ink mb-2">Your office or campus?</h2>
          <p className="text-smoke text-base mb-6">
            {offices.length > 0 ? "Tap one below, or add your own." : "Add your workplace."}
          </p>

          {/* office list */}
          <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto no-scrollbar">
            {offices.map((office) => (
              <button
                key={office.id}
                onClick={() => setSelectedOffice(office.id)}
                className={`w-full text-left card p-4 transition-all ${
                  selectedOffice === office.id ? "ring-2 ring-ink bg-smoke/5" : "hover:bg-smoke/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-ink">{office.name}</p>
                    <p className="text-xs text-ash mt-1">
                      {office.kind} {office.distance_m ? `• ${Math.round(office.distance_m)}m away` : ""}
                    </p>
                  </div>
                  {selectedOffice === office.id && <Check className="w-5 h-5 text-matcha flex-shrink-0" />}
                </div>
              </button>
            ))}
          </div>

          {/* add office toggle */}
          {!showAddOffice ? (
            <button
              onClick={() => setShowAddOffice(true)}
              className="btn-ghost mb-6 justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add your workplace
            </button>
          ) : (
            <div className="card p-4 mb-6 space-y-3">
              <input
                type="text"
                placeholder="e.g., Google India, Bangalore"
                value={newOfficeName}
                onChange={(e) => setNewOfficeName(e.target.value)}
                className="input text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddOffice}
                  disabled={loading || !newOfficeName.trim()}
                  className="btn-primary btn-ink flex-1 text-sm"
                >
                  {loading ? "Adding..." : "Add"}
                </button>
                <button
                  onClick={() => {
                    setShowAddOffice(false);
                    setNewOfficeName("");
                  }}
                  className="btn-ghost flex-1 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setStep("profile")}
            disabled={!selectedOffice}
            className="btn-primary btn-ink"
          >
            Continue →
          </button>
        </div>
      )}

      {/* STEP 3: Profile Setup */}
      {step === "profile" && (
        <div className="flex-1 flex flex-col justify-center py-8 animate-slide-up">
          <h2 className="text-3xl font-display tracking-tight text-ink mb-3">What's your name?</h2>
          <p className="text-smoke text-base mb-8">
            People will see this when you post a request.
          </p>

          <div className="mb-8">
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input py-4 text-base"
              autoFocus
            />
          </div>

          {/* preview card */}
          <div className="card p-4 mb-8 space-y-3">
            <p className="text-xs font-mono uppercase text-ash tracking-wide">Preview</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-cream text-lg">
                ☕
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink">{displayName || "Your name"}</p>
                <p className="text-xs text-ash">wants to get tea</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={loading || !displayName.trim()}
            className="btn-primary btn-ink"
          >
            {loading ? "Setting up..." : "Let's go →"}
          </button>
        </div>
      )}
    </main>
  );
}
