import { describe, expect, it } from 'vitest';
import { bumpVersion } from '../scripts/version.mjs';

describe('bumpVersion', () => {
  it('increments only the patch segment by one', () => {
    expect(bumpVersion('0.0.1')).toBe('0.0.2');
    expect(bumpVersion('0.0.8')).toBe('0.0.9');
    expect(bumpVersion('0.1.8')).toBe('0.1.9');
  });

  it('does not roll patch 9 into the next minor', () => {
    expect(bumpVersion('0.0.9')).toBe('0.0.10');
    expect(bumpVersion('0.1.9')).toBe('0.1.10');
  });

  it('supports multi-digit patch segments', () => {
    expect(bumpVersion('0.1.10')).toBe('0.1.11');
    expect(bumpVersion('1.2.99')).toBe('1.2.100');
  });
});
