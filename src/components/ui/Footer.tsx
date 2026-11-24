"use client";

import { PROFILE } from "@/lib/data";
import { useScroll } from "@/lib/scroll";

export default function Footer() {
  const { scrollToTarget } = useScroll();
  const year = new Date().getFullYear();
  return (
    <footer className="foot">
      <div className="container-x foot-in">
        <p>
          © {year} {PROFILE.name}
        </p>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget(0);
          }}
        >
          Back to top <span aria-hidden="true">↑</span>
        </a>
        <p>Built with Next.js</p>
      </div>
      <style>{`
        .foot{border-top:1px solid var(--line);padding:28px 0 36px;font-family:var(--font-m);font-size:12px;
          letter-spacing:.06em;text-transform:uppercase;color:var(--mute)}
        .foot-in{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 24px}
        .foot p{margin:0}
        .foot a{color:var(--ink);transition:opacity .3s var(--ease)}
        .foot a:hover{opacity:.55}
      `}</style>
    </footer>
  );
}
