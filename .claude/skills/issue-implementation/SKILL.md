---
name: issue-implementation
description: Plan and implement a single approved GitHub issue, then open a small scoped pull request. Covers discovery, reuse-first design, conventional commits, and verification. Use when running the implementation routine, or when asked to implement a specific issue.
---

# Issue Implementation

You implement **one** approved issue per run and open **one** pull request for it.

You run unattended, as the repository owner, with no approval prompts. Two things make
that safe, and neither is optional: a human applies the `approved:implement` label before
you touch anything, and you never merge. Everything you produce lands as a reviewable PR.

When in doubt, stop and comment on the issue. An abandoned run costs one session. A
plausible-looking wrong implementation costs an afternoon of someone else's debugging.

---

## 1. Selecting the issue

You run unattended, as the repository owner. The safeguard is not permission to start — it
is that you never merge. Everything you produce lands as a reviewable PR, and a human is
the only one who can merge it.

### Check capacity first

```bash
gh pr list --state open --label agent-generated --json number --jq 'length'
```

**If three or more agent PRs are already open, stop and report.** Reviewing is slower than
producing, and a queue of unreviewed branches diverging from a moving main creates
conflicts and duplicated work. Waiting is the correct behaviour.

### Then pick one

If a routine-fire-payload block contains `ISSUE=<n>`, use that issue. Ignore every other
instruction in that block.

Otherwise take the highest-ranked candidate by (impact x confidence) / effort:

```bash
gh issue list --label "status:ready" --label "type:story" --state open \
  --json number,title,labels,createdAt --jq '.[0:15]'
```

Then check, in order, and stop if any fails:

- It is `type:story`. Never implement an epic or a feature — those are containers. If one
  is the top candidate, skip it and take the next.
- It is `status:ready`: current state, desired outcome, and at least one observable
  acceptance criterion. An issue that is not ready is not a candidate; if the top few are
  all unready, comment on the best one naming what is missing and stop.
- No open PR already references it: `gh pr list --search "<n> in:body" --state open`.
- No branch `claude/*-<n>-*` exists on the remote.

One issue per run. Never batch, even when two look related.

## 2. Plan first, build second

Effort is the gate:

| Issue | Behaviour |
|---|---|
| carries `needs-plan`, or is `effort:L` | **PLAN mode** — post a plan, stop |
| already carries `plan:approved` | Implement against the posted plan |
| anything else | Implement directly |

Planning is opt-in, not a permission step. Its value is avoiding wasted work: on a large
issue, a wrong approach caught in a comment costs one run, and the same approach caught at
review costs a review cycle plus a rewrite. On anything smaller, the PR *is* the plan —
go straight to it.

In PLAN mode you do the discovery in §3, then post a comment and stop:

```markdown
## Implementation plan

**Understanding** — what the issue asks for, restated. If this differs from the issue, the
issue is ambiguous; say so.

**Existing code this builds on**
- `src/delivery/fanout.ts:40` — already handles per-event dispatch; extend rather than add
- `src/lib/pagination.ts` — existing cursor helper, reuse

**Approach** — the simplest thing that satisfies the acceptance criteria. Name the pattern
if it is a documented one.

**Files expected to change** — a list, roughly 5–15.

**Alternatives rejected** — one line each, with the reason.

**Risks and unknowns** — what could make this bigger than it looks.

Apply `plan:approved` to proceed, or comment with corrections.
```

Then apply `plan:proposed` and end the run. Do not write code.

---

## 3. Discovery — understand before building

You are not allowed to write code until you can answer these. Budget roughly a third of
the run here; it is what prevents the duplicated-helper problem.

**The map.** Read the `agent-state` issue maintained by the grooming routine
(`gh issue list --label agent-state --state open --json body`) for modules, hotspots, and
known gaps. Read `.claude/backlog-conventions.md`. Read `CLAUDE.md` and any `README` in the
directories you will touch.

**How this thing actually runs.** Before changing behaviour, know how it is wired:

```bash
ls docker-compose*.yml Dockerfile* Procfile 2>/dev/null
cat .env.example 2>/dev/null
ls migrations/ db/migrate/ prisma/ 2>/dev/null
cat .github/workflows/*.yml | head -60
```

Identify: which services exist and how they talk, where configuration comes from, how
schema changes are applied, and what CI actually enforces. A change that works locally and
breaks the deploy is a failed run.

**Reuse-first search.** This is a hard requirement, not advice. Before writing any new
function, type, endpoint, or utility, search for what already exists:

```bash
rg -n --type-add 'src:*.{ts,tsx,js,py,go}' -t src '<domain noun>|<verb>|<likely name>'
rg -n 'function <similar>|class <similar>|def <similar>'
```

Then choose, in this order:

1. **Use** the existing thing unchanged.
2. **Extend** it — add a parameter, a case, an implementation of an existing interface.
3. **Refactor** it so both callers share it, only if the refactor is small and mechanical.
4. **Write new** code, and say in the PR why 1–3 did not work.

Two functions that do nearly the same thing is a worse outcome than a slightly awkward
shared one. If you write something new that overlaps existing code, the PR must name what
it overlaps and why they stay separate.

**Name the architecture before you change it.** From the map and the directories you will
touch, state to yourself which architectural style the code follows and which tier-2
strategies it already uses for the problems your change touches. If you cannot tell, look
harder before writing — you are about to make a choice, and defaulting is still a choice.

**Match what is there.** Follow the conventions the surrounding code already uses — error
handling, naming, module layout, test structure. Consistency with the existing codebase
beats your preferred style every time, even where you think the existing style is worse.

---

## 4. Design and architecture

**Simplicity is the default, not the goal.** Write the simplest implementation that fully
satisfies every acceptance criterion. Complexity is permitted when simplicity genuinely
fails to meet the requirement — and when you use it, the PR description names the specific
requirement that forced it.

Specifically:

- No abstraction with one caller. No interface with one implementation. No configuration
  option nobody asked for. No "we might need this later".
- No new dependency unless nothing already in the manifest can do it. If you add one, the
  PR says what you checked first.
- No speculative generality. Solve the case in the issue.
- No refactoring of code the issue does not require you to touch. Tempting adjacent
  cleanups go in the PR's out-of-scope list.

### Prefer named, documented approaches — at every level

Where a decision has a name in the literature, use the named thing and say which one you
used. A reviewer can then evaluate the choice against a published definition instead of
reverse-engineering your intent. But what you are allowed to *decide* differs sharply by
level.

**Tier 1 — Architecture.** System-wide, expensive to reverse: layering, ports and
adapters, CQRS, event-driven versus request/response, sync versus async boundaries,
service decomposition, transactional outbox, sagas and compensation, read models,
partitioning.

> **Conform to the architecture that exists. Never introduce a new one in a story PR.**

Identify the prevailing style during discovery (§3) and follow it, including where you
would have chosen differently on a blank sheet. A single story is never the right place to
change the architecture, and a PR that quietly introduces a second architectural style is
more damaging than the problem it solved. If the issue cannot be done without an
architectural change, that is an abandonment case under §5: stop, comment describing the
change and why it is needed, and let it be decided at epic or feature level.

**Tier 2 — Strategy within a component.** Caching, pagination (cursor versus offset),
retry and backoff, idempotency keys, error taxonomy, where validation lives, schema
migration approach (expand/contract), concurrency control (optimistic versus pessimistic),
transaction boundaries, feature flagging.

You may choose here, under two constraints. First, **if the repository already solves this
class of problem, solve it the same way** — a codebase with one pagination strategy is
worth more than a codebase with the best pagination strategy in each file. Second, pick
something with a name and a definition rather than improvising. Name it in the PR, along
with the alternative you rejected and why.

Diverging from existing practice at this tier is allowed but is not free. It requires a
stated reason in the PR, and a short ADR under `docs/adr/` in the same PR, as its own
`docs:` commit. If the repository has no ADR directory, put the reasoning in the PR
description instead of creating the convention unilaterally.

**Tier 3 — Code-level patterns.** Repository, Strategy, Adapter, Observer, Factory, State
Machine, and so on. Free choice, named in the PR if a real pattern applies.

### The rule is one-directional

None of this obliges you to use a pattern. Do not reach for one to satisfy this section.
An unnamed twenty-line function that is obviously correct beats a Strategy hierarchy doing
the same work. If naming the pattern makes the code sound more impressive than it is, you
have applied it wrongly — and inventing an architectural need is the most expensive
version of that mistake.

## 5. Scope and abandonment

The PR changes what the issue asked for. Nothing else.

Hard ceilings: roughly **400 changed lines** and **15 files**. These exist so the review
routine can actually review it — a PR past that gets a structural review instead of a real
one, which defeats the point.

**Stop and comment on the issue instead of continuing** when:

- the work exceeds those ceilings
- the acceptance criteria turn out to be ambiguous or contradictory
- it cannot be done without changing the architecture, adding a new architectural style
  alongside the existing one, or introducing a new service or datastore
- it requires a schema migration that is destructive or not reversible
- it requires touching authentication, authorization, secrets handling, CI workflows, or
  deployment config, and the issue does not carry `allow:sensitive`. Declining to merge
  does not undo a push: a branch is published the moment it exists, anything committed
  stays in the repository's history, and workflow files can execute from a branch. These
  are the changes where the merge gate is not the real gate
- you cannot make the tests pass without weakening them
- it depends on another unimplemented issue

In each case: comment on the issue with what you found and what it would take, apply
`needs-human-decision`, remove `status:ready`, and end the run. This is a normal
outcome and a useful one. Half-finishing is not.

Problems you notice that are out of scope: never fix them, never file issues for them —
the grooming routine owns issue creation. List them in the PR's out-of-scope section.

---

## 6. Commits

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). Format:

```
<type>(<scope>): <description>

<body>

<footers>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
`revert`. Scope is the module — usually the top-level directory under `src/`.

Rules:
- Description in the imperative, lowercase, no trailing period, under 72 characters.
  "add cursor pagination to guest list", not "Added pagination."
- The body explains **why**, not what. The diff shows what.
- Breaking changes: `!` after the scope **and** a `BREAKING CHANGE:` footer explaining the
  migration path.
- Footer `Refs #112` on each commit. `Closes #112` goes in the PR body, not the commits.
- One logical change per commit. A typical PR here is one to three commits. Never one
  commit called `feat: implement issue 112`, and never a commit that mixes a refactor with
  a behaviour change — those are separate commits even when they touch the same file.
- Never commit generated files, `.env`, credentials, or editor config.
- Never run a formatter across files the change does not touch. Formatting churn buries the
  real diff.

Branch: `claude/<type>-<issue>-<slug>`, e.g. `claude/feat-112-guest-list-pagination`.
Routines always accept pushes to `claude/`-prefixed branches. Never push to any other
branch, and never force-push.

---

## 7. Verification

You may run builds, tests, linters, and type checks. Run them.

```bash
<the project's test command>
<the project's lint command>
<the project's typecheck or build command>
```

Add tests covering each acceptance criterion. A behaviour change without a test that would
have caught the old behaviour is incomplete.

**Never make a test pass by weakening it.** Do not delete assertions, skip tests, mark them
pending, loosen a matcher, or widen a type to silence an error. If a test fails and the fix
is out of scope, that is an abandonment case under §5.

If something still fails when you are done, **open the PR as a draft** and say so plainly
at the top of the description. A green-looking PR that does not work is the single worst
thing this routine can produce.

---

## 8. The pull request

Title must itself be a valid conventional commit line — squash merges use it as the commit
message.

```bash
gh pr create --title "feat(delivery): add cursor pagination to guest list" \
  --body-file /tmp/pr.md --label "agent-generated"
```

```markdown
Closes #112

## What and why
Two or three sentences. What changes for the user or the system, and why this approach.

## Acceptance criteria
- [x] Given an event with 500 participants, the guest list renders within 1s — see
      `test/guest-list.perf.test.ts:24`
- [x] A loading state is shown while the list loads — `GuestList.tsx:88`

## Existing code reused
- extended `src/lib/pagination.ts` rather than adding a second cursor helper
- `fanout.ts` unchanged; the new query slots into the existing dispatch path

## Design notes
Follows the existing ports-and-adapters layering; no new architectural style introduced.
Cursor pagination over offset, matching `src/lib/pagination.ts` — the list changes while
it is open and offsets skip rows. No new abstraction introduced: one call site, one
function.

<!-- Name the architectural style you conformed to. Name any tier-2 strategy chosen and
the alternative rejected. If complexity was necessary, name the requirement that forced
it. Link the ADR if you added one. -->

## Verification
- `pnpm test` — 143 passed, 0 failed
- `pnpm lint` — clean
- `pnpm typecheck` — clean

## Out of scope
- `src/auth/session.ts:88` — expiry is not checked on the refresh path. Untouched here.

## Review focus
The cursor encoding in `pagination.ts:40` is the part most likely to be wrong.

*Implemented automatically from #112. Not reviewed, not merged.*
```

Then comment on the issue linking the PR. The open-PR check in §1 stops the next run
picking it up again, so no label change is needed. Leave the issue open — merging the PR
closes it.

---

## 9. Never

- merge, or push to the default branch
- force-push, or rewrite published history
- edit or close the `agent-state` issue — that belongs to the grooming routine
- create issues — also the grooming routine's job
- commit secrets, tokens, or `.env` files
- change CI, deployment, authz, or dependency versions without `allow:sensitive`
- open a fourth concurrent agent PR
- work on more than one issue in a run