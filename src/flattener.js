/**
 * flattener.js — flatten nested/chained error stack traces into a single frame list
 */

'use strict';

/**
 * Extract cause chain from a parsed stack trace object.
 * Each entry has { header, frames }.
 */
function extractCauses(stackTrace) {
  const causes = [];
  let current = stackTrace;
  while (current) {
    causes.push(current);
    current = current.cause || null;
  }
  return causes;
}

/**
 * Tag each frame with its depth in the cause chain.
 */
function tagWithDepth(frames, depth) {
  return frames.map(frame => ({ ...frame, causeDepth: depth }));
}

/**
 * Flatten a cause chain into a single array of frames,
 * preserving order (root error first) and tagging depth.
 */
function flattenCauses(stackTrace) {
  const chain = extractCauses(stackTrace);
  const result = [];
  chain.forEach((entry, depth) => {
    const tagged = tagWithDepth(entry.frames || [], depth);
    result.push(...tagged);
  });
  return result;
}

/**
 * Build a flat representation with section headers interleaved.
 */
function flattenWithHeaders(stackTrace) {
  const chain = extractCauses(stackTrace);
  const sections = [];
  chain.forEach((entry, depth) => {
    sections.push({
      header: entry.header || '',
      frames: tagWithDepth(entry.frames || [], depth),
      depth,
    });
  });
  return sections;
}

/**
 * Collapse the flat frame list, removing duplicate consecutive frames
 * that appear across cause boundaries.
 */
function deduplicateAcrossCauses(frames) {
  const seen = new Set();
  return frames.filter(frame => {
    const key = `${frame.file}:${frame.line}:${frame.column}:${frame.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = {
  extractCauses,
  tagWithDepth,
  flattenCauses,
  flattenWithHeaders,
  deduplicateAcrossCauses,
};
