"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

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

    // Validation
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

      // Password set successfully
      setSuccess(true);
      
      // Redirect to map after a short delay
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
      <main className="min-h-screen flex items-center justify-center px-4 pt-6">
        <div className="max-w-[440px] w-full">
          <div className="card p-8 text-center">
            <CheckCircle className="w-12 h-12 text-matcha mx-auto mb-4" />
            <h1 className="text-2xl font-display mb-2">Password set!</h1>
            <p className="text-smoke">Redirecting to your map...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-6">
      <div className="max-w-[440px] w-full">
        <h1 className="text-3xl font-display tracking-tight text-ink mb-2">Set Your Password</h1>
        <p className="text-smoke text-sm mb-6">Create a secure password to protect your account.</p>

        {error && (
          <div className="card p-4 bg-red-50 border border-red-200 mb-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSetPassword} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 pr-10 border border-smoke/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-ink transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-ash mt-1">Minimum 8 characters recommended</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-3 py-2 pr-10 border border-smoke/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-ink transition"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-cream py-2 rounded-lg font-medium hover:bg-ink/90 disabled:opacity-50 transition"
          >
            {loading ? "Setting password..." : "Set Password"}
          </button>
        </form>

        <p className="text-xs text-ash text-center mt-6">
          Your password will be used to log in next time.
        </p>
      </div>
    </main>
  );
}