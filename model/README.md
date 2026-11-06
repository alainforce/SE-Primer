# SE Primer — Adaptive Hint Model

## Purpose

A logistic regression classifier that predicts whether a player is likely to make a risky choice (option B) on the **next decision** (decisions 2 and 3 only — no prediction at decision 1 since there is no prior history).

When P(riskli) ≥ 0.50 the app:
- Shows a proactive Socratic hint automatically
- Removes the countdown timer for that decision

If the model fails to load, the app falls back silently to default behaviour (no crash).

---

## Features

| Feature | Type | Description |
|---|---|---|
| `seviye` | int (0/1) | Player level: 0 = beginner, 1 = experienced |
| `sahne_no` | int (2/3) | Current decision number |
| `onceki_ort_karar_suresi_sn` | float | Mean decision duration (seconds) of prior decisions |
| `onceki_ipucu_sayisi` | int | Number of hints **player** opened/asked for (auto-opened model hints excluded) |
| `onceki_riskli_secim_sayisi` | int | Number of risky (B) choices in prior decisions |

**Target:** `riskli_secim` (1 = player picked B on their own; timeout rows excluded)

---

## Pipeline

```
StandardScaler → LogisticRegression(random_state=42, max_iter=1000)
```

Built with scikit-learn 1.7.1, exported via skl2onnx 1.17.0 (opset 17).

---

## Data

See `config.json` for exact counts after training. Fields:

| Field | Description |
|---|---|
| `n_real_rows` | Real player rows (kaynak=gercek, no timeout, sahne 2+3) |
| `n_real_sessions` | Unique real sessions |
| `real_class_balance` | {0: n, 1: n} from real rows |
| `n_synthetic_rows` | Synthetic rows used to augment training |

Real class balance will be reported after collection (not pre-claimed).

---

## Metrics

| Metric | Value |
|---|---|
| ROC-AUC (GroupKFold-5 OOF) | see `config.json → auc` |
| Acceptance threshold | **≥ 0.65** (pre-registered; reason: ~45 real rows, AUC noise ≈ ±0.08; frozen before training) |
| ONNX parity | max abs diff < 1e-4 (verified at export time) |

---

## Intervention Threshold

`intervention_threshold` in `config.json` (default **0.50**).

If P(riskli) ≥ threshold:
- Auto-open hint panel (without incrementing `onceki_ipucu_sayisi`)
- Hide countdown timer

---

## Limits & Do-Not-Use-For

- **Not applied at Decision 1** — no prior history available.
- Trained on a small dataset; predictions are weak signals, not ground truth.
- **Do not use** for clinical, legal, financial, or safety-critical decisions.
- **Do not use** to infer individual student ability or grade students.
- Intended solely as a UI personalization hint within the SE Primer learning game.

