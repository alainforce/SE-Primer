import React, { useEffect, useState, useRef } from 'react';

interface TimerProps {
  decisionId: string;
  durationSeconds?: number;
  onTimeout: () => void;
  isActive?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  decisionId,
  durationSeconds = 60,
  onTimeout,
  isActive = true,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);

  // Store onTimeout in a ref updated on every render so the effect doesn't depend on it
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const deadlineRef = useRef<number>(Date.now() + durationSeconds * 1000);
  const hasTimedOutRef = useRef<boolean>(false);

  // Reset the deadline ONLY when decisionId changes.
  // Parent re-renders (e.g. typing in tutor-input, drawer toggle) or onTimeout/isActive
  // updates do NOT touch the deadline, guaranteeing continuous unpaused countdown.
  useEffect(() => {
    deadlineRef.current = Date.now() + durationSeconds * 1000;
    hasTimedOutRef.current = false;
    setRemainingSeconds(durationSeconds);
  }, [decisionId, durationSeconds]);

  // Interval ticking effect: decoupled from onTimeout changes to prevent timer restarts
  useEffect(() => {
    if (!isActive) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const leftSec = Math.max(0, Math.ceil((deadlineRef.current - now) / 1000));
      setRemainingSeconds(leftSec);

      if (leftSec <= 0 && !hasTimedOutRef.current) {
        hasTimedOutRef.current = true;
        clearInterval(intervalId);
        onTimeoutRef.current();
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, [isActive]);

  const isCritical = remainingSeconds <= 20;

  return (
    <div
      data-testid="timer"
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border transition-colors ${
        isCritical
          ? 'bg-rose-950/60 border-rose-500/80 text-rose-300 motion-safe:animate-pulse'
          : 'bg-surface-elevated border-accent/40 text-accent'
      }`}
      aria-label={`Kalan kriz süresi ${remainingSeconds} saniye`}
    >
      <svg
        className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-400' : 'text-accent'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeLinecap="round" strokeWidth="2" d="M12 6v6l4 2" />
      </svg>
      <span>{remainingSeconds}s</span>
    </div>
  );
};
