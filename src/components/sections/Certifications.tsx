import { CERTIFICATIONS } from "@/lib/data";
import { vars } from "@/lib/css";
import SectionHead from "@/components/ui/SectionHead";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Certifications() {
  const issuers = Array.from(new Set(CERTIFICATIONS.map((c) => c.issuer))).join(", ");

  return (
    <section id="certifications" className="section ct" aria-labelledby="cert-h">
      <div className="container-x ct-grid">
        <div className="ct-head">
          <SectionHead index="04" label="Certifications" lead="Always" accent="learning." id="cert-h" />
          <p className="ct-count rv" style={vars({ "--i": 1 })}>
            {pad(CERTIFICATIONS.length)} certifications · {issuers}
          </p>
        </div>

        <ol className="ct-list">
          {CERTIFICATIONS.map((c, i) => {
            const inner = (
              <>
                <span className="ct-n">{pad(i + 1)}</span>
                <span className="ct-t">{c.title}</span>
                <span className="ct-i">{c.issuer}</span>
                {c.href && (
                  <span className="ct-arrow" aria-hidden="true">
                    ↗
                  </span>
                )}
              </>
            );
            return (
              <li key={c.id} className="rv" style={vars({ "--i": i + 1 })}>
                {c.href ? (
                  <a className="ct-row" href={c.href} target="_blank" rel="noreferrer">
                    {inner}
                  </a>
                ) : (
                  <div className="ct-row" tabIndex={0}>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <style>{`
        .ct{background:#fff;border-block:1px solid var(--line)}
        .ct-grid{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:clamp(32px,6vw,96px);align-items:start}
        .ct-head{position:sticky;top:120px}
        .ct-count{margin:clamp(18px,2.4vw,28px) 0 0;font:400 12px/1.6 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}

        .ct-list{margin:0;padding:0;list-style:none;border-bottom:1px solid var(--line)}
        .ct-list li{border-top:1px solid var(--line)}
        .ct-row{position:relative;isolation:isolate;display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:18px;align-items:baseline;
          padding:clamp(26px,3.4vw,40px) clamp(14px,2vw,24px);overflow:hidden;transition:color .45s var(--ease)}
        .ct-row::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--ink);transform:scaleX(0);transform-origin:0 50%;
          transition:transform .75s var(--ease)}
        .ct-n{font:400 12px/1 var(--font-m);letter-spacing:.08em;color:var(--mute);transition:color .45s var(--ease)}
        .ct-t{font-weight:700;font-size:clamp(22px,2.5vw,36px);line-height:1.1;letter-spacing:-.04em}
        .ct-i{font:400 12px/1 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--mute);transition:color .45s var(--ease)}
        .ct-arrow{position:absolute;right:20px;top:50%;margin-top:-.5em;opacity:0;transform:translateX(-14px);transition:opacity .45s var(--ease),transform .6s var(--ease)}
        .ct-row:hover,.ct-row:focus-visible{color:#fff;outline-offset:-3px}
        .ct-row:hover::before,.ct-row:focus-visible::before{transform:scaleX(1)}
        .ct-row:hover .ct-n,.ct-row:hover .ct-i,.ct-row:focus-visible .ct-n,.ct-row:focus-visible .ct-i{color:rgba(255,255,255,.7)}
        .ct-row:hover .ct-arrow,.ct-row:focus-visible .ct-arrow{opacity:1;transform:none}
        .ct-row:focus-visible{outline-color:#fff}

        @media (max-width:900px){
          .ct-grid{grid-template-columns:minmax(0,1fr)}
          .ct-head{position:static}
          .ct-row{grid-template-columns:40px minmax(0,1fr);row-gap:10px}
          .ct-i{grid-column:2}
        }
      `}</style>
    </section>
  );
}
