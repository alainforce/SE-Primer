import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvEscape, parseCsv } from './csv.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const value = 'comma, quote " and newline\nsecond line';
const csv = '\uFEFFid,student_answer\n1,' + csvEscape(value) + '\n';
const file = path.join(here, 'test-data', 'roundtrip.csv');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, csv, 'utf8');
let read = fs.readFileSync(file, 'utf8');
if (read.charCodeAt(0) === 0xFEFF) read = read.slice(1);
const parsed = parseCsv(read);
console.log(JSON.stringify({ file, written: value, parsed: parsed[1][1], equal: parsed[1][1] === value }, null, 2));
