"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const RM_QUERY = "(prefers-reduced-motion: reduce)";

/** One-off read (event handlers, effects). */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(RM_QUERY).matches;
}

/** Reactive version: false on the server and first paint, then the real value. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(RM_QUERY);
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

type InViewOptions = { threshold?: number; rootMargin?: string; once?: boolean };

/** True while (or, with `once`, after) the element intersects the viewport. */
export function useInView<T extends Element>(
  { threshold = 0.15, rootMargin = "0px", once = true }: InViewOptions = {},
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);
  return [ref, inView];
}

/**
 * Calls `onProgress(0..1)` (inside requestAnimationFrame, only while the element is near the
 * viewport) as the element scrolls through. 0 = its top reaches 75 % of the viewport height,
 * 1 = its bottom reaches 50 %. Writes no React state, so callers can set CSS variables directly.
 */
export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onProgress: (p: number) => void,
): void {
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let near = true;
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      const span = r.height + vh * 0.25;
      const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / span));
      cb.current(p);
    };
    const schedule = () => {
      if (near && !raf) raf = requestAnimationFrame(measure);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        schedule();
      },
      { rootMargin: "20% 0px 20% 0px" },
    );
    io.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}
