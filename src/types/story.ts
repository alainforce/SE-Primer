import { UserRole, UserGoal } from './user';

export type DecisionId = 'd1' | 'd2' | 'd3';
export type ChoiceId = 'A' | 'B';

export interface ChoiceDetail {
  id: ChoiceId;
  badge: string;
  title: string;
  description: string;
  whatHappened: string;
  whyItHappened: string;
  decisionDebt: string;
}

export interface DecisionDefinition {
  id: DecisionId;
  stepNumber: number;
  totalSteps: number;
  title: string;
  terminalLog: string;
  staticHint: string;
  timeoutReason: string;
  narratives: {
    base: string;
    roleNuance: Record<UserRole, string>;
    goalNuance: Record<UserGoal, string>;
  };
  choices: {
    A: ChoiceDetail;
    B: ChoiceDetail;
  };
}

export interface PathOutcome {
  pathKey: string; // e.g. "AAA", "AAB", etc.
  ending: 'A' | 'B';
  title: string;
  badgeLabel: string;
  description: string;
  resolutionTime: string;
  kvkkStatus: string;
  leakedRecords: number;
  systemStatus: string;
  caveatText: string;
  technicalDebtSummary: string[];
}

export interface DecisionMeta {
  durationSec: number;
  hintCount: number;
}

export interface DecisionRecord {
  oturum_id: string;
  kaynak: 'gercek' | 'sentetik';
  sahne_no: number;
  seviye: number; // 0=beginner, 1=experienced
  rol: string;
  hedef: string;
  karar_suresi_sn: number;
  onceki_ort_karar_suresi_sn: number;
  onceki_ipucu_sayisi: number;
  onceki_riskli_secim_sayisi: number;
  secim: string;
  riskli_secim: number;
  zaman_asimi: number;
}

