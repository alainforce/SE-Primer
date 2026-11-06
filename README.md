# SE Primer

SE Primer is a small mobile-first decision-learning game about software-engineering trade-offs, with an optional Socratic tutor and an adaptive hint model.

## Status

The model in this repository is a dev model trained on synthetic data only. The production gate (at least 15 real sessions, ROC-AUC >= 0.65 on real data) has **not** been run, so no production model is published. The AUC from the dev run is on synthetic data and is not evidence of quality.

## Setup

```bash
npm ci
Copy-Item .env.example .env
npm run dev
```

Use `npm run test:e2e` for the full Cypress suite and `npm run build` for a production build. The browser model is currently the DEV model copied to `public/model/`; its URL is centralized in `src/ml/modelConfig.ts`.

## Links

- GitHub repo: `[pending: add GitHub repository URL]`
- Live app: `[pending: add live app URL]`
- Demo video: `[pending: add demo video URL]`
- Hugging Face commit URL: `[pending: add commit-pinned model URL]`

## Honest limits

This is an MVP with one scenario and a small, noisy training set. The model is a UI personalization signal, not a ground-truth assessment, and must not be used for clinical, legal, financial, safety-critical, grading, or individual-ability decisions. In the browser, predictions are computed from the exported pipeline parameters; the ONNX file is loaded and validated through `onnxruntime-web`, but its classifier output is not used directly, so the parity test compares this JS implementation against the Python oracle. Real production parity artifacts are created only by production training into `model/`.

## AI tool usage

<!-- EMPTY STUB: content intentionally left for the project owner. -->
