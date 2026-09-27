# Risk-Driven Test Improvement with IBM Bob 2.0

## Status

Prepared for a genuine IBM Bob task session. The upstream coverage baseline is recorded; Bob-generated analysis, tests, before/after prepared-repository coverage, and screenshots are intentionally pending.

## Method

The analyzer ranks source files using normalized recent churn (40%), estimated complexity (30%), and statement coverage gap (30%). Bob is asked to validate and improve this model rather than blindly trust it.

## Reproduce

```bash
npm install
npm test
npm run coverage:json
npm run risk
npm run dashboard
```

Open http://localhost:3000. See `BOB_TASK.md` for the complete task prompt and `evidence/coverage-log.md` for measurements.

## Evidence placeholders

- Analysis summary screenshot: `evidence/bob-analysis-summary.png` (pending)
- Test-generation summary screenshot: `evidence/bob-test-summary.png` (pending)
- Demo video: pending

Do not replace placeholders with fabricated evidence.
