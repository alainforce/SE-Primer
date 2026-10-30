delete process.env.ELECTRON_RUN_AS_NODE;
const path = require('node:path');
const cypressEntry = require.resolve('cypress');
process.argv.splice(2, 0, 'run');
require(path.join(path.dirname(cypressEntry), 'bin', 'cypress'));
