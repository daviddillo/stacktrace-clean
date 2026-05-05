/**
 * inspector.js — Inspects stack trace frames for common error patterns
 * and provides diagnostic hints.
 */

const PATTERNS = [
  {
    pattern: /Cannot read propert(?:y|ies) ['"](\w+)['"] of (null|undefined)/,
    hint: (m) => `Check that the object is defined before accessing '.${m[1]}'.`,
    category: 'null-deref',
  },
  {
    pattern: /is not a function/,
    hint: () => 'Verify the value is callable and the import/require path is correct.',
    category: 'type-error',
  },
  {
    pattern: /Cannot find module ['"](.*?)['"]/,
    hint: (m) => `Module '${m[1]}' not found. Run 'npm install' or check the path.`,
    category: 'module-not-found',
  },
  {
    pattern: /Maximum call stack size exceeded/,
    hint: () => 'Infinite recursion detected. Add a base case or check termination conditions.',
    category: 'stack-overflow',
  },
  {
    pattern: /ENOENT: no such file or directory/,
    hint: () => 'A required file or directory is missing. Check paths and working directory.',
    category: 'fs-error',
  },
  {
    pattern: /EACCES: permission denied/,
    hint: () => 'Permission denied. Check file/directory permissions.',
    category: 'fs-error',
  },
  {
    pattern: /SyntaxError/,
    hint: () => 'Syntax error in source. Check for missing brackets, commas, or invalid syntax.',
    category: 'syntax',
  },
];

/**
 * Match an error message against known patterns.
 * @param {string} message
 * @returns {{ category: string, hint: string } | null}
 */
function inspectMessage(message) {
  for (const { pattern, hint, category } of PATTERNS) {
    const m = message.match(pattern);
    if (m) return { category, hint: hint(m) };
  }
  return null;
}

/**
 * Inspect a full parsed stack trace object and attach diagnostics.
 * @param {{ header: string, frames: object[] }} stackTrace
 * @returns {{ diagnosis: object | null, frames: object[] }}
 */
function inspectStackTrace(stackTrace) {
  const diagnosis = stackTrace.header ? inspectMessage(stackTrace.header) : null;

  const frames = stackTrace.frames.map((frame) => {
    const note = frame.file && frame.file.includes('node_modules')
      ? 'third-party'
      : frame.file && !frame.file.includes('/')
      ? 'built-in'
      : null;
    return note ? { ...frame, _note: note } : frame;
  });

  return { diagnosis, frames };
}

module.exports = { inspectMessage, inspectStackTrace, PATTERNS };
