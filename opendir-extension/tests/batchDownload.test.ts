import { describe, expect, it, vi } from 'vitest';
import { clampDelayMs, computeDownloadOffsets, computeGap } from '../src/content/download/batchDownload';

describe('batch download timing', () => {
  it('returns a single zero offset for one file', () => {
    expect(computeDownloadOffsets(1, 1500, false)).toEqual([0]);
  });

  it('schedules second file at fixed delay when random is off', () => {
    expect(computeDownloadOffsets(2, 1500, false)).toEqual([0, 1500]);
  });

  it('clamps fixed delay to minimum 250ms', () => {
    expect(computeDownloadOffsets(2, 100, false)).toEqual([0, 250]);
    expect(computeGap(100, false)).toBe(250);
  });

  it('keeps random gaps within [250, D]', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(computeGap(1500, true, 0)).toBe(250);

    random.mockReturnValue(1);
    expect(computeGap(1500, true, 1)).toBe(1500);

    random.mockRestore();
  });

  it('builds cumulative offsets for multiple files with fixed delay', () => {
    expect(computeDownloadOffsets(3, 1500, false)).toEqual([0, 1500, 3000]);
  });

  it('always clamps delay input', () => {
    expect(clampDelayMs(100)).toBe(250);
    expect(clampDelayMs(1500)).toBe(1500);
  });
});
