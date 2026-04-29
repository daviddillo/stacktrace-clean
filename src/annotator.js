/**
 * annotator.js
 * Annotates stack frames with inline source snippets.
 */

const fs = require('fs');
const path = require('path');

const SNIPPET_RADIUS = 2;

function readSourceLines(filePath) {
  try {
    const abs = path.resolve(filePath);
    const content = fs.readFileSync(abs, 'utf8');
    return content.split('\n');
  } catch {
    return null;
  }
}

function extractSnippet(lines, lineNumber, radius = SNIPPET_RADIUS) {
  if (!lines || lineNumber < 1) return null;
  const start = Math.max(0, lineNumber - 1 - radius);
  const end = Math.min(lines.length - 1, lineNumber - 1 + radius);
  const snippet = [];
  for (let i = start; i <= end; i++) {
    snippet.push({
      line: i + 1,
      text: lines[i],
      isTarget: i + 1 === lineNumber,
    });
  }
  return snippet;
}

function annotateFrame(frame, options = {}) {
  const { radius = SNIPPET_RADIUS, readLines = readSourceLines } = options;
  if (!frame || !frame.file || !frame.line) return { ...frame, snippet: null };
  const lines = readLines(frame.file);
  const snippet = extractSnippet(lines, frame.line, radius);
  return { ...frame, snippet };
}

function annotateStackTrace(stackTrace, options = {}) {
  if (!stackTrace || !Array.isArray(stackTrace.frames)) return stackTrace;
  return {
    ...stackTrace,
    frames: stackTrace.frames.map((f) => annotateFrame(f, options)),
  };
}

module.exports = { readSourceLines, extractSnippet, annotateFrame, annotateStackTrace };
