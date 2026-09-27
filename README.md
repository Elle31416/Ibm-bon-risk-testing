# Risk-Driven Testing with IBM Bob 2.0

> **Test what is most likely to break—not merely what is easiest to cover.**

This hackathon project turns repository history, code complexity, and coverage gaps into an explainable file-level risk ranking. IBM Bob 2.0 is then directed to analyze the highest risks, generate focused tests in measurable batches, and narrate the reasoning judges can verify.

## Why this matters

A coverage percentage answers **what ran**. It does not reveal:

- which files change most frequently;
- which modules contain the most decision paths;
- where low coverage overlaps with operational risk; or
- what the team should test next.

This project combines all three signals:

```text
Risk = 40% normalized churn
     + 30% normalized complexity
     + 30% statement coverage gap
```

The weights are visible, reviewable, and intentionally simple. Bob is asked to challenge the model rather than blindly trust it.

## Project at a glance

| Item | Selection |
|---|---|
| Upstream project | [chalk/chalk](https://github.com/chalk/chalk), pinned to `v5.4.1` |
| License | MIT |
| Repository size at selection | Approximately 35 tracked files |
| Existing suite | AVA, c8, XO, and tsd |
| Upstream test result | 32 tests passed |
| Upstream statement coverage | 99.61% |
| Prepared-repository baseline | **66.66% statements** |
| Dashboard | Dependency-free HTML served by Node.js |

The prepared baseline includes the newly added risk-analysis tooling. Those modules intentionally begin untested, creating a legitimate improvement runway without deleting, weakening, or bypassing the upstream tests.

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

These are starting results, not unquestionable truth. In particular, Bob should inspect new-file churn, path handling, binary changes, ranking ties, and whether overall coverage is statement-weighted correctly.

## Reproduce locally

### Requirements

- Git
- Node.js 20+ for this pinned repository
- npm
- IBM Bob 2.0 access for the genuine AI task session

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
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

## IBM Bob 2.0 workflow

The complete, reproducible task prompt is in [`BOB_TASK.md`](BOB_TASK.md). It guides one evidence-rich task session through four stages:

1. **Establish reality** — verify tools, license, branch, suite, and baseline.
2. **Analyze risk** — narrate churn, complexity, coverage, and model limitations.
3. **Test by priority** — add focused AVA tests in at least two batches.
4. **Prove the result** — rerun regression, refresh the dashboard, and summarize evidence.

Bob is explicitly instructed not to fabricate results, hide failures, or change production behavior merely to increase coverage.

## Evidence and integrity

Measured coverage is recorded in [`evidence/coverage-log.md`](evidence/coverage-log.md).

| Milestone | Statement coverage | Status |
|---|---:|---|
| Upstream v5.4.1 | 99.61% | Verified |
| Prepared repository | **66.66%** | Verified |
| Bob test batch 1 (`tools/risk-lib.js`) | 73.49% | Verified |
| Bob test batch 2 (`tools/server.js`, `tools/risk-analyzer.js`) / Final | **81.85%** | Verified |

See [`HACKATHON_README.md`](HACKATHON_README.md) and [`evidence/coverage-log.md`](evidence/coverage-log.md) for the full methodology, model fixes, and per-batch narration. Required analysis/test-generation screenshots and the demo video remain pending until captured from this session; no concept mockup is presented as execution evidence.

## Repository map

```text
├── BOB_TASK.md                 # Full Bob task-session prompt
├── HACKATHON_README.md         # Execution status and evidence pointers
├── dashboard/
│   ├── index.html              # One-page risk dashboard
│   └── risk-report.json        # Generated ranked data
├── evidence/
│   └── coverage-log.md         # Before/batch/final measurements
├── source/                     # Chalk production source
├── test/                       # Existing upstream AVA tests
├── tools/
│   ├── risk-analyzer.js        # CLI orchestration and report generation
│   ├── risk-lib.js             # Churn, complexity, coverage, ranking logic
│   └── server.js               # Minimal dashboard server
├── LICENSE                     # MIT license
└── UPSTREAM_README.md          # Original Chalk documentation
```

## Demo story

The 2–3 minute demo follows one clear arc:

1. Show the verified 66.66% prepared baseline.
2. Show Bob narrating the intersection of churn, complexity, and coverage.
3. Explain the transparent risk formula and top-ranked files.
4. Show Bob generating focused tests in batches.
5. Rerun coverage and demonstrate the number moving.
6. Refresh the dashboard and show tested versus pending risks.
7. Finish with the public repository and genuine Bob summaries.

## Design principles

- **Explainable:** every score decomposes into observable inputs.
- **Risk-first:** test priority reflects change and complexity, not coverage alone.
- **Measurable:** every test batch produces an exact coverage milestone.
- **Reproducible:** commands, weights, reports, and evidence logs live in the repo.
- **Honest:** pending Bob outputs remain clearly labelled until genuinely produced.

## License and attribution

This project builds on [Chalk](https://github.com/chalk/chalk), originally created by Sindre Sorhus and contributors. Chalk and the hackathon additions are distributed under the [MIT License](LICENSE). The original project documentation is preserved in [`UPSTREAM_README.md`](UPSTREAM_README.md).
