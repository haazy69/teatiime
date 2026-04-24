"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader } from "lucide-react";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/map");
      }, 1500);
    } catch (err) {
      setError("Failed to set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-br from-cream to-smoke/10">
        <div className="w-full max-w-[440px]">
          <div className="card p-8 text-center">
            <CheckCircle className="w-12 h-12 text-matcha mx-auto mb-4" />
            <h1 className="text-2xl font-display text-ink mb-2">
              Password Set!
            </h1>
            <p className="text-smoke">Redirecting to the map...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-br from-cream to-smoke/10">
      <div className="w-full max-w-[440px]">
        <h1 className="text-3xl font-display text-ink mb-2">Set Your Password</h1>
        <p className="text-smoke text-sm mb-6">
          Create a password to secure your account
        </p>

        {error && (
          <div className="card p-4 bg-red-50 border border-red-200 mb-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSetPassword} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 border border-smoke/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-smoke hover:text-ink transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-ash mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 border border-smoke/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-smoke hover:text-ink transition"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-cream py-3 rounded-lg font-medium hover:bg-ink/90 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Setting password...
              </>
            ) : (
              "Set Password"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}