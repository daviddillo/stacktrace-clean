/**
 * differ.js — compares two stack traces and highlights what changed
 */

'use strict';

/**
 * Compute a simple line-level diff between two arrays of frames.
 * Returns an array of { type: 'same'|'added'|'removed', frame } objects.
 */
function diffFrames(framesA, framesB) {
  const keysA = framesA.map(frameKey);
  const keysB = framesB.map(frameKey);

  const result = [];

  let i = 0;
  let j = 0;

  while (i < keysA.length || j < keysB.length) {
    if (i >= keysA.length) {
      result.push({ type: 'added', frame: framesB[j++] });
    } else if (j >= keysB.length) {
      result.push({ type: 'removed', frame: framesA[i++] });
    } else if (keysA[i] === keysB[j]) {
      result.push({ type: 'same', frame: framesB[j] });
      i++;
      j++;
    } else {
      const nextInB = keysB.indexOf(keysA[i], j);
      const nextInA = keysA.indexOf(keysB[j], i);

      if (nextInB === -1 && nextInA === -1) {
        result.push({ type: 'removed', frame: framesA[i++] });
        result.push({ type: 'added', frame: framesB[j++] });
      } else if (nextInA === -1 || (nextInB !== -1 && nextInB <= nextInA)) {
        result.push({ type: 'removed', frame: framesA[i++] });
      } else {
        result.push({ type: 'added', frame: framesB[j++] });
      }
    }
  }

  return result;
}

function frameKey(frame) {
  return `${frame.file || ''}:${frame.line || ''}:${frame.column || ''}:${frame.name || ''}`;
}

/**
 * Summarise a diff result into counts.
 */
function diffSummary(diff) {
  return diff.reduce(
    (acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    },
    { same: 0, added: 0, removed: 0 }
  );
}

/**
 * Compare two full parsed stack trace objects.
 * Returns { headerChanged, diff, summary }
 */
function compareStackTraces(traceA, traceB) {
  const headerChanged = traceA.header !== traceB.header;
  const diff = diffFrames(traceA.frames || [], traceB.frames || []);
  const summary = diffSummary(diff);
  return { headerChanged, diff, summary };
}

module.exports = { diffFrames, diffSummary, compareStackTraces };
