import chalk from 'chalk';

const INTERNAL_PATHS = ['node:internal', 'node_modules'];

function isInternal(file) {
  if (!file) return false;
  return INTERNAL_PATHS.some((p) => file.includes(p));
}

function formatFile(file, line, column) {
  if (!file) return chalk.gray('<unknown>');
  const loc = [line, column].filter(Boolean).join(':');
  const filePart = chalk.cyan(file);
  return loc ? `${filePart}:${chalk.yellow(loc)}` : filePart;
}

function formatName(name, isResolved) {
  if (!name) return chalk.gray('<anonymous>');
  return isResolved ? chalk.green(name) : chalk.white(name);
}

/**
 * Formats a single resolved frame as a colored string.
 *
 * @param {object} frame
 * @returns {string}
 */
export function formatFrame(frame) {
  const { name, file, line, column, isNative, isResolved } = frame;

  if (isNative) {
    return chalk.gray(`    at ${name ?? '<native>'} (native)`);
  }

  const dimmed = isInternal(file);
  const namePart = formatName(name, isResolved);
  const filePart = formatFile(file, line, column);
  const indicator = isResolved ? chalk.magenta('✦ ') : '';

  const line_ = `    at ${indicator}${namePart} (${filePart})`;
  return dimmed ? chalk.dim(line_) : line_;
}

/**
 * Formats an entire stack trace.
 *
 * @param {string} errorMessage
 * @param {object[]} frames
 * @returns {string}
 */
export function formatStackTrace(errorMessage, frames) {
  const header = chalk.red.bold(errorMessage);
  const body = frames.map(formatFrame).join('\n');
  return `${header}\n${body}`;
}
