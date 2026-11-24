"use client";

import { useEffect, type ReactNode } from "react";
import { ScrollProvider } from "@/lib/scroll";
import Navigation from "./Navigation";
import Footer from "./ui/Footer";

/** Adds .is-in (once) to every .rv / .rv-mask element as it scrolls into view. */
function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".rv, .rv-mask");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

export default function App({ children }: { children: ReactNode }) {
  return (
    <ScrollProvider>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <RevealObserver />
      <Navigation />
      <main id="main">{children}</main>
      <Footer />
    </ScrollProvider>
  );
}
