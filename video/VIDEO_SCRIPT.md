# Trip Wire — Demo Video Narration Script (2–3 min)

**Product:** Trip Wire — the tripwire for your codebase (risk-driven test triage, powered by IBM Bob 2.0)
**Repo:** [github.com/Elle31416/Ibm-bon-risk-testing](https://github.com/Elle31416/Ibm-bon-risk-testing) (fork of `chalk/chalk` v5.4.1, MIT)
**Live demo:** [ibm-bob-risk-dashboard.onrender.com](https://ibm-bob-risk-dashboard.onrender.com/)
**Runtime:** ≈ 2:35 spoken + pauses (≈ 285 words @ ~150 wpm) · **Format:** 16:9, 1080p+, screen-recording style + cinematic title/outro
**Status of numbers:** every figure below is verified against `evidence/coverage-log.md`, `SESSION_SUMMARY.md`, `evidence/risk-report-session1.json`, and the real c8 transcripts in `evidence/transcripts/` — nothing estimated.

---

## Blanks filled (from the skeleton, with real values)

| Skeleton blank | Filled with | Source |
|---|---|---|
| `[repo]` | `Ibm-bon-risk-testing` (github.com/Elle31416/Ibm-bon-risk-testing) | repo |
| Baseline coverage `__%` | **66.66%** statements (c8 `npm run coverage:json`, scope `source/**` + `tools/**`) | `evidence/coverage-log.md`, screenshot `08` |
| `[file]` highest risk | **`tools/risk-lib.js`** | `evidence/risk-report-session1.json` rank 1; coverage log "highest-ranked risk, score 76.4, 0% coverage" |
| `because ___` (paraphrase) | zero tests guarding it, biggest recent churn of any tooling file, most decision-dense code in the toolkit — the library that ranks everyone else's risk was itself the risk | coverage log batch-1 summary (churn ≈ 115 lines, 16 decision points, 0% coverage) |
| Coverage `__% → __%` after this batch | **66.66% → 73.49%** (batch 1, `tools/risk-lib.js` tests) — full arc later lands at **82.08%** | `evidence/coverage-log.md`, screenshots `07`/`08` |
| `[link]` | **https://github.com/Elle31416/Ibm-bon-risk-testing** | repo |
| Live demo | **https://ibm-bob-risk-dashboard.onrender.com** — verified live 2026-09-27 (`risk-report.json` generatedAt `2026-09-27T11:49:36.033Z`, overall 82.1) | live fetch + `dashboard/risk-report.json` |

---

## Storyboard + narration

### S1 · 0:00–0:15 — **Trip Wire intro (power open)** 
**On screen:** `video/screenshots/12-tripwire-hero.png` — "TRIP WIRE · THE TRIPWIRE FOR YOUR CODEBASE", glowing wire snapping over a city of code panels.

> "Every outage starts the same way — code that changed fast, got risky, and nobody was watching. Meet **Trip Wire**: the tripwire for your codebase. This is **Ibm-bon-risk-testing** — using IBM's **Bob 2.0** to find and fix the riskiest untested code."

*Delivery: cinematic, unhurried, one beat of silence before "Meet Trip Wire".*

### S2 · 0:15–0:40 — **Baseline: 66.66%** *(real c8 output)*
**On screen:** `evidence/screenshots/08-coverage-milestones.png` — the real milestone table; hold on the **Prepared-repo baseline 66.66%** row.

> "Baseline coverage, before Bob touches anything: **66.66%**. That's real c8 output over source and tools — and it looks low for a reason: three brand-new risk-engineering files start at zero. Upstream chalk sits at **99.6%**. The gap is the target."

*Numbers on screen also show: branches 71.42%, functions 81.57%, upstream 99.61%.*

### S3 · 0:40–1:10 — **Bob flags the highest risk** *(paraphrased)*
**On screen:** `evidence/screenshots/04-risk-analysis.png` — the live risk-ranking table (0.40 churn + 0.30 complexity + 0.30 coverageGap); hold on the honesty note naming session 1's top risk.

> "Bob flagged **tools/risk-lib.js** as the highest-risk file — and it's almost poetic. The library that ranks everyone else's risk was itself the risk: **zero tests**, the **biggest recent churn** of any tooling file, and the **most decision-dense code** in the toolkit. The brain of the engine — completely unwatched."

*Session-1 numbers (paraphrased, not read): risk score 76.4, ~115 lines of churn, 16 decision points, 0% coverage.*

### S4 · 1:10–1:45 — **The script and its tests, running** *(real terminal)*
**On screen:** `evidence/screenshots/05-batch3-new-tests.png`, then `evidence/screenshots/06-full-regression.png` — real terminal, green checkmarks.

> "Here's the risk-ranking script — **40% churn, 30% complexity, 30% coverage gap** — and the tests it generated, **running**. Forty focused unit tests on git parsing, renames, edge cases, ranking ties. The model review paid for itself too: Bob caught **three real bugs** in the analyzer — a misleading coverage average, churn silently lost on renamed files, and a crash on empty repos."

### S5 · 1:45–2:15 — **Coverage: 66.66% → 73.49%** *(real numbers)*
**On screen:** `evidence/screenshots/07-coverage-after-batch3.png` (c8 after the batch), then the live dashboard `video/screenshots/10-live-demo-browser.png`.

> "The scoreboard after this batch: **66.66% → 73.49%**. Two more batches later: **82.08%**, with **94 of 94** tests green — every number measured, none estimated. And it's live right now at **ibm-bob-risk-dashboard.onrender.com** — churn, complexity and coverage, ranked file by file."

*Batch arc on screen: 73.49% → 81.85% → 82.08% (40 + 17 + 5 tests; 32 upstream unchanged).*

### S6 · 2:15–2:35 — **Close**
**On screen:** `video/screenshots/13-tripwire-outro.png` — "IT TRIPS SO YOU DON'T." + repo URL.

> "That's the workflow. **Trip Wire trips — so your users don't.** Repo's public at **github.com/Elle31416/Ibm-bon-risk-testing** — full writeup in the README. Go trip your own wire."

---

## Continuity rules (keep the evidence honest)

1. Terminal screenshots are real captured output (`evidence/transcripts/` → `evidence/screenshots/`; 194 lines machine-verified verbatim before rendering). Never re-typeset them.
2. The dashboard shot (`10-live-demo-browser.png`) is a headless render of the exact assets the live URL serves (`render.yaml` → `npm run dashboard`); the visible "Live · generated 9/27/2026, 11:49:36 AM" stamp matches the live `risk-report.json` byte-for-byte. See `video/README.md` for capture provenance.
3. Only `12-tripwire-hero.png` / `13-tripwire-outro.png` are generated title art. They are branding, not evidence.
4. If a number is spoken, it must exist in `evidence/coverage-log.md`, a c8 transcript, or `evidence/risk-report-session1.json`.

## Pronunciation notes for VO

- `Ibm-bon-risk-testing` → "eye-bee-em bon risk testing"
- `66.66%` → "sixty-six point six six percent" (same pattern for 73.49 / 81.85 / 82.08 / 99.6)
- `c8` → "see eight" · `AVA` → "av-uh" · `risk-lib.js` → "risk lib dot j-s"
