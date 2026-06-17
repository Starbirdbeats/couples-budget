# Couples Budget

A calm, minimal couples budgeting PWA. Vite + React 19 + TypeScript, `vite-plugin-pwa` (Workbox), deployed to GitHub Pages via Actions on push to `main`. Implemented from the Claude Design handoff bundle "Couples Budget v2".

- **Design system:** calm minimal lavender — Hanken Grotesk, ink `#211F2A`, accent indigo `#6053CE`, rose `#C0457E`, 18px-radius white cards, 6px bars with month-pace ticks. Member identity: each person gets a color (indigo / rose / green / amber) carried through avatars, chips and rows. **Respect this system** — match existing patterns, don't drift toward generic AI aesthetics.
- **State:** see `src/state.tsx` (central provider). Data persistence in `src/store.ts`.
- **Vite `base`** is `/couples-budget/` — keep asset paths relative.

## Project docs (kept private)

Design, QA and lifecycle docs are **not in this repo** — they live in the maintainer's private second-brain vault at `Projects/Couples Budget/docs/` (synced to Starbird & MSI). Read them there before working a task doc; they govern how work ships.

**Lifecycle & gates** (summary — full rules in the vault's `docs/CLAUDE.md`):
- Work docs live in `docs/TBD/`; they graduate (`git mv`) to `docs/Archived/` only when **every** task is done.
- A task is done only at all four gates, in order: **Implemented → E2E-tested (agent) → Puppeteer-QA (agent) → Human-verified**.
- QA pass bar is severity-weighted: **P0/P1 block, P2/P3 are non-blocking flags**; money-data bugs are auto-P0. The QA agent never self-approves Gate 4 and never auto-fixes — it reports.
- On archive: update `docs/design/AS-BUILT.md` (timestamped changelog) and check it aligns with `docs/design/INTENDED-DESIGN.md`; flag drift for approval.

---

# Engineering Guidelines (Karpathy)

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
