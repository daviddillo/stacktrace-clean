/**
 * Truncates long stack traces to a configurable maximum number of frames,
 * optionally showing a summary of omitted frames.
 */

/**
 * @param {object[]} frames - parsed stack frames
 * @param {number} maxFrames - maximum number of frames to keep
 * @returns {{ frames: object[], omitted: number }}
 */
function truncateFrames(frames, maxFrames) {
  if (!Array.isArray(frames)) {
    throw new TypeError('frames must be an array');
  }
  if (typeof maxFrames !== 'number' || maxFrames < 1) {
    throw new RangeError('maxFrames must be a positive number');
  }

  if (frames.length <= maxFrames) {
    return { frames, omitted: 0 };
  }

  return {
    frames: frames.slice(0, maxFrames),
    omitted: frames.length - maxFrames,
  };
}

/**
 * Builds a human-readable summary line for omitted frames.
 *
 * @param {number} omitted
 * @returns {string|null}
 */
function omittedSummary(omitted) {
  if (omitted <= 0) return null;
  return `    ... ${omitted} more frame${omitted === 1 ? '' : 's'} omitted`;
}

/**
 * Applies truncation to a full stack trace string.
 *
 * @param {string} stackTrace - raw or formatted stack trace text
 * @param {number} maxFrames
 * @returns {string}
 */
function truncateStackTrace(stackTrace, maxFrames) {
  if (typeof stackTrace !== 'string') {
    throw new TypeError('stackTrace must be a string');
  }

  const lines = stackTrace.split('\n');
  const header = lines[0];
  const frameLines = lines.slice(1).filter((l) => l.trim().length > 0);

  if (frameLines.length <= maxFrames) {
    return stackTrace;
  }

  const kept = frameLines.slice(0, maxFrames);
  const omitted = frameLines.length - maxFrames;
  const summary = omittedSummary(omitted);

  return [header, ...kept, summary].join('\n');
}

module.exports = { truncateFrames, omittedSummary, truncateStackTrace };
