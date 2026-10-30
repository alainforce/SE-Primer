import React from 'react';
import { ChoiceDetail } from '../types/story';
import { ProgressBar } from './ProgressBar';

interface ConsequenceViewProps {
  currentStep: number;
  totalSteps: number;
  choice: ChoiceDetail;
  isTimeout?: boolean;
  timeoutReason?: string;
  onContinue: () => void;
}

export const ConsequenceView: React.FC<ConsequenceViewProps> = ({
  currentStep,
  totalSteps,
  choice,
  isTimeout = false,
  timeoutReason,
  onContinue,
}) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-5 py-2 px-2 pb-8">
      {/* Progress */}
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      {/* Timeout Alert if triggered */}
      {isTimeout && (
        <div
          data-testid="timeout-notice"
          className="bg-rose-950/70 border-2 border-rose-500/80 rounded-2xl p-4 space-y-1.5 shadow-lg text-rose-200"
        >
          <div className="flex items-center gap-2 font-serif font-bold text-sm text-rose-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Krizde Zaman Aşımı (Süre Doldu)</span>
          </div>
          <p className="text-xs leading-relaxed font-sans text-rose-200">
            {timeoutReason || 'Baskı altında karar vermemek de fiili bir karardır: Kriz anındaki analiz felci nedeniyle sistem otomatik olarak acil durum seçeneğini devreye soktu.'}
          </p>
        </div>
      )}

      {/* Decision Taken Summary Badge */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="border-b border-border-subtle pb-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-1 font-semibold">
            Alınan Karar
          </div>
          <h2 className="text-base font-serif font-bold text-primer-text-primary">
            {choice.badge}: {choice.title}
          </h2>
        </div>

        {/* What Happened */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-accent tracking-wide uppercase">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Ne Oldu? (Operasyonel Sonuç)</span>
          </div>
          <p
            data-testid="what-happened"
            className="text-xs leading-relaxed text-primer-text-secondary bg-surface-elevated/70 p-3 rounded-xl border border-border-subtle font-sans"
          >
            {choice.whatHappened}
          </p>
        </div>

        {/* Why It Happened */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-accent tracking-wide uppercase">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Neden Oldu? (Teknik Kök Neden)</span>
          </div>
          <p
            data-testid="why-it-happened"
            className="text-xs leading-relaxed text-primer-text-secondary bg-surface-elevated/70 p-3 rounded-xl border border-border-subtle font-sans"
          >
            {choice.whyItHappened}
          </p>
        </div>

        {/* Decision Debt */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-400 tracking-wide uppercase">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Teknik Borç Notu</span>
          </div>
          <p
            data-testid="decision-debt"
            className="text-xs leading-relaxed text-amber-200/90 bg-amber-950/20 p-3 rounded-xl border border-amber-500/30 font-sans"
          >
            {choice.decisionDebt}
          </p>
        </div>
      </div>

      {/* Continue Action */}
      <button
        type="button"
        data-testid="continue-button"
        onClick={onContinue}
        className="w-full py-3.5 px-4 min-h-[48px] rounded-xl font-sans font-bold text-sm tracking-wider uppercase bg-accent hover:bg-accent-hover text-canvas transition-all shadow-lg shadow-orange-500/10 cursor-pointer"
      >
        {currentStep < totalSteps ? 'Sonraki Aşamaya Geç' : 'Olay Sonu Raporunu İncele'}
      </button>
    </div>
  );
};

