import React, { useState } from 'react';
import { UserProfile, UserLevel, UserRole, UserGoal } from '../types/user';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [goal, setGoal] = useState<UserGoal | null>(null);

  const isFormComplete = level !== null && role !== null && goal !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) return;
    onComplete({ level, role, goal });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 py-4 px-2">
      {/* Primer Book Header */}
      <div className="text-center space-y-2 border-b border-border-subtle pb-5">
        <div className="inline-block px-3 py-1 bg-surface-elevated text-accent text-[11px] font-mono tracking-widest uppercase rounded-full border border-accent/30">
          YZM301 · Etkileşimli Sistem Mühendisliği
        </div>
        <h1 className="text-2xl font-serif font-bold text-primer-text-primary tracking-tight">
          SE Primer: Sistem Mühendisi El Kitabı
        </h1>
        <p className="text-xs text-primer-text-secondary leading-relaxed font-sans max-w-xs mx-auto">
          Neal Stephenson'ın <em>The Diamond Age</em> Primer konseptinden esinlenen kişiselleştirilmiş kriz simülasyonu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Soru 1: Deneyim Seviyesi */}
        <div className="space-y-2.5">
          <label className="block text-xs font-serif font-semibold text-accent tracking-wide uppercase">
            1. Mühendislik Deneyim Seviyeniz
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              data-testid="onboarding-level-beginner"
              onClick={() => setLevel('beginner')}
              className={`p-3 min-h-[56px] rounded-xl text-left border transition-all ${
                level === 'beginner'
                  ? 'bg-surface-elevated border-accent text-primer-text-primary shadow-[0_0_12px_rgba(252,163,17,0.2)]'
                  : 'bg-surface border-border-subtle text-primer-text-secondary hover:border-border-accent/40'
              }`}
            >
              <div className="font-serif font-bold text-sm text-primer-text-primary">Başlangıç</div>
              <div className="text-[11px] text-primer-text-muted mt-0.5 leading-snug">
                Sokratik rehber ipuçları her kararda açık gelir
              </div>
            </button>

            <button
              type="button"
              data-testid="onboarding-level-experienced"
              onClick={() => setLevel('experienced')}
              className={`p-3 min-h-[56px] rounded-xl text-left border transition-all ${
                level === 'experienced'
                  ? 'bg-surface-elevated border-accent text-primer-text-primary shadow-[0_0_12px_rgba(252,163,17,0.2)]'
                  : 'bg-surface border-border-subtle text-primer-text-secondary hover:border-border-accent/40'
              }`}
            >
              <div className="font-serif font-bold text-sm text-primer-text-primary">Deneyimli</div>
              <div className="text-[11px] text-primer-text-muted mt-0.5 leading-snug">
                60 saniyelik kriz geri sayım baskısı devrede
              </div>
            </button>
          </div>
        </div>

        {/* Soru 2: Rol */}
        <div className="space-y-2.5">
          <label className="block text-xs font-serif font-semibold text-accent tracking-wide uppercase">
            2. Uzmanlık Alanınız (Rol)
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              data-testid="onboarding-role-backend"
              onClick={() => setRole('backend')}
              className={`p-3 min-h-[50px] rounded-xl text-left border flex items-center justify-between transition-all ${
                role === 'backend'
                  ? 'bg-surface-elevated border-accent text-primer-text-primary shadow-[0_0_12px_rgba(252,163,17,0.2)]'
                  : 'bg-surface border-border-subtle text-primer-text-secondary hover:border-border-accent/40'
              }`}
            >
              <div>
                <div className="font-serif font-bold text-sm text-primer-text-primary">Backend Geliştirici</div>
                <div className="text-[11px] text-primer-text-muted">Veritabanı havuzu, thread starvation ve SQL göçü odaklı</div>
              </div>
              <span className={`text-sm ${role === 'backend' ? 'text-accent' : 'text-primer-text-muted'}`}>●</span>
            </button>

            <button
              type="button"
              data-testid="onboarding-role-devops"
              onClick={() => setRole('devops')}
              className={`p-3 min-h-[50px] rounded-xl text-left border flex items-center justify-between transition-all ${
                role === 'devops'
                  ? 'bg-surface-elevated border-accent text-primer-text-primary shadow-[0_0_12px_rgba(252,163,17,0.2)]'
                  : 'bg-surface border-border-subtle text-primer-text-secondary hover:border-border-accent/40'
              }`}
            >
              <div>
                <div className="font-serif font-bold text-sm text-primer-text-primary">DevOps / SRE Mühendisi</div>
                <div className="text-[11px] text-primer-text-muted">Kubernetes pod döngüsü, ingress trafiği ve canary odaklı</div>
              </div>
              <span className={`text-sm ${role === 'devops' ? 'text-accent' : 'text-primer-text-muted'}`}>●</span>
            </button>

            <button
              type="button"
              data-testid="onboarding-role-frontend"
              onClick={() => setRole('frontend')}
              className={`p-3 min-h-[50px] rounded-xl text-left border flex items-center justify-between transition-all ${
                role === 'frontend'
                  ? 'bg-surface-elevated border-accent text-primer-text-primary shadow-[0_0_12px_rgba(252,163,17,0.2)]'
                  : 'bg-surface border-border-subtle text-primer-text-secondary hover:border-border-accent/40'
              }`}
            >
              <div>
                <div className="font-serif font-bold text-sm text-primer-text-primary">Frontend / Fullstack Mühendisi</div>
                <div className="text-[11px] text-primer-text-muted">Gateway timeout, istemci retry fırtınası ve kuyruk odaklı</div>
              </div>
              <span className={`text-sm ${role === 'frontend' ? 'text-accent' : 'text-primer-text-muted'}`}>●</span>
            </button>
          </div>
        </div>

        {/* Soru 3: Hedef */}
        <div className="space-y-2.5">
          <label className="block text-xs font-serif font-semibold text-accent tracking-wide uppercase">
            3. Kriz Anındaki Öncelikli Hedefiniz
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              data-testid="onboarding-goal-uptime"
              onClick={() => setGoal('uptime')}
              className={`p-3 min-h-[46px] rounded-xl text-left border transition-all ${
                goal === 'uptime'
                  ? 'bg-surface-elevated border-accent text-primer-text-primary shadow-[0_0_12px_rgba(252,163,17,0.2)]'
                  : 'bg-surface border-border-subtle text-primer-text-secondary hover:border-border-accent/40'
              }`}
            >
              <div className="font-serif font-semibold text-xs text-primer-text-primary">Sistemi Hızla Ayakta Tutmak (Uptime)</div>
              <div className="text-[10px] text-primer-text-muted">300 hastayı bekletmeden servisi derhal açmak</div>
            </button>

            <button
              type="button"
              data-testid="onboarding-goal-compliance"
              onClick={() => setGoal('compliance')}
              className={`p-3 min-h-[46px] rounded-xl text-left border transition-all ${
                goal === 'compliance'
                  ? 'bg-surface-elevated border-accent text-primer-text-primary shadow-[0_0_12px_rgba(252,163,17,0.2)]'
                  : 'bg-surface border-border-subtle text-primer-text-secondary hover:border-border-accent/40'
              }`}
            >
              <div className="font-serif font-semibold text-xs text-primer-text-primary">Veri Güvenliği ve Mevzuat (KVKK 6698)</div>
              <div className="text-[10px] text-primer-text-muted">Hasta mahremiyetini ve yasal sınırları korumak</div>
            </button>

            <button
              type="button"
              data-testid="onboarding-goal-learning"
              onClick={() => setGoal('learning')}
              className={`p-3 min-h-[46px] rounded-xl text-left border transition-all ${
                goal === 'learning'
                  ? 'bg-surface-elevated border-accent text-primer-text-primary shadow-[0_0_12px_rgba(252,163,17,0.2)]'
                  : 'bg-surface border-border-subtle text-primer-text-secondary hover:border-border-accent/40'
              }`}
            >
              <div className="font-serif font-semibold text-xs text-primer-text-primary">Hatalardan Öğrenmek (Root Cause / Learning)</div>
              <div className="text-[10px] text-primer-text-muted">Mimari trade-off analizini ve kök nedeni kavramak</div>
            </button>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            type="submit"
            data-testid="onboarding-start"
            disabled={!isFormComplete}
            className={`w-full py-3.5 px-4 min-h-[48px] rounded-xl font-sans font-bold text-sm tracking-wider uppercase transition-all shadow-md ${
              isFormComplete
                ? 'bg-accent hover:bg-accent-hover text-canvas cursor-pointer shadow-orange-500/20'
                : 'bg-surface-elevated text-primer-text-muted cursor-not-allowed border border-border-subtle opacity-60'
            }`}
          >
            Nöbeti Devral ve Başla
          </button>
          {!isFormComplete && (
            <p className="text-[11px] text-primer-text-muted text-center mt-2 italic">
              Lütfen simülasyona başlamak için 3 soruyu da yanıtlayın.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

