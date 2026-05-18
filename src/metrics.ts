export interface TextMetrics {
  bytes: number;
  lines: number;
  nonEmptyLines: number;
  tokens: number;
}

export function estimateTokens(content: string): number {
  if (content.length === 0) {
    return 0;
  }

  const words = content.match(/[A-Za-z0-9_]+|[^\sA-Za-z0-9_]/g) ?? [];
  const characterEstimate = Math.ceil(content.length / 4);

  return Math.max(words.length, characterEstimate);
}

export function measureText(content: string): TextMetrics {
  const lines = content.length === 0 ? 0 : content.split(/\r\n|\r|\n/).length;
  const nonEmptyLines = content
    .split(/\r\n|\r|\n/)
    .filter((line) => line.trim().length > 0).length;

  return {
    bytes: Buffer.byteLength(content, "utf8"),
    lines,
    nonEmptyLines,
    tokens: estimateTokens(content)
  };
}
