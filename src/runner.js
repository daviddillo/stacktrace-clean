import { readFileSync } from 'fs';
import { runPipeline } from './pipeline.js';
import { resolveConfig } from './config.js';
import { prepareOutput } from './output.js';

/**
 * Read stack trace input from stdin or a file path.
 * @param {string|null} filePath
 * @returns {Promise<string>}
 */
export async function readInput(filePath) {
  if (filePath) {
    return readFileSync(filePath, 'utf8');
  }

  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

/**
 * Main entry point for the CLI runner.
 * @param {object} argv - Parsed CLI arguments.
 * @returns {Promise<void>}
 */
export async function run(argv = {}) {
  const config = await resolveConfig(argv);

  let input;
  try {
    input = await readInput(argv.file ?? null);
  } catch (err) {
    process.stderr.write(`stacktrace-clean: failed to read input: ${err.message}\n`);
    process.exit(1);
  }

  if (!input.trim()) {
    process.stderr.write('stacktrace-clean: no input provided\n');
    process.exit(1);
  }

  let result;
  try {
    result = await runPipeline(input, config);
  } catch (err) {
    process.stderr.write(`stacktrace-clean: pipeline error: ${err.message}\n`);
    process.exit(1);
  }

  await prepareOutput(result, config);
}
