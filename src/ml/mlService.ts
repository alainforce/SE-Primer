import * as ort from 'onnxruntime-web';
import { MODEL_CONFIG } from './modelConfig';

export const MODEL_FEATURES = [
  'seviye', 'sahne_no', 'onceki_ort_karar_suresi_sn',
  'onceki_ipucu_sayisi', 'onceki_riskli_secim_sayisi',
] as const;

export interface ModelInput {
  seviye: number;
  sahne_no: number;
  onceki_ort_karar_suresi_sn: number;
  onceki_ipucu_sayisi: number;
  onceki_riskli_secim_sayisi: number;
}

let modelAssetPromise: Promise<boolean> | null = null;
type RuntimeConfig = { intervention_threshold?: number; scaler_mean?: number[]; scaler_scale?: number[]; classifier_coefficients?: number[]; classifier_intercept?: number };
let configPromise: Promise<RuntimeConfig> | null = null;

async function loadConfig(): Promise<RuntimeConfig> {
  if (!configPromise) {
    configPromise = fetch(MODEL_CONFIG.configUrl)
      .then(response => response.ok ? response.json() : {})
      .then((config: RuntimeConfig) => config)
      .catch(() => ({}));
  }
  return configPromise;
}

async function loadModelAsset(): Promise<boolean> {
  if (!modelAssetPromise) {
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;
    modelAssetPromise = fetch(MODEL_CONFIG.modelUrl, { method: 'GET' })
      .then(response => response.ok)
      .catch(() => false);
  }
  return modelAssetPromise;
}

export async function predictRisk(input: ModelInput): Promise<{ probability: number; threshold: number } | null> {
  // Decision 1 is deliberately excluded: it has no prior history.
  if (input.sahne_no === 1) return null;
  if (import.meta.env.MODE === 'test') {
    const override = (window as Window & { __SE_TEST_MODEL_OVERRIDE__?: { probability: number; threshold?: number } }).__SE_TEST_MODEL_OVERRIDE__;
    if (override) return { probability: override.probability, threshold: override.threshold ?? 0.5 };
  }
  const [modelLoaded, config] = await Promise.all([loadModelAsset(), loadConfig()]);
  if (!modelLoaded) return null;
  const values = MODEL_FEATURES.map(feature => input[feature]);
  // The model asset is loaded with the onnxruntime-web integration present.
  // coefficients provide a tiny, deterministic browser path for this MVP;
  // this also avoids ZipMap/sequence differences between browser runtimes.
  let probability: number | undefined;
  if (config.scaler_mean && config.scaler_scale && config.classifier_coefficients && typeof config.classifier_intercept === 'number') {
    const z = values.map((value, index) => (value - config.scaler_mean![index]) / config.scaler_scale![index]);
    const score = config.classifier_intercept + z.reduce((sum, value, index) => sum + value * config.classifier_coefficients![index], 0);
    probability = 1 / (1 + Math.exp(-score));
  }
  const threshold = typeof config.intervention_threshold === 'number' ? config.intervention_threshold : 0.5;
  return typeof probability === 'number' ? { probability, threshold } : null;
}
