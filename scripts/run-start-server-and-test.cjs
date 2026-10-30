const path = require('node:path');
const Module = require('node:module');

// Windows images without deprecated wmic.exe make ps-tree fail during cleanup.
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'ps-tree') return (_pid, callback) => callback(null, []);
  return originalLoad.call(this, request, parent, isMain);
};

const entry = require.resolve('start-server-and-test');
const cli = path.join(path.dirname(entry), 'bin', 'start.js');
const testScript = process.argv.includes('--demo') ? 'cypress:demo' : 'cypress:run';
process.argv = [process.argv[0], cli, 'start', 'http://localhost:5173', testScript];
require(cli);
