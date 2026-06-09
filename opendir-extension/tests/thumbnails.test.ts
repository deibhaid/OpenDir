import { describe, expect, it } from 'vitest';
import { hasPreviewTypes, thumbnailsActive } from '../src/content/types';

describe('thumbnailsActive', () => {
  it('follows the master Thumbnails toggle', () => {
    expect(
      thumbnailsActive({ enabled: false, images: true, videos: true, text: true }),
    ).toBe(false);
    expect(
      thumbnailsActive({ enabled: true, images: false, videos: false, text: false }),
    ).toBe(true);
  });
});

describe('hasPreviewTypes', () => {
  it('is false when master toggle is off', () => {
    expect(
      hasPreviewTypes({ enabled: false, images: true, videos: true, text: true }),
    ).toBe(false);
  });

  it('is false when no preview types are selected', () => {
    expect(
      hasPreviewTypes({ enabled: true, images: false, videos: false, text: false }),
    ).toBe(false);
  });

  it('is true when master is on and a preview type is selected', () => {
    expect(
      hasPreviewTypes({ enabled: true, images: false, videos: false, text: true }),
    ).toBe(true);
  });
});
