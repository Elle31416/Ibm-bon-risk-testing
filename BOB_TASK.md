# IBM Bob 2.0 — primary task session

## Goal

Use one sustained, evidence-rich Bob task session to analyze repository risk, validate the ranking model, add tests in small batches, and leave a reproducible dashboard. Narrate reasoning and produce a task-session summary suitable for a hackathon evidence screenshot.

## Repository facts

- Upstream: `chalk/chalk`, pinned to tag `v5.4.1`
- License: MIT (`license`)
- Size at selection: about 35 tracked files on the current upstream branch
- Existing suite: AVA, XO, tsd, and c8
- Upstream baseline: 99.61% statements, 96.15% branches, 95.23% functions, 99.61% lines
- Added hackathon tooling under `tools/` is intentionally not yet tested. It creates a meaningful low-coverage target without weakening upstream tests.
- Never modify production behavior solely to increase coverage.

## Copy this entire prompt into Bob

You are working in a small MIT-licensed JavaScript repository prepared for a code-risk hackathon. Work autonomously, but narrate each stage and preserve evidence. First read README.md, package.json, license, evidence/coverage-log.md, tools/risk-analyzer.js, tools/risk-lib.js, tools/server.js, and dashboard/index.html. Inspect git history with `git log --numstat --since="365 days ago"` and inspect all existing tests.

Stage 1 — establish reality:
1. Confirm Node, npm, git, license, tracked-file count, branch, and remotes.
2. Run `npm run coverage:json`. Record the complete statement/branch/function/line totals in the Prepared-repo baseline row of evidence/coverage-log.md. Do not copy the upstream number if the new command reports a different number.
3. Explain why the prepared baseline differs from the upstream baseline.

Stage 2 — risk analysis:
4. Run `npm run risk` and inspect dashboard/risk-report.json.
5. Independently assess recent churn, cyclomatic complexity, and coverage gaps. Review the formulas and parsing in tools/risk-lib.js and tools/risk-analyzer.js for correctness, path normalization, binary renames, missing coverage, empty repositories, generated files, and misleading averages.
6. Report the top 5–10 risks with evidence. If the ranking is misleading, improve the analyzer before testing it. Keep weights transparent and justify changes.

Stage 3 — tests, highest risk first:
7. Add focused AVA tests for the highest-risk untested behavior. Cover normal paths, boundary cases, malformed input, missing coverage, all-zero normalization, git numstat parsing, complexity parsing limitations, ranking stability/ties, path handling, HTTP 404/path traversal, and server content types where applicable.
8. Refactor tools/server.js only if needed to export a testable server factory while keeping `npm run dashboard` functional. Avoid broad rewrites.
9. Work in at least two coherent test batches. After each batch run the relevant tests, then `npm run coverage:json`, `npm run risk`, and update evidence/coverage-log.md with exact numbers. Never fabricate coverage or mark a failed command as passing.
10. Run the full `npm test` as a regression check. Account for any environment/version issue explicitly rather than hiding it.

Stage 4 — dashboard and evidence:
11. Verify dashboard/index.html displays overall coverage and ranked files with tested/pending state. Improve only defects that affect the demo. Start it with `npm run dashboard` and report the URL.
12. Update HACKATHON_README.md with methodology, score formula, exact before/after results, top risks, commands, limitations, and screenshot placeholders. Do not claim a screenshot exists unless it does.
13. Finish with a concise task-session summary containing: files inspected, commands run, analyzer decisions, tests added, all coverage milestones, regression result, remaining risks, and files changed. Pause so I can capture the genuine Bob summary screenshot.

Constraints: stay inside this repository; do not publish, authenticate, reveal secrets, or change the upstream license. Do not use `npm audit fix --force`. Keep commits optional because the participant will publish to their own fork.
