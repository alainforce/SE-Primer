import React from 'react';

interface ProgressBarProps {
  currentStep: number; // 1, 2, or 3
  totalSteps?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps = 3 }) => {
  return (
    <div data-testid="progress-bar" className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs tracking-wider uppercase font-semibold text-accent font-serif">
        <span>KARAR {currentStep} / {totalSteps}</span>
        <span className="text-primer-text-muted font-sans font-normal text-[11px]">Sistem Mühendisi El Kitabı</span>
      </div>
      <div className="grid grid-cols-3 gap-2 w-full h-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={index}
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-accent'
                  : isCurrent
                  ? 'bg-accent/90 shadow-[0_0_8px_rgba(252,163,17,0.5)]'
                  : 'bg-border-subtle'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

