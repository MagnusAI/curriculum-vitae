# Curriculum Vitae — the pixel world edition 🕹️

An interactive CV: instead of scrolling a boring document, you walk around a little
pixel universe as Magnus and explore his career.

- 🌳 **Education Forest** (north) — one tree + sign per education entry
- 🌾 **Skill Fields** (south) — one crop row per skill category
- 🐑 **Hobby Meadow** (east) — farm animals, one per hobby
- 🏠 **The house** — the wife, a piano that actually plays (WebAudio),
  a computer holding the work experience, and a bookshelf about this site
- 🐕 A Jack Russell terrier follows you everywhere
- 📄 **Download the "boring" PDF** — generated client-side from the same data files,
  always available from the start screen and the in-game HUD

Works with keyboard (WASD/arrows + E) on desktop and an on-screen d-pad +
interact button on touch devices.

## Tech

- React 19 + TypeScript + Vite
- Hand-rolled HTML5 canvas engine (`src/game/engine/`) — fixed-timestep loop,
  tilemap, camera, AABB collision, sprite animation, WebAudio chiptune synth.
  No game framework.
- All pixel art is **generated from code**: `node scripts/generate-art.mjs`
  writes the sprite sheets in `src/assets/game/` and the atlas map
  `src/game/atlas.ts`. Set `PREVIEW_DIR` to also emit 4×-scaled previews.
- PDF via `@react-pdf/renderer`, lazy-loaded so it stays out of the main bundle.

## Data

All CV content lives in `src/data/*.ts` (work experience, education, skills,
hobbies, profile). The world is data-driven: adding a job or education entry is
just adding an object there — the game and the PDF both pick it up.
(Slot positions for the map live in `src/game/world/overworld.ts`.)

## Development

```
npm install
npm run dev      # → http://localhost:5173/curriculum-vitae/
npm run lint
npm run build
npm run preview  # serve the production build
```

Debug helpers: append `?debug` to expose `window.__game`, `?touch` to force
touch controls on desktop.

## Deployment

GitHub Pages. Push to `main` to trigger the GitHub Actions workflow, or
`npm run deploy` for a manual `gh-pages` push. The Vite base path is
`/curriculum-vitae/`.

## License

MIT
