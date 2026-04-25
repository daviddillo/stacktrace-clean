/**
 * linker.js — generates clickable terminal hyperlinks for stack frame file paths
 */

const path = require('path');

const OSC = '\u001B]';
const BEL = '\u0007';
const SEP = ';';

/**
 * Build a file:// URI from an absolute or relative file path plus line/col.
 * @param {string} filePath
 * @param {number} [line]
 * @param {number} [col]
 * @returns {string}
 */
function buildFileUri(filePath, line, col) {
  const abs = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  // Normalize Windows backslashes
  const normalized = abs.replace(/\\/g, '/');
  let uri = `file://${normalized}`;
  if (line != null) {
    uri += `:${line}`;
    if (col != null) uri += `:${col}`;
  }
  return uri;
}

/**
 * Wrap text in an OSC 8 terminal hyperlink sequence.
 * Falls back to plain text if the terminal doesn't support it.
 * @param {string} text
 * @param {string} uri
 * @returns {string}
 */
function hyperlink(text, uri) {
  return `${OSC}8${SEP}${SEP}${uri}${BEL}${text}${OSC}8${SEP}${SEP}${BEL}`;
}

/**
 * Determine if the current terminal likely supports OSC 8 hyperlinks.
 * @returns {boolean}
 */
function supportsHyperlinks() {
  const { TERM_PROGRAM, TERM, VTE_VERSION, WT_SESSION } = process.env;
  if (WT_SESSION) return true;
  if (VTE_VERSION && parseInt(VTE_VERSION, 10) >= 5000) return true;
  if (TERM_PROGRAM === 'iTerm.app') return true;
  if (TERM_PROGRAM === 'WezTerm') return true;
  if (TERM === 'xterm-kitty') return true;
  return false;
}

/**
 * Return a linked label for a file path + position if the terminal supports it,
 * otherwise return the raw label unchanged.
 * @param {string} label  — display text (already formatted/colored)
 * @param {string} filePath
 * @param {number} [line]
 * @param {number} [col]
 * @returns {string}
 */
function linkFrame(label, filePath, line, col) {
  if (!filePath || !supportsHyperlinks()) return label;
  try {
    const uri = buildFileUri(filePath, line, col);
    return hyperlink(label, uri);
  } catch {
    return label;
  }
}

module.exports = { buildFileUri, hyperlink, supportsHyperlinks, linkFrame };
