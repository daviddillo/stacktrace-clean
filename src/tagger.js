/**
 * tagger.js — attach semantic tags to stack frames for downstream filtering/display
 */

const TAGS = {
  async: /^async /,
  native: /\(native\)/,
  eval: /\beval\b/,
  anonymous: /(<anonymous>|<unknown>)/,
  node_modules: /node_modules/,
  internal: /^(node:|internal\/)/,
  test: /\.(test|spec)\.[jt]sx?/,
  typescript: /\.tsx?:/,
};

/**
 * Return an array of tag strings that apply to a parsed frame.
 * @param {object} frame
 * @returns {string[]}
 */
function tagFrame(frame) {
  const tags = [];
  const { name = '', file = '', raw = '' } = frame;

  for (const [tag, pattern] of Object.entries(TAGS)) {
    if (pattern.test(name) || pattern.test(file) || pattern.test(raw)) {
      tags.push(tag);
    }
  }

  return tags;
}

/**
 * Attach tags to every frame in a stack trace object.
 * @param {object} stackTrace  — { header, frames }
 * @returns {object}           — same shape with tags added to each frame
 */
function tagStackTrace(stackTrace) {
  const frames = (stackTrace.frames || []).map((frame) => ({
    ...frame,
    tags: tagFrame(frame),
  }));
  return { ...stackTrace, frames };
}

/**
 * Filter frames that carry at least one of the requested tags.
 * @param {object[]} frames
 * @param {string[]} wantedTags
 * @returns {object[]}
 */
function filterByTags(frames, wantedTags) {
  if (!wantedTags || wantedTags.length === 0) return frames;
  return frames.filter((f) =>
    (f.tags || []).some((t) => wantedTags.includes(t))
  );
}

/**
 * List all known tag names.
 * @returns {string[]}
 */
function listTags() {
  return Object.keys(TAGS);
}

module.exports = { tagFrame, tagStackTrace, filterByTags, listTags };
