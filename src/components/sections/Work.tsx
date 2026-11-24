"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { PROJECTS, PROJECTS_INTRO, type Project } from "@/lib/data";
import { vars } from "@/lib/css";
import Lightbox from "@/components/ui/Lightbox";
import SectionHead from "@/components/ui/SectionHead";

const pad = (n: number) => String(n).padStart(2, "0");

/** "T20 World Cup – Tournament Information Website" → bold part + serif-italic part. */
function splitTitle(title: string): [string, string | null] {
  const dash = title.match(/^(.+?) – (.+)$/);
  if (dash) return [dash[1], dash[2]];
  const using = title.match(/^(.+?) (using .+)$/);
  if (using) return [using[1], using[2]];
  return [title, null];
}

function Row({ n, label, children }: { n: string; label: string; children: ReactNode }) {
  return (
    <div className="pj-row rv">
      <h4 className="pj-rl">
        <b>{n}</b>
        {label}
      </h4>
      <div className="pj-rc">{children}</div>
    </div>
  );
}

function CaseStudy({ p, onOpen }: { p: Project; onOpen: (shot: number) => void }) {
  const [main, accent] = splitTitle(p.title);
  const [primary, ...rest] = p.shots;

  return (
    <article className="pj-case" aria-label={p.title}>
      {/* ------------------------------------------------------------ header */}
      <header className="pj-head">
        <div>
          <p className="pj-kicker rv">
            <b>{p.index}</b>
            <span aria-hidden="true">—</span>
            <span>{p.kicker}</span>
          </p>
          <h3 className="pj-title rv" style={vars({ "--i": 1 })}>
            {main}
            {accent && (
              <>
                {" "}
                <em className="serif-i">{accent}</em>
              </>
            )}
          </h3>
        </div>
        <div className="pj-meta rv" style={vars({ "--i": 2 })}>
          <ul className="pj-chips" aria-label="Technologies">
            {p.tech.map((t) => (
              <li key={t.name}>{t.name.replace(/ \(.*\)$/, "")}</li>
            ))}
          </ul>
          <p className="pj-arch">
            <span>Architecture</span>
            {p.architecture}
          </p>
          {(p.github || p.demo) && (
            <div className="pj-links">
              {p.github && (
                <a className="btn btn-primary" href={p.github} target="_blank" rel="noreferrer">
                  GitHub <span aria-hidden="true">↗</span>
                </a>
              )}
              {p.demo && (
                <a className="btn btn-ghost" href={p.demo} target="_blank" rel="noreferrer">
                  Live demo <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ----------------------------------------------------------- gallery */}
      {/* Screenshots live in /public/projects/<project>/ and are listed in `shots` (src/lib/data.ts). */}
      {primary && (
        <div className="pj-gallery rv" style={vars({ "--i": 3 })}>
          <button type="button" className="pj-primary" onClick={() => onOpen(0)} aria-haspopup="dialog">
            <span className="pj-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={primary.src} alt={primary.alt} width={primary.width} height={primary.height} loading="lazy" />
            </span>
            <span className="pj-cap">
              <span>{primary.label}</span>
              <span className="pj-zoom">Enlarge ↗</span>
            </span>
          </button>

          {rest.length > 0 && (
            <ul className="pj-thumbs">
              {rest.map((s, i) => (
                <li key={s.src}>
                  <button type="button" className="pj-thumb" onClick={() => onOpen(i + 1)} aria-haspopup="dialog">
                    <span className="pj-tframe">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.src} alt={s.alt} width={s.width} height={s.height} loading="lazy" />
                    </span>
                    <span className="pj-cap">
                      <span>{s.label}</span>
                      <span className="pj-zoom">Enlarge ↗</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- text */}
      <div className="pj-rows">
        <Row n="01" label="Project overview">
          <p className="pj-lead">{p.overview}</p>
        </Row>

        <Row n="02" label="Problem & purpose">
          {p.problem.map((t) => (
            <p key={t} className="pj-p">
              {t}
            </p>
          ))}
        </Row>

        <Row n="03" label="Technologies used">
          <ul className="pj-tech">
            {p.tech.map((t) => (
              <li key={t.name}>
                <b>{t.name}</b>
                <span>{t.desc}</span>
              </li>
            ))}
          </ul>
        </Row>

        <Row n="04" label="Key features">
          <ol className="pj-feat">
            {p.features.map((f, i) => (
              <li key={f.title}>
                <span className="pj-fn">{pad(i + 1)}</span>
                <b>{f.title}</b>
                <span>{f.desc}</span>
              </li>
            ))}
          </ol>
        </Row>

        <Row n="05" label="My work">
          <p className="pj-lead">{p.work}</p>
        </Row>

        <Row n="06" label="Key learnings">
          <ul className="pj-learn">
            {p.learnings.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Row>
      </div>
    </article>
  );
}

export default function Work() {
  const [active, setActive] = useState(0);
  const [lb, setLb] = useState<{ project: number; shot: number } | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = PROJECTS.length - 1;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  const open = lb ? PROJECTS[lb.project] : null;

  return (
    <section id="work" className="section wk" aria-labelledby="work-h">
      <div className="container-x">
        <SectionHead index="03" label="Selected work" lead="Selected" accent="Works." id="work-h" />
        <p className="wk-intro rv" style={vars({ "--i": 1 })}>
          {PROJECTS_INTRO}
        </p>

        {/* project switcher */}
        <div
          className="pj-tabs rv"
          role="tablist"
          aria-label="Projects"
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          style={vars({ "--i": 2 })}
        >
          {PROJECTS.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`pj-tab-${p.id}`}
              aria-selected={active === i}
              aria-controls={`pj-panel-${p.id}`}
              tabIndex={active === i ? 0 : -1}
              className={`pj-tab ${active === i ? "is-on" : ""}`}
              onClick={() => setActive(i)}
            >
              <span className="pj-tab-n">{p.index}</span>
              <span className="pj-tab-t">{p.short}</span>
              <span className="pj-tab-k">{p.kicker}</span>
            </button>
          ))}
        </div>

        {PROJECTS.map((p, i) => (
          <div
            key={p.id}
            role="tabpanel"
            id={`pj-panel-${p.id}`}
            aria-labelledby={`pj-tab-${p.id}`}
            className="pj-panel"
            hidden={active !== i}
          >
            <CaseStudy p={p} onOpen={(shot) => setLb({ project: i, shot })} />
          </div>
        ))}
      </div>

      {open && lb && (
        <Lightbox
          title={open.title}
          shots={open.shots}
          index={lb.shot}
          onIndex={(shot) => setLb({ project: lb.project, shot })}
          onClose={() => setLb(null)}
        />
      )}

      <style>{`
        .wk-intro{margin:clamp(18px,2.4vw,28px) 0 0;max-width:46ch;color:var(--mute);font-size:17px}

        /* ---- project switcher ---- */
        .pj-tabs{display:grid;grid-template-columns:repeat(${PROJECTS.length},minmax(0,1fr));gap:12px;margin-top:clamp(32px,4vw,56px)}
        .pj-tab{position:relative;display:grid;gap:10px;align-content:start;text-align:left;padding:clamp(20px,2.4vw,30px);min-height:150px;
          border-radius:28px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);
          transition:transform .6s var(--ease),background-color .5s var(--ease),color .5s var(--ease),box-shadow .5s var(--ease)}
        .pj-tab:hover,.pj-tab:focus-visible{transform:translateY(-3px);box-shadow:inset 0 0 0 1px rgba(13,13,13,.3)}
        .pj-tab.is-on{background:var(--ink);color:#fff;box-shadow:inset 0 0 0 1px var(--ink),0 40px 80px -40px rgba(13,13,13,.4)}
        .pj-tab-n{font:400 12px/1 var(--font-m);letter-spacing:.08em;color:var(--mute);transition:color .5s var(--ease)}
        .pj-tab-t{font-weight:700;font-size:clamp(26px,3vw,42px);line-height:1.02;letter-spacing:-.045em}
        .pj-tab-k{align-self:end;font:400 11px/1.4 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--mute);transition:color .5s var(--ease)}
        .pj-tab.is-on .pj-tab-n,.pj-tab.is-on .pj-tab-k{color:rgba(255,255,255,.62)}
        .pj-tab:focus-visible{outline-offset:4px}

        /* ---- case study ---- */
        .pj-panel{margin-top:clamp(48px,6vw,88px)}
        .pj-panel:not([hidden]) .pj-case{animation:pjIn .8s var(--ease) both}
        @keyframes pjIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

        .pj-head{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:clamp(24px,5vw,80px);align-items:end}
        .pj-kicker{display:flex;gap:.7em;margin:0 0 20px;font:400 12px/1 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
        .pj-kicker b{font-weight:400;color:var(--ink)}
        .pj-title{margin:0;font-weight:700;font-size:clamp(32px,4.4vw,68px);line-height:1;letter-spacing:-.045em;text-wrap:balance}
        .pj-meta{display:grid;gap:18px;justify-items:start}
        .pj-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
        .pj-chips li{display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:999px;font-size:13px;font-weight:500;
          box-shadow:inset 0 0 0 1px rgba(13,13,13,.16)}
        .pj-arch{margin:0;color:var(--mute);font-size:15px;line-height:1.55;max-width:52ch}
        .pj-arch span{display:block;margin-bottom:6px;font:400 11px/1 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--ink)}
        .pj-links{display:flex;flex-wrap:wrap;gap:10px}

        /* ---- screenshots: containers are plain buttons around an <img>, easy to swap ---- */
        .pj-gallery{margin-top:clamp(36px,5vw,64px);display:grid;gap:clamp(12px,1.6vw,20px)}
        .pj-primary,.pj-thumb{display:grid;gap:12px;width:100%;text-align:left}
        .pj-frame,.pj-tframe{display:block;overflow:hidden;background:#fff;box-shadow:inset 0 0 0 1px var(--line);
          transition:box-shadow .6s var(--ease),transform .7s var(--ease)}
        .pj-frame{border-radius:28px;padding:clamp(8px,1.2vw,16px)}
        .pj-frame img{display:block;width:100%;height:auto;max-height:min(80svh,780px);object-fit:contain;border-radius:calc(28px - clamp(8px,1.2vw,16px));
          transition:transform 1.2s var(--ease)}
        .pj-primary:hover .pj-frame,.pj-primary:focus-visible .pj-frame,.pj-thumb:hover .pj-tframe,.pj-thumb:focus-visible .pj-tframe{
          box-shadow:inset 0 0 0 1px rgba(13,13,13,.3),0 36px 70px -44px rgba(13,13,13,.4)}
        .pj-primary:hover .pj-frame img{transform:scale(1.012)}

        .pj-thumbs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(12px,1.6vw,20px);margin:0;padding:0;list-style:none}
        .pj-thumbs li{min-width:0}
        .pj-tframe{aspect-ratio:2/1;display:grid;place-items:center;border-radius:22px;padding:10px;background:#fff}
        .pj-tframe img{display:block;width:100%;height:100%;object-fit:contain;border-radius:12px;transition:transform 1s var(--ease)}
        .pj-thumb:hover .pj-tframe img{transform:scale(1.02)}

        .pj-cap{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:0 6px;
          font:400 11.5px/1.4 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
        .pj-zoom{flex:none;color:var(--ink);opacity:0;transform:translateX(-6px);transition:opacity .5s var(--ease),transform .6s var(--ease)}
        .pj-primary:hover .pj-zoom,.pj-primary:focus-visible .pj-zoom,.pj-thumb:hover .pj-zoom,.pj-thumb:focus-visible .pj-zoom{opacity:1;transform:none}
        @media (hover:none){.pj-zoom{opacity:1;transform:none}}

        /* ---- text rows ---- */
        .pj-rows{margin-top:clamp(56px,7vw,104px);border-bottom:1px solid var(--line)}
        .pj-row{display:grid;grid-template-columns:minmax(0,240px) minmax(0,1fr);gap:clamp(18px,4vw,64px);padding:clamp(30px,4vw,52px) 0;border-top:1px solid var(--line)}
        .pj-rl{margin:0;display:flex;gap:14px;align-items:baseline;font:400 12px/1.3 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
        .pj-rl b{font-weight:400;color:var(--ink)}
        .pj-rc{min-width:0}
        .pj-lead{margin:0;max-width:34ch;font-weight:500;font-size:clamp(22px,2.3vw,34px);line-height:1.22;letter-spacing:-.03em;text-wrap:pretty}
        .pj-p{margin:0 0 14px;max-width:66ch;color:var(--ink-2);font-size:17px;line-height:1.65}
        .pj-p:last-child{margin-bottom:0}

        .pj-tech{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 clamp(20px,3vw,48px);margin:0;padding:0;list-style:none}
        .pj-tech li,.pj-feat li{display:grid;gap:6px;align-content:start;padding:16px 0 18px;border-top:1px solid var(--line)}
        .pj-tech li:nth-child(-n+2){border-top:0;padding-top:0}
        .pj-tech b,.pj-feat b{font-weight:700;font-size:18px;line-height:1.2;letter-spacing:-.025em}
        .pj-tech span,.pj-feat span:not(.pj-fn){color:var(--mute);font-size:15px;line-height:1.55}

        .pj-feat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 clamp(20px,2.6vw,40px);margin:0;padding:0;list-style:none}
        .pj-feat li:nth-child(-n+3){border-top:0;padding-top:0}
        .pj-fn{font:400 11px/1 var(--font-m);letter-spacing:.08em;color:var(--mute);margin-bottom:4px}

        .pj-learn{margin:0;padding:0;list-style:none;max-width:70ch}
        .pj-learn li{position:relative;padding:15px 0 15px 34px;border-top:1px solid var(--line);color:var(--ink-2);font-size:16.5px;line-height:1.55}
        .pj-learn li:first-child{border-top:0;padding-top:0}
        .pj-learn li::before{content:"";position:absolute;left:0;top:calc(15px + .78em);width:16px;height:1px;background:var(--ink)}
        .pj-learn li:first-child::before{top:.78em}

        @media (max-width:1000px){
          .pj-head{grid-template-columns:minmax(0,1fr);align-items:start}
          .pj-feat{grid-template-columns:repeat(2,minmax(0,1fr))}
          .pj-feat li:nth-child(-n+3){border-top:1px solid var(--line);padding-top:16px}
          .pj-feat li:nth-child(-n+2){border-top:0;padding-top:0}
        }
        @media (max-width:760px){
          .pj-tabs{grid-template-columns:minmax(0,1fr)}
          .pj-tab{min-height:0;gap:8px}
          .pj-row{grid-template-columns:minmax(0,1fr);gap:16px}
          .pj-thumbs{grid-template-columns:minmax(0,1fr)}
          .pj-tech,.pj-feat{grid-template-columns:minmax(0,1fr)}
          .pj-tech li:nth-child(2){border-top:1px solid var(--line);padding-top:16px}
          .pj-feat li:nth-child(-n+3){border-top:1px solid var(--line);padding-top:16px}
          .pj-feat li:first-child{border-top:0;padding-top:0}
          .pj-frame{border-radius:20px}
          .pj-frame img{border-radius:12px}
        }
      `}</style>
    </section>
  );
}
