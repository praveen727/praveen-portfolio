"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { prefersReducedMotion } from "./hooks";

type Target = string | number | HTMLElement;

type ScrollApi = {
  /** Smooth-scroll (Lenis) to a selector like "#work", an element, or a pixel offset. */
  scrollToTarget: (target: Target) => void;
  /** Lock / unlock page scrolling (used by the mobile menu). */
  lock: (locked: boolean) => void;
};

const ScrollContext = createContext<ScrollApi>({
  scrollToTarget: () => {},
  lock: () => {},
});

export const useScroll = () => useContext(ScrollContext);

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Smooth scrolling is decorative motion: skip it entirely for reduced-motion visitors.
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollToTarget = useCallback((target: Target) => {
    const lenis = lenisRef.current;
    const el =
      typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (typeof target === "string" && !el) return;
    if (lenis) {
      lenis.scrollTo(el ?? 0, { duration: 1.3, easing: easeOutQuart });
      return;
    }
    // No Lenis (reduced motion, or not mounted yet): jump instantly.
    if (typeof el === "number") window.scrollTo(0, el);
    else if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
  }, []);

  const lock = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }
    document.documentElement.style.overflow = locked ? "hidden" : "";
  }, []);

  const api = useMemo(() => ({ scrollToTarget, lock }), [scrollToTarget, lock]);
  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
