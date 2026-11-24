import type { CSSProperties, ReactNode } from "react";

/**
 * Real brand logos (self-hosted in /public/logos, licences alongside) keep their official colours.
 * Everything else is a thin line icon drawn in the same style, in the current text colour.
 */
export const BRAND = {
  python: { src: "/logos/python.svg", color: "#3776AB" },
  c: { src: "/logos/c.svg", color: "#A8B9CC" },
  git: { src: "/logos/git.svg", color: "#F05032" },
  word: { src: "/logos/word.svg", color: "#2B579A" },
  excel: { src: "/logos/excel.svg", color: "#217346" },
  powerpoint: { src: "/logos/powerpoint.svg", color: "#B7472A" },
} as const;

export type BrandKey = keyof typeof BRAND;

export function isBrand(key: string): key is BrandKey {
  return Object.prototype.hasOwnProperty.call(BRAND, key);
}

/** 48×48 line icons, stroke 1.5, no fill. */
export const CONCEPT: Record<string, ReactNode> = {
  sql: (
    <>
      <ellipse cx="24" cy="11" rx="14" ry="5" />
      <path d="M10 11v26c0 2.8 6.3 5 14 5s14-2.2 14-5V11" />
      <path d="M10 24c0 2.8 6.3 5 14 5s14-2.2 14-5" />
    </>
  ),
  powerbi: (
    <>
      <rect x="9" y="27" width="8" height="13" rx="2" />
      <rect x="20" y="17" width="8" height="23" rx="2" />
      <rect x="31" y="8" width="8" height="32" rx="2" />
      <path d="M5 44h38" />
    </>
  ),
  critical: (
    <>
      <path d="M24 5a12 12 0 0 0-6 22.4V33h12v-5.6A12 12 0 0 0 24 5Z" />
      <path d="M19 38h10M21 43h6" />
    </>
  ),
  adaptability: (
    <>
      <path d="M9 22a15 15 0 0 1 26-7.5L39 18" />
      <path d="M39 8v10H29" />
      <path d="M39 26a15 15 0 0 1-26 7.5L9 30" />
      <path d="M9 40V30h10" />
    </>
  ),
  detail: (
    <>
      <circle cx="21" cy="21" r="12" />
      <path d="M30 30l12 12" />
      <path d="M21 16v10M16 21h10" />
    </>
  ),
  communication: (
    <>
      <path d="M8 9h22a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H19l-7 6v-6H8a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2Z" />
      <path d="M35 19h5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-3v6l-7-6H24a2 2 0 0 1-2-2v-3" />
    </>
  ),
  language: (
    <>
      <circle cx="24" cy="24" r="17" />
      <path d="M7 24h34" />
      <path d="M24 7c5 4.6 7.5 10.3 7.5 17S29 36.4 24 41c-5-4.6-7.5-10.3-7.5-17S19 11.6 24 7Z" />
    </>
  ),
};

type Props = {
  logo: string;
  /** Pixel size of the icon itself. */
  size?: number;
  /** Soft brand-tint glow behind real brand logos. */
  glow?: boolean;
  className?: string;
};

export default function TechLogo({ logo, size = 48, glow = false, className }: Props) {
  if (isBrand(logo)) {
    const { src, color } = BRAND[logo];
    const style = { "--c": color, width: size, height: size } as CSSProperties;
    return (
      <span className={`tl ${glow ? "tl-glow" : ""} ${className ?? ""}`} style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={size} height={size} draggable={false} />
      </span>
    );
  }
  const icon = CONCEPT[logo] ?? CONCEPT.language;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={size > 80 ? 0.6 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icon}
    </svg>
  );
}
