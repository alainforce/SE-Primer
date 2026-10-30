import { GoogleGenAI } from '@google/genai';
import { SOCRATIC_TUTOR_SYSTEM_PROMPT } from './systemPrompt';
import { DECISIONS } from '../data/storyData';
import { DecisionId } from '../types/story';
import { UserLevel, UserRole } from '../types/user';

export const GEMINI_MODEL = 'gemini-3.8-flash';
export const GEMINI_TEMPERATURE = 0.4;

export interface ChatMessage {
  sender: 'student' | 'tutor';
  text: string;
}

export function containsAnswerLeak(text: string): boolean {
  const normalized = text.toLocaleLowerCase('tr-TR');
  const leakPatterns = [
    /(?:^|\s|[.,;!?])doğru\s+(?:cevap|seçenek|karar)(?:[.,;!?]|\s|$)/iu,
    /(?:^|\s|[.,;!?])kesinlikle\s+[ab]\s+(?:seçeneği|şıkkı)(?:[.,;!?]|\s|$)/iu,
    /(?:^|\s|[.,;!?])(?:seçenek|şık)\s+[ab]\s+(?:doğru|daha\s+iyi|seçilmeli)(?:[.,;!?]|\s|$)/iu,
    /(?:^|\s|[.,;!?])[ab]['']?(?:yi|yı|si|sı)?\s+(?:seç|tercih\s+et|uygula)(?:[.,;!?]|\s|$)/iu,
    /(?:^|\s|[.,;!?])(?:cevabımız|cevabın|önerim)\s*:\s*[ab](?:[.,;!?]|\s|$)/iu,
    /(?:^|\s|[.,;!?])cevap\s+[ab](?:[.,;!?]|\s|$)/iu,
    /(?:^|\s|[.,;!?])şunu\s+seçmelisin(?:[.,;!?]|\s|$)/iu,
  ];
  return leakPatterns.some(pattern => pattern.test(normalized));
}

export interface TutorOptions {
  applyOutputGuard?: boolean;
  allowStaticFallback?: boolean;
}

const APP_DEFAULTS: Required<TutorOptions> = {
  applyOutputGuard: true,
  allowStaticFallback: true,
};

export function resolveApiKey(explicitKey?: string): string | undefined {
  const candidates = [
    explicitKey,
    import.meta.env?.VITE_GEMINI_API_KEY,
    typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined,
    typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY : undefined,
  ];
  return candidates.find(key => Boolean(key && key.trim() && !key.includes('your_gemini_api_key_here')))?.trim();
}

/**
 * Build the full prompt context sent to the model.
 * Exported so eval/ can verify what gets sent without duplicating logic.
 */
export function buildPromptContext(params: {
  decisionId: DecisionId;
  question: string;
  level: UserLevel;
  role: UserRole;
  history?: ChatMessage[];
}): string {
  const { decisionId, question, level, role, history = [] } = params;
  const decision = DECISIONS[decisionId];

  const recentHistoryText = history
    .slice(-4)
    .map(msg => `${msg.sender === 'student' ? 'Öğrenci' : 'Mentor'}: ${msg.text}`)
    .join('\n');

  return `
[GÜNCEL BAĞLAM]
Karar ID: ${decision.id}
Aşama: ${decision.stepNumber}. Karar (${decision.title})
Mühendis Seviyesi: ${level === 'experienced' ? 'Deneyimli (Kriz ve zaman baskısı altında)' : 'Başlangıç'}
Mühendis Rolü: ${role}
Sistem Durumu ve Loglar:
${decision.terminalLog}

[GEÇMİŞ DİYALOG (SON TURLAR)]
${recentHistoryText || 'Henüz konuşma yok.'}

[ÖĞRENCİNİN YENİ SORUSU/İFADESİ]
"${question}"

Lütfen yönergelere uyarak, doğru cevabı veya şıkkı ASLA vermeden, Sokratik bir karşı soru veya teknik ipucu ile yanıt ver (En fazla 2-3 cümle, Türkçe).`;
}

/**
 * Core tutor function used by both the app and eval.
 * apiKey param allows eval to inject the key from env/.env without import.meta.
 */
export async function askSocraticTutor(params: {
  decisionId: DecisionId;
  question: string;
  level: UserLevel;
  role: UserRole;
  history?: ChatMessage[];
  apiKey?: string;
  options?: TutorOptions;
}): Promise<string> {
  const opts: Required<TutorOptions> = { ...APP_DEFAULTS, ...params.options };
  const { decisionId, question, level, role, history = [] } = params;
  const decision = DECISIONS[decisionId];
  const staticFallback = decision?.staticHint
    || 'Karar vermeden önce bu seçimin sistem bütünlüğüne ve hasta verilerine uzun vadeli etkisini düşünmelisin.';

  const apiKey = resolveApiKey(params.apiKey);

  if (!apiKey) {
    if (opts.allowStaticFallback) return staticFallback;
    throw new Error('No API key available and static fallback is disabled');
  }

  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 30_000 } });
  const promptContext = buildPromptContext({ decisionId, question, level, role, history });

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: promptContext,
    config: {
      systemInstruction: SOCRATIC_TUTOR_SYSTEM_PROMPT,
      temperature: GEMINI_TEMPERATURE,
    }
  });

  const reply = response.text?.trim();
  if (!reply || reply.length === 0) {
    if (opts.allowStaticFallback) return staticFallback;
    throw new Error('Empty reply from model and static fallback is disabled');
  }

  if (opts.applyOutputGuard && containsAnswerLeak(reply)) {
    console.warn('Output guard intercepted a potential answer leak. Returning static hint.');
    if (opts.allowStaticFallback) return staticFallback;
    throw new Error('Output guard triggered but static fallback is disabled');
  }

  return reply;
}
