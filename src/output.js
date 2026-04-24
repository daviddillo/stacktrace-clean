import { createWriteStream } from 'fs';
import { stdout, stderr } from 'process';

/**
 * Writes output to a stream or file path.
 * @param {string} text
 * @param {object} options
 * @param {string} [options.outputFile] - file path to write to
 * @param {boolean} [options.useStderr] - write to stderr instead of stdout
 * @returns {Promise<void>}
 */
export async function writeOutput(text, options = {}) {
  const { outputFile, useStderr = false } = options;

  if (outputFile) {
    return writeToFile(text, outputFile);
  }

  const stream = useStderr ? stderr : stdout;
  return writeToStream(text, stream);
}

/**
 * Writes a string to a writable stream.
 * @param {string} text
 * @param {NodeJS.WritableStream} stream
 * @returns {Promise<void>}
 */
export function writeToStream(text, stream) {
  return new Promise((resolve, reject) => {
    const data = text.endsWith('\n') ? text : text + '\n';
    stream.write(data, 'utf8', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Writes a string to a file.
 * @param {string} text
 * @param {string} filePath
 * @returns {Promise<void>}
 */
export function writeToFile(text, filePath) {
  return new Promise((resolve, reject) => {
    const stream = createWriteStream(filePath, { encoding: 'utf8' });
    stream.on('error', reject);
    stream.on('finish', resolve);
    const data = text.endsWith('\n') ? text : text + '\n';
    stream.end(data);
  });
}

/**
 * Strips ANSI escape codes from a string.
 * @param {string} text
 * @returns {string}
 */
export function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1B\[[0-9;]*m/g, '');
}

/**
 * Prepares output text, optionally stripping color codes.
 * @param {string} text
 * @param {object} options
 * @param {boolean} [options.noColor]
 * @returns {string}
 */
export function prepareOutput(text, options = {}) {
  if (options.noColor) {
    return stripAnsi(text);
  }
  return text;
}
