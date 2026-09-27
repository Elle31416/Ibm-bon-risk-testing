# Bob 2.0 task session — screenshots (individual files)

Each PNG below is one terminal panel of the Bob 2.0 task session, rendered from
the **real command output** captured in `../transcripts/`. Every non-note line on
an image was machine-verified verbatim against those transcripts before rendering
(194 lines checked; the render aborts if any line does not match). Numbers on the
milestone/narration cards are verified against `../coverage-log.md`,
`../risk-report-session1.json`, and the c8 transcripts.

| # | File | Shows | Source transcript |
|---|---|---|---|
| 00 | `00-title.png` | Title card: repo, branch, date, env, headline numbers (66.66% → 82.08%, 94/94 tests, risk formula) | values from coverage log + all transcripts |
| 01 | `01-setup.png` | Versions (git 2.39.5 / node v22.22.3 / npm 10.9.8), branch, 50 tracked files, remote | `01-setup.txt` |
| 02 | `02-baseline-coverage.png` | `npm run coverage:json` before this session's changes — **81.85%** c8 table (89/89 tests) | `02-baseline-coverage.txt` |
| 03 | `03-baseline-plain-c8.png` | Cheat-sheet baseline command (no `--all`) — **99.62%** + scope note (different measurement scope, both real) | `03-baseline-plain-c8.txt` |
| 04 | `04-risk-analysis.png` | `npm run risk` — full ranked table (0.40 churn + 0.30 complexity + 0.30 coverageGap), overall 81.9%, squash-history churn note | `04-risk-analysis.txt` |
| 05 | `05-batch3-new-tests.png` | The 5 new batch-3 tests passing in isolation (4 ansi256 model + server entry-point e2e) — 14/14 | `06-batch3-isolated.txt` |
| 06 | `06-full-regression.png` | Full regression: **94/94 AVA pass** + `npx tsd` zero type errors | `05-batch3-after.txt` |
| 07 | `07-coverage-after-batch3.png` | `npm run coverage:json` after batch 3 — **82.08%**, `source/index.js` at 100%, re-rank 82.1% | `05-batch3-after.txt` |
| 08 | `08-coverage-milestones.png` | Milestone table: 99.61 (upstream) → 66.66 (baseline) → 73.49 → 81.85 → **82.08** | coverage log + c8 transcripts |
| 09 | `09-narration-filled.png` | 2–3 min narration script with every blank filled from real values | coverage log + session-1 risk report + c8 transcripts |

**Story in one line:** prepared-repo baseline **66.66%** → Bob batch 1 **73.49%**
→ batch 2 **81.85%** → batch 3 (this session) **82.08%** statement coverage,
94/94 AVA tests, tsd clean — all measured with `npm run coverage:json`
(`c8 --all --include="source/**/*.js" --include="tools/**/*.js"`).

Honesty notes (also on the images): (1) this fork's single squash-merge commit
makes churn ∝ file size in live runs — session 1's ranking against real
multi-commit history is preserved at `../risk-report-session1.json`;
(2) the plain no-`--all` c8 command measures a different scope (99.62%) — that is
why two baseline images exist; (3) `tools/server.js` stays 92.1% in c8's table
because the e2e-tested child process is signalled and does not flush V8 coverage
into the parent report — verified experimentally, documented in `../coverage-log.md`.
