/**
 * comparator.js — Compare two stack traces and produce a structured result
 * with frame-level diff, similarity score, and change summary.
 */

const { diffFrames, diffSummary } = require('./differ');
const { scoreFrames } = require('./scorer');

/**
 * Compute a similarity ratio between 0 and 1.
 * 1 = identical, 0 = completely different.
 */
function similarityScore(diffResult) {
  const { added, removed, unchanged } = diffResult.summary;
  const total = added + removed + unchanged * 2;
  if (total === 0) return 1;
  return (unchanged * 2) / total;
}

/**
 * Classify the overall relationship between two stack traces.
 */
function classifyRelationship(score) {
  if (score >= 0.95) return 'identical';
  if (score >= 0.7) return 'similar';
  if (score >= 0.4) return 'related';
  return 'distinct';
}

/**
 * Compare two parsed stack traces and return a rich comparison object.
 *
 * @param {object} traceA
 * @param {object} traceB
 * @returns {object}
 */
function compareTraces(traceA, traceB) {
  const diff = diffFrames(traceA.frames, traceB.frames);
  const summary = diffSummary(diff);
  const score = similarityScore({ summary });
  const relationship = classifyRelationship(score);

  const scoredA = scoreFrames(traceA.frames);
  const scoredB = scoreFrames(traceB.frames);

  const topFrameA = scoredA[0] || null;
  const topFrameB = scoredB[0] || null;

  const sameError =
    traceA.errorType && traceB.errorType
      ? traceA.errorType === traceB.errorType
      : null;

  return {
    relationship,
    similarityScore: Math.round(score * 100) / 100,
    sameError,
    diff,
    summary,
    topFrameA,
    topFrameB,
  };
}

/**
 * Format a comparison result as a human-readable string.
 */
function formatComparison(result) {
  const lines = [];
  lines.push(`Relationship : ${result.relationship}`);
  lines.push(`Similarity   : ${(result.similarityScore * 100).toFixed(0)}%`);
  if (result.sameError !== null) {
    lines.push(`Same error   : ${result.sameError ? 'yes' : 'no'}`);
  }
  lines.push(
    `Changes      : +${result.summary.added} added, -${result.summary.removed} removed, =${result.summary.unchanged} unchanged`
  );
  if (result.topFrameA) {
    lines.push(`Top frame A  : ${result.topFrameA.file}:${result.topFrameA.line}`);
  }
  if (result.topFrameB) {
    lines.push(`Top frame B  : ${result.topFrameB.file}:${result.topFrameB.line}`);
  }
  return lines.join('\n');
}

module.exports = { similarityScore, classifyRelationship, compareTraces, formatComparison };
