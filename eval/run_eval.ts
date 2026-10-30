#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { DecisionId } from '../src/types/story.js';
import type { UserLevel, UserRole } from '../src/types/user.js';
import { csvEscape } from './csv.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
interface StudentEntry { id:number; decision_id:1|2|3; level:UserLevel; role:UserRole; category:string; student_answer:string; }
interface Failure { errorClass: string; httpStatus: string; message: string; }

function loadDotEnv(): void {
  const envPath = path.join(here, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const processWithLoader = process as typeof process & { loadEnvFile?: (filePath?: string) => void };
  if (processWithLoader.loadEnvFile) {
    processWithLoader.loadEnvFile(envPath);
    return;
  }
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

function failureOf(error: unknown, apiKey?: string): Failure {
  const value = error as { constructor?: { name?: string }; status?: unknown; response?: { status?: unknown }; error?: { status?: unknown }; message?: unknown };
  const rawMessage = typeof value?.message === 'string' ? value.message : String(error);
  const message = apiKey ? rawMessage.split(apiKey).join('[REDACTED]') : rawMessage;
  const status = value?.status ?? value?.response?.status ?? value?.error?.status ?? 'n/a';
  return { errorClass: value?.constructor?.name || 'UnknownError', httpStatus: String(status), message };
}

function printFailure(scope: string, failure: Failure, logPath?: string): void {
  const line = `${scope}: class=${failure.errorClass} http_status=${failure.httpStatus} message=${failure.message}`;
  console.error(line);
  if (logPath) fs.appendFileSync(logPath, line + '\n', 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const force = args.includes('--force');
  const labelArg = args.indexOf('--label');
  const requestedLabel = labelArg >= 0 && args[labelArg + 1] ? args[labelArg + 1] : new Date().toISOString().replace(/[:.]/g, '-');
  const label = dry ? 'dry-run' : requestedLabel;
  if (!/^[A-Za-z0-9._-]+$/.test(label)) throw new Error('Invalid label');
  const entries = JSON.parse(fs.readFileSync(path.join(here, 'student_answers.json'), 'utf8')) as StudentEntry[];
  if (entries.length !== 20 || entries.some((e, i) => e.id !== i + 1 || ![1,2,3].includes(e.decision_id))) throw new Error('student_answers.json must contain exactly ids 1-20 and decision_id 1-3');

  loadDotEnv();
  const tutor = await import('../src/tutor/tutorService.js');
  const apiKey = dry ? undefined : tutor.resolveApiKey();
  if (!dry && !apiKey) throw new Error('No API key found. Put GEMINI_API_KEY or VITE_GEMINI_API_KEY in .env.');

  const runDir = path.join(here, 'runs', label);
  if (fs.existsSync(runDir)) {
    if (!force) throw new Error(`Refusing to overwrite existing eval/runs/${label}/; rerun with --force`);
    fs.rmSync(runDir, { recursive: true, force: true });
  }

  if (!dry) {
    try {
      await tutor.askSocraticTutor({ decisionId: `d${entries[0].decision_id}` as DecisionId, question: entries[0].student_answer, level: entries[0].level, role: entries[0].role, history: [], apiKey, options: { applyOutputGuard: false, allowStaticFallback: false } });
    } catch (error) {
      printFailure('PREflight', failureOf(error, apiKey));
      throw new Error('Preflight failed; no run folder was created.');
    }
  }

  fs.mkdirSync(runDir, { recursive: true });
  const promptContent = fs.readFileSync(path.join(here, '..', 'src', 'tutor', 'systemPrompt.ts'));
  const promptHash = crypto.createHash('sha256').update(promptContent).digest('hex');
  const header = 'id,decision_id,category,student_answer,tutor_reply,leaked_answer,error_type,notes';
  const rows: string[] = []; const failures: Failure[] = [];
  for (const entry of entries) {
    let reply = '';
    if (dry) reply = `[DRY RUN] Karar ${entry.decision_id}: Hangi teknik riskleri değerlendirirdin?`;
    else {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          reply = await tutor.askSocraticTutor({ decisionId: `d${entry.decision_id}` as DecisionId, question: entry.student_answer, level: entry.level, role: entry.role, history: [], apiKey, options: { applyOutputGuard: false, allowStaticFallback: false } });
          break;
        } catch (error) {
          const failure = failureOf(error, apiKey); failures.push(failure);
          printFailure(`id=${entry.id} attempt=${attempt + 1}`, failure, path.join(runDir, 'errors.log'));
          if (attempt < 2) await sleep((attempt + 1) * 1000);
        }
      }
      if (!reply) reply = 'ERROR';
    }
    rows.push([String(entry.id), String(entry.decision_id), entry.category, csvEscape(entry.student_answer), csvEscape(reply), '', '', ''].join(','));
    if (entry.id < entries.length) await sleep(600);
  }
  const csv = '\uFEFF' + header + '\n' + rows.join('\n') + '\n';
  fs.writeFileSync(path.join(runDir, 'labels.csv'), csv, 'utf8');
  const conveniencePath = path.join(here, 'labels.csv');
  if (!dry) {
    if (!fs.existsSync(conveniencePath)) fs.writeFileSync(conveniencePath, csv, 'utf8');
    else if (Buffer.compare(fs.readFileSync(conveniencePath), Buffer.from(csv, 'utf8')) === 0) fs.writeFileSync(conveniencePath, csv, 'utf8');
    else console.warn('WARNING: skipped copying to eval/labels.csv because it differs from the new run output.');
  }
  const counts = new Map<string, number>();
  for (const failure of failures) { const reason = `${failure.errorClass} (${failure.httpStatus}): ${failure.message}`; counts.set(reason, (counts.get(reason) || 0) + 1); }
  const common = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  fs.writeFileSync(path.join(runDir, 'run_meta.json'), JSON.stringify({ model:tutor.GEMINI_MODEL, temperature:tutor.GEMINI_TEMPERATURE, date:new Date().toISOString(), systemPromptSHA256:promptHash, errorCount:failures.length ? rows.filter(row => row.endsWith(',ERROR,,,')).length : 0, error_reason: common ? `${common[0]} x${common[1]}` : null, label }, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${rows.length} rows to eval/runs/${label}/labels.csv (${failures.length ? rows.filter(row => row.endsWith(',ERROR,,,')).length : 0} ERROR rows).`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Eval failed'); process.exit(1); });
