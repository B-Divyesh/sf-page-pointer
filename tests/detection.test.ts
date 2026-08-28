import { describe, expect, it } from 'vitest';
import { detectText, nearestPosition, stepPosition } from '../src/detection';

function syntheticPage(): { data: Uint8ClampedArray; width: number; height: number } {
  const width = 160;
  const height = 80;
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  const rect = (left: number, top: number, rectWidth: number, rectHeight: number) => {
    for (let y = top; y < top + rectHeight; y += 1) for (let x = left; x < left + rectWidth; x += 1) {
      const offset = (y * width + x) * 4;
      data[offset] = 20; data[offset + 1] = 20; data[offset + 2] = 20; data[offset + 3] = 255;
    }
  };
  // Two rows; separated rectangles behave like letters, larger gaps like words.
  [10, 17, 24, 42, 49, 67, 74, 81].forEach((x) => rect(x, 15, 5, 9));
  [12, 19, 37, 44, 62, 69, 87, 94].forEach((x) => rect(x, 49, 5, 9));
  return { data, width, height };
}

describe('local text geometry', () => {
  it('groups contrasting ink into lines and word-like boxes', () => {
    const result = detectText(syntheticPage());
    expect(result.lines).toHaveLength(2);
    expect(result.lines[0].words.length).toBeGreaterThanOrEqual(3);
    expect(result.confidence).toBe('high');
  });

  it('orients to the nearest line and advances across line boundaries', () => {
    const result = detectText(syntheticPage());
    const current = nearestPosition(result, 45, 18);
    expect(current).not.toBeNull();
    if (!current) return;
    expect(current.line).toBe(0);
    const lastOnLine = { line: 0, word: result.lines[0].words.length - 1 };
    expect(stepPosition(result, lastOnLine, 1)).toEqual({ line: 1, word: 0 });
  });

  it('fails quietly when a blank frame has no printed line', () => {
    const width = 80;
    const height = 40;
    const result = detectText({ data: new Uint8ClampedArray(width * height * 4).fill(255), width, height });
    expect(result.lines).toEqual([]);
    expect(nearestPosition(result, 10, 10)).toBeNull();
  });
});
