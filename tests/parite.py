"""ONNX Runtime parity oracle for the five references in parite.json."""
import json
import argparse
from pathlib import Path
import numpy as np
import onnxruntime as ort

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--model-dir", default=str(ROOT / "model"))
parser.add_argument("--refs", default=str(ROOT / "tests" / "parite.json"))
args = parser.parse_args()
model_path = Path(args.model_dir) / "model.onnx"
if not model_path.exists() or Path(args.model_dir).name == "model_dev":
    raise SystemExit("Production parity oracle requires model/model.onnx; model_dev is not accepted.")
refs_path = Path(args.refs)
if not refs_path.exists() or refs_path.name != "parite.json":
    raise SystemExit("Production parity oracle requires tests/parite.json generated from model/.")
refs = json.loads(refs_path.read_text(encoding="utf-8"))
session = ort.InferenceSession(str(model_path))
input_name = session.get_inputs()[0].name
features = ["seviye", "sahne_no", "onceki_ort_karar_suresi_sn", "onceki_ipucu_sayisi", "onceki_riskli_secim_sayisi"]

for ref in refs:
    values = np.array([[ref["input"][name] for name in features]], dtype=np.float32)
    outputs = session.run(None, {input_name: values})
    probabilities = outputs[1]
    probability = float(probabilities[0][1] if isinstance(probabilities[0], dict) else probabilities[0])
    difference = abs(probability - ref["p_riskli"])
    print(f"{ref['description']}: oracle={probability:.6f} reference={ref['p_riskli']:.6f} diff={difference:.2e}")
    if difference > 1e-4:
        raise SystemExit("PARITY FAIL")
print("PARITY PASS: all 5 references within 1e-4")
