import { describe, expect, it } from 'vitest';
import { bumpVersion } from '../scripts/version.mjs';

describe('bumpVersion', () => {
  it('increments patch segment', () => {
    expect(bumpVersion('0.0.1')).toBe('0.0.2');
    expect(bumpVersion('0.0.8')).toBe('0.0.9');
  });

  it('rolls patch 9 to next minor', () => {
    expect(bumpVersion('0.0.9')).toBe('0.1.0');
  });

  it('rolls minor 9 patch 9 to next major', () => {
    expect(bumpVersion('0.9.9')).toBe('1.0.0');
  });
});
