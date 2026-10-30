import React, { useState } from 'react';
import { DecisionDefinition, ChoiceId } from '../types/story';
import { UserProfile } from '../types/user';
import { ProgressBar } from './ProgressBar';
import { Timer } from './Timer';
import { TutorDrawer } from './TutorDrawer';

interface SceneViewProps {
  decision: DecisionDefinition;
  userProfile: UserProfile;
  onChoose: (choice: ChoiceId, isTimeout?: boolean) => void;
}

export const SceneView: React.FC<SceneViewProps> = ({
  decision,
  userProfile,
  onChoose,
}) => {
  const isBeginner = userProfile.level === 'beginner';
  const isExperienced = userProfile.level === 'experienced';
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);

  // Dynamic narrative combining base + role nuance + goal nuance
  const roleText = decision.narratives.roleNuance[userProfile.role];
  const goalText = decision.narratives.goalNuance[userProfile.goal];
  const combinedNarrative = `${decision.narratives.base} ${roleText} ${goalText}`;

  const handleChoice = (choice: ChoiceId, isTimeout = false) => {
    if (hasChosen) return;
    setHasChosen(true);
    onChoose(choice, isTimeout);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 py-2 px-3 pb-8">
      {/* Top Header with Progress and Optional Timer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <ProgressBar currentStep={decision.stepNumber} totalSteps={decision.totalSteps} />
          </div>
          {isExperienced && (
            <div className="shrink-0 pt-3">
              <Timer
                key={decision.id}
                decisionId={decision.id}
                durationSeconds={60}
                isActive={!hasChosen}
                onTimeout={() => handleChoice('B', true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Incident Narrative Card */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-4 space-y-3 shadow-lg">
        <h2
          data-testid="scene-title"
          className="text-lg font-serif font-bold text-primer-text-primary leading-snug"
        >
          {decision.title}
        </h2>
        <p
          data-testid="scene-narrative"
          className="text-xs leading-relaxed text-primer-text-secondary font-sans"
        >
          {combinedNarrative}
        </p>

        {/* Terminal Log Console */}
        <div className="bg-[#070C1A] border border-border-subtle/70 rounded-xl p-3 font-mono text-xs overflow-x-auto shadow-inner">
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-border-subtle/50">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-[10px] text-primer-text-muted ml-2 font-sans">
              kriz-terminali :: 08:00 UTC+3
            </span>
          </div>
          <pre
            data-testid="terminal-log"
            className="text-[11px] leading-relaxed text-amber-300/90 whitespace-pre-wrap select-all"
          >
            {decision.terminalLog}
          </pre>
        </div>
      </div>

      {/* Beginner Static Hint Panel (Visible only for beginner, no network call) */}
      {isBeginner && (
        <div
          data-testid="hint-panel"
          className="bg-surface-elevated/90 border border-accent/40 rounded-xl p-3.5 space-y-1.5 shadow-md"
        >
          <div className="flex items-center gap-1.5 text-accent text-xs font-serif font-bold">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14H8a4 4 0 01-2.9-6.755 4.015 4.015 0 013.9-1.245 4 4 0 015 4A4.01 4.01 0 0112 14z" />
            </svg>
            <span>Başlangıç Rehberi & Sokratik İpucu</span>
          </div>
          <p className="text-xs text-primer-text-secondary leading-relaxed font-sans italic">
            "{decision.staticHint}"
          </p>
        </div>
      )}

      {/* Decision Choices - Placed in flow, never covered by drawer */}
      <div className="space-y-3 pt-1">
        {/* Choice A */}
        <button
          type="button"
          data-testid="choice-A"
          onClick={() => handleChoice('A')}
          disabled={hasChosen}
          className="w-full min-h-[58px] p-4 rounded-xl text-left bg-surface hover:bg-surface-elevated active:border-accent border border-border-subtle hover:border-accent transition-all duration-200 group shadow-md"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-border-subtle text-primer-text-secondary group-hover:bg-accent group-hover:text-canvas transition-colors">
              {decision.choices.A.badge}
            </span>
          </div>
          <div className="text-sm font-serif font-bold text-primer-text-primary group-hover:text-accent transition-colors">
            {decision.choices.A.title}
          </div>
          <p className="text-xs text-primer-text-secondary mt-1 leading-normal font-sans">
            {decision.choices.A.description}
          </p>
        </button>

        {/* Choice B */}
        <button
          type="button"
          data-testid="choice-B"
          onClick={() => handleChoice('B')}
          disabled={hasChosen}
          className="w-full min-h-[58px] p-4 rounded-xl text-left bg-surface hover:bg-surface-elevated active:border-accent border border-border-subtle hover:border-accent transition-all duration-200 group shadow-md"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-border-subtle text-primer-text-secondary group-hover:bg-accent group-hover:text-canvas transition-colors">
              {decision.choices.B.badge}
            </span>
          </div>
          <div className="text-sm font-serif font-bold text-primer-text-primary group-hover:text-accent transition-colors">
            {decision.choices.B.title}
          </div>
          <p className="text-xs text-primer-text-secondary mt-1 leading-normal font-sans">
            {decision.choices.B.description}
          </p>
        </button>
      </div>

      {/* Socratic AI Tutor Drawer at bottom - Placed below choices so choices stay fully accessible */}
      <div className="pt-2">
        <TutorDrawer
          decisionId={decision.id}
          level={userProfile.level}
          role={userProfile.role}
          isOpen={isTutorOpen}
          onToggle={() => setIsTutorOpen(prev => !prev)}
        />
      </div>
    </div>
  );
};
