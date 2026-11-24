"use client";

import { useRef } from "react";
import { EDUCATION, EXPERIENCE } from "@/lib/data";
import { useScrollProgress } from "@/lib/hooks";
import { vars } from "@/lib/css";
import { useScroll } from "@/lib/scroll";
import SectionHead from "@/components/ui/SectionHead";

/** Education first (by year), then the undated internship / course, in résumé order. */
const STOPS = [...EDUCATION, ...EXPERIENCE];

export default function Experience() {
  const { scrollToTarget } = useScroll();
  const listRef = useRef<HTMLOListElement>(null);

  /* the spine draws with scroll; each stop lights up once the spine reaches its dot */
  useScrollProgress(listRef, (p) => {
    const list = listRef.current;
    if (!list) return;
    list.style.setProperty("--p", p.toFixed(4));
    const reach = p * list.offsetHeight;
    list.querySelectorAll<HTMLElement>("[data-stop]").forEach((el) => {
      el.classList.toggle("lit", reach >= el.offsetTop + 14);
    });
  });

  return (
    <section id="experience" className="section ex" aria-labelledby="exp-h">
      <div className="container-x">
        <SectionHead index="05" label="Experience" lead="The path" accent="so far." id="exp-h" />
        <p className="ex-intro rv" style={vars({ "--i": 1 })}>
          Education and experience as one line, in order.
        </p>

        <ol className="ex-list" ref={listRef}>
          <li className="ex-spine" aria-hidden="true">
            <span className="ex-fill" />
          </li>
          {STOPS.map((s) => (
            <li key={s.id} className="ex-stop" data-stop>
              <span className="ex-when">{s.when}</span>
              <span className="ex-dot" aria-hidden="true" />
              <div className="ex-main">
                <p className="ex-kind">{s.kind}</p>
                <h3 className="ex-title">{s.title}</h3>
                <p className="ex-place">{s.place}</p>
                <p className="ex-detail">{s.detail}</p>
              </div>
            </li>
          ))}
          <li className="ex-stop ex-last" data-stop>
            <span className="ex-when" aria-hidden="true">
              Next
            </span>
            <span className="ex-dot" aria-hidden="true" />
            <div className="ex-main">
              <a
                href="#contact"
                className="ex-next"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget("#contact");
                }}
              >
                <span>Next —</span> <em className="serif-i">Your team?</em>
              </a>
            </div>
          </li>
        </ol>
      </div>

      <style>{`
        .ex{--yc:clamp(76px,13vw,170px);--dc:28px}
        .ex-intro{margin:clamp(18px,2.4vw,28px) 0 0;max-width:46ch;color:var(--mute);font-size:17px}

        .ex-list{position:relative;margin:clamp(40px,5vw,72px) 0 0;padding:0;list-style:none}
        .ex-spine{position:absolute;top:10px;bottom:30px;left:calc(var(--yc) + var(--dc) / 2);width:1px;margin-left:-.5px;background:var(--line)}
        .ex-fill{position:absolute;inset:0;background:var(--ink);transform-origin:50% 0;transform:scaleY(var(--p,0))}

        .ex-stop{position:relative;display:grid;grid-template-columns:var(--yc) var(--dc) minmax(0,1fr);padding-bottom:clamp(44px,6vw,80px)}
        .js .ex-stop{transition:opacity .7s var(--ease)}
        .js .ex-stop:not(.lit){opacity:.32}
        .ex-when{padding-top:6px;font:400 12px/1.3 var(--font-m);letter-spacing:.06em;text-transform:uppercase;color:var(--mute)}
        .ex-dot{justify-self:center;margin-top:7px;width:13px;height:13px;border-radius:50%;background:var(--paper);
          box-shadow:inset 0 0 0 1.5px var(--faint);transition:background-color .5s var(--ease),box-shadow .6s var(--ease),transform .6s var(--ease);position:relative;z-index:1}
        .lit .ex-dot{background:var(--ink);box-shadow:inset 0 0 0 1.5px var(--ink),0 0 0 6px rgba(13,13,13,.09);transform:scale(1.1)}

        .ex-main{padding-left:clamp(10px,2vw,28px);min-width:0}
        .ex-kind{margin:0 0 10px;font:400 11px/1 var(--font-m);letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}
        .ex-title{margin:0;font-weight:700;font-size:clamp(24px,2.8vw,40px);line-height:1.05;letter-spacing:-.045em;text-wrap:balance;max-width:24ch}
        .ex-place{margin:12px 0 0;font-size:17px;font-weight:500;letter-spacing:-.01em}
        .ex-detail{margin:6px 0 0;color:var(--mute);font-size:16px}

        .ex-last{padding-bottom:0}
        .ex-next{display:flex;align-items:center;gap:.4em;width:fit-content;max-width:100%;padding:clamp(22px,3vw,34px) clamp(26px,4vw,52px);
          border-radius:28px;border:1.5px dashed rgba(13,13,13,.3);font-weight:700;font-size:clamp(24px,3vw,42px);line-height:1;letter-spacing:-.045em;
          transition:background-color .5s var(--ease),color .5s var(--ease),border-color .5s var(--ease),transform .6s var(--ease)}
        .ex-next .serif-i{transition:color .5s var(--ease)}
        .ex-next:hover,.ex-next:focus-visible{background:var(--ink);color:#fff;border-color:var(--ink);transform:translateY(-3px)}
        .ex-next:hover .serif-i,.ex-next:focus-visible .serif-i{color:rgba(255,255,255,.7)}
        .ex-last .ex-when{padding-top:30px}
        .ex-last .ex-dot{margin-top:31px}
      `}</style>
    </section>
  );
}
