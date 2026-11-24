"use client";

import { useRef, useState, type AnimationEvent, type PointerEvent } from "react";
import { PROFILE } from "@/lib/data";
import { vars } from "@/lib/css";

const hop = (e: PointerEvent<HTMLSpanElement>) => {
  const el = e.currentTarget;
  if (!el.classList.contains("hop")) el.classList.add("hop");
};
const unhop = (e: AnimationEvent<HTMLSpanElement>) => e.currentTarget.classList.remove("hop");

/** Every letter is its own span so it can bounce when the cursor passes over it. */
function Letters({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split(" ").map((word, w) => (
        <span key={`${word}-${w}`}>
          {w > 0 && " "}
          <span className="ct2-w">
            {Array.from(word).map((ch, i) => (
              <span key={i} className={`ch ${className ?? ""}`} onPointerEnter={hop} onAnimationEnd={unhop}>
                {ch}
              </span>
            ))}
          </span>
        </span>
      ))}
    </>
  );
}

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = PROFILE.email;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing else to try */
      }
      ta.remove();
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section id="contact" className="section ct2" aria-labelledby="contact-h">
      <div className="container-x">
        <p className="tag rv">
          <b>06</b>
          <span aria-hidden="true">—</span>
          <span>Contact</span>
        </p>

        <h2 className="ct2-h" id="contact-h" aria-label="Let's build something together.">
          <span className="ct2-line" aria-hidden="true">
            <Letters text="Let's build" />
          </span>
          <span className="ct2-line" aria-hidden="true">
            <Letters text="something" /> <Letters text="together." className="serif-i" />
          </span>
        </h2>

        <div className="ct2-row">
          <div className="ct2-main">
            <div className="ct2-mailrow rv" style={vars({ "--i": 1 })}>
              <a className="ct2-mail" href={`mailto:${PROFILE.email}`}>
                {PROFILE.email}
              </a>
              <button type="button" className="ct2-copy" onClick={copy} aria-label="Copy email address">
                {copied ? (
                  <>
                    Copied
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
                      <path d="M2.5 7.4 5.6 10.5 11.5 3.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                ) : (
                  "Copy"
                )}
              </button>
              <span className="sr-only" role="status" aria-live="polite">
                {copied ? "Email address copied to clipboard" : ""}
              </span>
            </div>

            <ul className="ct2-links rv" style={vars({ "--i": 2 })}>
              <li>
                <span>Phone</span>
                <a href={PROFILE.phoneHref}>{PROFILE.phone}</a>
              </li>
              <li>
                <span>Based in</span>
                <b>{PROFILE.location}</b>
              </li>
              {PROFILE.github && (
                <li>
                  <span>GitHub</span>
                  <a href={PROFILE.github} target="_blank" rel="noreferrer">
                    {PROFILE.github.replace(/^https?:\/\//, "")}
                  </a>
                </li>
              )}
              {PROFILE.linkedin && (
                <li>
                  <span>LinkedIn</span>
                  <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">
                    {PROFILE.linkedin.replace(/^https?:\/\//, "")}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <a className="ct2-badge rv" href={`mailto:${PROFILE.email}`} aria-label={`Say hello: email ${PROFILE.name}`} style={vars({ "--i": 3 })}>
            <svg viewBox="0 0 160 160" width="150" height="150" aria-hidden="true" focusable="false">
              <defs>
                <path id="badgeCircle" d="M80 80m-60 0a60 60 0 1 1 120 0a60 60 0 1 1-120 0" />
              </defs>
              <g className="ct2-spin">
                <text>
                  <textPath href="#badgeCircle" startOffset="0" textLength="368" lengthAdjust="spacing">
                    SAY HELLO • SAY HELLO • SAY HELLO •
                  </textPath>
                </text>
              </g>
              <path d="M62 98 98 62M72 62h26v26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        .ct2{padding-bottom:clamp(64px,9vh,110px)}
        .ct2-h{margin:0;font-weight:700;letter-spacing:-.05em;line-height:.98;font-size:clamp(46px,8.6vw,138px)}
        .ct2-line{display:block}
        .ct2-w{display:inline-block;white-space:nowrap}
        .ch{display:inline-block;will-change:transform}
        .ch.hop{animation:hop .7s var(--ease)}
        @keyframes hop{0%{transform:translateY(0)}35%{transform:translateY(-.22em)}70%{transform:translateY(.03em)}100%{transform:translateY(0)}}
        .ct2-h .serif-i{font-size:1.04em}

        .ct2-row{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:48px;margin-top:clamp(44px,7vw,96px)}
        .ct2-main{min-width:0;flex:1 1 520px}
        .ct2-mailrow{display:flex;flex-wrap:wrap;align-items:center;gap:14px 20px}
        .ct2-mail{font-weight:700;font-size:clamp(22px,4.2vw,64px);letter-spacing:-.045em;line-height:1.1;overflow-wrap:anywhere;
          text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.14em;text-decoration-color:var(--ink);
          transition:text-decoration-color .5s var(--ease),color .5s var(--ease)}
        .ct2-mail:hover{text-decoration-color:var(--faint);color:var(--mute)}
        .ct2-copy{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px;border-radius:999px;font:500 13px/1 var(--font-d);
          box-shadow:inset 0 0 0 1px rgba(13,13,13,.22);transition:background-color .4s var(--ease),color .4s var(--ease),box-shadow .4s var(--ease)}
        .ct2-copy:hover,.ct2-copy:focus-visible{background:var(--ink);color:#fff;box-shadow:inset 0 0 0 1px var(--ink)}

        .ct2-links{display:flex;flex-wrap:wrap;gap:20px 56px;margin:clamp(30px,4vw,48px) 0 0;padding:0;list-style:none}
        .ct2-links li{display:grid;gap:8px}
        .ct2-links span{font:400 11px/1 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
        .ct2-links a,.ct2-links b{font-size:20px;font-weight:500;letter-spacing:-.02em}
        .ct2-links a{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px;text-decoration-color:rgba(13,13,13,.35);transition:text-decoration-color .4s var(--ease)}
        .ct2-links a:hover{text-decoration-color:var(--ink)}

        .ct2-badge{display:grid;place-items:center;width:150px;height:150px;border-radius:50%;color:var(--ink);flex:none;
          transition:transform .7s var(--ease)}
        .ct2-badge:hover{transform:scale(1.06)}
        .ct2-badge text{font:500 11.5px var(--font-m);letter-spacing:.17em;fill:var(--ink)}
        .ct2-badge svg{overflow:visible}
        .ct2-spin{transform-origin:80px 80px;animation:spin 22s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </section>
  );
}
