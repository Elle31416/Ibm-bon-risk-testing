# Trip Wire demo video — production package

Everything needed to produce the 2–3 min Trip Wire demo film:

| File | What it is |
|---|---|
| [`VIDEO_SCRIPT.md`](VIDEO_SCRIPT.md) | Narration script (skeleton blanks filled with real numbers), storyboard beat-by-beat, continuity + pronunciation notes |
| [`IMAGE_TO_VIDEO_PROMPT.md`](IMAGE_TO_VIDEO_PROMPT.md) | **The final prompt to feed an image-to-video agent** — global style block, per-scene keyframe + motion prompts, full VO script, assembly/mixing notes |
| [`screenshots/`](screenshots/) | New captures for the film: live-demo screen (browser-framed + clean) and generated Trip Wire title/outro art |
| `../evidence/screenshots/` | The 10 real evidence panels (`00`–`09`) used as keyframes — terminal output machine-verified verbatim against `../evidence/transcripts/` |

## Screenshot manifest & provenance (three tiers — kept distinct on purpose)

**Tier 1 — real evidence (never regenerate):** `evidence/screenshots/00…09.png`, rendered from verbatim command transcripts (`evidence/transcripts/01…06`). Used for scenes S2–S5.

**Tier 2 — live demo screen:** `screenshots/10-live-demo-browser.png`, `screenshots/11-live-demo-full.png`
- Content shown: the **Code Risk Dashboard** served at [ibm-bob-risk-dashboard.onrender.com](https://ibm-bob-risk-dashboard.onrender.com/) — “Live · generated 9/27/2026, 11:49:36 AM”, overall statement coverage **82.1%**, 8 risk-ranked files.
- Capture method: headless Chromium rendering the dashboard served by this repo's own `tools/server.js` (`npm run dashboard` — the exact `render.yaml` start command) with `dashboard/risk-report.json`.
- Verification: on 2026-09-27 the live URL's `risk-report.json` (server-side fetch) returned `generatedAt 2026-09-27T11:49:36.033Z`, `overallCoverage 82.1` — byte-identical to the repo's `dashboard/risk-report.json` rendered in these shots. The in-shot “Live · generated” stamp is that timestamp.
- Honesty note: this sandbox's network allowlist blocks direct egress to `onrender.com` (TLS filtered), so the browser could not load the live URL itself; the render is pixel-faithful because it executes the same server + same assets the live service executes. To re-capture on an unrestricted machine: `npx playwright screenshot --viewport-size=1500,1020 https://ibm-bob-risk-dashboard.onrender.com/ live.png`.

**Tier 3 — generated title art (branding, not evidence):** `screenshots/12-tripwire-hero.png`, `screenshots/13-tripwire-outro.png` — AI-generated Trip Wire intro/outro cards (no factual claims in-frame beyond the tagline and repo URL).

## Integrity rules (same as the rest of this repo)

1. Every spoken number must exist in `evidence/coverage-log.md`, a c8 transcript, or `evidence/risk-report-session1.json`.
2. Evidence panels keep their burned-in honesty footers; don't crop them out of keyframes.
3. If a video model garbles text in an evidence panel, re-roll the clip — don't edit the image.

## Verified numbers used in the film

| Beat | Value | Where it's proven |
|---|---|---|
| Baseline | 66.66% stmts (71.42 / 81.57 / 66.66) | `evidence/coverage-log.md`, screenshot `08` |
| Upstream chalk v5.4.1 | 99.61% | same |
| After batch 1 (`tools/risk-lib.js`, 40 tests) | 73.49% | same |
| After batch 2 (17 tests) | 81.85% | same |
| After batch 3 (5 tests) | **82.08%** (82.38 / 91.11 / 82.08) | same |
| Tests | 94/94 AVA + tsd clean | `SESSION_SUMMARY.md` |
| Session-1 top risk | `tools/risk-lib.js` — score 76.4, 0% coverage, ~115 churn, 16 decision points | `evidence/risk-report-session1.json`, `evidence/coverage-log.md` |
| Live dashboard | 82.1% overall, generatedAt 2026-09-27T11:49:36.033Z | live fetch + `dashboard/risk-report.json` |

## Reproduce the local dashboard screenshot

```bash
npm install
PORT=4173 npm run dashboard   # serves dashboard/ exactly as render.yaml does
# then screenshot http://127.0.0.1:4173/ with any headless browser
```
