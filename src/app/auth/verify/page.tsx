"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "verified" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Email is verified, go to set password
          setStatus("verified");
          setTimeout(() => {
            router.push("/auth/set-password");
          }, 1500);
        } else {
          setStatus("error");
          setError("Verification failed. Please try signing in again.");
        }
      } catch (err) {
        setStatus("error");
        setError("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-[440px] w-full">
        {status === "verifying" && (
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-ink mx-auto mb-4" />
            <h1 className="text-2xl font-display mb-2">Verifying your email...</h1>
            <p className="text-smoke">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === "verified" && (
          <div className="card p-8 text-center">
            <CheckCircle className="w-12 h-12 text-matcha mx-auto mb-4" />
            <h1 className="text-2xl font-display mb-2">Email verified!</h1>
            <p className="text-smoke">Redirecting to set your password...</p>
          </div>
        )}

        {status === "error" && (
          <div className="card p-8">
            <div className="flex gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h1 className="text-lg font-display mb-2">Verification failed</h1>
                <p className="text-smoke text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/auth/signin")}
              className="w-full bg-ink text-cream rounded-lg py-2 font-medium hover:bg-ink/90 transition"
            >
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </main>
  );
}