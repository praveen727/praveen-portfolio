import { EDUCATION, EXPERIENCE, PROFILE } from "@/lib/data";
import { vars } from "@/lib/css";
import IDCard from "@/components/ui/IDCard";
import SectionHead from "@/components/ui/SectionHead";

const bsc = EDUCATION.find((e) => e.id === "bsc");
const internship = EXPERIENCE.find((e) => e.id === "internzland");

const FACTS: { label: string; value: string; href?: string }[] = [
  { label: "Location", value: PROFILE.location },
  ...(bsc ? [{ label: "Education", value: `${bsc.title} · ${bsc.when}` }] : []),
  ...(internship
    ? [{ label: "Internship", value: `${internship.title} · ${internship.place} (${internship.when})` }]
    : []),
  { label: "Languages", value: PROFILE.languages },
  { label: "Email", value: PROFILE.email, href: `mailto:${PROFILE.email}` },
];

export default function About() {
  return (
    <section id="about" className="about" aria-labelledby="about-h">
      <div className="container-x about-grid">
        <div className="about-l">
          <SectionHead index="01" label="About" lead="Hi, I'm" accent={`${PROFILE.firstName}.`} id="about-h" />
          <p className="about-lead rv" style={vars({ "--i": 1 })}>
            {PROFILE.resumeSummary}
          </p>
          <p className="about-sub rv" style={vars({ "--i": 2 })}>
            {PROFILE.extraLine}
          </p>
          <div className="about-cta rv" style={vars({ "--i": 3 })}>
            <a href={PROFILE.resume} download className="btn btn-primary">
              Résumé <span aria-hidden="true">↓</span>
            </a>
            <a href={`mailto:${PROFILE.email}`} className="btn btn-ghost">
              Email me
            </a>
            {PROFILE.github && (
              <a href={PROFILE.github} className="btn btn-ghost" target="_blank" rel="noreferrer">
                GitHub
              </a>
            )}
            {PROFILE.linkedin && (
              <a href={PROFILE.linkedin} className="btn btn-ghost" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            )}
          </div>
        </div>

        <div className="about-c">
          <IDCard />
        </div>

        <aside className="about-r" aria-label="Quick facts">
          <p className="tag rv">
            <b>Quick facts</b>
          </p>
          <dl className="facts">
            {FACTS.map((f, i) => (
              <div className="fact rv" key={f.label} style={vars({ "--i": i })}>
                <dt>{f.label}</dt>
                <dd>{f.href ? <a href={f.href}>{f.value}</a> : f.value}</dd>
              </div>
            ))}
          </dl>
          <figure className="quote rv" style={vars({ "--i": FACTS.length })}>
            <blockquote>{PROFILE.quote}</blockquote>
            <figcaption>From the résumé objective</figcaption>
          </figure>
        </aside>
      </div>

      <style>{`
        .about{padding-bottom:var(--section-pad)}
        .about-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px minmax(0,1fr);column-gap:clamp(28px,4.4vw,80px);align-items:stretch}
        .about-l,.about-r{padding-top:var(--section-pad)}
        .about-c{display:flex;justify-content:center;align-items:flex-start;min-width:0}

        .about-lead{margin:clamp(22px,3vw,34px) 0 0;font-size:clamp(17px,1.35vw,20px);line-height:1.6;letter-spacing:-.015em;color:var(--ink-2)}
        .about-sub{margin:14px 0 0;color:var(--mute);font-size:16px}
        .about-cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:clamp(26px,3.4vw,38px)}

        .facts{margin:0;display:grid}
        .fact{display:grid;grid-template-columns:104px minmax(0,1fr);gap:16px;align-items:baseline;padding:15px 0;border-top:1px solid var(--line)}
        .fact:last-child{border-bottom:1px solid var(--line)}
        .fact dt{font:400 11px/1.4 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
        .fact dd{margin:0;font-size:15px;line-height:1.45;font-weight:500;letter-spacing:-.01em;overflow-wrap:anywhere}
        .fact dd a{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px;text-decoration-color:rgba(13,13,13,.35);transition:text-decoration-color .4s var(--ease)}
        .fact dd a:hover{text-decoration-color:var(--ink)}

        .quote{margin:clamp(26px,3vw,38px) 0 0}
        .quote blockquote{margin:0;font-family:var(--font-s);font-style:italic;font-size:clamp(25px,2.2vw,32px);line-height:1.15;letter-spacing:-.015em}
        .quote blockquote::before{content:"“"}
        .quote blockquote::after{content:"”"}
        .quote figcaption{margin-top:12px;font:400 11px/1 var(--font-m);letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}

        @media (max-width:1060px){
          .about-grid{grid-template-columns:minmax(0,1fr);row-gap:clamp(44px,7vw,72px)}
          .about-r{padding-top:0}
          .about-c{order:2;justify-content:center}
          .about-r{order:3}
        }
      `}</style>
    </section>
  );
}
