"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PROFILE } from "@/lib/data";
import { vars } from "@/lib/css";
import { prefersReducedMotion } from "@/lib/hooks";
import { useScroll } from "@/lib/scroll";

export default function Hero() {
  const { scrollToTarget } = useScroll();
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [soundOn, setSoundOn] = useState(false);
  const [blocked, setBlocked] = useState(false); // browser refused unmuted autoplay

  const visible = useRef(true); // ≥ 35 % of the hero is on screen
  const wantSound = useRef(true); // flips to false if the visitor mutes on purpose
  const started = useRef(false);
  const reduced = useRef(false);

  /** Try with sound first; if the browser refuses, play muted and wait for a gesture. */
  const play = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !wantSound.current;
    try {
      await v.play();
      started.current = true;
      setSoundOn(!v.muted);
      setBlocked(false);
    } catch (err) {
      if ((err as DOMException).name !== "NotAllowedError") return; // e.g. paused while loading
      v.muted = true;
      setSoundOn(false);
      setBlocked(wantSound.current);
      try {
        await v.play();
        started.current = true;
      } catch {
        /* still blocked: the poster stays up */
      }
    }
  }, []);

  /* autoplay on load + pause the video (and the voice) when the hero leaves the screen */
  useEffect(() => {
    const v = videoRef.current;
    const hero = heroRef.current;
    if (!v || !hero) return;
    reduced.current = prefersReducedMotion();
    if (!reduced.current) void play();

    const io = new IntersectionObserver(
      ([entry]) => {
        const vis = entry.intersectionRatio >= 0.35;
        visible.current = vis;
        if (!vis) {
          v.pause();
        } else if (started.current || !reduced.current) {
          v.play().catch(() => {});
        }
      },
      { threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1] },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [play]);

  /* unlock sound on the visitor's first pointerdown / keydown / touchend */
  useEffect(() => {
    if (!blocked) return;
    const unlock = (ev: Event) => {
      const target = ev.target as Element | null;
      if (target?.closest?.("[data-sound-btn]")) return; // the button handles itself
      if (ev.type === "keydown" && (ev as KeyboardEvent).key === "Escape") return;
      const v = videoRef.current;
      if (!v || !wantSound.current) return;
      v.muted = false;
      setSoundOn(true);
      setBlocked(false);
      if (visible.current) v.play().catch(() => {});
    };
    const events = ["pointerdown", "keydown", "touchend"] as const;
    events.forEach((n) => window.addEventListener(n, unlock, { passive: true }));
    return () => events.forEach((n) => window.removeEventListener(n, unlock));
  }, [blocked]);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!soundOn) {
      wantSound.current = true;
      v.muted = false;
      setSoundOn(true);
      setBlocked(false);
      started.current = true;
      v.play().catch(() => {});
    } else {
      wantSound.current = false;
      v.muted = true;
      setSoundOn(false);
    }
  };

  const go = (target: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget(target);
  };

  const lines = PROFILE.roleLead.split(" ");

  return (
    <section id="top" ref={heroRef} className="hero" aria-label="Introduction">
      <div className="hero-ghost" aria-hidden="true">
        {PROFILE.firstName.toUpperCase()}
      </div>

      <video
        ref={videoRef}
        className="hero-video"
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero/hero-poster.webp"
        aria-label={`Short video of ${PROFILE.name} introducing himself to the camera`}
      >
        <source src="/hero/hero.webm" type="video/webm" />
        <source src="/hero/hero.mp4" type="video/mp4" />
      </video>

      <div className="hero-copy">
        <div className="hero-copy-in">
          <p className="tag rv">
            <b>Portfolio</b>
            <span aria-hidden="true">—</span>
            <span>{PROFILE.name}</span>
          </p>
          <h1 className="hero-h1">
            {lines.map((l, i) => (
              <span className="rv-mask" key={l} style={vars({ "--i": i })}>
                <span>{l}</span>
              </span>
            ))}
            <span className="rv-mask" style={vars({ "--i": lines.length })}>
              <span>
                <em className="serif-i">{PROFILE.roleAccent}</em>
              </span>
            </span>
          </h1>
          <div className="hero-cta rv" style={vars({ "--i": 4 })}>
            <a href="#work" className="btn btn-primary" onClick={go("#work")}>
              Explore work
            </a>
            <a href="#contact" className="btn btn-ghost" onClick={go("#contact")}>
              Let&apos;s talk
            </a>
            <a href={PROFILE.resume} download className="btn btn-ghost">
              Résumé <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`hero-sound ${blocked && !soundOn ? "is-pinging" : ""}`}
        data-sound-btn
        onClick={toggleSound}
        aria-label={soundOn ? "Turn the sound off" : "Turn the sound on"}
      >
        {soundOn ? (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <rect x="3" y="2" width="3.4" height="12" rx="1" fill="currentColor" />
            <rect x="9.6" y="2" width="3.4" height="12" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M4.5 2.6v10.8a.6.6 0 0 0 .92.5l8.4-5.4a.6.6 0 0 0 0-1L5.42 2.1a.6.6 0 0 0-.92.5Z" fill="currentColor" />
          </svg>
        )}
      </button>

      <style>{`
        .hero{position:relative;display:flex;justify-content:center;align-items:flex-start;
          min-height:100svh;background:var(--paper);overflow:clip}

        .hero-ghost{position:absolute;left:50%;top:clamp(88px,20svh,190px);transform:translateX(-50%);
          font-family:var(--font-d);font-weight:700;font-size:clamp(104px,23vw,420px);line-height:.8;
          letter-spacing:-.06em;white-space:nowrap;color:transparent;-webkit-text-stroke:1.5px rgba(13,13,13,.1);
          pointer-events:none;user-select:none}

        /* multiply: the video's white backdrop disappears into the paper */
        .hero-video{position:relative;z-index:1;display:block;height:min(96svh,1040px);width:auto;
          aspect-ratio:768/960;object-fit:cover;mix-blend-mode:multiply;
          animation:heroIn 1.6s var(--ease) both}
        @keyframes heroIn{from{opacity:0}to{opacity:1}}

        .hero-copy{position:absolute;inset:auto 0 clamp(28px,6svh,64px) 0;z-index:3;pointer-events:none}
        .hero-copy-in{width:100%;max-width:calc(1320px + var(--gutter) * 2);margin-inline:auto;padding-inline:var(--gutter)}
        .hero-copy-in > *{pointer-events:auto}
        .hero-copy .tag{margin-bottom:22px}
        .hero-h1{margin:0 0 clamp(22px,3.4svh,34px);font-family:var(--font-d);font-weight:700;
          letter-spacing:-.045em;line-height:.98;font-size:clamp(46px,5.4vw,88px)}
        .hero-cta{display:flex;flex-wrap:wrap;gap:10px;max-width:420px}

        .hero-sound{position:absolute;z-index:4;right:var(--gutter);bottom:clamp(28px,6svh,64px);
          display:grid;place-items:center;width:46px;height:46px;border-radius:50%;
          background:var(--ink);color:#fff;transition:transform .5s var(--ease),box-shadow .5s var(--ease)}
        .hero-sound:hover,.hero-sound:focus-visible{transform:scale(1.08);box-shadow:0 14px 28px -12px rgba(13,13,13,.55)}
        .hero-sound.is-pinging::after{content:"";position:absolute;inset:0;border-radius:50%;
          box-shadow:0 0 0 1px var(--ink);animation:ping 2.2s var(--ease) infinite;pointer-events:none}
        @keyframes ping{0%{transform:scale(1);opacity:.55}80%,100%{transform:scale(1.9);opacity:0}}

        @media (max-width:820px){
          .hero{flex-direction:column;align-items:center;padding-top:64px}
          .hero-video{height:62svh}
          .hero-ghost{top:calc(64px + 8svh)}
          .hero-copy{position:relative;inset:auto;margin-top:-4svh;padding-bottom:56px}
          .hero-h1{font-size:clamp(44px,13vw,72px)}
          .hero-h1 .rv-mask{display:inline-block;margin-right:.22em}
          .hero-sound{bottom:auto;top:calc(64px + 62svh - 54px)}
        }
      `}</style>
    </section>
  );
}
