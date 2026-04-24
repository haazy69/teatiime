"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "verified" | "error">(
    "verifying"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setStatus("verified");
          setTimeout(() => {
            router.push("/auth/set-password");
          }, 1500);
        } else {
          setStatus("error");
          setError("Verification failed. Please try signing up again.");
        }
      } catch (err) {
        setStatus("error");
        setError("An error occurred. Please try again.");
      }
    };

    verifyEmail();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-br from-cream to-smoke/10">
      <div className="w-full max-w-[440px]">
        <div className="card p-8 text-center">
          {status === "verifying" && (
            <>
              <Loader className="w-12 h-12 animate-spin text-ink mx-auto mb-4" />
              <h1 className="text-2xl font-display text-ink mb-2">
                Verifying Email
              </h1>
              <p className="text-smoke">Please wait...</p>
            </>
          )}

          {status === "verified" && (
            <>
              <CheckCircle className="w-12 h-12 text-matcha mx-auto mb-4" />
              <h1 className="text-2xl font-display text-ink mb-2">
                Email Verified!
              </h1>
              <p className="text-smoke">Redirecting to set your password...</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-display text-ink mb-2">
                Verification Failed
              </h1>
              <p className="text-smoke text-sm mb-6">{error}</p>
              <button
                onClick={() => router.push("/auth/signin")}
                className="w-full bg-ink text-cream py-3 rounded-lg font-medium hover:bg-ink/90 transition"
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}