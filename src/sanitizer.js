/**
 * sanitizer.js — Strip or mask sensitive values from stack trace frames
 * before display or export.
 */

const DEFAULT_PATTERNS = [
  { label: 'token', pattern: /([?&](?:token|api_?key|secret)=)[^&\s#]*/gi, replacement: '$1[REDACTED]' },
  { label: 'password', pattern: /([?&]password=)[^&\s#]*/gi, replacement: '$1[REDACTED]' },
  { label: 'homedir', pattern: /\/(?:Users|home)\/[^\/]+/g, replacement: '/~' },
  { label: 'windir', pattern: /[A-Z]:\\Users\\[^\\]+/gi, replacement: 'C:\\Users\\~' },
];

/**
 * Compile a sanitizer from a list of rule objects.
 * @param {Array<{label:string, pattern:RegExp, replacement:string}>} rules
 * @returns {(text: string) => string}
 */
function buildSanitizer(rules = DEFAULT_PATTERNS) {
  return function sanitize(text) {
    if (typeof text !== 'string') return text;
    let out = text;
    for (const { pattern, replacement } of rules) {
      // Reset lastIndex for global regexes
      pattern.lastIndex = 0;
      out = out.replace(pattern, replacement);
    }
    return out;
  };
}

/**
 * Sanitize a single parsed frame object in-place (returns new object).
 * @param {object} frame
 * @param {(text:string)=>string} sanitize
 * @returns {object}
 */
function sanitizeFrame(frame, sanitize) {
  return {
    ...frame,
    file: frame.file ? sanitize(frame.file) : frame.file,
    raw: frame.raw ? sanitize(frame.raw) : frame.raw,
  };
}

/**
 * Sanitize all frames in a parsed stack trace object.
 * @param {object} stackTrace  — { header, frames }
 * @param {object} [options]
 * @param {Array}  [options.rules]   — custom rules; falls back to defaults
 * @returns {object}
 */
function sanitizeStackTrace(stackTrace, options = {}) {
  const sanitize = buildSanitizer(options.rules || DEFAULT_PATTERNS);
  return {
    ...stackTrace,
    header: stackTrace.header ? sanitize(stackTrace.header) : stackTrace.header,
    frames: (stackTrace.frames || []).map(f => sanitizeFrame(f, sanitize)),
  };
}

module.exports = { DEFAULT_PATTERNS, buildSanitizer, sanitizeFrame, sanitizeStackTrace };
