import Link from "next/link";

export default function Landing() {
  return (
    <main className="min-h-screen relative overflow-hidden safe-top safe-bottom">
      {/* atmospheric color blooms - hidden on desktop */}
      <div className="absolute top-0 -right-20 w-80 h-80 rounded-full bg-ember/20 blur-[80px] pointer-events-none lg:hidden" />
      <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-matcha/20 blur-[80px] pointer-events-none lg:hidden" />

      <div className="relative z-10 grid md:grid-cols-2 gap-8 lg:gap-16 min-h-screen">
        {/* Left: Headline */}
        <div className="flex flex-col justify-center px-6 md:px-0 md:pr-8 py-12">
        {/* mark */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-cream text-base">☕</div>
          <span className="font-mono text-xs tracking-widest uppercase text-smoke">teatime · est 2026</span>
        </div>

        {/* headline */}
        <div className="flex-1 flex flex-col justify-center py-12">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-ash mb-6">No. 01 — An invitation</p>
          <h1 className="text-[56px] leading-[0.92] tracking-tight text-ink mb-6">
            A cup of tea,
            <br />
            <span className="editorial text-rust">a walk away.</span>
          </h1>
          <p className="text-smoke text-lg leading-relaxed max-w-[340px]">
            Find someone in your building, your campus, your block — for chai, coffee, lunch, a smoke break, or just air.
          </p>
        </div>

        {/* feature strip */}
        <div className="mb-10 grid grid-cols-3 gap-3 text-center">
          {[
            { emoji: "📍", label: "Auto-locate" },
            { emoji: "🔔", label: "Real-time" },
            { emoji: "🗺️", label: "Live map" },
          ].map((f) => (
            <div key={f.label} className="card py-4 px-2">
              <div className="text-2xl mb-1">{f.emoji}</div>
              <div className="text-[11px] font-medium text-smoke tracking-wide">{f.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link href="/auth" className="btn-primary btn-ember">
            Start with an email →
          </Link>
          <p className="text-center text-[11px] font-mono tracking-wide text-ash uppercase">
            For students and desk workers alike
          </p>
        </div>
        </div>

        {/* Right: Features (desktop only) */}
        <div className="hidden md:flex flex-col justify-center px-8 lg:px-12">
          <div className="space-y-4">
            <div className="card p-6">
              <div className="text-3xl mb-3">📍</div>
              <h3 className="font-display text-lg mb-2">Auto-locate</h3>
              <p className="text-sm text-smoke">Find people in your exact building or block</p>
            </div>
            <div className="card p-6">
              <div className="text-3xl mb-3">🔔</div>
              <h3 className="font-display text-lg mb-2">Real-time</h3>
              <p className="text-sm text-smoke">Instant notifications when someone nearby joins</p>
            </div>
            <div className="card p-6">
              <div className="text-3xl mb-3">🗺️</div>
              <h3 className="font-display text-lg mb-2">Live map</h3>
              <p className="text-sm text-smoke">See all activity on a beautiful, interactive map</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
