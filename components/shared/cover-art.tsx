import { cn, hashString } from "@/lib/utils";

const palettes = [
  ["#dbe4c9", "#8a9a74", "#2c3226"],
  ["#f0d9bc", "#c98f6b", "#3a2419"],
  ["#d9d2ec", "#8e84b8", "#241f33"],
  ["#cfe2e6", "#7ba6ad", "#1c2a2d"],
  ["#efd3d4", "#c08a8d", "#332022"],
  ["#d8e5d6", "#7fa08a", "#1d2a22"],
];

/**
 * Deterministic generative cover art. Keeps the site image-light and fast
 * while giving every post a distinct identity.
 */
export function CoverArt({
  seed,
  className,
  label,
}: {
  seed: string;
  className?: string;
  label?: string;
}) {
  const hash = hashString(seed || "default");
  const [a, b, c] = palettes[hash % palettes.length];
  const angle = hash % 360;
  const rings = 3 + (hash % 3);

  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      style={{
        background: `linear-gradient(${angle}deg, ${c} 0%, ${b} 55%, ${a} 130%)`,
      }}
      aria-hidden={!label}
    >
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 size-full opacity-90"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id={`g-${hash}`} cx="72%" cy="20%" r="80%">
            <stop offset="0%" stopColor={a} stopOpacity="0.95" />
            <stop offset="55%" stopColor={a} stopOpacity="0.15" />
            <stop offset="100%" stopColor={a} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`l-${hash}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={c} stopOpacity="0.7" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#g-${hash})`} />
        <rect width="400" height="300" fill={`url(#l-${hash})`} />
        {Array.from({ length: rings }).map((_, i) => (
          <circle
            key={i}
            cx={120 + (hash % 60)}
            cy={180 + (hash % 40)}
            r={40 + i * 46}
            fill="none"
            stroke={a}
            strokeOpacity={0.22 - i * 0.04}
            strokeWidth="1.2"
          />
        ))}
        <path
          d={`M0 ${220 + (hash % 40)} Q 100 ${150 + (hash % 60)} 200 ${205 + (hash % 25)} T 400 ${170 + (hash % 50)}`}
          fill="none"
          stroke={a}
          strokeOpacity="0.4"
          strokeWidth="1"
        />
        <g opacity="0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={i}
              x1={20 + i * 70}
              y1="0"
              x2={20 + i * 70}
              y2="300"
              stroke={a}
              strokeOpacity="0.08"
            />
          ))}
        </g>
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_100%,transparent,rgba(0,0,0,0.35))]" />
      <div className="noise absolute inset-0" />
      {label && (
        <span className="absolute bottom-3 left-4 z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
          {label}
        </span>
      )}
    </div>
  );
}
