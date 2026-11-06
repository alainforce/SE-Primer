"""
train.py — SE Primer adaptive-hint model trainer.

Usage:
    python train.py [--dev] [--csv data/oturumlar.csv] \
                    [--threshold 0.50] [--random-state 42]

Flags:
    --dev           Skip real-data gates; write output to model_dev/ instead of model/.
    --csv PATH      Input CSV (default: data/oturumlar.csv).
    --threshold F   Intervention threshold P(riskli) >= F (default: 0.50).
    --random-state  Random seed (default: 42).

Outputs (in model/ or model_dev/):
    model.onnx   — exported pipeline
    config.json  — metadata & metrics
"""

import argparse
import json
import sys
from datetime import date
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupKFold
from sklearn.metrics import roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import onnxruntime as rt

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

FEATURES = [
    "seviye",
    "sahne_no",
    "onceki_ort_karar_suresi_sn",
    "onceki_ipucu_sayisi",
    "onceki_riskli_secim_sayisi",
]
TARGET = "riskli_secim"


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Train SE Primer adaptive-hint model")
    p.add_argument("--dev", action="store_true", help="Dev mode: skip real-data gates, write to model_dev/")
    p.add_argument("--csv", default="data/oturumlar.csv", help="Input CSV path")
    p.add_argument("--threshold", type=float, default=0.50, help="Intervention threshold (default 0.50)")
    p.add_argument("--random-state", type=int, default=42, help="Random seed (default 42)")
    return p.parse_args()


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def load_data(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} rows from {csv_path}")
    return df


def split_real_synthetic(df: pd.DataFrame):
    """Return (real_df, synthetic_df).

    Real rows: kaynak == 'gercek', zaman_asimi == 0.
    The model is only trained / evaluated on sahne_no in {2, 3} because
    there is no prior history at sahne_no == 1.
    """
    real = df[(df["kaynak"] == "gercek") & (df["zaman_asimi"] == 0) & (df["sahne_no"].isin([2, 3]))].copy()
    synthetic = df[(df["kaynak"] == "sentetik") & (df["sahne_no"].isin([2, 3]))].copy()
    return real, synthetic


# ---------------------------------------------------------------------------
# Cross-validation
# ---------------------------------------------------------------------------

def cross_validate(real: pd.DataFrame, synthetic: pd.DataFrame, random_state: int) -> tuple[float, np.ndarray, np.ndarray]:
    """GroupKFold CV on real rows; each training fold also sees all synthetic rows.

    Returns pooled OOF ROC-AUC.
    """
    if len(real) == 0:
        raise ValueError("No real rows available for cross-validation.")
    if real[TARGET].nunique() < 2:
        raise ValueError("Real evaluation rows must contain both target classes.")

    gkf = GroupKFold(n_splits=5)
    groups = real["oturum_id"].values
    X_real = real[FEATURES].values.astype(np.float32)
    y_real = real[TARGET].values

    X_synth = synthetic[FEATURES].values.astype(np.float32) if len(synthetic) else np.empty((0, len(FEATURES)), dtype=np.float32)
    y_synth = synthetic[TARGET].values if len(synthetic) else np.array([], dtype=int)

    oof_probs: list[float] = []
    oof_labels: list[int] = []

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(random_state=random_state, max_iter=1000)),
    ])

    for fold, (train_idx, test_idx) in enumerate(gkf.split(X_real, y_real, groups)):
        X_train = np.vstack([X_real[train_idx], X_synth]) if len(X_synth) else X_real[train_idx]
        y_train = np.concatenate([y_real[train_idx], y_synth]) if len(y_synth) else y_real[train_idx]
        X_test = X_real[test_idx]
        y_test = y_real[test_idx]

        pipe.fit(X_train, y_train)
        probs = pipe.predict_proba(X_test)[:, 1]
        oof_probs.extend(probs.tolist())
        oof_labels.extend(y_test.tolist())
        print(f"  Fold {fold + 1}: n_train={len(X_train)}, n_test={len(X_test)}, pos_test={int(y_test.sum())}")

    auc = roc_auc_score(oof_labels, oof_probs)
    print(f"\nPooled OOF ROC-AUC: {auc:.4f}")
    return auc, np.asarray(oof_labels), np.asarray(oof_probs)


def bootstrap_auc_by_session(df: pd.DataFrame, labels: np.ndarray, probs: np.ndarray, random_state: int, resamples: int = 200) -> tuple[float, float]:
    sessions = df["oturum_id"].to_numpy()
    unique_sessions = np.unique(sessions)
    rng = np.random.default_rng(random_state)
    values = []
    for _ in range(resamples):
        sampled = rng.choice(unique_sessions, size=len(unique_sessions), replace=True)
        indices = np.concatenate([np.flatnonzero(sessions == session) for session in sampled])
        if np.unique(labels[indices]).size == 2:
            values.append(roc_auc_score(labels[indices], probs[indices]))
    if not values:
        return float("nan"), float("nan")
    return float(np.percentile(values, 2.5)), float(np.percentile(values, 97.5))


# ---------------------------------------------------------------------------
# ONNX export & parity check
# ---------------------------------------------------------------------------

def export_onnx(pipeline: Pipeline, out_path: Path) -> None:
    initial_types = [("float_input", FloatTensorType([None, len(FEATURES)]))]
    onnx_model = convert_sklearn(
        pipeline,
        initial_types=initial_types,
        options={"clf": {"zipmap": False}},
        target_opset=17,
    )
    out_path.write_bytes(onnx_model.SerializeToString())
    print(f"ONNX model written to {out_path}")


def parity_check(pipeline: Pipeline, all_data: pd.DataFrame, onnx_path: Path) -> None:
    """Assert max abs diff between sklearn and ONNX probabilities < 1e-4."""
    X = all_data[FEATURES].values.astype(np.float32)
    sk_probs = pipeline.predict_proba(X)[:, 1]

    sess = rt.InferenceSession(str(onnx_path))
    input_name = sess.get_inputs()[0].name
    onnx_out = sess.run(None, {input_name: X})
    # output[1] is the probability dict for binary classifiers in skl2onnx
    onnx_probs = np.array([row[1] for row in onnx_out[1]])

    max_diff = float(np.abs(sk_probs - onnx_probs).max())
    print(f"ONNX parity check: max abs diff = {max_diff:.2e}")
    if max_diff >= 1e-4:
        print(f"ERROR: parity check FAILED (max diff {max_diff:.2e} >= 1e-4). Aborting.")
        sys.exit(1)
    print("Parity check PASSED.")


# ---------------------------------------------------------------------------
# Probability histogram
# ---------------------------------------------------------------------------

def print_histogram(pipeline: Pipeline, scenes23: pd.DataFrame, threshold: float) -> None:
    if len(scenes23) == 0:
        print("No scenes 2+3 data for histogram.")
        return
    X = scenes23[FEATURES].values.astype(np.float32)
    probs = pipeline.predict_proba(X)[:, 1]

    buckets = np.arange(0, 1.1, 0.1)
    counts, _ = np.histogram(probs, bins=buckets)
    print("\nProbability histogram (scenes 2+3, all data):")
    for i, c in enumerate(counts):
        lo, hi = buckets[i], buckets[i + 1]
        bar = "#" * c
        marker = " <-- threshold" if lo <= threshold < hi else ""
        print(f"  [{lo:.1f}-{hi:.1f}): {c:3d}  {bar}{marker}")
    n_above = int((probs >= threshold).sum())
    print(f"\nRows above threshold ({threshold}): {n_above} / {len(probs)}")


def write_production_parity_refs(pipeline: Pipeline) -> None:
    refs = [
        ("Experienced player, scene 2, fast decisions, no hints, 1 prior risky", [1, 2, 20.0, 0, 1]),
        ("Beginner, scene 2, slow decisions, 2 hints, 0 prior risky", [0, 2, 45.0, 2, 0]),
        ("Experienced player, scene 3, very fast decisions, no hints, 2 prior risky", [1, 3, 15.0, 0, 2]),
        ("Beginner, scene 3, slow decisions, 3 hints, 1 prior risky", [0, 3, 60.0, 3, 1]),
        ("Beginner, scene 2, very fast decisions, no hints, 0 prior risky", [0, 2, 10.0, 0, 0]),
    ]
    matrix = np.asarray([row for _, row in refs], dtype=np.float32)
    probabilities = pipeline.predict_proba(matrix)[:, 1]
    output = [{"description": description, "input": dict(zip(FEATURES, row)), "p_riskli": round(float(prob), 6)} for (description, row), prob in zip(refs, probabilities)]
    path = Path("tests/parite.json")
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Production parity references written to {path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    args = parse_args()

    print("=" * 60)
    print("SE Primer — adaptive-hint model trainer")
    print(f"Mode: {'DEV' if args.dev else 'PRODUCTION'}")
    print(f"CSV:  {args.csv}")
    print(f"Threshold: {args.threshold}")
    print(f"Random state: {args.random_state}")
    print("=" * 60)

    # --- Load data ---
    df = load_data(args.csv)

    real, synthetic = split_real_synthetic(df)
    n_real_rows = len(real)
    n_real_sessions = int(real["oturum_id"].nunique()) if n_real_rows > 0 else 0
    n_synthetic_rows = len(synthetic)

    print(f"\nReal rows (gercek, no timeout, sahne 2+3): {n_real_rows}")
    print(f"Real sessions: {n_real_sessions}")
    print(f"Synthetic rows (sahne 2+3): {n_synthetic_rows}")

    # --- Real-data gate ---
    if not args.dev and n_real_sessions < 15:
        print(f"\nNOT ENOUGH REAL SESSIONS ({n_real_sessions} < 15). Collect more data and retry.")
        sys.exit(1)

    # --- Cross-validation ---
    print("\n--- Cross-validation ---")
    if args.dev and n_real_rows == 0:
        # Dev fallback: use synthetic as stand-in
        print("DEV MODE: no real rows — using synthetic as CV stand-in.")
        real_cv = synthetic.copy()
        real_cv["oturum_id"] = real_cv["oturum_id"]  # keep original ids
        synth_cv = pd.DataFrame(columns=synthetic.columns)
        auc, oof_labels, oof_probs = cross_validate(real_cv, synth_cv, args.random_state)
        bootstrap_df = real_cv
    else:
        auc, oof_labels, oof_probs = cross_validate(real, synthetic, args.random_state)
        bootstrap_df = real

    print(f"\nFinal AUC: {auc:.4f}")
    if n_real_rows < 60:
        low, high = bootstrap_auc_by_session(bootstrap_df, oof_labels, oof_probs, args.random_state)
        print(f"WARNING: Few real rows: AUC is noisy (95% bootstrap interval: [{low:.4f}, {high:.4f}])")

    # --- AUC gate ---
    if not args.dev and auc < 0.65:
        print(f"\nAUC {auc:.4f} < 0.65 (pre-registered threshold). Model rejected. Aborting.")
        sys.exit(1)

    # --- Train final model on ALL data ---
    print("\n--- Training final model on all data (scenes 2+3) ---")
    all_data = pd.concat([real, synthetic], ignore_index=True) if n_synthetic_rows > 0 else real.copy()
    if len(all_data) == 0:
        print("ERROR: No training data available.")
        sys.exit(1)

    X_all = all_data[FEATURES].values.astype(np.float32)
    y_all = all_data[TARGET].values

    final_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(random_state=args.random_state, max_iter=1000)),
    ])
    final_pipeline.fit(X_all, y_all)
    print(f"Final model trained on {len(X_all)} rows.")

    # --- Output dir ---
    out_dir = Path("model_dev") if args.dev else Path("model")
    out_dir.mkdir(exist_ok=True)

    # --- ONNX export ---
    print("\n--- Exporting to ONNX ---")
    onnx_path = out_dir / "model.onnx"
    export_onnx(final_pipeline, onnx_path)
    parity_check(final_pipeline, all_data, onnx_path)
    if not args.dev:
        write_production_parity_refs(final_pipeline)

    # --- Config ---
    real_class_balance: dict
    if n_real_rows > 0:
        vc = real[TARGET].value_counts().to_dict()
        real_class_balance = {str(k): int(v) for k, v in vc.items()}
    else:
        real_class_balance = {}

    config = {
        "auc": round(auc, 4),
        "n_real_rows": n_real_rows,
        "n_real_sessions": n_real_sessions,
        "real_class_balance": real_class_balance,
        "n_synthetic_rows": n_synthetic_rows,
        "synthetic_rows_used": n_synthetic_rows,
        "feature_order": FEATURES,
        "class_labels": [0, 1],
        "intervention_threshold": args.threshold,
        "model": "LogisticRegression + StandardScaler (sklearn Pipeline)",
        "random_state": args.random_state,
        "date": date.today().isoformat(),
        "scaler_mean": final_pipeline.named_steps["scaler"].mean_.tolist(),
        "scaler_scale": final_pipeline.named_steps["scaler"].scale_.tolist(),
        "classifier_coefficients": final_pipeline.named_steps["clf"].coef_[0].tolist(),
        "classifier_intercept": float(final_pipeline.named_steps["clf"].intercept_[0]),
    }
    config_path = out_dir / "config.json"
    config_path.write_text(json.dumps(config, indent=2, ensure_ascii=False))
    print(f"\nConfig written to {config_path}")
    print(json.dumps(config, indent=2, ensure_ascii=False))

    # --- Histogram ---
    print_histogram(final_pipeline, all_data, args.threshold)

    for scene in (2, 3):
        scene_data = all_data[all_data["sahne_no"] == scene]
        if len(scene_data):
            scene_probs = final_pipeline.predict_proba(scene_data[FEATURES].values.astype(np.float32))[:, 1]
            print(f"Scene {scene}: n={len(scene_probs)}, min={scene_probs.min():.4f}, median={np.median(scene_probs):.4f}, mean={scene_probs.mean():.4f}, max={scene_probs.max():.4f}, above_threshold={(scene_probs >= args.threshold).mean():.1%}")

    print("\n" + "=" * 60)
    print(f"SUCCESS. Outputs in {out_dir}/")
    print("=" * 60)


if __name__ == "__main__":
    main()
