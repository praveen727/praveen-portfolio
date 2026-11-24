"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NAV, PROFILE } from "@/lib/data";
import { vars } from "@/lib/css";
import { useScroll } from "@/lib/scroll";

export default function Navigation() {
  const { scrollToTarget, lock } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  const barRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const firstOverlayLink = useRef<HTMLAnchorElement>(null);

  /* scrolled state + top progress bar (no React state for the bar) */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* active section: the one crossing the middle band of the viewport */
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
          else setActive((cur) => (cur === e.target.id ? null : cur));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* slide the ink indicator under the active link */
  const measure = useCallback(() => {
    const el = active ? linkRefs.current[active] : null;
    const list = listRef.current;
    if (!el || !list) {
      setPill(null);
      return;
    }
    const a = el.getBoundingClientRect();
    const b = list.getBoundingClientRect();
    setPill({ x: a.left - b.left, w: a.width });
  }, [active]);

  useLayoutEffect(() => {
    measure();
  }, [measure, scrolled]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /* mobile overlay: Esc closes, scroll is locked while open */
  const close = useCallback(() => {
    setOpen(false);
    lock(false);
    menuBtnRef.current?.focus({ preventScroll: true });
  }, [lock]);

  useEffect(() => {
    if (!open) return;
    lock(true);
    firstOverlayLink.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, lock]);

  /* leaving the overlay open when the viewport grows to desktop would trap scrolling */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches && open) {
        setOpen(false);
        lock(false);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open, lock]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const wasOpen = open;
    if (wasOpen) {
      setOpen(false);
      lock(false);
    }
    // let the scroll lock release before Lenis starts moving
    window.setTimeout(() => {
      scrollToTarget(`#${id}`);
      history.replaceState(null, "", `#${id}`);
    }, wasOpen ? 60 : 0);
  };

  const toTop = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget(0);
    history.replaceState(null, "", window.location.pathname);
  };

  return (
    <>
      <div className="nv-progress" aria-hidden="true">
        <div ref={barRef} className="nv-bar" />
      </div>

      <header className={`nv ${scrolled ? "is-scrolled" : ""}`}>
        <div className="nv-in">
          <a href="#top" className="nv-brand" onClick={toTop} aria-label={`${PROFILE.name}, back to top`}>
            <span className="nv-mark" aria-hidden="true">
              <span>{PROFILE.initials}</span>
            </span>
            <span className="nv-name">{PROFILE.name}</span>
          </a>

          <nav className="nv-nav" aria-label="Primary">
            <ul ref={listRef} className="nv-list">
              <li
                className="nv-pill"
                aria-hidden="true"
                style={{
                  transform: `translateX(${pill?.x ?? 0}px)`,
                  width: pill?.w ?? 0,
                  opacity: pill ? 1 : 0,
                }}
              />
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    ref={(el) => {
                      linkRefs.current[n.id] = el;
                    }}
                    className={active === n.id ? "is-active" : ""}
                    aria-current={active === n.id ? "location" : undefined}
                    onClick={go(n.id)}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            ref={menuBtnRef}
            type="button"
            className="nv-menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => (open ? close() : setOpen(true))}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`nv-overlay ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
      >
        <ol className="nv-ol">
          {NAV.map((n, i) => (
            <li key={n.id} style={vars({ "--i": i })}>
              <a
                href={`#${n.id}`}
                ref={i === 0 ? firstOverlayLink : undefined}
                onClick={go(n.id)}
              >
                <span className="nv-n">{String(i + 1).padStart(2, "0")}</span>
                {n.label}
              </a>
            </li>
          ))}
        </ol>
        <p className="nv-foot">{PROFILE.email}</p>
      </div>

      <style>{`
        .nv-progress{position:fixed;inset:0 0 auto 0;height:2px;z-index:70;pointer-events:none}
        .nv-bar{height:100%;background:var(--ink);transform:scaleX(0);transform-origin:0 50%}

        .nv{position:fixed;inset:0 0 auto 0;z-index:60;padding:14px var(--gutter);pointer-events:none}
        .nv-in{max-width:1320px;margin-inline:auto;display:flex;align-items:center;justify-content:space-between;gap:16px}
        .nv-in > *{pointer-events:auto}

        .nv-brand{display:inline-flex;align-items:center;gap:12px;font-weight:500;letter-spacing:-.02em}
        .nv-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;
          font:500 13px/1 var(--font-m);letter-spacing:.02em;color:var(--ink);
          box-shadow:inset 0 0 0 1px var(--ink);background:transparent;
          transition:background-color .5s var(--ease),color .5s var(--ease),transform .9s var(--ease)}
        .nv-mark > span{display:block;transition:transform .9s var(--ease)}
        .nv-brand:hover .nv-mark{transform:rotate(360deg)}
        .nv-brand:hover .nv-mark > span{transform:rotate(-360deg)}
        .is-scrolled .nv-mark{background:var(--ink);color:#fff}
        .nv-name{font-size:15px;transition:opacity .5s var(--ease),transform .5s var(--ease)}
        .is-scrolled .nv-name{opacity:0;transform:translateX(-8px);pointer-events:none}

        .nv-nav{display:none}
        .nv-list{position:relative;display:flex;align-items:center;gap:2px;padding:5px;border-radius:999px;
          background:transparent;box-shadow:inset 0 0 0 1px transparent;
          transition:background-color .5s var(--ease),box-shadow .5s var(--ease),backdrop-filter .5s}
        .is-scrolled .nv-list{background:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);
          box-shadow:inset 0 0 0 1px var(--line),0 12px 32px -16px rgba(13,13,13,.25)}
        .nv-list a{position:relative;z-index:1;display:block;padding:9px 18px;border-radius:999px;font-size:14px;font-weight:500;
          letter-spacing:-.01em;color:var(--ink);transition:color .4s var(--ease)}
        .nv-list a.is-active{color:#fff}
        .nv-list a:not(.is-active):hover{color:var(--mute)}
        .nv-pill{position:absolute;left:0;top:5px;bottom:5px;border-radius:999px;background:var(--ink);
          transition:transform .6s var(--ease),width .6s var(--ease),opacity .4s var(--ease);pointer-events:none}

        .nv-menu{display:inline-flex;align-items:center;height:42px;padding:0 20px;border-radius:999px;font-size:14px;font-weight:500;
          background:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);
          box-shadow:inset 0 0 0 1px var(--line)}

        .nv-overlay{position:fixed;inset:0;z-index:55;display:flex;flex-direction:column;justify-content:center;
          padding:96px var(--gutter) 48px;background:var(--paper);
          clip-path:inset(0 0 100% 0);visibility:hidden;
          transition:clip-path .9s var(--ease),visibility 0s linear .9s}
        .nv-overlay.is-open{clip-path:inset(0 0 0 0);visibility:visible;transition:clip-path .9s var(--ease),visibility 0s}
        .nv-ol{margin:0;padding:0;list-style:none;display:grid;gap:4px}
        .nv-ol a{display:flex;align-items:baseline;gap:18px;padding:6px 0;font-weight:700;letter-spacing:-.045em;line-height:1.05;
          font-size:clamp(44px,13vw,84px);transform:translateY(40px);opacity:0;
          transition:transform .9s var(--ease),opacity .9s var(--ease)}
        .is-open .nv-ol a{transform:none;opacity:1;transition-delay:calc(.12s + var(--i) * .07s)}
        .nv-n{font:400 12px/1 var(--font-m);letter-spacing:.08em;color:var(--mute)}
        .nv-foot{margin:36px 0 0;font:400 12px/1 var(--font-m);letter-spacing:.08em;color:var(--mute)}

        @media (min-width:768px){
          .nv-nav{display:block}
          .nv-menu,.nv-overlay{display:none}
        }
      `}</style>
    </>
  );
}
