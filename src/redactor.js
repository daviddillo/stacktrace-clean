/**
 * redactor.js — Scrub sensitive values from stack trace output
 * Supports redacting file paths, env vars, and custom patterns.
 */

const DEFAULT_PATTERNS = [
  // Home directory paths
  { pattern: /\/Users\/[^/]+/g, replacement: '/Users/<user>' },
  { pattern: /\/home\/[^/]+/g, replacement: '/home/<user>' },
  // Windows user paths
  { pattern: /C:\\Users\\[^\\]+/gi, replacement: 'C:\\Users\\<user>' },
  // Auth tokens / API keys in query strings or env
  { pattern: /([?&](?:token|key|secret|password|auth)=)[^&\s]+/gi, replacement: '$1<redacted>' },
  // IPv4 addresses
  { pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replacement: '<ip>' },
];

/**
 * Compile a user-supplied redaction rule into a { pattern, replacement } entry.
 * Accepts a RegExp or a plain string (treated as literal).
 */
function compileRule(rule) {
  if (rule && rule.pattern instanceof RegExp) {
    return { pattern: rule.pattern, replacement: rule.replacement ?? '<redacted>' };
  }
  if (typeof rule === 'string') {
    const escaped = rule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return { pattern: new RegExp(escaped, 'g'), replacement: '<redacted>' };
  }
  throw new TypeError(`Invalid redaction rule: ${JSON.stringify(rule)}`);
}

/**
 * Build a redactor function from a merged set of rules.
 * @param {object} options
 * @param {boolean} [options.defaults=true]  include built-in patterns
 * @param {Array}   [options.rules=[]]       additional user rules
 * @returns {(text: string) => string}
 */
function buildRedactor(options = {}) {
  const { defaults = true, rules = [] } = options;
  const compiled = [
    ...(defaults ? DEFAULT_PATTERNS : []),
    ...rules.map(compileRule),
  ];

  return function redact(text) {
    if (typeof text !== 'string') return text;
    let out = text;
    for (const { pattern, replacement } of compiled) {
      // Reset lastIndex for global regexes to avoid stateful bugs
      if (pattern.global) pattern.lastIndex = 0;
      out = out.replace(pattern, replacement);
    }
    return out;
  };
}

/**
 * Redact sensitive data from a parsed stack trace object in-place.
 * @param {object} stackTrace  parsed stack trace (from parser.js)
 * @param {Function} redact    redactor function from buildRedactor
 * @returns {object}           same object, mutated
 */
function redactStackTrace(stackTrace, redact) {
  if (stackTrace.header) {
    stackTrace.header = redact(stackTrace.header);
  }
  if (Array.isArray(stackTrace.frames)) {
    for (const frame of stackTrace.frames) {
      if (frame.file) frame.file = redact(frame.file);
      if (frame.raw)  frame.raw  = redact(frame.raw);
    }
  }
  return stackTrace;
}

module.exports = { compileRule, buildRedactor, redactStackTrace, DEFAULT_PATTERNS };
