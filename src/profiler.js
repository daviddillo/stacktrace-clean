/**
 * Lightweight timing profiler for pipeline stages.
 * Records wall-clock durations and exposes a formatted summary.
 */

const marks = new Map();
const durations = [];

/**
 * Start timing a named stage.
 * @param {string} name
 */
function start(name) {
  marks.set(name, process.hrtime.bigint());
}

/**
 * Stop timing a named stage and record the duration.
 * @param {string} name
 * @returns {number} elapsed milliseconds
 */
function stop(name) {
  const begin = marks.get(name);
  if (begin === undefined) throw new Error(`profiler: no start mark for "${name}"`);
  const elapsedNs = process.hrtime.bigint() - begin;
  const elapsedMs = Number(elapsedNs) / 1e6;
  durations.push({ name, ms: elapsedMs });
  marks.delete(name);
  return elapsedMs;
}

/**
 * Return all recorded durations sorted by descending time.
 * @returns {Array<{name: string, ms: number}>}
 */
function results() {
  return [...durations].sort((a, b) => b.ms - a.ms);
}

/**
 * Format recorded durations as a human-readable string.
 * @returns {string}
 */
function report() {
  if (durations.length === 0) return 'No profiling data.';
  const lines = results().map(
    ({ name, ms }) => `  ${name.padEnd(24)} ${ms.toFixed(3)} ms`
  );
  return ['Pipeline timing report:', ...lines].join('\n');
}

/**
 * Reset all recorded data.
 */
function reset() {
  marks.clear();
  durations.length = 0;
}

module.exports = { start, stop, results, report, reset };
