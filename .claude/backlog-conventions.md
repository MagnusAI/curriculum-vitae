# Backlog conventions

Human-maintained. Read by the `backlog-grooming` routine every run; it overrides the
routine's own judgement. Edit this file to steer the backlog — do not expect the routine
to infer direction from the code alone.

## What this repository is

A personal CV for Magnus Arnild, published to GitHub Pages at
`https://magnusai.github.io/curriculum-vitae/`. Its audience is recruiters and hiring
engineers.

The site has a dual job, and both halves matter:

1. **Convey the CV** to a recruiter who has thirty seconds and will not play a game.
2. **Be the work sample.** The implementation itself is the evidence of engineering
   ability. Claimed skills in a list count for little; a fast, smooth, accessible,
   well-tested application counts for a lot.

Anything that makes the site slower, jankier, less accessible, or less maintainable
damages the primary product, regardless of how impressive it looks in isolation.

## Current direction (decided 2026-08-31)

The first implementation was a free-roam pixel world: the visitor walked an avatar between
zones to uncover CV content. It is live and works, but it gates information behind
exploration and reads as a toy rather than a professional artefact. It is being replaced.

**Target shape — a single scrolling page.** One professional, linear CV page. Each
section (career, education, skills, hobbies) is headed by an animated, interactive pixel
scene. The pixel art and game-feel are retained as *illustration and craft demonstration*;
the free-roam world, avatar walking, and scene-switching are not.

**Approach — ground-up rewrite.** Only two things carry over:

- `src/data/*.ts` — the CV content, which is the single source of truth for the page and
  the generated PDF alike.
- `scripts/generate-art.mjs` — the code-generated pixel art pipeline, which is itself a
  differentiator worth keeping.

Everything else (engine, scenes, entities, UI shell) is open for replacement.

## Priorities, in order

1. **Performance and polish** — fast first paint, small main bundle, animation that holds
   frame rate on a mid-range phone, no layout shift, no jank.
2. **Testing and CI** — the repository currently has no test suite and no CI beyond the
   Pages deploy. This is the most visible professional gap in the work sample.
3. **Accessibility** — full keyboard operation, content reachable by screen reader,
   `prefers-reduced-motion` honoured, WCAG AA contrast, managed focus.

Advanced rendering flourishes (lighting, particles, parallax) are welcome only once the
three above hold. They are never a reason to regress them.

## Standing constraints

- The site is a **static GitHub Pages deployment** under the base path
  `/curriculum-vitae/`. No server, no runtime secrets. Asset URLs must go through bundler
  imports, never hand-built strings.
- **The PDF download must always work and must always be reachable without interacting
  with any animation or game element.** It is the recruiter's escape hatch.
- The CV content stays **data-driven** from `src/data/*.ts`. Copy belongs in data or
  content modules, never hardcoded in components.
- Pixel art stays **generated from code** via `scripts/generate-art.mjs`; committed PNGs
  are build output of that script, not hand-edited assets.

## Labelling and levelling

- Follow the routine's own hierarchy (epic → feature → story) and label taxonomy.
- Use `area:performance`, `area:testing`, `area:ux`, `area:dx`, `area:docs`,
  `area:security` as the primary areas. Accessibility findings use `area:ux`.
- Work with no direct user-facing outcome — tests, CI, tooling, docs — is an `enabler`.

## No-go areas

- Do not file issues proposing a move to a game framework (Phaser, Kaplay, PixiJS, Three.js
  or similar). The hand-written renderer is a deliberate choice and part of the work
  sample.
- Do not file issues proposing a backend, database, CMS, or analytics service. The site is
  and stays static and privacy-respecting.
- Do not file issues about the CV's factual content (job history, dates, wording). That is
  the owner's to edit, not the backlog's.
