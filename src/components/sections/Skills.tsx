"use client";

import { useMemo, useState } from "react";
import { SKILL_GROUPS, type FamilyId, type SkillItem } from "@/lib/data";
import { vars } from "@/lib/css";
import { useInView } from "@/lib/hooks";
import SectionHead from "@/components/ui/SectionHead";
import TechLogo from "@/components/ui/TechLogo";

type Tile = SkillItem & {
  n: number;
  family: FamilyId;
  familyLabel: string;
  /** wave-reveal delay (ms) for the 8-column and 4-column layouts: (row + col) × 40 */
  d8: number;
  d4: number;
};

const COLS_WIDE = 8;
const COLS_NARROW = 4;

const TILES: Tile[] = SKILL_GROUPS.flatMap((g) => g.skills.map((s) => ({ ...s, family: g.id, familyLabel: g.label })))
  .map((s, i) => ({
    ...s,
    n: i + 1,
    d8: (Math.floor(i / COLS_WIDE) + (i % COLS_WIDE)) * 40,
    d4: (Math.floor(i / COLS_NARROW) + (i % COLS_NARROW)) * 40,
  }));

const FAMILIES = SKILL_GROUPS.map((g) => ({ id: g.id, label: g.label, count: g.skills.length }));
const pad = (n: number) => String(n).padStart(2, "0");

export default function Skills() {
  const [filter, setFilter] = useState<FamilyId | "all">("all");
  const [active, setActive] = useState(0);
  const [gridRef, gridIn] = useInView<HTMLUListElement>({ threshold: 0.12 });
  const t = TILES[active];
  const shown = useMemo(
    () => TILES.filter((x) => filter === "all" || x.family === filter).length,
    [filter],
  );

  return (
    <section id="skills" className="section sk" aria-labelledby="skills-h">
      <div className="container-x">
        <SectionHead index="02" label="Skills" lead="The periodic table of my" accent="stack." id="skills-h" />
        <p className="sk-intro rv" style={vars({ "--i": 1 })}>
          Every skill on my résumé, one element each. Hover or focus a tile to inspect it.
        </p>

        <div className="sk-chips rv" role="group" aria-label="Filter skills by family" style={vars({ "--i": 2 })}>
          <button
            type="button"
            className="chip"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All <span>{TILES.length}</span>
          </button>
          {FAMILIES.map((f) => (
            <button
              key={f.id}
              type="button"
              className="chip"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(filter === f.id ? "all" : f.id)}
            >
              {f.label} <span>{f.count}</span>
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          Showing {shown} of {TILES.length} skills
        </p>

        <div className="sk-wrap">
          <ul ref={gridRef} className={`sk-grid ${gridIn ? "is-in" : ""}`}>
            {TILES.map((x, i) => {
              const dim = filter !== "all" && x.family !== filter;
              return (
                <li key={x.name} style={vars({ "--d8": `${x.d8}ms`, "--d4": `${x.d4}ms` })}>
                  <button
                    type="button"
                    className={`tile ${active === i ? "is-on" : ""} ${dim ? "is-dim" : ""}`}
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse") setActive(i);
                    }}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-label={`${x.name}, ${x.familyLabel}, element ${i + 1}`}
                  >
                    <span className="tile-n" aria-hidden="true">
                      {pad(x.n)}
                    </span>
                    <span className="tile-sym" aria-hidden="true">
                      {x.symbol}
                    </span>
                    <span className="tile-name" aria-hidden="true">
                      {x.name}
                    </span>
                    <span className="tile-fam" aria-hidden="true">
                      {x.familyLabel}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <aside className="insp card card-active" aria-label="Skill details">
            <div className="insp-logo" key={t.name} style={vars({ "--i": 0 })}>
              <TechLogo logo={t.logo} size={150} glow />
            </div>
            <p className="insp-meta">
              № {pad(t.n)} · {t.familyLabel}
            </p>
            <h3 className="insp-name">{t.name}</h3>
            <p className="insp-detail">{t.detail}</p>
            {t.appears.length > 0 && (
              <>
                <p className="insp-h">Appears in</p>
                <ul className="insp-list">
                  {t.appears.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      </div>

      <style>{`
        .sk-intro{margin:clamp(18px,2.4vw,28px) 0 0;max-width:46ch;color:var(--mute);font-size:17px}
        .sk-chips{display:flex;flex-wrap:wrap;gap:8px;margin:clamp(26px,3vw,40px) 0 clamp(22px,2.6vw,34px)}
        .chip{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 16px;border-radius:999px;font-size:14px;font-weight:500;
          box-shadow:inset 0 0 0 1px rgba(13,13,13,.18);transition:background-color .4s var(--ease),color .4s var(--ease),box-shadow .4s var(--ease),transform .5s var(--ease)}
        .chip span{font:400 11px/1 var(--font-m);opacity:.55}
        .chip:hover{box-shadow:inset 0 0 0 1px var(--ink);transform:translateY(-1px)}
        .chip[aria-pressed="true"]{background:var(--ink);color:#fff;box-shadow:inset 0 0 0 1px var(--ink)}

        .sk-wrap{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:clamp(24px,3vw,44px);align-items:start}
        .sk-grid{display:grid;grid-template-columns:repeat(${COLS_WIDE},minmax(0,1fr));gap:8px;margin:0;padding:0;list-style:none}
        .sk-grid li{display:block;min-width:0;--d:var(--d8)}

        .tile{position:relative;display:flex;flex-direction:column;align-items:flex-start;width:100%;aspect-ratio:1/1.1;padding:10px 11px 11px;
          text-align:left;border-radius:16px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);overflow:hidden;
          transition:transform .6s var(--ease),background-color .45s var(--ease),color .45s var(--ease),opacity .5s var(--ease),box-shadow .5s var(--ease)}
        .tile-n{font:400 10px/1 var(--font-m);color:var(--mute);transition:color .45s var(--ease)}
        .tile-sym{margin-top:auto;font-weight:700;font-size:clamp(24px,2.7vw,36px);line-height:1;letter-spacing:-.05em}
        .tile-name{margin-top:6px;font-size:11.5px;line-height:1.2;font-weight:500;letter-spacing:-.01em;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.4em}
        .tile-fam{margin-top:5px;font:400 8.5px/1 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--faint);white-space:nowrap;
          overflow:hidden;text-overflow:ellipsis;max-width:100%;transition:color .45s var(--ease)}
        .tile:hover{transform:translateY(-4px);box-shadow:inset 0 0 0 1px rgba(13,13,13,.3)}
        .tile.is-on{background:var(--ink);color:#fff;box-shadow:inset 0 0 0 1px var(--ink)}
        .tile.is-on .tile-n,.tile.is-on .tile-fam{color:rgba(255,255,255,.6)}
        .tile.is-dim{opacity:.22}

        /* diagonal wave reveal: delay = (row + col) × 40 ms. "backwards" so hover transforms still work afterwards */
        .sk-grid:not(.is-in) .tile{opacity:0}
        .sk-grid.is-in .tile{animation:tileIn .9s var(--ease) backwards;animation-delay:var(--d)}
        @keyframes tileIn{from{opacity:0;transform:translateY(18px) scale(.94)}}

        .insp{position:sticky;top:104px;padding:26px 26px 28px;min-height:420px}
        .insp-logo{display:grid;place-items:center;width:100%;height:190px;color:var(--ink);animation:pop .8s var(--ease) both}
        @keyframes pop{0%{opacity:0;transform:scale(.7) translateY(8px)}60%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:none}}
        .insp-meta{margin:14px 0 0;font:400 11px/1 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
        .insp-name{margin:10px 0 0;font-weight:700;font-size:32px;line-height:1.05;letter-spacing:-.045em}
        .insp-detail{margin:10px 0 0;color:var(--ink-2);font-size:15px;line-height:1.5}
        .insp-h{margin:20px 0 8px;font:400 11px/1 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
        .insp-list{margin:0;padding:0;list-style:none;display:grid;gap:0}
        .insp-list li{padding:9px 0;border-top:1px solid var(--line);font-size:13.5px;line-height:1.4}

        @media (max-width:1000px){
          .sk-wrap{grid-template-columns:minmax(0,1fr)}
          .insp{position:static;min-height:0}
        }
        @media (max-width:700px){
          .sk-grid{grid-template-columns:repeat(${COLS_NARROW},minmax(0,1fr));gap:6px}
          .sk-grid li{--d:var(--d4)}
          .tile{padding:8px 8px 9px;border-radius:14px}
          .tile-sym{font-size:26px}
          .tile-name{font-size:10.5px}
          .tile-fam{display:none}
        }
      `}</style>
    </section>
  );
}
