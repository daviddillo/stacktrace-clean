/**
 * fuzzer.js — fuzzy-search frames by file path or function name
 */

'use strict';

/**
 * Compute a simple fuzzy score between a query and a target string.
 * Returns a value in [0, 1]; higher is a better match.
 */
function fuzzyScore(query, target) {
  if (!query || !target) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return 1;

  let qi = 0;
  let matchedChars = 0;
  let lastIndex = -1;
  let gapPenalty = 0;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      matchedChars++;
      if (lastIndex !== -1) gapPenalty += ti - lastIndex - 1;
      lastIndex = ti;
      qi++;
    }
  }

  if (qi < q.length) return 0; // not all query chars found
  const coverage = matchedChars / q.length;
  const density = matchedChars / (matchedChars + gapPenalty);
  return (coverage + density) / 2;
}

/**
 * Score a single frame against a query.
 * Checks both file path and function name.
 */
function scoreFrame(frame, query) {
  const fileScore = fuzzyScore(query, frame.file || '');
  const nameScore = fuzzyScore(query, frame.name || '');
  return Math.max(fileScore, nameScore);
}

/**
 * Search frames using fuzzy matching.
 * Returns frames sorted by descending score, filtered by threshold.
 */
function fuzzySearch(frames, query, { threshold = 0.3, limit = Infinity } = {}) {
  if (!query) return frames.slice();

  const scored = frames
    .map(frame => ({ frame, score: scoreFrame(frame, query) }))
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ frame }) => frame);
}

/**
 * Return the best-matching frame for a query, or null.
 */
function bestMatch(frames, query) {
  const results = fuzzySearch(frames, query, { threshold: 0, limit: 1 });
  return results[0] || null;
}

module.exports = { fuzzyScore, scoreFrame, fuzzySearch, bestMatch };
