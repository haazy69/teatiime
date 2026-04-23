"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import BottomNav from "@/components/BottomNav";
import { Loader, Save } from "lucide-react";
import type { Profile } from "@/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const availableInterests = ["tea", "coffee", "smoke", "lunch", "snacks", "walk"];
  const interestEmojis: Record<string, string> = {
    tea: "🍵",
    coffee: "☕",
    smoke: "🚬",
    lunch: "🍱",
    snacks: "🥟",
    walk: "🚶",
  };

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
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setInterests(data.interests || []);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio: bio,
        interests: interests,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      setMessage("Error saving profile");
    } else {
      setMessage("Profile saved!");
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center pb-24">
        <Loader className="w-6 h-6 animate-spin text-ink" />
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 px-4 pt-6 safe-top">
      <div className="max-w-[440px] mx-auto">
        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display tracking-tight text-ink mb-2">Profile</h1>
          {profile?.email && (
            <p className="text-sm text-ash font-mono">{profile.email}</p>
          )}
        </div>

        {/* avatar */}
        <div className="card p-6 text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center text-cream text-4xl mx-auto">
            {profile?.avatar_emoji || "☕"}
          </div>
          <p className="text-xs text-ash mt-3 font-mono">@{profile?.id?.slice(0, 8)}</p>
        </div>

        {/* name */}
        <div className="mb-6">
          <label className="text-xs font-mono uppercase tracking-wide text-ash block mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
          />
        </div>

        {/* bio */}
        <div className="mb-6">
          <label className="text-xs font-mono uppercase tracking-wide text-ash block mb-2">
            About You
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="e.g., College student, coffee enthusiast"
            className="input resize-none h-20"
          />
        </div>

        {/* interests */}
        <div className="mb-6">
          <label className="text-xs font-mono uppercase tracking-wide text-ash block mb-3">
            What do you enjoy?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availableInterests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`p-3 rounded-lg border transition-all text-center ${
                  interests.includes(interest)
                    ? "bg-ink text-cream border-ink"
                    : "bg-cream border-smoke/10 hover:border-smoke/30"
                }`}
              >
                <div className="text-2xl mb-1">{interestEmojis[interest]}</div>
                <div className="text-xs font-medium capitalize">{interest}</div>
              </button>
            ))}
          </div>
        </div>

        {/* status */}
        <div className="mb-6">
          <label className="text-xs font-mono uppercase tracking-wide text-ash block mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-matcha" />
            Availability
          </label>
          <div className="card p-4">
            <p className="text-sm font-medium text-ink mb-1">You're currently {profile?.is_available ? "online" : "offline"}</p>
            <p className="text-xs text-ash">Others can see you when you use the app.</p>
          </div>
        </div>

        {/* message */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm font-medium mb-6 ${
              message.includes("Error")
                ? "bg-ember/15 text-ember border border-ember/30"
                : "bg-matcha/15 text-matcha border border-matcha/30"
            }`}
          >
            {message}
          </div>
        )}

        {/* save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary btn-ink flex justify-between"
        >
          <span>{saving ? "Saving..." : "Save Changes"}</span>
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
