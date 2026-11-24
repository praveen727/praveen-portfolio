# Praveen R — portfolio

A quiet, white / black / gray personal site built from the résumé (`Praveen__Cv.pdf`) and the intro video.
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Lenis. No GSAP, no three.js, no CDNs.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://yourname.com`) before building so the Open Graph image URL is absolute.

## Where things live

| Path | What |
| --- | --- |
| `src/lib/data.ts` | **All content.** PROFILE, NAV, SKILL_GROUPS, PROJECTS, CERTIFICATIONS, EDUCATION, EXPERIENCE, ACHIEVEMENTS. Components only read from here. |
| `src/app/globals.css` | Design tokens, `@layer base` resets, shared classes in `@layer components`. |
| `src/lib/` | `hooks.ts` (useInView, useScrollProgress, reduced motion), `scroll.tsx` (Lenis + `scrollToTarget`), `css.ts`. |
| `src/fonts/` | Self-hosted WOFF2 subsets + licences (see `LICENSES.md`). |
| `public/hero/` | `hero.webm`, `hero.mp4`, `hero-poster.webp` (looping intro video). |
| `public/logos/` | Brand SVGs + licence files. |
| `scripts/build-hero-assets.py` | Rebuilds the hero video, portrait and OG image. |

### Sections

| # | Section | Component | Animation |
| --- | --- | --- | --- |
| – | Navigation | `components/Navigation.tsx` | glass pill, sliding ink indicator, scroll-progress bar, clip-path mobile menu |
| – | Hero | `components/hero/Hero.tsx` | looping video (multiply-blended), sound control, pauses off-screen |
| 01 | About | `sections/About.tsx` + `ui/IDCard.tsx` | hanging lanyard ID card: damped pendulum + 3D flip |
| 02 | Skills | `sections/Skills.tsx` | periodic-table tiles, diagonal wave reveal, family filter, sticky inspector |
| 03 | Work ("Selected Works.") | `sections/Work.tsx` + `ui/Lightbox.tsx` | two case studies behind accessible tabs, fade-up on switch, click-to-enlarge screenshot lightbox |
| 04 | Certifications | `sections/Certifications.tsx` | ink-flood rows on a white band |
| 05 | Experience | `sections/Experience.tsx` | timeline spine that draws with scroll |
| 06 | Contact | `sections/Contact.tsx` | letters hop under the cursor, copy-email chip, spinning badge |

Each section's CSS lives in a `<style>` tag inside its component; shared classes (`.btn`, `.card`, `.tag`, `.rv`, `.rv-mask` …) are in `globals.css`.

## What is, and is not, on the site

Everything comes from the résumé. Things the résumé does **not** contain were left out rather than invented:

- **Achievements section removed** (and its nav link): the résumé states no ranks, ratings or counts. `ACHIEVEMENTS` in `data.ts` is an empty array.
- **No GitHub / LinkedIn / project links.** The only link embedded in the PDF is `mailto:meghask2715@gmail.com`, which is a different name and address from the one printed on the résumé, so it was **not** used. The visible email `pr9089500@gmail.com` is used.
- **Role:** the résumé names no job title, so the hero says "Data Analytics Graduate" (from the degree).
- **Projects:** two case studies (T20 World Cup website, Adaptive Water Supply ML) written from the owner's own brief, with the owner's real screenshots. Technology lists are exactly the ones supplied; nothing was added. No GitHub / live-demo buttons are shown until `github` / `demo` are filled in. The résumé PDF still describes the older project wording.
- **Skills inspector:** the "Appears in" list only shows places the résumé actually mentions the skill.
- **Timeline:** the internship and course have no dates in the résumé, so they follow the education stops.
- **Light edits:** capitalisation, and the project description "an tracker system … monitoring expense for tracking expense details" → "a tracker system … expense monitoring, for tracking expense details". The summary is verbatim.
- **Privacy:** the street address is not shown, only "Erode – 638459". Phone `91-79045 58028` is shown as `+91 79045 58028`.
- The ID card's band says "Portfolio ID" (not "Developer ID") and has no invented ID number.

To add something later (GitHub link, new project, achievements), edit `src/lib/data.ts` only.

### Projects: screenshots and links

- Images live in `public/projects/<project-id>/` (see the README there). Overwrite a file with the same name, or edit that project's `shots` array in `data.ts`: the **first** shot is the large primary image, the rest are the supporting thumbnails. Images are never cropped; every one opens in the lightbox (Esc, arrows, swipe).
- Add a link later by setting `github` or `demo` on a project in `data.ts`; the button appears automatically.
- A third project would be one more object in `PROJECTS`; the tabs, gallery and lightbox adapt on their own.
- The back of the ID card lists the project short names (`short` in `data.ts`).

## Rebuild the hero video

```bash
python3 scripts/build-hero-assets.py \
  --video path/to/intro.mp4 \
  --photo path/to/photo.jpg --photo-crop X:Y:W:H     # optional: portrait for the ID card
# optional: --crop W:H:X:Y   (skip person detection)  --loop-seconds 10  --fade 0.5
```

Needs `ffmpeg`, `numpy`, `Pillow`. The script:

1. detects the person and crops a 4:5 window head-to-toe, centred, scaled to 768 × 960;
2. whitens the backdrop with `colorlevels` (the site multiplies the video onto the paper colour);
3. makes a seamless loop: the last 0.5 s is cross-faded into the first 0.5 s (`xfade` for the picture, a sample-accurate equal-power cross-fade in numpy for the audio). Nothing is stretched, so lips stay in sync;
4. writes `hero.mp4` (H.264 CRF 24 + AAC 96k, faststart), `hero.webm` (VP9 CRF 36 + Opus 80k), `hero-poster.webp`, `portrait-bust.webp` (480 × 600) and `og.jpg` (1200 × 630).

The supplied clip is 8.0 s, so the loop is 7.5 s.

## Behaviour notes

- The page opens straight on the hero: no loader, splash or sound gate.
- Hero video tries to play with sound; if the browser blocks it, it plays muted (soft ping ring on the button) and unmutes on the first pointerdown / keydown / touchend. It pauses when less than 35 % of the hero is visible, so the voice stops as soon as you scroll away.
- `prefers-reduced-motion`: no smooth scroll, no autoplay (the sound button starts the video), no pendulum, reveals shown immediately.
- The ID card flips on hover (mouse), tap (touch) or Enter / Space (keyboard).

## Credits and licences

- **Fonts** (SIL OFL 1.1): Inter / Inter Display, Instrument Serif, JetBrains Mono. See `src/fonts/LICENSES.md`.
  The brief asks for Inter Tight; it was not available offline when this was built, so Inter with the same tight tracking is used. Swap instructions are in `LICENSES.md`.
- **Logos** in `public/logos/`:
  - Python, C, Git: [Simple Icons](https://simpleicons.org), CC0 1.0 (via `react-icons`). Marks belong to their owners.
  - Word, Excel, PowerPoint: Font Awesome Free file-type glyphs, CC BY 4.0, tinted with the Office app colours.
  - SQL and Power BI use the line icons in `ui/TechLogo.tsx` (no licensed Power BI mark was available offline). To use the official one, add `public/logos/powerbi.svg` and a `powerbi` entry in the `BRAND` map.
- Soft-skill / language icons are simple line drawings in `TechLogo.tsx`.
