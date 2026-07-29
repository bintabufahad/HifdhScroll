import { useId } from "react";

/**
 * Procedural, cinematic scene backdrops for reels and ayah gifts. Everything is
 * CSS/SVG (no image downloads), but layered like photographs: deep multi-stop
 * palettes, atmospheric haze, soft glows, film grain and vignettes - so the
 * ayah sits on something that feels shot at maghrib, not drawn in a hurry.
 */

/* ---------- shared atmosphere helpers ---------- */

function Grain({ opacity = 0.05 }: { opacity?: number }) {
  const id = useId();
  return (
    <svg className="absolute inset-0 h-full w-full" style={{ opacity }} aria-hidden>
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}

function Vignette({ strength = 0.5 }: { strength?: number }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse 90% 75% at 50% 45%, transparent 55%, rgba(0,0,0,${strength}) 100%)`,
      }}
    />
  );
}

/** A soft luminous body (sun/moon) with a wide halo. */
function Glow({
  x,
  y,
  size,
  core,
  halo,
  pulse = 8,
}: {
  x: string;
  y: string;
  size: number;
  core: string;
  halo: string;
  pulse?: number;
}) {
  return (
    <>
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: x,
          top: y,
          width: size * 3.2,
          height: size * 3.2,
          background: `radial-gradient(circle, ${halo} 0%, transparent 65%)`,
          animation: `glowPulse ${pulse}s ease-in-out infinite`,
        }}
      />
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: x,
          top: y,
          width: size,
          height: size,
          background: `radial-gradient(circle at 38% 32%, ${core}, ${halo})`,
          boxShadow: `0 0 ${size * 0.7}px ${size * 0.25}px ${halo}`,
        }}
      />
    </>
  );
}

/** Slow-drifting horizontal haze band. */
function Haze({ top, height, color, duration = 55, reverse = false }: { top: string; height: string; color: string; duration?: number; reverse?: boolean }) {
  return (
    <div
      className="absolute w-[200%]"
      style={{ top, height, animation: `${reverse ? "driftReverse" : "drift"} ${duration}s linear infinite` }}
    >
      <div className="absolute left-[5%] h-full w-[38%] rounded-full blur-3xl" style={{ background: color }} />
      <div className="absolute left-[52%] h-full w-[30%] rounded-full blur-3xl" style={{ background: color, opacity: 0.8 }} />
      <div className="absolute left-[80%] h-full w-[26%] rounded-full blur-3xl" style={{ background: color, opacity: 0.6 }} />
    </div>
  );
}

/** Star field with depth: a few bright glowing stars, many faint ones. */
function Stars({ count, className = "" }: { count: number; className?: string }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    top: (i * 37 + 7) % 92,
    left: (i * 53 + 11) % 100,
    size: i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.8 : 1,
    bright: i % 7 === 0,
    delay: (i % 10) * 0.35,
    duration: 2.4 + (i % 5) * 0.7,
  }));
  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.bright ? 0.95 : 0.55,
            boxShadow: s.bright ? "0 0 6px 1.5px rgba(255,255,255,0.7)" : undefined,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/** Layered mountain ridges with atmospheric perspective (far = palest). */
function Ridges({ colors, opacities = [0.35, 0.6, 0.95] }: { colors: [string, string, string]; opacities?: number[] }) {
  return (
    <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 150" preserveAspectRatio="none" aria-hidden>
      <path d="M0,150 L0,74 L46,46 L88,72 L132,38 L178,70 L224,48 L266,76 L312,44 L356,70 L400,52 L400,150 Z" fill={colors[0]} opacity={opacities[0]} />
      <path d="M0,150 L0,96 L54,64 L108,96 L158,70 L212,100 L262,72 L318,102 L368,78 L400,92 L400,150 Z" fill={colors[1]} opacity={opacities[1]} />
      <path d="M0,150 L0,120 L60,94 L124,122 L184,100 L248,126 L310,102 L400,124 L400,150 Z" fill={colors[2]} opacity={opacities[2]} />
    </svg>
  );
}

/** Smooth layered dunes. */
function Dunes({ colors }: { colors: [string, string, string] }) {
  return (
    <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden>
      <path d="M0,140 L0,78 C70,52 130,86 200,72 C270,58 330,84 400,64 L400,140 Z" fill={colors[0]} opacity="0.45" />
      <path d="M0,140 L0,100 C90,74 170,108 260,92 C330,80 370,98 400,90 L400,140 Z" fill={colors[1]} opacity="0.7" />
      <path d="M0,140 L0,118 C110,96 220,126 320,110 C360,104 385,112 400,108 L400,140 Z" fill={colors[2]} opacity="0.95" />
    </svg>
  );
}

/** A quiet mosque skyline in silhouette: central dome, two minarets. */
function MosqueSkyline({ color, opacity = 0.9 }: { color: string; opacity?: number }) {
  return (
    <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden>
      <g fill={color} opacity={opacity}>
        {/* ground */}
        <rect x="0" y="104" width="400" height="16" />
        {/* left minaret */}
        <rect x="88" y="38" width="8" height="70" />
        <rect x="84" y="52" width="16" height="5" rx="2" />
        <path d="M85,38 Q92,22 99,38 Z" />
        <rect x="91.2" y="14" width="1.6" height="10" />
        <circle cx="92" cy="12.5" r="1.8" />
        {/* right minaret */}
        <rect x="304" y="38" width="8" height="70" />
        <rect x="300" y="52" width="16" height="5" rx="2" />
        <path d="M301,38 Q308,22 315,38 Z" />
        <rect x="307.2" y="14" width="1.6" height="10" />
        <circle cx="308" cy="12.5" r="1.8" />
        {/* main hall */}
        <rect x="130" y="86" width="140" height="22" />
        {/* central dome */}
        <path d="M158,88 C158,58 178,46 200,46 C222,46 242,58 242,88 Z" />
        <rect x="199.2" y="34" width="1.6" height="10" />
        <circle cx="200" cy="32" r="2" />
        {/* side domes */}
        <path d="M118,104 C118,88 128,82 137,82 C146,82 156,88 156,104 Z" />
        <path d="M244,104 C244,88 254,82 263,82 C272,82 282,88 282,104 Z" />
      </g>
    </svg>
  );
}

/** Faint 8-point-star lattice, for the paper scenes. */
function GeometricLattice({ color, opacity = 0.07 }: { color: string; opacity?: number }) {
  const id = useId();
  return (
    <svg className="absolute inset-0 h-full w-full" style={{ opacity }} aria-hidden>
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <rect x="16" y="16" width="24" height="24" fill="none" stroke={color} strokeWidth="1" />
          <rect x="16" y="16" width="24" height="24" fill="none" stroke={color} strokeWidth="1" transform="rotate(45 28 28)" />
          <circle cx="28" cy="28" r="2" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Slanted shafts of light falling from above. */
function LightRays({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {[18, 38, 62, 80].map((left, i) => (
        <div
          key={i}
          className="absolute -top-1/4 h-[150%] blur-2xl"
          style={{
            left: `${left}%`,
            width: `${7 + (i % 2) * 5}%`,
            background: `linear-gradient(to bottom, ${color}, transparent 75%)`,
            transform: "rotate(14deg)",
            opacity: 0.5 - i * 0.08,
          }}
        />
      ))}
    </div>
  );
}

function Crescent({ x, y, size, color, glow }: { x: string; y: string; size: number; color: string; glow: string }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y, animation: "glowPulse 10s ease-in-out infinite" }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 ${size / 4}px ${glow})` }}>
        <path d="M62,8 A44,44 0 1 0 62,92 A35,35 0 1 1 62,8 Z" fill={color} />
      </svg>
    </div>
  );
}

/* ---------- the scenes ---------- */

function Sunset() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #171034 0%, #3d1e46 32%, #7e2f45 55%, #c4573c 74%, #e8945a 88%, #f6c178 100%)" }}
    >
      <Stars count={16} className="opacity-50" />
      <Glow x="50%" y="76%" size={72} core="#ffe9b8" halo="rgba(244,164,96,0.5)" pulse={7} />
      <Haze top="58%" height="9%" color="rgba(240,150,110,0.35)" duration={70} />
      <Haze top="40%" height="7%" color="rgba(150,80,120,0.3)" duration={90} reverse />
      <Ridges colors={["#4b2440", "#33172f", "#1c0c1e"]} />
      <Grain opacity={0.05} />
      <Vignette strength={0.55} />
    </div>
  );
}

function Ocean() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #0b1d33 0%, #14324e 38%, #1d4a63 58%, #0f3a49 78%, #072531 100%)" }}
    >
      <Stars count={22} className="opacity-60" />
      <Glow x="66%" y="24%" size={44} core="#fdf6da" halo="rgba(210,225,235,0.4)" pulse={9} />
      {/* moon path shimmering on the water */}
      <div
        className="absolute bottom-0 left-[66%] h-[46%] w-16 -translate-x-1/2 blur-md"
        style={{ background: "linear-gradient(to bottom, rgba(253,246,218,0.35), rgba(253,246,218,0.05))", animation: "glowPulse 6s ease-in-out infinite" }}
      />
      <div className="absolute bottom-0 h-[38%] w-[200%]" style={{ animation: "drift 30s linear infinite" }}>
        <svg className="h-full w-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          <path d="M0,60 Q100,42 200,60 T400,60 T600,60 T800,60 L800,200 L0,200 Z" fill="#0a2e40" opacity="0.75" />
        </svg>
      </div>
      <div className="absolute bottom-0 h-[26%] w-[200%]" style={{ animation: "driftReverse 22s linear infinite" }}>
        <svg className="h-full w-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          <path d="M0,70 Q120,50 240,70 T480,70 T720,70 L800,66 L800,200 L0,200 Z" fill="#051a26" opacity="0.9" />
        </svg>
      </div>
      <Grain opacity={0.045} />
      <Vignette strength={0.5} />
    </div>
  );
}

function Desert() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #120b2e 0%, #2c1444 34%, #5c2a52 58%, #a05243 80%, #cf8353 100%)" }}
    >
      <Stars count={30} className="opacity-70" />
      <Glow x="34%" y="58%" size={54} core="#ffdf9e" halo="rgba(220,140,80,0.45)" pulse={9} />
      <Haze top="52%" height="7%" color="rgba(200,120,90,0.3)" duration={80} />
      <Dunes colors={["#6b3350", "#47203c", "#241026"]} />
      <Grain opacity={0.055} />
      <Vignette strength={0.55} />
    </div>
  );
}

function Mountains() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #16243c 0%, #29405e 40%, #52708e 68%, #8fa8bd 100%)" }}
    >
      <Stars count={12} className="opacity-40" />
      <Glow x="76%" y="18%" size={36} core="#f6f7f2" halo="rgba(200,215,230,0.35)" pulse={10} />
      <Haze top="55%" height="12%" color="rgba(190,205,220,0.4)" duration={65} />
      <Ridges colors={["#5d7794", "#3a5271", "#1d2f47"]} />
      <Haze top="80%" height="10%" color="rgba(160,180,200,0.35)" duration={50} reverse />
      <Grain opacity={0.04} />
      <Vignette strength={0.45} />
    </div>
  );
}

function NightSky() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #05060f 0%, #0d1226 45%, #1a1f3d 78%, #232849 100%)" }}
    >
      {/* milky way band */}
      <div
        className="absolute left-[10%] top-[-10%] h-[130%] w-[34%] blur-3xl"
        style={{ background: "linear-gradient(to bottom, rgba(160,170,220,0.16), rgba(120,130,190,0.06))", transform: "rotate(24deg)" }}
      />
      <Stars count={64} />
      <Crescent x="74%" y="20%" size={64} color="#f8f0cd" glow="rgba(248,240,205,0.45)" />
      <MosqueSkyline color="#04050c" opacity={0.96} />
      <Grain opacity={0.05} />
      <Vignette strength={0.5} />
    </div>
  );
}

function Forest() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #0d2b1e 0%, #12402a 42%, #1c5434 68%, #0a2417 100%)" }}
    >
      <LightRays color="rgba(212,236,180,0.35)" />
      <Glow x="50%" y="12%" size={40} core="rgba(240,250,210,0.9)" halo="rgba(190,220,150,0.35)" pulse={8} />
      <Haze top="55%" height="14%" color="rgba(120,170,130,0.28)" duration={75} />
      {/* two rows of pines */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden>
        <g fill="#0c2e1c" opacity="0.65">
          <path d="M30,140 L30,96 L44,96 L30,54 L16,96 L30,96 Z" />
          <path d="M105,140 L105,90 L121,90 L105,42 L89,90 L105,90 Z" />
          <path d="M190,140 L190,98 L204,98 L190,60 L176,98 L190,98 Z" />
          <path d="M275,140 L275,88 L292,88 L275,38 L258,88 L275,88 Z" />
          <path d="M355,140 L355,95 L370,95 L355,52 L340,95 L355,95 Z" />
        </g>
        <g fill="#041710" opacity="0.95">
          <path d="M65,140 L65,104 L82,104 L65,50 L48,104 L65,104 Z" />
          <path d="M150,140 L150,100 L169,100 L150,40 L131,100 L150,100 Z" />
          <path d="M235,140 L235,106 L252,106 L235,56 L218,106 L235,106 Z" />
          <path d="M320,140 L320,98 L339,98 L320,44 L301,98 L320,98 Z" />
          <path d="M390,140 L390,108 L400,108 L400,140 Z" />
        </g>
      </svg>
      {/* fireflies */}
      <div className="absolute inset-x-0 bottom-[12%] h-1/3" aria-hidden>
        {[14, 32, 51, 68, 84].map((left, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${(i * 29) % 90}%`,
              width: 3,
              height: 3,
              background: "#e8f5a3",
              boxShadow: "0 0 8px 2px rgba(220,240,140,0.65)",
              animation: `twinkle ${2.8 + i * 0.5}s ease-in-out ${i * 0.6}s infinite`,
            }}
          />
        ))}
      </div>
      <Grain opacity={0.05} />
      <Vignette strength={0.55} />
    </div>
  );
}

function Parchment() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "radial-gradient(ellipse 120% 90% at 50% 30%, #f4ead2 0%, #e9d9b2 45%, #d3ba85 80%, #c0a266 100%)" }}
    >
      <GeometricLattice color="#8a6f3f" opacity={0.08} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 18% 8%, rgba(255,250,235,0.6), transparent 70%)" }} />
      <Grain opacity={0.07} />
      <Vignette strength={0.4} />
    </div>
  );
}

function Ivory() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "radial-gradient(ellipse 130% 100% at 50% 20%, #fbf8f0 0%, #f2e9d6 55%, #e2d2b2 100%)" }}
    >
      <GeometricLattice color="#a58a55" opacity={0.06} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 35% at 78% 12%, rgba(240,220,170,0.4), transparent 70%)" }} />
      <Grain opacity={0.04} />
      <Vignette strength={0.3} />
    </div>
  );
}

function Sepia() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "radial-gradient(ellipse 110% 85% at 50% 35%, #a8845c 0%, #7c5c3a 50%, #4a3421 82%, #2c1e12 100%)" }}
    >
      {/* light leak */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 45% 60% at 92% 0%, rgba(240,200,140,0.35), transparent 70%)" }} />
      <Grain opacity={0.1} />
      <Vignette strength={0.65} />
    </div>
  );
}

function Charcoal() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "radial-gradient(ellipse 120% 90% at 50% 25%, #3f4147 0%, #26272c 55%, #101114 100%)" }}
    >
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 30% at 50% 0%, rgba(200,205,215,0.14), transparent 70%)" }} />
      <Grain opacity={0.06} />
      <Vignette strength={0.55} />
    </div>
  );
}

function RoseDusk() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #2e1b33 0%, #63344c 38%, #a75a63 62%, #d99a84 84%, #edc4a0 100%)" }}
    >
      <Stars count={10} className="opacity-40" />
      <Glow x="50%" y="66%" size={56} core="#ffe6c4" halo="rgba(235,160,130,0.45)" pulse={9} />
      <Haze top="48%" height="9%" color="rgba(220,140,140,0.32)" duration={75} />
      <Ridges colors={["#7c4054", "#57293f", "#331526"]} />
      <Grain opacity={0.045} />
      <Vignette strength={0.5} />
    </div>
  );
}

function Lavender() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #1d1633 0%, #3c2d5e 38%, #6d549a 66%, #9d85c2 88%, #c3b0da 100%)" }}
    >
      <Stars count={26} className="opacity-60" />
      <Crescent x="26%" y="20%" size={44} color="#f4eede" glow="rgba(244,238,222,0.4)" />
      <Haze top="52%" height="10%" color="rgba(190,170,230,0.35)" duration={70} />
      <Ridges colors={["#5c477f", "#413060", "#241a3d"]} />
      <Grain opacity={0.045} />
      <Vignette strength={0.5} />
    </div>
  );
}

function GoldenHour() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #45210f 0%, #7a3d16 30%, #b8681f 55%, #e29a3a 76%, #f6c968 94%, #fbe29a 100%)" }}
    >
      <Glow x="50%" y="70%" size={80} core="#fff3c4" halo="rgba(250,190,90,0.55)" pulse={7} />
      <Haze top="56%" height="8%" color="rgba(250,200,120,0.4)" duration={65} />
      <Haze top="38%" height="6%" color="rgba(200,120,60,0.3)" duration={85} reverse />
      {/* floating dust motes */}
      <div className="absolute inset-0" aria-hidden>
        {[20, 37, 55, 71, 86].map((left, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${28 + ((i * 17) % 40)}%`,
              width: 2.5,
              height: 2.5,
              background: "rgba(255,230,170,0.9)",
              boxShadow: "0 0 6px 1px rgba(255,220,150,0.6)",
              animation: `twinkle ${3 + i * 0.6}s ease-in-out ${i * 0.5}s infinite`,
            }}
          />
        ))}
      </div>
      <Ridges colors={["#8a4d1c", "#5f3212", "#371c08"]} />
      <Grain opacity={0.05} />
      <Vignette strength={0.5} />
    </div>
  );
}

function TealFade() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #06201f 0%, #0c3a36 38%, #17564d 64%, #2b7a68 88%, #47997f 100%)" }}
    >
      <Glow x="50%" y="30%" size={44} core="rgba(210,245,225,0.85)" halo="rgba(120,200,170,0.3)" pulse={9} />
      <Haze top="58%" height="12%" color="rgba(110,190,160,0.28)" duration={70} />
      <Ridges colors={["#1d5a4c", "#123c34", "#07211d"]} />
      <Grain opacity={0.045} />
      <Vignette strength={0.5} />
    </div>
  );
}

function MoonlitSilver() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #0e1420 0%, #1d2a3c 42%, #35485e 70%, #566d84 100%)" }}
    >
      <Stars count={34} className="opacity-70" />
      <Glow x="70%" y="22%" size={52} core="#f7f9f4" halo="rgba(215,230,240,0.45)" pulse={9} />
      <Haze top="24%" height="8%" color="rgba(190,205,220,0.25)" duration={60} />
      <Haze top="60%" height="10%" color="rgba(150,170,195,0.3)" duration={80} reverse />
      <Ridges colors={["#465b73", "#2d4054", "#152232"]} />
      <Grain opacity={0.045} />
      <Vignette strength={0.5} />
    </div>
  );
}

function MistyDawn() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #d8c5c8 0%, #c9b4bd 30%, #a7a2b5 58%, #7e8aa0 82%, #61728c 100%)" }}
    >
      <Glow x="50%" y="38%" size={40} core="rgba(255,240,225,0.95)" halo="rgba(240,210,190,0.5)" pulse={8} />
      <Haze top="30%" height="14%" color="rgba(245,235,235,0.55)" duration={60} />
      <Haze top="52%" height="16%" color="rgba(230,225,232,0.5)" duration={80} reverse />
      <Haze top="74%" height="12%" color="rgba(210,210,222,0.45)" duration={50} />
      <Ridges colors={["#8b90a6", "#6d7690", "#4c5a76"]} opacities={[0.3, 0.5, 0.8]} />
      {/* distant birds */}
      <svg className="absolute left-[30%] top-[26%] w-24 opacity-50" viewBox="0 0 100 30" aria-hidden>
        <path d="M10,15 Q15,9 20,15 Q25,9 30,15" stroke="#3c4356" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M48,10 Q52,5 56,10 Q60,5 64,10" stroke="#3c4356" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M76,18 Q79,14 82,18 Q85,14 88,18" stroke="#3c4356" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </svg>
      <Grain opacity={0.04} />
      <Vignette strength={0.4} />
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
  parchment: Parchment,
  ivory: Ivory,
  sepia: Sepia,
  charcoal: Charcoal,
  rosedusk: RoseDusk,
  lavender: Lavender,
  goldenhour: GoldenHour,
  tealfade: TealFade,
  moonlit: MoonlitSilver,
  mistydawn: MistyDawn,
};

export default function SceneBackground({ sceneId, className = "" }: { sceneId: string; className?: string }) {
  const Component = SCENES[sceneId] ?? Sunset;
  return (
    <div className={`relative h-full w-full ${className}`}>
      <Component />
    </div>
  );
}
