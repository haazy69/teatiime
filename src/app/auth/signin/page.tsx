"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { AlertCircle, Eye, EyeOff, Loader } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push("/map");
    } catch (err) {
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Auto sign in after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Account created! Please sign in.");
        setMode("signin");
        return;
      }

      router.push("/map");
    } catch (err) {
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-br from-cream to-smoke/10">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-ink mb-2">
            TeaTime
          </h1>
          <p className="text-smoke text-sm">Connect with people nearby</p>
        </div>

        <div className="card p-8 space-y-6">
          <div className="flex gap-4 border-b border-smoke/20">
            <button
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`py-3 px-4 font-medium border-b-2 transition ${
                mode === "signin"
                  ? "border-ink text-ink"
                  : "border-transparent text-smoke hover:text-ink"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`py-3 px-4 font-medium border-b-2 transition ${
                mode === "signup"
                  ? "border-ink text-ink"
                  : "border-transparent text-smoke hover:text-ink"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full px-4 py-3 border border-smoke/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink/20 transition disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 border border-smoke/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink/20 transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-smoke hover:text-ink transition disabled:opacity-50"
                  >
                    {showPassword ? (
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
                className="w-full bg-ink text-cream py-3 rounded-lg font-medium hover:bg-ink/90 disabled:opacity-50 transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <p className="text-center text-sm text-smoke">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className="text-ink font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full px-4 py-3 border border-smoke/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink/20 transition disabled:opacity-50"
                />
              </div>

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
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 border border-smoke/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink/20 transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-smoke hover:text-ink transition disabled:opacity-50"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink text-cream py-3 rounded-lg font-medium hover:bg-ink/90 disabled:opacity-50 transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <p className="text-center text-sm text-smoke">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className="text-ink font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          <div className="text-center text-xs text-ash border-t border-smoke/10 pt-6">
            <p>By continuing, you agree to our Terms of Service</p>
          </div>
        </div>
      </div>
    </main>
  );
}