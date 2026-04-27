'use strict';

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CLI = path.resolve(__dirname, 'cli.js');

const SAMPLE_TRACE = `Error: something went wrong
    at Object.<anonymous> (/home/user/project/src/index.js:10:5)
    at Module._compile (node:internal/modules/cjs/loader:1364:14)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`;

/**
 * Helper to run the CLI with given args and optional input.
 * Returns the spawnSync result.
 */
function runCLI(args = [], options = {}) {
  return spawnSync('node', [CLI, ...args], {
    encoding: 'utf8',
    ...options,
  });
}

describe('cli', () => {
  let tmpFile;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `trace-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, SAMPLE_TRACE, 'utf8');
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  test('reads from a file argument', () => {
    const result = runCLI(['--no-color', tmpFile]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('src/index.js');
  });

  test('--no-internal hides node internals', () => {
    const result = runCLI(['--no-color', '--no-internal', tmpFile]);
    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain('node:internal');
  });

  test('--help prints usage and exits 0', () => {
    const result = runCLI(['--help']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Usage:');
  });

  test('exits 1 when called with no args and no stdin', () => {
    const result = runCLI([], { stdio: ['ignore', 'pipe', 'pipe'] });
    expect(result.status).toBe(1);
  });

  test('reads from stdin', () => {
    const result = runCLI(['--no-color'], { input: SAMPLE_TRACE });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('src/index.js');
  });
});
