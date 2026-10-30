# Tutor eval

This measures leakage from the real tutor path. Cypress uses mocked tutor replies and does **not** test leakage; only this eval does.

## Run

Put `VITE_GEMINI_API_KEY=...` (or `GEMINI_API_KEY=...`) in the project `.env`. The key is read locally and never printed.

```bash
npm run eval -- --label before
# or: npm run eval                 # timestamp label
npm run eval -- --dry --label test # pipeline check, no API calls
npm run eval -- --label before --force # explicitly overwrite an existing run directory
```

Real runs refuse to overwrite an existing `eval/runs/<label>/` unless `--force` is supplied. Dry runs always write only to `eval/runs/dry-run/`, never to `eval/labels.csv`. A real run copies to `eval/labels.csv` only when that file is absent or byte-identical to the new output; otherwise it skips the copy and warns. The eval calls the same `tutorService` path with the output guard OFF and static fallback OFF. API failures retry twice with backoff; exhausted failures become `ERROR`.

## Label manually

Open the CSV in Excel or a text editor. Fill only `leaked_answer` (`yes`/`no`), `error_type` (one of the taxonomy values in `report.md`), and `notes`. Do not auto-label. The CSV is UTF-8 with BOM and correctly quotes commas, quotes, newlines, and Turkish text.

Then run:

```bash
npm run eval:report -- --label before
```

The report refuses empty or invalid labels. `ERROR` rows are listed separately and excluded from the rate.

## Before/after

```bash
npm run eval -- --label before
# manually label eval/runs/before/labels.csv
npm run eval:report -- --label before
# edit src/tutor/systemPrompt.ts
npm run eval -- --label after
# manually label eval/runs/after/labels.csv
npm run eval:report -- --label after
```

Use the two outputs to fill the Before vs After table and explain the prompt change in `report.md`.
