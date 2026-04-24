import { parseStackTrace } from './parser.js';
import { resolveFrames } from './resolver.js';
import { filterFrames } from './filter.js';
import { deduplicateFrames } from './deduplicator.js';
import { truncateStackTrace } from './truncator.js';
import { groupFrames, flattenGroups } from './grouper.js';
import { formatStackTrace } from './formatter.js';
import { highlightStackTrace } from './highlighter.js';

/**
 * Default pipeline steps in order.
 */
const DEFAULT_STEPS = [
  'parse',
  'resolve',
  'filter',
  'deduplicate',
  'truncate',
  'group',
  'format',
  'highlight',
];

/**
 * Run the full processing pipeline on raw stack trace input.
 * @param {string} input - Raw stack trace string.
 * @param {object} config - Resolved config object.
 * @param {string[]} [steps] - Pipeline steps to run.
 * @returns {Promise<string>} - Final formatted output.
 */
export async function runPipeline(input, config = {}, steps = DEFAULT_STEPS) {
  let state = { raw: input, frames: [], header: '', output: '' };

  for (const step of steps) {
    state = await runStep(step, state, config);
  }

  return state.output;
}

async function runStep(step, state, config) {
  switch (step) {
    case 'parse': {
      const parsed = parseStackTrace(state.raw);
      return { ...state, frames: parsed.frames, header: parsed.header };
    }
    case 'resolve': {
      const frames = await resolveFrames(state.frames, config);
      return { ...state, frames };
    }
    case 'filter': {
      const frames = filterFrames(state.frames, config);
      return { ...state, frames };
    }
    case 'deduplicate': {
      const frames = deduplicateFrames(state.frames, config);
      return { ...state, frames };
    }
    case 'truncate': {
      const frames = truncateStackTrace(state.frames, config);
      return { ...state, frames };
    }
    case 'group': {
      const groups = groupFrames(state.frames, config);
      const frames = flattenGroups(groups);
      return { ...state, frames, groups };
    }
    case 'format': {
      const output = formatStackTrace(state.header, state.frames, config);
      return { ...state, output };
    }
    case 'highlight': {
      const output = config.color === false
        ? state.output
        : highlightStackTrace(state.output, config);
      return { ...state, output };
    }
    default:
      throw new Error(`Unknown pipeline step: "${step}"`);
  }
}

export { DEFAULT_STEPS };
