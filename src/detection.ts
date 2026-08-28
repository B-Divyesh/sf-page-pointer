export interface WordBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextLine {
  top: number;
  bottom: number;
  baseline: number;
  words: WordBox[];
}

export interface DetectionResult {
  lines: TextLine[];
  confidence: 'high' | 'low';
}

interface PixelSource {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

const smooth = (values: number[], radius: number): number[] => values.map((_, index) => {
  let sum = 0;
  let count = 0;
  for (let cursor = Math.max(0, index - radius); cursor <= Math.min(values.length - 1, index + radius); cursor += 1) {
    sum += values[cursor];
    count += 1;
  }
  return sum / count;
});

const groups = (active: boolean[], minSize: number, joinGap = 0): Array<[number, number]> => {
  const found: Array<[number, number]> = [];
  let start = -1;
  let last = -1;
  active.forEach((on, index) => {
    if (on) {
      if (start < 0) start = index;
      last = index;
    } else if (start >= 0 && index - last > joinGap) {
      if (last - start + 1 >= minSize) found.push([start, last]);
      start = -1;
      last = -1;
    }
  });
  if (start >= 0 && last - start + 1 >= minSize) found.push([start, last]);
  return found;
};

/** Detects rows and word-like ink clusters. Pixels never leave the calling device. */
export function detectText(source: PixelSource): DetectionResult {
  const { data, width, height } = source;
  const gray = new Uint8Array(width * height);
  let mean = 0;
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const offset = pixel * 4;
    const value = Math.round(data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114);
    gray[pixel] = value;
    mean += value;
  }
  mean /= width * height;
  const threshold = Math.max(45, Math.min(190, mean - 38));
  const rowInk = new Array<number>(height).fill(0);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (gray[y * width + x] < threshold) rowInk[y] += 1;
    }
  }
  const rowSmoothed = smooth(rowInk, 1);
  const rowThreshold = Math.max(3, width * 0.012);
  const rowGroups = groups(rowSmoothed.map((count) => count > rowThreshold), 3, 2)
    .filter(([top, bottom]) => bottom - top < Math.max(54, height * 0.14));

  const lines: TextLine[] = rowGroups.map(([rawTop, rawBottom]) => {
    const top = Math.max(0, rawTop - 2);
    const bottom = Math.min(height - 1, rawBottom + 2);
    const columnInk = new Array<number>(width).fill(0);
    for (let x = 0; x < width; x += 1) {
      for (let y = top; y <= bottom; y += 1) {
        if (gray[y * width + x] < threshold) columnInk[x] += 1;
      }
    }
    const glyphs = groups(columnInk.map((count) => count >= 1), 1, 1);
    const glyphWidths = glyphs.map(([left, right]) => right - left + 1).sort((a, b) => a - b);
    const medianGlyph = glyphWidths[Math.floor(glyphWidths.length / 2)] ?? 4;
    const wordGap = Math.max(4, Math.min(18, medianGlyph * 0.9));
    const words: WordBox[] = [];
    let wordStart = -1;
    let wordEnd = -1;
    for (const [left, right] of glyphs) {
      if (wordStart < 0) {
        wordStart = left;
        wordEnd = right;
      } else if (left - wordEnd > wordGap) {
        if (wordEnd - wordStart >= 2) words.push({ x: wordStart, y: top, width: wordEnd - wordStart + 1, height: bottom - top + 1 });
        wordStart = left;
        wordEnd = right;
      } else {
        wordEnd = right;
      }
    }
    if (wordStart >= 0 && wordEnd - wordStart >= 2) {
      words.push({ x: wordStart, y: top, width: wordEnd - wordStart + 1, height: bottom - top + 1 });
    }
    let darkestRow = top;
    for (let y = top; y <= bottom; y += 1) if (rowInk[y] >= rowInk[darkestRow]) darkestRow = y;
    return { top, bottom, baseline: darkestRow, words };
  }).filter((line) => line.words.length > 0);

  return { lines, confidence: lines.length > 1 && lines.some((line) => line.words.length > 2) ? 'high' : 'low' };
}

export function nearestPosition(result: DetectionResult, x: number, y: number): { line: number; word: number } | null {
  if (!result.lines.length) return null;
  let line = 0;
  let distance = Number.POSITIVE_INFINITY;
  result.lines.forEach((candidate, index) => {
    const center = (candidate.top + candidate.bottom) / 2;
    const nextDistance = Math.abs(center - y);
    if (nextDistance < distance) {
      distance = nextDistance;
      line = index;
    }
  });
  const words = result.lines[line].words;
  let word = 0;
  let wordDistance = Number.POSITIVE_INFINITY;
  words.forEach((candidate, index) => {
    const center = candidate.x + candidate.width / 2;
    const nextDistance = Math.abs(center - x);
    if (nextDistance < wordDistance) {
      wordDistance = nextDistance;
      word = index;
    }
  });
  return { line, word };
}

export function stepPosition(result: DetectionResult, current: { line: number; word: number }, direction: -1 | 1): { line: number; word: number } {
  const line = result.lines[current.line];
  if (!line) return current;
  const nextWord = current.word + direction;
  if (nextWord >= 0 && nextWord < line.words.length) return { line: current.line, word: nextWord };
  const nextLine = current.line + direction;
  if (nextLine < 0 || nextLine >= result.lines.length) return current;
  return { line: nextLine, word: direction > 0 ? 0 : result.lines[nextLine].words.length - 1 };
}
