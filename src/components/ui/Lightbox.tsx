"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Shot } from "@/lib/data";
import { useScroll } from "@/lib/scroll";

type Props = {
  /** Accessible name, e.g. the project title. */
  title: string;
  shots: Shot[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Enlarged, uncropped view of a project's screenshots. Esc / arrows / swipe / backdrop click. */
export default function Lightbox({ title, shots, index, onIndex, onClose }: Props) {
  const { lock } = useScroll();
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const shot = shots[index];
  const many = shots.length > 1;

  const go = useCallback(
    (d: number) => onIndex((index + d + shots.length) % shots.length),
    [index, onIndex, shots.length],
  );

  /* lock page scroll, move focus in, and give it back to the thumbnail on close */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    lock(true);
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      lock(false);
      opener?.focus?.({ preventScroll: true });
    };
  }, [lock]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && many) go(1);
      else if (e.key === "ArrowLeft" && many) go(-1);
      else if (e.key === "Tab" && root.current) {
        const f = root.current.querySelectorAll<HTMLElement>("button:not([disabled])");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, many, onClose]);

  return (
    <div
      ref={root}
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label={`${title}: screenshots`}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("lb-stage")) onClose();
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || !many) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="lb-top">
        <p className="lb-count" aria-live="polite">
          {pad(index + 1)} / {pad(shots.length)}
        </p>
        <button ref={closeBtn} type="button" className="lb-btn lb-close" onClick={onClose} aria-label="Close enlarged view">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="lb-stage">
        {many && (
          <button type="button" className="lb-btn lb-nav lb-prev" onClick={() => go(-1)} aria-label="Previous screenshot">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
              <path d="M11 3 5 9l6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <figure className="lb-fig" key={shot.src}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} draggable={false} />
          <figcaption>{shot.label}</figcaption>
        </figure>
        {many && (
          <button type="button" className="lb-btn lb-nav lb-next" onClick={() => go(1)} aria-label="Next screenshot">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
              <path d="m7 3 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <style>{`
        .lb{position:fixed;inset:0;z-index:120;display:flex;flex-direction:column;background:rgba(244,242,238,.97);
          -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);animation:lbIn .45s var(--ease) both}
        @keyframes lbIn{from{opacity:0}to{opacity:1}}
        .lb-top{display:flex;align-items:center;justify-content:space-between;padding:18px var(--gutter)}
        .lb-count{margin:0;font:400 12px/1 var(--font-m);letter-spacing:.08em;color:var(--mute)}
        .lb-btn{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;
          transition:transform .5s var(--ease),background-color .4s var(--ease),color .4s var(--ease),box-shadow .4s var(--ease)}
        .lb-close{background:var(--ink);color:#fff}
        .lb-close:hover,.lb-close:focus-visible{transform:scale(1.08) rotate(90deg)}
        .lb-nav{flex:none;box-shadow:inset 0 0 0 1px rgba(13,13,13,.22);background:rgba(255,255,255,.7)}
        .lb-nav:hover,.lb-nav:focus-visible{background:var(--ink);color:#fff;box-shadow:inset 0 0 0 1px var(--ink)}
        .lb-stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;gap:clamp(10px,2vw,28px);
          padding:0 var(--gutter) clamp(20px,4vh,40px)}
        .lb-fig{margin:0;min-width:0;min-height:0;display:flex;flex-direction:column;align-items:center;gap:14px;
          max-width:min(1500px,100%);max-height:100%;animation:lbFig .6s var(--ease) both}
        @keyframes lbFig{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
        .lb-fig img{display:block;min-height:0;max-width:100%;max-height:calc(100svh - 190px);width:auto;height:auto;object-fit:contain;
          border-radius:14px;background:#fff;box-shadow:inset 0 0 0 1px var(--line),0 30px 70px -40px rgba(13,13,13,.45)}
        .lb-fig figcaption{font:400 12px/1.4 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--mute);text-align:center}
        @media (max-width:700px){
          .lb-nav{position:absolute;bottom:18px;z-index:2}
          .lb-prev{left:var(--gutter)}
          .lb-next{right:var(--gutter)}
          .lb-fig img{max-height:calc(100svh - 230px)}
        }
      `}</style>
    </div>
  );
}
