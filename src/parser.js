/**
 * Parses raw Node.js stack trace strings into structured frame objects.
 */

const FRAME_REGEX = /^\s+at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?\s*$/;
const NATIVE_REGEX = /^\s+at\s+(.+?)\s+\(native\)\s*$/;
const EVAL_REGEX = /^\s+at\s+eval\s+\((.+?):(\d+):(\d+)\)/;

/**
 * @typedef {Object} StackFrame
 * @property {string|null} functionName
 * @property {string} fileName
 * @property {number} lineNumber
 * @property {number} columnNumber
 * @property {boolean} isNative
 * @property {boolean} isEval
 */

/**
 * Parse a single stack frame line into a structured object.
 * @param {string} line
 * @returns {StackFrame|null}
 */
function parseFrame(line) {
  if (NATIVE_REGEX.test(line)) {
    const match = line.match(NATIVE_REGEX);
    return {
      functionName: match[1],
      fileName: '<native>',
      lineNumber: 0,
      columnNumber: 0,
      isNative: true,
      isEval: false,
    };
  }

  if (EVAL_REGEX.test(line)) {
    const match = line.match(EVAL_REGEX);
    return {
      functionName: 'eval',
      fileName: match[1],
      lineNumber: parseInt(match[2], 10),
      columnNumber: parseInt(match[3], 10),
      isNative: false,
      isEval: true,
    };
  }

  const match = line.match(FRAME_REGEX);
  if (!match) return null;

  return {
    functionName: match[1] || null,
    fileName: match[2],
    lineNumber: parseInt(match[3], 10),
    columnNumber: parseInt(match[4], 10),
    isNative: false,
    isEval: false,
  };
}

/**
 * Parse a full stack trace string into a list of frames.
 * @param {string} stackTrace
 * @returns {{ message: string, frames: StackFrame[] }}
 */
function parseStackTrace(stackTrace) {
  const lines = stackTrace.split('\n');
  const frames = [];
  let message = '';

  for (const line of lines) {
    if (line.trim().startsWith('at ')) {
      const frame = parseFrame(line);
      if (frame) frames.push(frame);
    } else if (!message && line.trim()) {
      message = line.trim();
    }
  }

  return { message, frames };
}

module.exports = { parseFrame, parseStackTrace };
