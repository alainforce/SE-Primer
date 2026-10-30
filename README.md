# SE Primer

SE Primer is a short, mobile-first decision-learning experience about software-engineering trade-offs. It combines a branching story, technical-debt feedback, timed decisions, and an optional Socratic AI tutor. The stack is Vite, React, TypeScript, Tailwind CSS, Gemini, and Cypress.

## Setup and run

```bash
npm ci
cp .env.example .env
# Set VITE_GEMINI_API_KEY in .env when tutor calls are wanted.
npm run dev
npm run build
npx tsc --noEmit
npm run test:e2e
npm run demo
npm run eval -- --label before
npm run eval:report -- --label before
```

On PowerShell, use `Copy-Item .env.example .env` instead of `cp`. The tutor evaluation calls the real tutor service; label `eval/runs/<label>/labels.csv` by hand before running the report. The demo video is written to `cypress/videos/demo_walkthrough.cy.ts.mp4` after `npm run demo`.

## Deploy to Google AI Studio

1. Check the current Google AI Studio documentation for the current import and deployment flow.
2. Import the GitHub repository, or paste the Vite + React + TypeScript project files into an AI Studio app if repository import is unavailable.
3. Install dependencies and use the project's normal build/start commands, following the current AI Studio instructions for the supported runtime.
4. Let AI Studio inject its own key through its supported environment mechanism; do not paste a production key into source files. The app reads `import.meta.env.VITE_GEMINI_API_KEY`, then `process.env.GEMINI_API_KEY`.
5. After deployment, play the experience on a phone-sized screen, verify that tutor replies appear, and verify that a timed decision reaches the timeout behavior. Use the current AI Studio docs for any platform-specific sharing or deployment controls.

## Security notes

`VITE_` environment variables are exposed to the client bundle. Never commit `.env`, and never host or share a `dist/` directory built with a real key.

## Links

- GitHub repository: `[add repository URL]`
- AI Studio app: `[add AI Studio app URL]`
- Demo video: `[add demo video URL]`

## Project layout

```text
src/                 React app, story data, tutor service
cypress/             E2E specs, fixtures, and commands
eval/                Tutor leakage dataset, runner, labels, and report
spec.md              Product requirements and traceability table
DESIGN.md            UI and data-testid contract
```

See [spec.md](spec.md), [DESIGN.md](DESIGN.md), and [eval/report.md](eval/report.md).

## 3 features I did NOT build

1. User accounts or saved progress are intentionally omitted because this product stage should keep the learning loop low-friction and avoid collecting identity or progress data before a privacy model exists.
2. Additional scenarios or chapters are intentionally omitted because one tightly instrumented scenario makes the learning objective and tutor evaluation interpretable before content breadth is expanded.
3. A leaderboard or voice narration is intentionally omitted because competitive scoring could reward reckless choices and narration is not needed to validate the core Socratic decision-learning loop at this stage.

## Limitations

This prototype contains one scenario. The tutor evaluation is n=20, uses one model and one labeler, and the Cypress mocks do not test tutor leakage; only the evaluation in `eval/` does.
