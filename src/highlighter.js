import chalk from 'chalk';

const COLORS = {
  error: chalk.red.bold,
  errorMessage: chalk.red,
  internalFrame: chalk.gray,
  userFrame: chalk.white,
  filePath: chalk.cyan,
  lineCol: chalk.yellow,
  functionName: chalk.green,
  keyword: chalk.magenta,
  separator: chalk.gray,
};

/**
 * Highlight the error header line (e.g. "TypeError: Cannot read...")
 * @param {string} line
 * @returns {string}
 */
export function highlightErrorHeader(line) {
  const match = line.match(/^([A-Za-z]+Error|Error):\s*(.*)$/);
  if (!match) return COLORS.errorMessage(line);
  return `${COLORS.error(match[1])}: ${COLORS.errorMessage(match[2])}`;
}

/**
 * Highlight a single parsed stack frame for terminal output.
 * @param {object} frame - parsed frame object from parser.js
 * @param {boolean} isInternalFrame
 * @returns {string}
 */
export function highlightFrame(frame, isInternalFrame = false) {
  const indent = '    ';
  const at = COLORS.separator('at');

  const name = frame.name
    ? `${isInternalFrame ? COLORS.internalFrame(frame.name) : COLORS.functionName(frame.name)} `
    : '';

  if (!frame.file) {
    return `${indent}${at} ${name}${COLORS.internalFrame('<anonymous>')}`;
  }

  const colorFile = isInternalFrame ? COLORS.internalFrame : COLORS.filePath;
  const colorLineCol = isInternalFrame ? COLORS.internalFrame : COLORS.lineCol;

  const location = frame.line != null
    ? `${colorFile(frame.file)}${COLORS.separator(':')}${colorLineCol(frame.line)}${frame.column != null ? `${COLORS.separator(':')}${colorLineCol(frame.column)}` : ''}`
    : colorFile(frame.file);

  return `${indent}${at} ${name}${COLORS.separator('(')}${location}${COLORS.separator(')')}`;
}

/**
 * Highlight a full stack trace string.
 * @param {string[]} lines - array of raw stack trace lines
 * @param {Function} isInternalFn - function to check if a frame is internal
 * @returns {string}
 */
export function highlightStackTrace(lines, isInternalFn = () => false) {
  return lines
    .map((line, i) => {
      if (i === 0) return highlightErrorHeader(line);
      return isInternalFn(line)
        ? COLORS.internalFrame(line)
        : COLORS.userFrame(line);
    })
    .join('\n');
}

export { COLORS };
