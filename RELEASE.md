# v2.0 Release Notes

## Changed

- Added the browser ONNX adaptive hint model for decisions 2 and 3.
- Added model parity tooling, collect-mode safeguards, and release-gated production artifacts.
- Added `#/parite` for quick browser probability checks.

## Model reference

Pinned Hugging Face commit: `[ADD COMMIT-PINNED MODEL URL]`

## Rollback

Change `src/ml/modelConfig.ts` back to the previous model URL, or deploy the previous application build. If the model fails to load, the app automatically uses the standard timer/hint rules.

## Hosting trade-offs

| Question | Browser | On-device | Own server |
|---|---|---|---|
| Network and latency | Initial model download; local inference | No model network round-trip; device-dependent | Network round-trip; server capacity matters |
| Does data leave the device? | No for inference after download | No | Yes, if inputs are sent to the server |
| Is the model secret? | No; shipped to users | No; shipped to device | More controllable, though outputs can still leak information |

## Rollout options

### Shadow

Run model inference and log its result without changing the timer or hint UI. This is useful for comparing predictions with natural player behavior before intervention.

### Canary

Serve the model to a small, explicit fraction of sessions while the rest use the old rules. Compare errors, dropout, and player experience before expanding exposure.

### Progressive rollout

Increase exposure in stages with a rollback threshold and monitoring at every stage. Stop or reverse the rollout if parity, load failures, or learning-flow metrics regress.
