"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { Mail, ArrowRight, Loader } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Check your email for the login link. It expires in 24h." });
      setEmail("");
    }
  };

  return (
    <main className="min-h-screen flex flex-col px-6 py-12 safe-top safe-bottom">
      {/* back button */}
      <Link href="/" className="text-sm font-medium text-smoke hover:text-ink transition-colors mb-8">
        ← Back
      </Link>

      {/* headline */}
      <div className="flex-1 flex flex-col justify-center py-8">
        <h1 className="text-4xl leading-tight font-display tracking-tight text-ink mb-2">
          Welcome back.
        </h1>
        <p className="text-smoke text-base mb-8 max-w-xs">
          We'll send you a magic link to your email. No password needed.
        </p>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-ash pointer-events-none" />
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-12 py-4"
              required
              disabled={loading}
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-matcha/15 text-matcha border border-matcha/30"
                  : "bg-ember/15 text-ember border border-ember/30"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="btn-primary btn-ink flex justify-between"
          >
            <span>{loading ? "Sending..." : "Send magic link"}</span>
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* info */}
        <div className="card p-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-wide text-ash">Secured by Supabase</p>
          <ul className="text-[13px] space-y-1 text-smoke leading-relaxed">
            <li>✓ Link expires in 24 hours</li>
            <li>✓ One email per account</li>
            <li>✓ We never store your password</li>
          </ul>
        </div>
      </div>

      {/* brand mark */}
      <div className="pt-8 border-t border-ink/10">
        <p className="text-[11px] font-mono tracking-widest uppercase text-ash">Teatime × Supabase</p>
      </div>
    </main>
  );
}
