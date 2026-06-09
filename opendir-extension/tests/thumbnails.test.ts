import { describe, expect, it } from 'vitest';
import { thumbnailsActive } from '../src/content/types';

describe('thumbnailsActive', () => {
  it('is false when master toggle is off', () => {
    expect(
      thumbnailsActive({ enabled: false, images: true, videos: true, text: true }),
    ).toBe(false);
  });

  it('is false when no thumbnail types are selected', () => {
    expect(
      thumbnailsActive({ enabled: true, images: false, videos: false, text: false }),
    ).toBe(false);
  });

  it('is true when master is on and a type is selected', () => {
    expect(
      thumbnailsActive({ enabled: true, images: false, videos: false, text: true }),
    ).toBe(true);
  });
});
