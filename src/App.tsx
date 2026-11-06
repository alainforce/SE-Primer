import React, { useMemo, useState } from 'react';
import { UserProfile } from './types/user';
import { DecisionId, ChoiceId, DecisionRecord, DecisionMeta } from './types/story';
import { DECISIONS, PATH_OUTCOMES } from './data/storyData';
import { Onboarding } from './components/Onboarding';
import { SceneView } from './components/SceneView';
import { ConsequenceView } from './components/ConsequenceView';
import { EndingView } from './components/EndingView';
import { ModelInput } from './ml/mlService';
import { PariteView } from './components/PariteView';

type AppStep = 'onboarding' | 'scene' | 'consequence' | 'ending';

interface InternalDecisionRecord extends DecisionRecord {
  currentHintCount: number;
}

export const App: React.FC = () => {
  if (typeof window !== 'undefined' && window.location.hash === '#/parite') return <PariteView />;
  const isCollectMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('collect') === '1';
  const [sessionId, setSessionId] = useState<string>(() => 'sess_' + Math.random().toString(36).substring(2, 10));
  const [decisionRecords, setDecisionRecords] = useState<InternalDecisionRecord[]>([]);

  const [currentStep, setCurrentStep] = useState<AppStep>('onboarding');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentDecisionId, setCurrentDecisionId] = useState<DecisionId>('d1');
  const [choicesHistory, setChoicesHistory] = useState<ChoiceId[]>([]);
  const [lastChoice, setLastChoice] = useState<ChoiceId>('A');
  const [isLastTimeout, setIsLastTimeout] = useState<boolean>(false);

  // 1. Onboarding Completed
  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setChoicesHistory([]);
    setDecisionRecords([]);
    setCurrentDecisionId('d1');
    setCurrentStep('scene');
  };

  // 2. Choice Made (or Experienced Timeout)
  const handleDecisionChoice = (choice: ChoiceId, isTimeout = false, meta?: DecisionMeta) => {
    setLastChoice(choice);
    setIsLastTimeout(isTimeout);
    setChoicesHistory(prev => [...prev, choice]);

    if (userProfile) {
      const prevDurations = decisionRecords.map(r => r.karar_suresi_sn);
      const prevAvgDuration = prevDurations.length === 0
        ? 0.0
        : Math.round((prevDurations.reduce((a, b) => a + b, 0) / prevDurations.length) * 10) / 10;
      
      const prevHints = decisionRecords.reduce((sum, r) => sum + r.currentHintCount, 0);
      const prevRiskyCount = decisionRecords.filter(r => r.secim === 'B').length;

      const durationSec = meta?.durationSec ?? 15.0;
      const thisHintCount = meta?.hintCount ?? 0;

      const curDecision = DECISIONS[currentDecisionId];
      const newRecord: InternalDecisionRecord = {
        oturum_id: sessionId,
        kaynak: 'gercek',
        sahne_no: curDecision.stepNumber,
        seviye: userProfile.level === 'experienced' ? 1 : 0,
        rol: userProfile.role,
        hedef: userProfile.goal,
        karar_suresi_sn: durationSec,
        onceki_ort_karar_suresi_sn: prevAvgDuration,
        onceki_ipucu_sayisi: prevHints,
        onceki_riskli_secim_sayisi: prevRiskyCount,
        secim: choice,
        riskli_secim: choice === 'B' ? 1 : 0,
        zaman_asimi: isTimeout ? 1 : 0,
        currentHintCount: thisHintCount,
      };

      setDecisionRecords(prev => [...prev, newRecord]);
    }

    setCurrentStep('consequence');
  };

  // 3. Continue from Consequence
  const handleConsequenceContinue = () => {
    if (currentDecisionId === 'd1') {
      setCurrentDecisionId('d2');
      setCurrentStep('scene');
    } else if (currentDecisionId === 'd2') {
      setCurrentDecisionId('d3');
      setCurrentStep('scene');
    } else {
      // Completed d3 -> transition to ending
      setCurrentStep('ending');
    }
  };

  // 4. Restart Game
  const handleRestart = () => {
    setUserProfile(null);
    setChoicesHistory([]);
    setDecisionRecords([]);
    setSessionId('sess_' + Math.random().toString(36).substring(2, 10));
    setCurrentDecisionId('d1');
    setCurrentStep('onboarding');
  };

  // Calculate current decision details
  const currentDecision = DECISIONS[currentDecisionId];
  const previousDurations = decisionRecords.map(r => r.karar_suresi_sn);
  const modelInput: ModelInput = useMemo(() => ({
    seviye: userProfile?.level === 'experienced' ? 1 : 0,
    sahne_no: currentDecision.stepNumber,
    onceki_ort_karar_suresi_sn: previousDurations.length ? previousDurations.reduce((a, b) => a + b, 0) / previousDurations.length : 0,
    onceki_ipucu_sayisi: decisionRecords.reduce((sum, r) => sum + r.currentHintCount, 0),
    onceki_riskli_secim_sayisi: decisionRecords.filter(r => r.secim === 'B').length,
  }), [currentDecision.stepNumber, userProfile?.level, decisionRecords]);
  const currentChoiceDetail = currentDecision ? currentDecision.choices[lastChoice] : DECISIONS.d1.choices.A;

  // Path Key for Ending (e.g. "AAA", "AAB", "BBB")
  const pathKey = choicesHistory.join('') || 'AAA';
  const outcome = PATH_OUTCOMES[pathKey] || PATH_OUTCOMES.AAA;

  return (
    <div className="min-h-dvh bg-canvas text-primer-text-primary flex flex-col justify-between selection:bg-accent selection:text-canvas">
      {/* Top Mobile Bar */}
      <header className="w-full max-w-md mx-auto pt-3 px-4 flex items-center justify-between text-[11px] text-primer-text-muted border-b border-border-subtle/30 pb-2">
        <span className="font-mono tracking-wider font-semibold text-accent">SE PRIMER</span>
        {userProfile && (
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-surface border border-border-subtle capitalize">
              {userProfile.level === 'experienced' ? 'Deneyimli' : 'Başlangıç'}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface border border-border-subtle capitalize">
              {userProfile.role}
            </span>
          </div>
        )}
      </header>

      {/* Start Consent Banner for ?collect=1 */}
      {isCollectMode && (
        <div
          data-testid="collect-start-notice"
          className="w-full max-w-md mx-auto px-4 py-2 bg-accent/10 border-b border-accent/25 text-[11px] text-amber-200 font-sans text-center leading-snug"
        >
          Veri toplama modu aktif: Oturum boyunca yalnızca anonim oyun içi karar metrikleri kaydedilir.
        </div>
      )}

      {/* Main View Area (100dvh mobile container) */}
      <main className="flex-1 w-full flex flex-col justify-start">
        {currentStep === 'onboarding' && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {currentStep === 'scene' && userProfile && (
          <SceneView
            decision={currentDecision}
            userProfile={userProfile}
            onChoose={handleDecisionChoice}
            modelInput={modelInput}
            isCollectMode={isCollectMode}
          />
        )}

        {currentStep === 'consequence' && (
          <ConsequenceView
            currentStep={currentDecision.stepNumber}
            totalSteps={currentDecision.totalSteps}
            choice={currentChoiceDetail}
            isTimeout={isLastTimeout}
            timeoutReason={currentDecision.timeoutReason}
            onContinue={handleConsequenceContinue}
          />
        )}

        {currentStep === 'ending' && (
          <EndingView
            outcome={outcome}
            onRestart={handleRestart}
            isCollectMode={isCollectMode}
            decisionRecords={decisionRecords}
          />
        )}
      </main>

      {/* Footer Vignette */}
      <footer className="w-full max-w-md mx-auto py-2 px-4 text-center text-[10px] text-primer-text-muted/70 font-mono border-t border-border-subtle/20">
        YZM301 · SE Primer · Inspired by The Diamond Age
      </footer>
    </div>
  );
};

export default App;
