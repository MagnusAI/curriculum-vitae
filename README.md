# Curriculum Vitae — data layer

This repo is a standalone, well-modelled **data source** for a CV: personal
info, work experience, education, skills, and hobbies. It intentionally
contains no UI, no website, no PDF renderer, and no build step — just typed,
validated data meant to be read by other, separate access points (a website,
an LLM agent, a game, a PDF exporter, whatever comes next), each living in
its own project and reading these files directly.

## Structure

Every entity domain (`person`, `experience`, `education`, `skills`,
`hobbies`, `meta`) gets one file per concern, so each file has a single
responsibility:

```
data/           canonical content — plain JSON, one file per domain
  meta.json
  person.json
  experience.json
  education.json
  skills.json
  hobbies.json
  assets/       binary assets referenced from data (e.g. a photo)

schema/         Zod shape + validation rules, one file per domain
  common.ts     shared primitives: Id, IsoMonth, DateRange, Location, Link
  meta.ts
  person.ts
  experience.ts
  education.ts
  skill.ts
  hobby.ts
  index.ts      barrel export of schemas + inferred TypeScript types

lib/
  loadData.ts   reads a domain's JSON file and parses it through its schema

scripts/
  validate.ts   CLI: loads and validates every domain, prints a summary

tests/          one test file per domain, mirroring data/ and schema/
```

Every entity carries a stable, kebab-case `id` so an external consumer (a
website deep link, an LLM citation, a game hotspot) can reference a specific
entry without depending on array order.

## Using this data

No build step is required to read the raw content — any consumer, in any
language, can read `data/*.json` directly. Working in TypeScript/Node? Import
`lib/loadData.ts` to get parsed, schema-validated, typed objects instead:

```ts
import { loadAll } from "./lib/loadData";

const { person, experience, education, skills, hobbies } = loadAll();
```

## Adding data

- **A new entry in an existing domain** (e.g. a new job): add an object to
  the matching `data/<domain>.json` file, following the shape in
  `schema/<domain>.ts`. Give it a unique kebab-case `id`.
- **A whole new domain** (e.g. certifications, languages spoken): add
  `schema/<domain>.ts`, `data/<domain>.json`, and `tests/<domain>.test.ts`
  following the existing files as a template, then wire it into
  `schema/index.ts` and `lib/loadData.ts`.

## Development

```bash
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest — schema validity + cross-entity invariants
npm run validate    # quick CLI sanity check with a readable summary
```

## License

MIT
