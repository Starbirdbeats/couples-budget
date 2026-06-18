# docs/ — pointer to the private vault (signposts only)

⚠️ **The real design / QA / lifecycle docs are NOT in this repo.** They are maintained in the maintainer's **private second-brain vault**, deliberately kept out of this public repo.

**Where they live (and where to operate):**

```
the second-brain vault → Projects/Couples Budget/docs/
(on Starbird:  /home/Starbird/second-brain/Projects/Couples Budget/docs/)
```

This `docs/` tree in the repo is **signposts only**. **Do not author work docs here** — author and update them in the vault.

## For an automated routine / agent

To complete your task (process TBD work docs, run the gate pipeline, archive, update the changelog):

1. Go to the vault docs at the path above. The vault is git-synced and present on **Starbird & MSI**.
2. Read `docs/CLAUDE.md` there for the lifecycle & gates, and `docs/TBD/CLAUDE.md` for the QA agent protocol.
3. Work the active docs in `docs/TBD/` there; graduate completed ones into `docs/Archived/`; update `docs/design/AS-BUILT.md`.
4. **If you are running in the cloud or a fresh clone, you will NOT have the vault.** Do not improvise against this empty repo `docs/` — **stop and report that the governance docs are unreachable.** This governance is local-only (Starbird/MSI).

## Gate summary (authoritative rules live in the vault's `docs/CLAUDE.md`)

- A `docs/TBD/` doc graduates to `docs/Archived/` only when **every** task is **Implemented → E2E-tested (agent) → Puppeteer-QA (agent) → Human-verified**.
- QA pass bar is severity-weighted: **P0/P1 block, P2/P3 are non-blocking flags**; money-data bugs are auto-P0. The QA agent never self-approves Gate 4 and never auto-fixes — it reports.
- On archive: update `docs/design/AS-BUILT.md` (timestamped changelog) and check it aligns with `docs/design/INTENDED-DESIGN.md`; flag drift for approval.
