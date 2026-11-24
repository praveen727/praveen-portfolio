"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EDUCATION, PROFILE, PROJECTS, SKILL_GROUPS } from "@/lib/data";
import { prefersReducedMotion } from "@/lib/hooks";

/** Deterministic pseudo-barcode (decorative) seeded from the name. */
function useBars(seed: string) {
  return useMemo(() => {
    let s = 0;
    for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    const bars: { x: number; w: number }[] = [];
    let x = 0;
    while (x < 148) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const w = 1 + (s % 3);
      const gap = 1 + ((s >> 8) % 3);
      bars.push({ x, w });
      x += w + gap;
    }
    return bars;
  }, [seed]);
}

const bsc = EDUCATION.find((e) => e.id === "bsc");
const skillLine = SKILL_GROUPS.filter((g) => g.id === "programming" || g.id === "data")
  .flatMap((g) => g.skills.map((s) => s.name))
  .join(" · ");

export default function IDCard() {
  const swingRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const pointerType = useRef<string>("mouse");
  const bars = useBars(PROFILE.name);

  /* damped pendulum: pointer movement pushes it, a spring pulls it back, a faint sway runs when idle */
  useEffect(() => {
    const el = swingRef.current;
    if (!el || prefersReducedMotion()) return;
    const host = el.closest("section") ?? el;

    let angle = 0; // degrees
    let vel = 0; // degrees / second
    let last = performance.now();
    let raf = 0;
    let running = false;
    let pendingDx = 0;
    let lastX: number | null = null;

    const K = 17.6; // spring: ω₀² (≈ 0.67 Hz)
    const C = 1.1; // damping
    const GAIN = 0.22; // deg/s of swing speed per pixel of pointer travel

    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      vel += (-K * angle - C * vel) * dt - pendingDx * GAIN;
      pendingDx = 0;
      angle = Math.max(-18, Math.min(18, angle + vel * dt));
      const idle = Math.sin(now / 1700) * 0.9 + Math.sin(now / 830) * 0.3;
      el.style.transform = `rotate(${(angle + idle).toFixed(3)}deg)`;
      raf = requestAnimationFrame(step);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e: Event) => {
      const pe = e as PointerEvent;
      if (lastX !== null) {
        const r = el.getBoundingClientRect();
        const near = Math.max(0, 1 - Math.abs(pe.clientX - (r.left + r.width / 2)) / 520);
        pendingDx += (pe.clientX - lastX) * near;
      }
      lastX = pe.clientX;
    };
    const onLeave = () => {
      lastX = null;
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      threshold: 0,
    });
    io.observe(host);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      stop();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const lanyardText = `${PROFILE.name.toUpperCase()} · ${PROFILE.role.toUpperCase()} · `;

  return (
    <div className="lan" ref={swingRef}>
      <span className="lan-nail" aria-hidden="true" />

      <div className="strap" aria-hidden="true">
        <div className="strap-track">
          {[0, 1].map((n) => (
            <span key={n}>{lanyardText.repeat(3)}</span>
          ))}
        </div>
      </div>

      <svg className="clip" width="30" height="56" viewBox="0 0 30 56" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="clipMetal" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#8f8f8f" />
            <stop offset="0.45" stopColor="#f2f2f2" />
            <stop offset="1" stopColor="#7d7d7d" />
          </linearGradient>
        </defs>
        <rect x="4" y="0" width="22" height="26" rx="4" fill="url(#clipMetal)" stroke="#6a6a6a" strokeWidth="0.8" />
        <rect x="10" y="6" width="10" height="9" rx="2" fill="#ffffff" opacity="0.55" />
        <circle cx="15" cy="40" r="11" fill="none" stroke="url(#clipMetal)" strokeWidth="4" />
        <circle cx="15" cy="40" r="12.8" fill="none" stroke="#6a6a6a" strokeWidth="0.6" opacity="0.7" />
      </svg>

      <div
        className={`idc ${flipped ? "is-flipped" : ""}`}
        role="group"
        tabIndex={0}
        aria-roledescription="flip card"
        aria-label={`ID card of ${PROFILE.name}. Press Enter or Space to flip it.`}
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setFlipped(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setFlipped(false);
        }}
        onClick={() => {
          // mouse users flip by hovering; touch / pen users tap
          if (pointerType.current !== "mouse") setFlipped((f) => !f);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <div className="idc-inner">
          {/* ---------------------------------------------------------- front */}
          <div className="idc-face idc-front">
            <div className="idc-band">
              <span className="idc-slot" aria-hidden="true" />
              <span>Portfolio ID</span>
            </div>

            <div className="idc-photo">
              <div className="idc-ring">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/portrait-bust.webp"
                  alt={`Portrait of ${PROFILE.name}`}
                  width={480}
                  height={600}
                  draggable={false}
                />
              </div>
            </div>

            <p className="idc-name">{PROFILE.name}</p>
            <p className="idc-role">{PROFILE.role}</p>

            <dl className="idc-rows">
              <div>
                <dt>Dept.</dt>
                <dd>{PROFILE.department}</dd>
              </div>
              <div>
                <dt>Valid till</dt>
                <dd>{PROFILE.validTill}</dd>
              </div>
              <div>
                <dt>Base</dt>
                <dd>{PROFILE.location}</dd>
              </div>
            </dl>

            <div className="idc-foot" aria-hidden="true">
              <svg width="150" height="30" viewBox="0 0 150 30">
                {bars.map((b) => (
                  <rect key={b.x} x={b.x} y="0" width={b.w} height="30" fill="#0d0d0d" />
                ))}
              </svg>
              <span className="idc-holo" />
            </div>
          </div>

          {/* ----------------------------------------------------------- back */}
          <div className="idc-face idc-back">
            <div className="idc-band">
              <span className="idc-slot" aria-hidden="true" />
              <span>What I am</span>
            </div>
            <ul className="idc-list">
              <li>{PROFILE.role}</li>
              {bsc && (
                <li>
                  {bsc.title} · {bsc.detail}
                </li>
              )}
              <li>{skillLine}</li>
              <li>{PROJECTS.map((p) => p.short).join(" · ")}</li>
              <li>Python internship · Internzland</li>
            </ul>
            <p className="idc-sig">{PROFILE.name}</p>
            <p className="idc-found">If found, say hello · {PROFILE.email}</p>
          </div>
        </div>
      </div>

      <style>{`
        .lan{position:relative;display:flex;flex-direction:column;align-items:center;width:300px;max-width:100%;
          margin-inline:auto;transform-origin:50% 0;will-change:transform}
        .lan-nail{position:absolute;top:-7px;left:50%;width:14px;height:14px;margin-left:-7px;border-radius:50%;
          background:#d8d6d1;box-shadow:inset 0 0 0 1px rgba(13,13,13,.25),0 2px 4px rgba(13,13,13,.18);z-index:3}

        .strap{position:relative;width:30px;height:clamp(112px,19vh,196px);overflow:hidden;background:var(--ink);
          box-shadow:inset 3px 0 0 rgba(255,255,255,.12),inset -3px 0 0 rgba(255,255,255,.12)}
        .strap-track{position:absolute;inset:0 0 auto 0;display:flex;flex-direction:column;align-items:center;
          animation:strapUp 40s linear infinite}
        .strap-track span{writing-mode:vertical-rl;color:#fff;font:500 10px/30px var(--font-m);letter-spacing:.2em;white-space:nowrap}
        @keyframes strapUp{to{transform:translateY(-50%)}}

        .clip{position:relative;z-index:2;display:block;margin-top:-1px;margin-bottom:-16px;
          filter:drop-shadow(0 3px 3px rgba(13,13,13,.25))}

        .idc{position:relative;width:300px;max-width:100%;height:404px;perspective:1400px;outline-offset:6px;border-radius:24px;cursor:pointer}
        .idc-inner{position:absolute;inset:0;transform-style:preserve-3d;transition:transform 1s var(--ease)}
        .idc.is-flipped .idc-inner{transform:rotateY(180deg)}
        .idc-face{position:absolute;inset:0;overflow:hidden;border-radius:24px;background:#fff;
          -webkit-backface-visibility:hidden;backface-visibility:hidden;
          box-shadow:inset 0 0 0 1px var(--line),0 34px 60px -26px rgba(13,13,13,.4),0 6px 14px -6px rgba(13,13,13,.18)}
        .idc-back{transform:rotateY(180deg)}

        .idc-band{display:flex;align-items:center;justify-content:center;position:relative;height:38px;background:var(--ink);color:#fff;
          font:500 11px/1 var(--font-m);letter-spacing:.22em;text-transform:uppercase}
        .idc-slot{position:absolute;top:9px;left:50%;width:34px;height:7px;margin-left:-17px;border-radius:4px;background:#fff;opacity:.9}
        .idc-band span:last-child{margin-top:9px}

        .idc-photo{position:relative;display:grid;place-items:center;margin-top:16px}
        .idc-photo::before{content:"";position:absolute;left:50%;top:50%;width:210px;height:230px;transform:translate(-50%,-50%);
          background:radial-gradient(closest-side,rgba(13,13,13,.11),transparent)}
        .idc-ring{position:relative;z-index:1;width:134px;height:162px;padding:3px;border-radius:26px;overflow:hidden;
          background:linear-gradient(145deg,#f2f2f2,#8e8e8e 55%,#e4e4e4);
          box-shadow:0 0 0 6px rgba(13,13,13,.04),0 18px 36px -14px rgba(13,13,13,.35)}
        .idc-ring img{width:100%;height:100%;object-fit:cover;border-radius:23px;display:block;
          transition:transform 1.4s var(--ease)}
        .idc-front:hover .idc-ring img{transform:scale(1.07)}

        .idc-name{margin:12px 0 0;text-align:center;font-weight:700;font-size:23px;line-height:1.1;letter-spacing:-.04em}
        .idc-role{margin:4px 0 0;text-align:center;font:400 10.5px/1.2 var(--font-m);letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}
        .idc-rows{margin:11px 20px 0;display:grid;gap:5px;border-top:1px solid var(--line);padding-top:9px}
        .idc-rows > div{display:grid;grid-template-columns:74px 1fr;gap:8px;align-items:baseline}
        .idc-rows dt{font:400 9.5px/1 var(--font-m);letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}
        .idc-rows dd{margin:0;font-size:11.5px;line-height:1.25;font-weight:500;letter-spacing:-.01em}

        .idc-foot{position:absolute;left:20px;right:20px;bottom:14px;display:flex;align-items:flex-end;justify-content:space-between}
        .idc-foot svg{display:block}
        .idc-holo{position:relative;width:40px;height:40px;border-radius:50%;overflow:hidden;
          background:conic-gradient(from 20deg,#f6f6f6,#b9b9b9,#fafafa,#8c8c8c,#e9e9e9,#a8a8a8,#f6f6f6);
          box-shadow:inset 0 0 0 1px rgba(13,13,13,.18)}
        .idc-holo::after{content:"";position:absolute;inset:-30%;
          background:linear-gradient(115deg,transparent 38%,rgba(255,255,255,.85) 50%,transparent 62%);
          transform:translateX(-80%);animation:holo 4.5s var(--ease) infinite}
        @keyframes holo{0%,35%{transform:translateX(-80%)}75%,100%{transform:translateX(80%)}}

        .idc-list{margin:20px 22px 0;padding:0;list-style:none;display:grid;gap:11px}
        .idc-list li{position:relative;padding-left:16px;font-size:13.5px;line-height:1.4;letter-spacing:-.01em}
        .idc-list li::before{content:"";position:absolute;left:0;top:.58em;width:6px;height:6px;border-radius:50%;background:var(--ink)}
        .idc-sig{position:absolute;left:22px;bottom:62px;margin:0;font-family:var(--font-s);font-style:italic;font-size:34px;line-height:1;
          letter-spacing:-.01em;border-bottom:1px solid var(--line);padding-right:60px;padding-bottom:4px}
        .idc-found{position:absolute;left:22px;right:22px;bottom:18px;margin:0;font:400 10px/1.5 var(--font-m);letter-spacing:.04em;color:var(--mute);word-break:break-word}

        @media (prefers-reduced-motion:reduce){
          .idc-inner{transition:none}
        }
      `}</style>
    </div>
  );
}
