/**
 * Original illustrations (no real product photography exists yet).
 * The bottle is a neutral, unbranded silhouette — NOT a reproduction of the
 * official Cojac's bottle or label. Replace with approved photos when available.
 */
import { useId } from 'react';
import type { FlavourPalette } from '../types';

interface BottleProps {
  palette: FlavourPalette;
  tag?: string;
  className?: string;
  title?: string;
}

export function BottleArt({ palette, tag, className, title }: BottleProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className={className}
      viewBox="0 0 220 540"
      role="img"
      aria-label={title ?? `Illustrated bottle${tag ? ` of ${tag}` : ''} (illustration, not a product photo)`}
    >
      <defs>
        <linearGradient id={`liq-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={palette.deep} />
          <stop offset="0.35" stopColor={palette.cream} />
          <stop offset="0.7" stopColor={palette.cream} />
          <stop offset="1" stopColor={palette.deep} />
        </linearGradient>
        <linearGradient id={`liqV-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#3a1a0a" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id={`gold-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#8a6428" />
          <stop offset="0.3" stopColor="#ecd6a6" />
          <stop offset="0.55" stopColor="#c49a58" />
          <stop offset="1" stopColor="#7a5520" />
        </linearGradient>
        <linearGradient id={`glass-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.12" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.92" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id={`shadow-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1a0508" stopOpacity="0.45" />
          <stop offset="1" stopColor="#1a0508" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`clip-${id}`}>
          <path d="M92 60 H128 V126 C128 160 184 170 184 222 V480 Q184 512 150 512 H70 Q36 512 36 480 V222 C36 170 92 160 92 126 Z" />
        </clipPath>
      </defs>
      <ellipse cx="110" cy="522" rx="92" ry="12" fill={`url(#shadow-${id})`} />
      {/* liquid — filled right to the top */}
      <g clipPath={`url(#clip-${id})`}>
        <rect x="30" y="66" width="160" height="452" fill={`url(#liq-${id})`} />
        <rect x="30" y="66" width="160" height="452" fill={`url(#liqV-${id})`} />
        <ellipse cx="110" cy="68" rx="20" ry="3" fill="#fff" opacity="0.4" />
      </g>
      {/* glass */}
      <path
        d="M92 60 H128 V126 C128 160 184 170 184 222 V480 Q184 512 150 512 H70 Q36 512 36 480 V222 C36 170 92 160 92 126 Z"
        fill={`url(#glass-${id})`}
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.5"
      />
      <path d="M50 230 C50 200 70 182 88 172" stroke="#fff" strokeOpacity="0.6" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M50 250 V460" stroke="#fff" strokeOpacity="0.45" strokeWidth="7" strokeLinecap="round" />
      <path d="M170 260 V440" stroke="#fff" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />
      {/* cap */}
      <rect x="88" y="18" width="44" height="50" rx="7" fill={`url(#gold-${id})`} />
      <rect x="88" y="56" width="44" height="6" fill="#000" opacity="0.15" />
      <path d="M96 24 V60" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
      {/* ribbon */}
      <g>
        <rect x="90" y="104" width="40" height="12" rx="2" fill={palette.accent} />
        <path d="M110 110 C92 92 72 96 76 108 C79 118 98 116 110 110 Z" fill={palette.accent} />
        <path d="M110 110 C128 92 148 96 144 108 C141 118 122 116 110 110 Z" fill={palette.accent} />
        <path d="M108 112 L96 150 L104 146 L108 154 Z" fill={palette.accent} />
        <path d="M112 112 L126 148 L118 145 L114 153 Z" fill={palette.accent} />
        <circle cx="110" cy="110" r="6" fill={palette.accent} stroke="#000" strokeOpacity="0.15" />
        <path d="M80 104 C86 100 94 102 100 106" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      </g>
      {/* hand-tied tag */}
      {tag && (
        <g transform="rotate(-8 148 196)">
          <path d="M124 120 C134 150 140 166 146 180" stroke="#8a6a40" strokeWidth="1.2" fill="none" />
          <path d="M132 180 H196 V236 H132 L120 208 Z" fill="#f7ecd6" stroke="#b08a52" strokeWidth="1" />
          <circle cx="134" cy="208" r="3" fill="none" stroke="#b08a52" />
          <text x="166" y="204" textAnchor="middle" fontFamily="Fraunces Variable, Georgia, serif" fontSize="11" fill="#4d0f1b" fontStyle="italic">
            {tag.split(' ')[0]}
          </text>
          <text x="166" y="220" textAnchor="middle" fontFamily="Fraunces Variable, Georgia, serif" fontSize="11" fill="#4d0f1b" fontStyle="italic">
            {tag.split(' ').slice(1).join(' ')}
          </text>
        </g>
      )}
    </svg>
  );
}

export function GlassArt({ palette, className }: { palette: FlavourPalette; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 140 170" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={palette.deep} />
          <stop offset="0.45" stopColor={palette.cream} />
          <stop offset="1" stopColor={palette.deep} />
        </linearGradient>
      </defs>
      <ellipse cx="70" cy="162" rx="52" ry="6" fill="#1a0508" opacity="0.3" />
      <path d="M22 50 L32 150 Q34 158 44 158 H96 Q106 158 108 150 L118 50 Z" fill={`url(#g-${id})`} />
      <ellipse cx="70" cy="50" rx="48" ry="8" fill={palette.cream} />
      <ellipse cx="70" cy="50" rx="48" ry="8" fill="#fff" opacity="0.25" />
      {/* nutmeg dusting */}
      {[
        [56, 48],
        [72, 51],
        [84, 47],
        [64, 53],
        [78, 49],
        [90, 51],
        [50, 51],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.3} fill="#7a4a2a" opacity="0.7" />
      ))}
      <path d="M14 20 L32 152 Q34 162 46 162 H94 Q106 162 108 152 L126 20" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" />
      <path d="M26 40 L36 140" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="70" cy="20" rx="56" ry="7" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" />
    </svg>
  );
}

export function CinnamonArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 80" aria-hidden="true">
      <g transform="rotate(-8 100 40)">
        <rect x="10" y="22" width="170" height="18" rx="9" fill="#8a5537" />
        <rect x="10" y="22" width="170" height="6" rx="3" fill="#b0714a" />
        <ellipse cx="180" cy="31" rx="5" ry="9" fill="#5a3624" />
        <path d="M178 26 q4 5 0 10" stroke="#b0714a" fill="none" />
        <rect x="24" y="42" width="150" height="16" rx="8" fill="#7a4a2e" />
        <rect x="24" y="42" width="150" height="5" rx="3" fill="#a0653f" />
        <ellipse cx="174" cy="50" rx="4.5" ry="8" fill="#4d2e1e" />
      </g>
      <g transform="translate(40 58)">
        <circle r="13" fill="#6b4126" />
        <path d="M-8 -4 q8 -6 16 0 M-9 3 q9 -5 18 1" stroke="#9a6440" strokeWidth="1.4" fill="none" />
      </g>
    </svg>
  );
}

/** Small decorative star (Christmas star / sparkle). */
export function Sparkle({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill="currentColor" />
    </svg>
  );
}

export function Ornament() {
  return (
    <div className="ornament" aria-hidden="true">
      <span />
      <Sparkle size={16} />
      <span />
    </div>
  );
}

/** Decorative botanical sprig (bay leaf / evergreen) used at section edges. */
export function Sprig({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 220" aria-hidden="true" fill="none">
      <path d="M60 218 C58 160 62 90 70 6" stroke="currentColor" strokeWidth="1.4" />
      {[30, 60, 90, 120, 150, 180].map((y, i) => (
        <g key={y}>
          <path d={`M${62 - i * 0.6} ${y + 8} C40 ${y} 28 ${y - 14} 22 ${y - 22} C38 ${y - 22} 54 ${y - 10} ${62 - i * 0.6} ${y + 8}Z`} fill="currentColor" opacity="0.7" />
          <path d={`M${64 - i * 0.6} ${y - 4} C84 ${y - 14} 94 ${y - 28} 98 ${y - 36} C82 ${y - 34} 68 ${y - 22} ${64 - i * 0.6} ${y - 4}Z`} fill="currentColor" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}
