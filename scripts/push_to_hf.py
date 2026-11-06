"""
Push model/ directory to a HuggingFace repository.

Prerequisites:
    huggingface-cli login   # run once; stores token in ~/.cache/huggingface
    python scripts/push_to_hf.py --repo <username/repo-name>

This script never reads or prints your token.
"""

import argparse
import os
from pathlib import Path
from huggingface_hub import HfApi


MODEL_DIR = Path(__file__).resolve().parent.parent / "model"


def main() -> None:
    parser = argparse.ArgumentParser(description="Push model/ to HuggingFace Hub")
    parser.add_argument(
        "--repo",
        required=True,
        help="HuggingFace repository id, e.g. yourname/se-primer-model",
    )
    parser.add_argument(
        "--repo-type",
        default="model",
        choices=["model", "dataset", "space"],
        help="Repository type (default: model)",
    )
    args = parser.parse_args()

    if not MODEL_DIR.exists():
        raise FileNotFoundError(
            f"model/ directory not found at {MODEL_DIR}. "
            "Run 'python train.py' (without --dev) first."
        )
    if MODEL_DIR.name == "model_dev" or "model_dev" in str(MODEL_DIR).lower():
        raise RuntimeError("Refusing to push model_dev/. Train a production model into model/ first.")

    files = list(MODEL_DIR.iterdir())
    if not files:
        raise FileNotFoundError("model/ directory is empty. Run 'python train.py' first.")

    print(f"Preparing {len([f for f in files if f.is_file()])} model files from {MODEL_DIR}")
    api = HfApi()

    # Create repo if it doesn't exist yet
    api.create_repo(repo_id=args.repo, repo_type=args.repo_type, exist_ok=True)

    for f in files:
        if f.is_file():
            print(f"Uploading {f.name} ...")
            api.upload_file(
                path_or_fileobj=str(f),
                path_in_repo=f.name,
                repo_id=args.repo,
                repo_type=args.repo_type,
            )

    print(f"\nDone. Files uploaded to https://huggingface.co/{args.repo}")


if __name__ == "__main__":
    main()
