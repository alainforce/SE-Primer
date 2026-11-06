delete process.env.ELECTRON_RUN_AS_NODE;
const cypress = require('cypress');

const args = process.argv.slice(2);
const options = {};
const specIndex = args.indexOf('--spec');
if (specIndex >= 0 && args[specIndex + 1]) options.spec = args[specIndex + 1];

cypress.run(options).then(result => {
  const runs = result.runs || [];
  let totals = { tests: 0, passes: 0, fails: 0, pending: 0, skipped: 0 };
  console.log('\nCypress spec summary');
  console.log('Spec | Tests | Passing | Failing | Pending | Skipped');
  for (const run of runs) {
    const stats = run.stats || {};
    const row = {
      tests: stats.tests || 0,
      passes: stats.passes || 0,
      fails: stats.failures || 0,
      pending: stats.pending || 0,
      skipped: stats.skipped || 0,
    };
    totals = Object.fromEntries(Object.keys(totals).map(key => [key, totals[key] + row[key]]));
    console.log(`${run.spec.relative} | ${row.tests} | ${row.passes} | ${row.fails} | ${row.pending} | ${row.skipped}`);
  }
  console.log(`Totals: ${runs.length} specs, ${totals.tests} tests, ${totals.passes} passing, ${totals.fails} failing, ${totals.pending} pending, ${totals.skipped} skipped`);
  process.exitCode = result.status === 'failed' ? 1 : 0;
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
