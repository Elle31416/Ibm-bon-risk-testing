# Trip Wire — Final Image-to-Video Prompt (with narration script)

**Feed this file to your image-to-video agent** (Runway, Kling, Luma, Pika, Sora, Veo…). It produces six clips (~2:35 total) that stitch into the demo film. Each scene gives: the **keyframe image** (first-frame conditioning), a **motion prompt** (what to animate), on-screen text, and the **narration line** (VO/TTS). Master style first, then per-scene copy-paste prompts.

---

## 1. Global style block (paste into every scene)

> Cinematic tech-product demo, 16:9, 1080p or 4K. Palette: deep navy #090d1a, electric cyan #38bdf8, emerald #34d399, amber #fbbf24 accents. Clean modern sans-serif type, subtle glow, volumetric light, soft depth of field. Motion is smooth and deliberate — slow dolly/pan moves only, no whip cuts, no camera shake. High-end developer-tool marketing aesthetic. Preserve every pixel of text in the source image exactly — do not regenerate, distort, or respell any text. Do not add watermarks, people, or real company logos.

**Global direction:** screen-recording realism for evidence panels (treat as a glass display floating in the dark navy scene), full cinematic treatment only for the Trip Wire intro/outro art.

---

## 2. Scene-by-scene generation prompts

### SCENE 1 · 0:00–0:15 · Trip Wire power intro · 15 s
**Keyframe:** `video/screenshots/12-tripwire-hero.png`
**Motion prompt:**
> Animate this title keyframe. Slow dolly-in through the floating code panels toward the snapping tripwire spark at center; the emerald spark flares brighter and amber embers drift upward and fade. A soft light sweep passes across the glowing "TRIP WIRE" letters once. The tagline "THE TRIPWIRE FOR YOUR CODEBASE" stays perfectly static and legible. In the final 2 seconds the wire re-knits with a single cyan pulse traveling left to right. Ease-out motion, 24 fps cinematic.
**On screen:** (burned into keyframe) TRIP WIRE · THE TRIPWIRE FOR YOUR CODEBASE
**Narration (VO):** “Every outage starts the same way — code that changed fast, got risky, and nobody was watching. Meet Trip Wire: the tripwire for your codebase. This is Ibm-bon-risk-testing — using IBM's Bob 2.0 to find and fix the riskiest untested code.”

### SCENE 2 · 0:15–0:40 · Baseline coverage · 25 s
**Keyframe:** `evidence/screenshots/08-coverage-milestones.png`
**Motion prompt:**
> Animate this terminal-panel screenshot as a floating glass display in a dark navy studio. Very slow push-in from the top of the milestone table toward the “Prepared-repo baseline” row; a soft cyan highlight bar slides under “66.66%” and rests there. Faint scanline shimmer across the terminal, monospace text remains razor-sharp and unchanged. Subtle parallax: panel edges catch a thin cyan rim light.
**On screen (lower third, animated in):** `Baseline — 66.66% statements · real c8 (npm run coverage:json)`
**Narration (VO):** “Baseline coverage, before Bob touches anything: 66.66%. That's real c8 output over source and tools — and it looks low for a reason: three brand-new risk-engineering files start at zero. Upstream chalk sits at 99.6%. The gap is the target.”

### SCENE 3 · 0:40–1:10 · Bob flags the highest risk · 30 s
**Keyframe:** `evidence/screenshots/04-risk-analysis.png`
**Motion prompt:**
> Animate this risk-table terminal screenshot on the floating glass display. Slow lateral pan down the ranked table; the amber risk-score column glows gently as the camera passes. Settle and push in on the honesty note at the bottom where “tools/risk-lib.js #1, score 76.4, 0% coverage” is highlighted with a soft amber glow. Rows never reorder; all text stays identical to the source image.
**On screen (lower third, animated in):** `Highest risk → tools/risk-lib.js — 0% tests · top churn · most complex`
**Narration (VO):** “Bob flagged tools/risk-lib.js as the highest-risk file — and it's almost poetic. The library that ranks everyone else's risk was itself the risk: zero tests, the biggest recent churn of any tooling file, and the most decision-dense code in the toolkit. The brain of the engine — completely unwatched.”

### SCENE 4 · 1:10–1:45 · Script + generated tests running · 35 s (two 17 s clips)
**Keyframe A:** `evidence/screenshots/05-batch3-new-tests.png`
**Motion prompt A:**
> Animate this test-run terminal. The green checkmark lines flicker on top-to-bottom like live test output being written, ending with “10 tests passed” pulsing once in green. Tiny blinking block cursor at the prompt. Slow push-in toward the pass count. Everything else frozen and pixel-exact.
**Keyframe B:** `evidence/screenshots/06-full-regression.png`
**Motion prompt B:**
> Animate this full-regression terminal. Smooth vertical scroll through the passing test list (as if a human scrolled), settling on the final pass summary; a soft emerald glow blooms behind the pass count once. Faint scanline shimmer; text stays crisp and unchanged.
**On screen (lower third):** `npm run risk → 0.40 churn + 0.30 complexity + 0.30 coverageGap`
**Narration (VO):** “Here's the risk-ranking script — 40% churn, 30% complexity, 30% coverage gap — and the tests it generated, running. Forty focused unit tests on git parsing, renames, edge cases, ranking ties. The model review paid for itself too: Bob caught three real bugs in the analyzer — a misleading coverage average, churn silently lost on renamed files, and a crash on empty repos.”

### SCENE 5 · 1:45–2:15 · Coverage climb + live dashboard · 30 s (two 15 s clips)
**Keyframe A:** `evidence/screenshots/07-coverage-after-batch3.png`
**Motion prompt A:**
> Animate this c8 coverage-table screenshot. The headline coverage number counts up smoothly from 66.66 to 82.08 in cyan digits while the gradient progress bar fills left to right; table rows stay static and pixel-exact. Soft ambient glow rises as the number lands on 82.08.
**Keyframe B:** `video/screenshots/10-live-demo-browser.png`
**Motion prompt B:**
> Animate this browser window showing a live risk dashboard at ibm-bob-risk-dashboard.onrender.com. The window floats up in slight 3D perspective and settles perfectly flat; a mouse cursor glides to the URL bar and the padlock glints. The “Live · generated 9/27/2026” stamp pulses softly; the risk rows cascade in one by one from top to bottom like live data arriving; the 82.1% metric breathes with a gentle glow.
**On screen (lower third):** `66.66% → 73.49% → 82.08% · 94/94 tests · live: ibm-bob-risk-dashboard.onrender.com`
**Narration (VO):** “The scoreboard after this batch: 66.66% → 73.49%. Two more batches later: 82.08%, with 94 of 94 tests green — every number measured, none estimated. And it's live right now at ibm-bob-risk-dashboard.onrender.com — churn, complexity and coverage, ranked file by file.”

### SCENE 6 · 2:15–2:35 · Outro · 20 s
**Keyframe:** `video/screenshots/13-tripwire-outro.png`
**Motion prompt:**
> Animate this closing keyframe. A calm emerald pulse travels along the intact tripwire from left to right, lighting the code panels faintly as it passes. Slow pull-back camera; “IT TRIPS SO YOU DON'T.” stays centered and static with a subtle glow breathe; the github.com/Elle31416/Ibm-bon-risk-testing URL fades in sharper over the last 5 seconds. End with a gentle fade to black in the final second.
**On screen:** (burned into keyframe) IT TRIPS SO YOU DON'T. · github.com/Elle31416/Ibm-bon-risk-testing
**Narration (VO):** “That's the workflow. Trip Wire trips — so your users don't. Repo's public at github.com/Elle31416/Ibm-bon-risk-testing — full writeup in the README. Go trip your own wire.”

---

## 3. Full narration script (VO / TTS track, ≈ 2:35)

```
[0:00] Every outage starts the same way — code that changed fast, got risky,
and nobody was watching. Meet Trip Wire: the tripwire for your codebase.
This is Ibm-bon-risk-testing — using IBM's Bob 2.0 to find and fix the
riskiest untested code.

[0:15] Baseline coverage, before Bob touches anything: 66.66%. That's real c8
output over source and tools — and it looks low for a reason: three
brand-new risk-engineering files start at zero. Upstream chalk sits at 99.6%.
The gap is the target.

[0:40] Bob flagged tools/risk-lib.js as the highest-risk file — and it's almost
poetic. The library that ranks everyone else's risk was itself the risk:
zero tests, the biggest recent churn of any tooling file, and the most
decision-dense code in the toolkit. The brain of the engine — completely
unwatched.

[1:10] Here's the risk-ranking script — 40% churn, 30% complexity, 30% coverage
gap — and the tests it generated, running. Forty focused unit tests on git
parsing, renames, edge cases, ranking ties. The model review paid for itself
too: Bob caught three real bugs in the analyzer — a misleading coverage
average, churn silently lost on renamed files, and a crash on empty repos.

[1:45] The scoreboard after this batch: 66.66% → 73.49%. Two more batches later:
82.08%, with 94 of 94 tests green — every number measured, none estimated.
And it's live right now at ibm-bob-risk-dashboard.onrender.com — churn,
complexity and coverage, ranked file by file.

[2:15] That's the workflow. Trip Wire trips — so your users don't. Repo's public
at github.com/Elle31416/Ibm-bon-risk-testing — full writeup in the README.
Go trip your own wire.
```

**VO direction:** confident, calm, slightly wry on “it's almost poetic”; 0.4 s beat before each timestamped line; never rush the numbers.

---

## 4. Assembly & mixing notes

1. **Order/length:** S1 15 s → S2 25 s → S3 30 s → S4A 17 s + S4B 17 s → S5A 15 s + S5B 15 s → S6 20 s ≈ 2:34 + crossfades.
2. **Transitions:** 0.5 s crossfades between scenes; hard cuts only between S4A→S4B and S5A→S5B (terminal energy).
3. **Audio:** dark ambient synth bed, low pulse like a heartbeat under S1/S6 (the “tripwire”), sub-drop on “completely unwatched”, subtle UI ticks synced to test checkmarks in S4, gentle riser into “82.08%” landing, music resolves on “Go trip your own wire.”
4. **Lower thirds:** cyan-on-navy, in at +0.5 s, out at −0.5 s of each scene; URLs exactly as spelled above (keep `Elle31416` capital-E).
5. **Truth rules:** never re-generate text inside evidence panels; if a clip garbles text, re-roll the clip, don't edit the image. Numbers spoken must match the source screenshots.

## 5. Keyframe manifest (upload these with the prompt)

| File | Scene | Type |
|---|---|---|
| `video/screenshots/12-tripwire-hero.png` | S1 | generated title art |
| `evidence/screenshots/08-coverage-milestones.png` | S2 | real evidence (c8 milestones) |
| `evidence/screenshots/04-risk-analysis.png` | S3 | real evidence (npm run risk) |
| `evidence/screenshots/05-batch3-new-tests.png` | S4A | real evidence (tests in isolation) |
| `evidence/screenshots/06-full-regression.png` | S4B | real evidence (full regression) |
| `evidence/screenshots/07-coverage-after-batch3.png` | S5A | real evidence (c8 after batch) |
| `video/screenshots/10-live-demo-browser.png` | S5B | live demo screen (ibm-bob-risk-dashboard.onrender.com) |
| `video/screenshots/13-tripwire-outro.png` | S6 | generated title art |

Optional B-roll (no VO attached): `evidence/screenshots/00-title.png`, `02-baseline-coverage.png`, `03-baseline-plain-c8.png`, `08` close-ups, `video/screenshots/11-live-demo-full.png`.
