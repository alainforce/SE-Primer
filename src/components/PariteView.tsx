import React, { useState } from 'react';
import { ModelInput, predictRisk } from '../ml/mlService';

const initial: ModelInput = {
  seviye: 1,
  sahne_no: 2,
  onceki_ort_karar_suresi_sn: 20,
  onceki_ipucu_sayisi: 0,
  onceki_riskli_secim_sayisi: 1,
};

export const PariteView: React.FC = () => {
  const [input, setInput] = useState(initial);
  const [probability, setProbability] = useState<number | null>(null);
  const [error, setError] = useState('');

  const update = (key: keyof ModelInput, value: string) => {
    setInput(current => ({ ...current, [key]: Number(value) }));
  };

  const run = async () => {
    setError('');
    try {
      const result = await predictRisk(input);
      if (!result) throw new Error('Model yüklenemedi');
      setProbability(result.probability);
    } catch {
      setProbability(null);
      setError('Model yüklenemedi; varsayılan uygulama davranışı korunur.');
    }
  };

  return (
    <main className="w-full max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-serif font-bold">Model Parite</h1>
      {(Object.keys(initial) as Array<keyof ModelInput>).map(key => (
        <label key={key} className="block text-xs font-mono">
          {key}
          <input data-cy={`input-${key}`} type="number" step="any" value={input[key]} onChange={event => update(key, event.target.value)} className="mt-1 w-full p-2 bg-surface border border-border-subtle rounded" />
        </label>
      ))}
      <button type="button" data-cy="run" onClick={run} className="w-full p-3 bg-accent text-canvas rounded font-bold">Tahmin Et</button>
      {error && <p data-cy="error" className="text-rose-400 text-sm">{error}</p>}
      <p data-cy="p" className="font-mono text-lg">{probability === null ? '—' : probability.toFixed(6)}</p>
    </main>
  );
};
