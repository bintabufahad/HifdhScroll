function Stars({ count, className = "" }: { count: number; className?: string }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    top: (i * 37) % 100,
    left: (i * 53) % 100,
    size: 1 + (i % 3),
    delay: (i % 10) * 0.3,
    duration: 2 + (i % 5) * 0.6,
  }));
  return (
    <div className={`absolute inset-0 ${className}`}>
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Sunset() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-orange-300 via-pink-500 to-indigo-950">
      <div
        className="absolute left-1/2 top-[38%] h-28 w-28 -translate-x-1/2 rounded-full bg-gradient-to-b from-yellow-200 to-orange-400 blur-[1px]"
        style={{ animation: "glowPulse 6s ease-in-out infinite" }}
      />
      <div className="absolute inset-x-0 top-[20%] h-24 w-[200%] opacity-40" style={{ animation: "drift 40s linear infinite" }}>
        <div className="absolute left-[5%] h-10 w-32 rounded-full bg-white/60 blur-xl" />
        <div className="absolute left-[45%] h-8 w-40 rounded-full bg-orange-100/50 blur-xl" />
        <div className="absolute left-[70%] h-10 w-28 rounded-full bg-white/50 blur-xl" />
      </div>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path d="M0,100 L0,60 Q50,20 100,55 T200,45 T300,60 T400,40 L400,100 Z" fill="#1e1b4b" opacity="0.85" />
      </svg>
    </div>
  );
}

function Ocean() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-sky-300 via-sky-500 to-teal-800">
      <div
        className="absolute left-1/2 top-[22%] h-16 w-16 -translate-x-1/2 rounded-full bg-yellow-100/90 blur-[2px]"
        style={{ animation: "glowPulse 7s ease-in-out infinite" }}
      />
      <div className="absolute bottom-0 h-1/2 w-[200%]" style={{ animation: "drift 18s linear infinite" }}>
        <svg className="h-full w-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          <path d="M0,120 Q100,90 200,120 T400,120 T600,120 T800,120 L800,200 L0,200 Z" fill="#0d9488" opacity="0.55" />
        </svg>
      </div>
      <div className="absolute bottom-0 h-2/5 w-[200%]" style={{ animation: "driftReverse 26s linear infinite" }}>
        <svg className="h-full w-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          <path d="M0,140 Q100,110 200,140 T400,140 T600,140 T800,140 L800,200 L0,200 Z" fill="#134e4a" opacity="0.8" />
        </svg>
      </div>
    </div>
  );
}

function Desert() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-amber-200 via-orange-400 to-purple-950">
      <Stars count={14} className="opacity-70" />
      <div
        className="absolute left-1/2 top-[45%] h-20 w-20 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-100 to-red-400"
        style={{ animation: "glowPulse 8s ease-in-out infinite" }}
      />
      <div className="absolute bottom-0 h-1/3 w-[200%]" style={{ animation: "drift 50s linear infinite" }}>
        <svg className="h-full w-full" viewBox="0 0 800 150" preserveAspectRatio="none">
          <path d="M0,150 L0,90 Q100,60 200,85 T400,80 T600,95 T800,80 L800,150 Z" fill="#7c2d12" opacity="0.5" />
        </svg>
      </div>
      <div className="absolute bottom-0 h-1/4 w-[200%]" style={{ animation: "driftReverse 30s linear infinite" }}>
        <svg className="h-full w-full" viewBox="0 0 800 120" preserveAspectRatio="none">
          <path d="M0,120 L0,70 Q120,40 240,65 T480,60 T720,75 L800,70 L800,120 Z" fill="#451a03" opacity="0.85" />
        </svg>
      </div>
    </div>
  );
}

function Mountains() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-slate-300 via-blue-300 to-slate-600">
      <div className="absolute right-[15%] top-[12%] h-14 w-14 rounded-full bg-white/90" style={{ animation: "glowPulse 9s ease-in-out infinite" }} />
      <div className="absolute inset-x-0 top-[8%] h-20 w-[200%] opacity-50" style={{ animation: "drift 55s linear infinite" }}>
        <div className="absolute left-[10%] h-8 w-36 rounded-full bg-white/70 blur-lg" />
        <div className="absolute left-[60%] h-6 w-44 rounded-full bg-white/60 blur-lg" />
      </div>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 160" preserveAspectRatio="none">
        <path d="M0,160 L0,90 L60,30 L120,90 L160,50 L220,95 L280,40 L340,90 L400,60 L400,160 Z" fill="#64748b" opacity="0.55" />
        <path d="M0,160 L0,120 L80,60 L150,120 L210,75 L270,125 L340,70 L400,110 L400,160 Z" fill="#334155" opacity="0.9" />
      </svg>
    </div>
  );
}

function NightSky() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-black">
      <Stars count={40} />
      <svg className="absolute right-[12%] top-[15%] h-16 w-16" viewBox="0 0 100 100" style={{ animation: "glowPulse 10s ease-in-out infinite" }}>
        <path d="M60,10 A40,40 0 1 0 60,90 A32,32 0 1 1 60,10 Z" fill="#fef9c3" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 80" preserveAspectRatio="none">
        <path d="M0,80 L0,55 Q80,25 160,50 T320,45 T400,55 L400,80 Z" fill="#0f172a" />
      </svg>
    </div>
  );
}

function Forest() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-emerald-200 via-emerald-500 to-emerald-900">
      <div className="absolute left-1/2 top-[16%] h-24 w-24 -translate-x-1/2 rounded-full bg-yellow-100/50 blur-2xl" style={{ animation: "glowPulse 8s ease-in-out infinite" }} />
      <div className="absolute inset-x-0 top-1/4 h-1/2 w-[200%] opacity-40" style={{ animation: "drift 60s linear infinite" }}>
        <div className="absolute left-[10%] h-16 w-52 rounded-full bg-white/50 blur-2xl" />
        <div className="absolute left-[55%] h-12 w-64 rounded-full bg-white/40 blur-2xl" />
      </div>
      <div className="absolute bottom-0 w-full origin-bottom" style={{ animation: "sway 7s ease-in-out infinite" }}>
        <svg className="w-full" viewBox="0 0 400 130" preserveAspectRatio="none">
          <path d="M20,130 L20,60 L35,60 L20,25 L5,60 L20,60 M120,130 L120,50 L138,50 L120,10 L102,50 L120,50 M300,130 L300,55 L320,55 L300,15 L280,55 L300,55 M380,130 L380,65 L395,65 L380,30 L365,65 L380,65"
            fill="#064e3b" opacity="0.9" stroke="#064e3b" strokeWidth="14" strokeLinejoin="round" />
        </svg>
      </div>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 40" preserveAspectRatio="none">
        <path d="M0,40 L0,20 Q200,0 400,20 L400,40 Z" fill="#022c22" />
      </svg>
    </div>
  );
}

const SCENES: Record<string, () => React.ReactElement> = {
  sunset: Sunset,
  ocean: Ocean,
  desert: Desert,
  mountains: Mountains,
  nightsky: NightSky,
  forest: Forest,
};

export default function SceneBackground({ sceneId, className = "" }: { sceneId: string; className?: string }) {
  const Component = SCENES[sceneId] ?? Sunset;
  return (
    <div className={`relative h-full w-full ${className}`}>
      <Component />
    </div>
  );
}
