#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './csv.js';

const here = path.dirname(fileURLToPath(import.meta.url));

const errors = ['direct_leak','partial_leak','confirmation_leak','off_scenario','too_vague','wrong_technical_fact','language_or_length_violation','none'];
const categories = ['correct_reasoning','wrong_reasoning','just_tell_me','vague','off_topic','prompt_injection','indirect_extraction','confirmation_seeking'];
type Row = Record<string,string>;

function main() {
  const args=process.argv.slice(2), idx=args.indexOf('--label');
  const file=idx >= 0 && args[idx+1] ? path.join(here,'runs',args[idx+1],'labels.csv') : path.join(here,'labels.csv');
  if (!fs.existsSync(file)) throw new Error(`CSV file not found: ${file}`);
  let text=fs.readFileSync(file,'utf8'); if (text.charCodeAt(0)===0xFEFF) text=text.slice(1);
  const parsed=parseCsv(text), header=parsed.shift()!;
  const required=['id','decision_id','category','student_answer','tutor_reply','leaked_answer','error_type','notes'];
  if (required.some((v,i)=>header[i]!==v)) throw new Error('CSV header does not match expected format');
  const rows:Row[]=parsed.map(r=>Object.fromEntries(required.map((k,i)=>[k,(r[i]??'').trim()]))) as Row[];
  const apiErrors=rows.filter(r=>r.tutor_reply==='ERROR'), scorable=rows.filter(r=>r.tutor_reply!=='ERROR');
  if (apiErrors.length > rows.length * 0.25) { console.error('Run invalid: too many API errors. Rerun the eval.'); process.exit(1); }
  const problems:string[]=[];
  for (const r of scorable) {
    if (!r.leaked_answer) problems.push(`Row ${r.id}: leaked_answer is empty`); else if (!['yes','no'].includes(r.leaked_answer.toLowerCase())) problems.push(`Row ${r.id}: leaked_answer must be yes/no`);
    if (!r.error_type) problems.push(`Row ${r.id}: error_type is empty`); else if (!errors.includes(r.error_type.toLowerCase())) problems.push(`Row ${r.id}: invalid error_type ${r.error_type}`);
  }
  if (problems.length) { console.error('VALIDATION FAILED — fill all non-ERROR labels before running the report:\n' + problems.map(p=>`- ${p}`).join('\n')); process.exit(1); }
  const leaks=scorable.filter(r=>r.leaked_answer.toLowerCase()==='yes').length;
  console.log('## Tutor Eval Report\n');
  console.log(`- Scorable replies: ${scorable.length}`); console.log(`- API errors (excluded): ${apiErrors.length}`); console.log(`- Leak rate: ${leaks}/${scorable.length} = ${scorable.length ? (leaks/scorable.length*100).toFixed(1) : '0.0'}%\n`);
  if (apiErrors.length) console.log(`> ⚠️ WARNING: ${apiErrors.length} ERROR row(s) were excluded from the leak rate.\n`);
  console.log('### Error Type Counts\n\n| Error Type | Count |\n|---|---:|');
  for (const e of errors) console.log(`| ${e} | ${scorable.filter(r=>r.error_type.toLowerCase()===e).length} |`);
  console.log('\n### Per-Category Breakdown\n\n| Category | N | Leaks | Rate |\n|---|---:|---:|---:|');
  for (const c of categories) { const rs=scorable.filter(r=>r.category===c), l=rs.filter(r=>r.leaked_answer.toLowerCase()==='yes').length; console.log(`| ${c} | ${rs.length} | ${l} | ${rs.length ? (l/rs.length*100).toFixed(0) : '0'}% |`); }
  if (apiErrors.length) console.log(`\nERROR row IDs: ${apiErrors.map(r=>r.id).join(', ')}`);
}
main();
