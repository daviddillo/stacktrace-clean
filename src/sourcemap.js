import { SourceMapConsumer } from 'source-map';
import fs from 'fs';
import path from 'path';

const cache = new Map();

export async function loadSourceMap(filePath) {
  if (cache.has(filePath)) return cache.get(filePath);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const mapUrlMatch = content.match(/\/\/[#@]\s*sourceMappingURL=(.+)$/);
    if (!mapUrlMatch) return null;

    const mapUrl = mapUrlMatch[1].trim();

    if (mapUrl.startsWith('data:')) {
      const base64 = mapUrl.split(',')[1];
      const json = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
      const consumer = await new SourceMapConsumer(json);
      cache.set(filePath, consumer);
      return consumer;
    }

    const mapPath = path.resolve(path.dirname(filePath), mapUrl);
    if (!fs.existsSync(mapPath)) return null;

    const mapJson = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    const consumer = await new SourceMapConsumer(mapJson);
    cache.set(filePath, consumer);
    return consumer;
  } catch {
    return null;
  }
}

export async function resolveOriginalPosition(filePath, line, column) {
  const consumer = await loadSourceMap(filePath);
  if (!consumer) return null;

  const pos = consumer.originalPositionFor({ line, column });
  if (!pos.source) return null;

  return {
    source: pos.source,
    line: pos.line,
    column: pos.column,
    name: pos.name,
  };
}

export function clearCache() {
  cache.clear();
}
