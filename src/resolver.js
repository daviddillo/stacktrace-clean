import path from 'path';
import { resolveOriginalPosition } from './sourcemap.js';

/**
 * Attempts to resolve a parsed stack frame to its original source position.
 * Falls back to the compiled frame if no source map is available.
 *
 * @param {import('./parser.js').ParsedFrame} frame
 * @returns {Promise<import('./parser.js').ParsedFrame>}
 */
export async function resolveFrame(frame) {
  if (!frame.file || !frame.line) return frame;

  const absolutePath = path.isAbsolute(frame.file)
    ? frame.file
    : path.resolve(process.cwd(), frame.file);

  const original = await resolveOriginalPosition(
    absolutePath,
    frame.line,
    frame.column ?? 0
  );

  if (!original) return frame;

  return {
    ...frame,
    file: original.source,
    line: original.line,
    column: original.column,
    name: original.name ?? frame.name,
    isResolved: true,
  };
}

/**
 * Resolves all frames in a stack trace in parallel.
 *
 * @param {import('./parser.js').ParsedFrame[]} frames
 * @returns {Promise<import('./parser.js').ParsedFrame[]>}
 */
export async function resolveFrames(frames) {
  return Promise.all(frames.map(resolveFrame));
}
