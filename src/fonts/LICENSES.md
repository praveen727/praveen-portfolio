# Fonts

All fonts are SIL Open Font License 1.1 and are Latin subsets re-packed as WOFF2 (self-hosted, no CDN).

| File | Family | Upstream |
| --- | --- | --- |
| Inter-Regular.woff2, Inter-Medium.woff2 | Inter | https://github.com/rsms/inter |
| InterDisplay-Bold.woff2 | Inter Display (headings) | https://github.com/rsms/inter |
| InstrumentSerif-Regular.woff2, InstrumentSerif-Italic.woff2 | Instrument Serif | https://github.com/Instrument/instrument-serif |
| JetBrainsMono-Regular.woff2 | JetBrains Mono | https://github.com/JetBrains/JetBrainsMono (see OFL-JetBrainsMono.txt) |

## Inter vs Inter Tight

The brief asks for **Inter Tight (variable)**. It was not available offline when this site was built, so the display
and body font is Inter / Inter Display with the same tight tracking (-0.045em on headings). To switch to Inter Tight:
download the variable font from https://fonts.google.com/specimen/Inter+Tight, subset/convert it to WOFF2, drop it in
this folder and replace the three `Inter*` entries in `src/app/layout.tsx` with one
`src: "../fonts/InterTight-Variable.woff2", weight: "100 900"`.
