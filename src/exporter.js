import { toJSON, toPlainText, toMarkdown } from './serializer.js';
import { writeToFile, writeToStream } from './output.js';

const FORMATS = ['json', 'text', 'markdown'];

export function validateFormat(format) {
  if (!FORMATS.includes(format)) {
    throw new Error(`Unsupported export format: "${format}". Choose from: ${FORMATS.join(', ')}`);
  }
}

export function serializeAs(stackTrace, format) {
  switch (format) {
    case 'json':     return toJSON(stackTrace);
    case 'text':     return toPlainText(stackTrace);
    case 'markdown': return toMarkdown(stackTrace);
    default:         throw new Error(`Unknown format: ${format}`);
  }
}

export function getExtension(format) {
  const map = { json: '.json', text: '.txt', markdown: '.md' };
  return map[format] ?? '.txt';
}

export async function exportToFile(stackTrace, format, filePath) {
  validateFormat(format);
  const content = serializeAs(stackTrace, format);
  const resolvedPath = filePath.endsWith(getExtension(format))
    ? filePath
    : `${filePath}${getExtension(format)}`;
  await writeToFile(resolvedPath, content);
  return resolvedPath;
}

export async function exportToStream(stackTrace, format, stream) {
  validateFormat(format);
  const content = serializeAs(stackTrace, format);
  await writeToStream(stream, content);
}

export function listFormats() {
  return [...FORMATS];
}
