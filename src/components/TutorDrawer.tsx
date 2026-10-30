import React, { useState, useRef, useEffect } from 'react';
import { askSocraticTutor, ChatMessage } from '../tutor/tutorService';
import { DecisionId } from '../types/story';
import { UserLevel, UserRole } from '../types/user';

interface TutorDrawerProps {
  decisionId: DecisionId;
  level: UserLevel;
  role: UserRole;
  isOpen: boolean;
  onToggle: () => void;
}

export const TutorDrawer: React.FC<TutorDrawerProps> = ({
  decisionId,
  level,
  role,
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep input visible when mobile keyboard appears
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (document.activeElement === inputRef.current) {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }
  }, [isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    const newHistory: ChatMessage[] = [...messages, { sender: 'student', text: trimmed }];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const reply = await askSocraticTutor({
        decisionId,
        question: trimmed,
        level,
        role,
        history: messages,
        options: { applyOutputGuard: true, allowStaticFallback: true },
      });

      setMessages(prev => [...prev, { sender: 'tutor', text: reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'tutor',
          text: 'Bağlantı esnasında bir gecikme oluştu; lütfen bu aşamadaki mimari riskleri ve sistem şemasını gözden geçir.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-surface border border-accent/30 rounded-2xl overflow-hidden shadow-xl transition-all"
    >
      {/* Toggle button */}
      <button
        type="button"
        data-testid="tutor-toggle"
        onClick={onToggle}
        className="w-full px-4 py-3 min-h-[44px] flex items-center justify-between text-left bg-surface-elevated/70 hover:bg-surface-elevated transition-colors text-accent font-serif font-bold text-sm"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14H8a4 4 0 01-2.9-6.755 4.015 4.015 0 013.9-1.245 4 4 0 015 4A4.01 4.01 0 0112 14z" />
          </svg>
          Sokratik Primer Mentoru
        </span>
        <span className="text-xs font-sans font-medium text-primer-text-muted">
          {isOpen ? 'Gizle ▲' : 'İstişare Et ▼'}
        </span>
      </button>

      {/* Expandable chat body */}
      {isOpen && (
        <div className="p-4 space-y-3 bg-surface/95 border-t border-border-subtle">
          <p className="text-xs text-primer-text-muted italic font-serif">
            "Cevapları doğrudan vermem; doğru soruyu sorman için sana ayna tutarım."
          </p>

          {/* Messages container */}
          {messages.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    msg.sender === 'student'
                      ? 'bg-border-subtle/40 text-primer-text-primary ml-4'
                      : 'bg-surface-elevated border border-accent/30 text-amber-100 mr-4 font-serif italic'
                  }`}
                  data-testid={msg.sender === 'tutor' ? 'tutor-reply' : undefined}
                >
                  <div className="font-sans font-bold text-[10px] text-accent mb-0.5 uppercase tracking-wider">
                    {msg.sender === 'student' ? 'Sen (Nöbetçi Mühendis)' : 'Sokratik Mentor'}
                  </div>
                  {msg.text}
                </div>
              ))}
            </div>
          )}

          {/* Active loading indicator */}
          {isLoading && (
            <div
              data-testid="tutor-reply"
              className="p-3 rounded-xl text-xs bg-surface-elevated border border-accent/30 text-amber-200/80 mr-4 font-serif italic animate-pulse"
            >
              <div className="font-sans font-bold text-[10px] text-accent mb-0.5 uppercase tracking-wider">
                Sokratik Mentor
              </div>
              Düşünüyor ve mimari sorusunu hazırlıyor...
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSend} className="flex gap-2 pt-1">
            <input
              ref={inputRef}
              type="text"
              data-testid="tutor-input"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onFocus={() => {
                inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              placeholder="Mentora teknik soru sor..."
              className="flex-1 px-3 py-2 min-h-[44px] bg-canvas border border-border-subtle rounded-xl text-xs text-primer-text-primary placeholder:text-primer-text-muted focus:outline-none focus:border-accent"
              disabled={isLoading}
            />
            <button
              type="submit"
              data-testid="tutor-send"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2 min-h-[44px] bg-accent hover:bg-accent-hover disabled:bg-surface-elevated disabled:text-primer-text-muted disabled:cursor-not-allowed text-canvas font-bold text-xs rounded-xl transition-colors flex items-center justify-center font-sans cursor-pointer"
            >
              Gönder
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
