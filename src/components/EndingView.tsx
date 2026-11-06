import React, { useState } from 'react';
import { PathOutcome, DecisionRecord } from '../types/story';

interface EndingViewProps {
  outcome: PathOutcome;
  onRestart: () => void;
  isCollectMode?: boolean;
  decisionRecords?: DecisionRecord[];
}

export const EndingView: React.FC<EndingViewProps> = ({
  outcome,
  onRestart,
  isCollectMode = false,
  decisionRecords = [],
}) => {
  const isEndingA = outcome.ending === 'A';
  const [copied, setCopied] = useState(false);

  const handleCopySession = () => {
    if (!decisionRecords || decisionRecords.length === 0) return;
    const header = 'oturum_id,kaynak,sahne_no,seviye,rol,hedef,karar_suresi_sn,onceki_ort_karar_suresi_sn,onceki_ipucu_sayisi,onceki_riskli_secim_sayisi,secim,riskli_secim,zaman_asimi';
    const rows = decisionRecords.map(r =>
      `${r.oturum_id},gercek,${r.sahne_no},${r.seviye},${r.rol},${r.hedef},${r.karar_suresi_sn},${r.onceki_ort_karar_suresi_sn},${r.onceki_ipucu_sayisi},${r.onceki_riskli_secim_sayisi},${r.secim},${r.riskli_secim},${r.zaman_asimi}`
    );
    const csvContent = [header, ...rows].join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(csvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5 py-3 px-2 pb-10">
      {/* Post-Mortem Report Header */}
      <div className="text-center space-y-2 border-b border-border-subtle pb-4">
        <div className="inline-block px-3 py-1 bg-surface-elevated text-accent text-[11px] font-mono tracking-widest uppercase rounded-full border border-accent/30">
          Olay Sonrası İnceleme (Post-Mortem #8402)
        </div>
        <h1
          data-testid="ending-title"
          className="text-xl font-serif font-bold text-primer-text-primary tracking-tight"
        >
          {outcome.title}
        </h1>
        <p className="text-xs text-primer-text-secondary leading-relaxed font-sans max-w-sm mx-auto">
          {outcome.description}
        </p>
      </div>

      {/* Official Ending Badge / Seal */}
      <div
        data-testid="ending-badge"
        data-ending={outcome.ending}
        className={`p-4 rounded-2xl border-2 shadow-xl flex items-center gap-3.5 ${
          isEndingA
            ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/80 text-rose-200'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isEndingA ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}
        >
          {isEndingA ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <div>
          <div className="font-serif font-bold text-sm tracking-wide">
            {outcome.badgeLabel}
          </div>
          <div className="text-[11px] opacity-90 mt-0.5 font-sans">
            {outcome.caveatText}
          </div>
        </div>
      </div>

      {/* Dynamic 2x2 Metrics Grid (Derived from storyData) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Çözüm Saati */}
        <div className="bg-surface border border-border-subtle rounded-xl p-3 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-wider text-primer-text-muted">
            Çözüm Saati
          </div>
          <div className="text-base font-serif font-bold text-primer-text-primary">
            {outcome.resolutionTime}
          </div>
        </div>

        {/* KVKK Durumu */}
        <div className="bg-surface border border-border-subtle rounded-xl p-3 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-wider text-primer-text-muted">
            KVKK Durumu
          </div>
          <div
            className={`text-xs font-serif font-bold ${
              isEndingA ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {outcome.kvkkStatus}
          </div>
        </div>

        {/* Sızan Kayıt */}
        <div className="bg-surface border border-border-subtle rounded-xl p-3 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-wider text-primer-text-muted">
            Sızan Kayıt
          </div>
          <div
            className={`text-base font-serif font-bold ${
              outcome.leakedRecords === 0 ? 'text-primer-text-primary' : 'text-rose-400'
            }`}
          >
            {outcome.leakedRecords} Hasta
          </div>
        </div>

        {/* Sistem Durumu */}
        <div className="bg-surface border border-border-subtle rounded-xl p-3 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-wider text-primer-text-muted">
            Sistem Durumu
          </div>
          <div className="text-xs font-serif font-bold text-primer-text-primary">
            {outcome.systemStatus}
          </div>
        </div>
      </div>

      {/* Technical Debt Summary Card */}
      <div className="bg-surface border border-accent/30 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-accent font-serif font-bold text-sm">
          <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Kararlarınızdan Doğan Teknik Borç Karnesi</span>
        </div>

        <ul
          data-testid="technical-debt-summary"
          className="space-y-2.5 text-xs text-primer-text-secondary font-sans leading-relaxed"
        >
          {outcome.technicalDebtSummary.map((debtItem, index) => (
            <li key={index} className="flex items-start gap-2 bg-surface-elevated/60 p-2.5 rounded-lg border border-border-subtle">
              <span className="text-accent font-bold mt-0.5">•</span>
              <span>{debtItem}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Anonymous Collect Mode Section */}
      {isCollectMode && (
        <div className="bg-surface border border-accent/40 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-accent font-serif font-bold text-sm">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Anonim Veri Toplama Modu Aktif</span>
          </div>
          <p
            data-testid="collect-consent-notice"
            className="text-xs text-primer-text-secondary leading-relaxed font-sans"
          >
            Bu oturumda kişisel hiçbir veri toplanmamış olup, yalnızca anonim oyun içi karar metrikleri (süre, seçim, ipucu etkileşimi) kayıt altına alınmıştır. Bu veriler model eğitimi ve araştırma amacıyla kullanılabilir.
          </p>
          <button
            type="button"
            data-testid="copy-session-button"
            onClick={handleCopySession}
            className="w-full py-2.5 px-3 min-h-[44px] rounded-xl border border-accent text-accent hover:bg-accent hover:text-canvas transition-colors text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? '✓ Oturum CSV Olarak Kopyalandı!' : '📋 Oturumu Kopyala (CSV)'}
          </button>
        </div>
      )}

      {/* Restart Simulation Button */}
      <button
        type="button"
        data-testid="restart-button"
        onClick={onRestart}
        className="w-full py-3.5 px-4 min-h-[48px] rounded-xl font-sans font-bold text-sm tracking-wider uppercase bg-accent hover:bg-accent-hover text-canvas transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
      >
        Simülasyonu Yeniden Başlat
      </button>
    </div>
  );
};
