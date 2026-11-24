# Project screenshots

Each project has its own folder. Replace a screenshot by overwriting the file with the same name
(any size / proportion: images are never cropped), or edit the `shots` list of that project in
`src/lib/data.ts` (the first entry is the large primary image).

- `t20-world-cup/`  01-gallery, 02-home-records, 03-venues
- `water-supply/`   01-prediction-lab, 02-forecast, 03-model-performance, 04-month-analysis, 05-data-visualization

If a replacement has a different width/height, update `width` / `height` for that entry in `data.ts`
(they only reserve space while the image loads).
