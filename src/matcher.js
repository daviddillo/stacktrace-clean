/**
 * matcher.js — Pattern-based frame matching with glob and regex support
 */

const path = require('path');

/**
 * Compile a pattern string into a usable matcher function.
 * Supports: exact strings, globs (*), and /regex/ syntax.
 */
function compilePattern(pattern) {
  if (typeof pattern !== 'string' || pattern.length === 0) {
    throw new TypeError(`Invalid pattern: ${JSON.stringify(pattern)}`);
  }

  // Regex pattern: /expr/flags
  const reMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
  if (reMatch) {
    return new RegExp(reMatch[1], reMatch[2]);
  }

  // Glob: convert * and ** to regex
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '.+')
    .replace(/\*/g, '[^/\\]*');
  return new RegExp(`^${escaped}$`);
}

/**
 * Test a single frame against a compiled pattern (RegExp).
 */
function testFrame(frame, regex) {
  const candidates = [
    frame.file || '',
    frame.name || '',
    frame.source || '',
  ];
  return candidates.some(c => regex.test(c));
}

/**
 * Match a frame against one or more raw pattern strings.
 * Returns true if ANY pattern matches.
 */
function matchesAny(frame, patterns) {
  if (!Array.isArray(patterns) || patterns.length === 0) return false;
  return patterns.some(p => testFrame(frame, compilePattern(p)));
}

/**
 * Match a frame against all pattern strings.
 * Returns true only if ALL patterns match.
 */
function matchesAll(frame, patterns) {
  if (!Array.isArray(patterns) || patterns.length === 0) return false;
  return patterns.every(p => testFrame(frame, compilePattern(p)));
}

/**
 * Build a reusable matcher from a list of patterns.
 * mode: 'any' (default) | 'all'
 */
function buildMatcher(patterns, mode = 'any') {
  const compiled = patterns.map(compilePattern);
  return function match(frame) {
    if (mode === 'all') {
      return compiled.every(rx => testFrame(frame, rx));
    }
    return compiled.some(rx => testFrame(frame, rx));
  };
}

module.exports = { compilePattern, testFrame, matchesAny, matchesAll, buildMatcher };
