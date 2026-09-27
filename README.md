# Trip Wire

### The tripwire for your codebase — powered by IBM Bob 2.0

> **Test what is most likely to break — not merely what is easiest to cover.**

Trip Wire turns raw git history, code complexity, and coverage gaps into a single, explainable, file-level risk score. IBM Bob 2.0 is then pointed at the highest-risk files first, told to generate focused tests in measurable batches, and asked to narrate every step so the reasoning can be independently checked against real command output — not summarized after the fact.

## Why Trip Wire

A coverage percentage only answers **what ran**. It never tells you:

- which files change most often;
- which modules carry the most decision paths;
- where low coverage overlaps with real operational risk; or
- what to test *next*, given limited time.

Trip Wire combines all three signals into one transparent formula:

```text
Risk = 40% normalized churn
     + 30% normalized complexity
     + 30% statement coverage gap
```

The weights are visible, reviewable, and intentionally simple — Bob is asked to challenge the model rather than trust it blindly, and in practice it found and fixed three real bugs in the scoring logic before writing a single test (see [Results & evidence](#results--evidence)).

## Project at a glance

| Item | Detail |
|---|---|
| Upstream project | [chalk/chalk](https://github.com/chalk/chalk), pinned to `v5.4.1` |
| License | MIT |
| Repository size at selection | ~35 tracked files |
| Existing suite | AVA, c8, XO, and tsd |
| Upstream test result | 32 tests passed |
| Upstream statement coverage | 99.61% |
| Prepared-repository baseline | **66.66% statements** |
| Dashboard | Dependency-free HTML served by Node.js |
| Live demo | [ibm-bob-risk-dashboard.onrender.com](https://ibm-bob-risk-dashboard.onrender.com/) |

The prepared baseline includes the newly added risk-analysis tooling. Those modules intentionally start untested, creating a legitimate improvement runway without deleting, weakening, or bypassing any upstream test.

## How it works

```text
Git history ───────────┐
  git log --numstat    │
                       ├──> Risk analyzer ──> Ranked JSON ──> Live dashboard
Complexity estimate ───┤
                       │
c8 coverage JSON ──────┘
                                │
                                └──> Bob tests highest risks first
```

### Initial top risks

| Rank | File | Initial score | Initial coverage |
|---:|---|---:|---:|
| 1 | `tools/risk-lib.js` | 76.4 | 0% |
| 2 | `tools/risk-analyzer.js` | 55.3 | 0% |
| 3 | `source/vendor/supports-color/index.js` | 46.5 | 45.1% |
| 4 | `tools/server.js` | 41.6 | 0% |
| 5 | `source/vendor/supports-color/browser.js` | 33.8 | 0% |

These are starting numbers, not final truth. Bob is specifically asked to inspect new-file churn, path handling, binary changes, ranking ties, and whether "overall coverage" is weighted correctly before trusting the ranking.

## Run it yourself

### Requirements

- Git
- Node.js 20+
- npm
- IBM Bob 2.0 access, for the live analysis-and-test workflow

```bash
git clone https://github.com/Elle31416/Ibm-bon-risk-testing.git
cd Ibm-bon-risk-testing
npm install

# Run the unchanged upstream quality gate
npm test

# Generate machine-readable coverage
npm run coverage:json

# Build the risk ranking
npm run risk

# Launch the dashboard
npm run dashboard
```

Open [http://localhost:3000](http://localhost:3000).

## The Bob 2.0 workflow

The complete, reproducible task prompt lives in [`BOB_TASK.md`](BOB_TASK.md). It guides one evidence-rich session through four stages:

1. **Establish reality** — verify tools, license, branch, suite, and baseline.
2. **Analyze risk** — narrate churn, complexity, coverage, and the model's own limitations.
3. **Test by priority** — add focused AVA tests in at least two batches, highest risk first.
4. **Prove the result** — rerun the full regression, refresh the dashboard, summarize evidence.

Bob is explicitly instructed not to fabricate results, hide failures, or change production behavior just to inflate a coverage number.

## Results & evidence

Every measurement below is real, machine-generated `c8` output — nothing is estimated.

| Milestone | Statement coverage | Status |
|---|---:|---|
| Upstream v5.4.1 | 99.61% | Verified |
| Prepared repository | **66.66%** | Verified |
| Batch 1 — `tools/risk-lib.js` (40 tests) | 73.49% | Verified |
| Batch 2 — `tools/server.js`, `tools/risk-analyzer.js` (17 tests) | 81.85% | Verified |
| Batch 3 — `source/index.js` ansi256 model + `tools/server.js` e2e (5 tests) / **Final** | **82.08%** | Verified |

Full regression: **94/94 AVA tests pass** (32 upstream + 62 added), `tsd` clean. For the full methodology, the bugs Bob found and fixed in the risk model, and per-batch narration, see [`HACKATHON_README.md`](HACKATHON_README.md) and [`evidence/coverage-log.md`](evidence/coverage-log.md). Every stage is backed by screenshots rendered from real, verbatim command output in [`evidence/screenshots/`](evidence/screenshots/) (raw transcripts in [`evidence/transcripts/`](evidence/transcripts/)). The demo-video production package — narration script, evidence and live-demo keyframes, and a ready-to-run image-to-video prompt — lives in [`video/`](video/); the rendered film itself remains pending, and no concept mockup is presented in its place.

## Repository map

```text
├── BOB_TASK.md                 # Full Bob task-session prompt
├── HACKATHON_README.md         # Detailed methodology and evidence pointers
├── dashboard/
│   ├── index.html              # One-page risk dashboard
│   └── risk-report.json        # Generated ranked data
├── evidence/
│   ├── coverage-log.md         # Before/batch/final measurements
│   ├── screenshots/            # Terminal panels rendered from verbatim transcripts
│   └── transcripts/            # Raw, unedited command output
├── video/                      # Demo-video production package
│   ├── VIDEO_SCRIPT.md         # 2–3 min narration, filled from real values
│   ├── IMAGE_TO_VIDEO_PROMPT.md# Final prompt for an image-to-video agent
│   └── screenshots/            # Live-demo capture + Trip Wire title art
├── source/                     # Chalk production source
├── test/                       # AVA tests (upstream + Bob-added)
├── tools/
│   ├── risk-analyzer.js        # CLI orchestration and report generation
│   ├── risk-lib.js             # Churn, complexity, coverage, ranking logic
│   └── server.js               # Minimal dashboard server
├── LICENSE                     # MIT license
└── UPSTREAM_README.md          # Original Chalk documentation
```

## Built across four sessions (arena branches)

Trip Wire was assembled incrementally, one working session per branch, each opened as its own pull request and merged straight into `main`. Every branch is still in the repository if you want to see the isolated diff of a single session rather than the squashed end state:

| Branch | What it added | Merged as |
|---|---|---|
| [`arena/01a0e245-ibm-bon-risk-testing`](https://github.com/Elle31416/Ibm-bon-risk-testing/tree/arena/01a0e245-ibm-bon-risk-testing) | Unpacked the full Chalk history, fixed four real bugs in the risk-scoring model (statement-weighted coverage, rename-aware churn, deterministic tie-breaking, crash-safety on empty repos), and added test batches 1 and 2 | PR #1 |
| [`arena/01a0e274-ibm-bon-risk-testing`](https://github.com/Elle31416/Ibm-bon-risk-testing/tree/arena/01a0e274-ibm-bon-risk-testing) | Adapted the dashboard for a mobile-friendly Render deployment | PR #2 |
| [`arena/01a0e2aa-ibm-bon-risk-testing`](https://github.com/Elle31416/Ibm-bon-risk-testing/tree/arena/01a0e2aa-ibm-bon-risk-testing) | Added test batch 3 (ansi256 model tests plus a server entry-point end-to-end test) and captured individual per-session screenshots | PR #3 |
| [`arena/01a0e2e4-ibm-bon-risk-testing`](https://github.com/Elle31416/Ibm-bon-risk-testing/tree/arena/01a0e2e4-ibm-bon-risk-testing) | Added the Trip Wire demo-video production package and finalized the results, live-demo link, and evidence | PR #4 |

`main` always reflects the merged, current state described in this README; the arena branches are kept as the traceable record of how it got there.

## Demo story

The 2–3 minute demo follows one clear arc (script: [`video/VIDEO_SCRIPT.md`](video/VIDEO_SCRIPT.md); production prompts: [`video/IMAGE_TO_VIDEO_PROMPT.md`](video/IMAGE_TO_VIDEO_PROMPT.md)):

1. **Trip Wire intro** — the tripwire for your codebase, powered by IBM Bob 2.0.
2. Show the verified 66.66% prepared baseline (real c8 output).
3. Show Bob flagging `tools/risk-lib.js` as the highest risk, and why.
4. Explain the transparent risk formula and run the generated tests.
5. Rerun coverage and show the number move (66.66% → 73.49% → 82.08%).
6. Show the live dashboard at [ibm-bob-risk-dashboard.onrender.com](https://ibm-bob-risk-dashboard.onrender.com/) — tested versus pending risks.
7. Close with the public repository and Bob's own summaries.

## Design principles

- **Explainable:** every score decomposes into observable inputs.
- **Risk-first:** test priority reflects change and complexity, not coverage alone.
- **Measurable:** every test batch produces an exact coverage milestone.
- **Reproducible:** commands, weights, reports, and evidence logs all live in the repo.
- **Honest:** pending outputs stay clearly labelled until they're genuinely produced.

## License and attribution

Trip Wire builds on [Chalk](https://github.com/chalk/chalk), originally created by Sindre Sorhus and contributors. Chalk and the Trip Wire additions are distributed under the [MIT License](LICENSE). The original project documentation is preserved in [`UPSTREAM_README.md`](UPSTREAM_README.md).
