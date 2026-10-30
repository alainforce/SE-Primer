import React, { useState } from 'react';
import { UserProfile } from './types/user';
import { DecisionId, ChoiceId } from './types/story';
import { DECISIONS, PATH_OUTCOMES } from './data/storyData';
import { Onboarding } from './components/Onboarding';
import { SceneView } from './components/SceneView';
import { ConsequenceView } from './components/ConsequenceView';
import { EndingView } from './components/EndingView';

type AppStep = 'onboarding' | 'scene' | 'consequence' | 'ending';

export const App: React.FC = () => {
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
    setCurrentDecisionId('d1');
    setCurrentStep('scene');
  };

  // 2. Choice Made (or Experienced Timeout)
  const handleDecisionChoice = (choice: ChoiceId, isTimeout = false) => {
    setLastChoice(choice);
    setIsLastTimeout(isTimeout);
    setChoicesHistory(prev => [...prev, choice]);
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
    setCurrentDecisionId('d1');
    setCurrentStep('onboarding');
  };

  // Calculate current decision details
  const currentDecision = DECISIONS[currentDecisionId];
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
          <EndingView outcome={outcome} onRestart={handleRestart} />
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

