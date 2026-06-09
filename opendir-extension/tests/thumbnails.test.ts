import { describe, expect, it } from 'vitest';
import {
  DIRECTORY_COVER_FILES,
  extensionFilterMatchesItem,
  isImageExtensionFilter,
  normalizeDirectoryHref,
  shouldShowDirectoryCover,
  shouldShowImageThumbnail,
} from '../src/content/lib/thumbnails';
import type { DirectoryItem } from '../src/content/types';
import { hasPreviewTypes, thumbnailsActive } from '../src/content/types';

const imageItem: DirectoryItem = {
  name: 'fanart.jpg',
  href: 'https://example.com/movies/a/fanart.jpg',
  type: 'file',
  ext: 'jpg',
  fileType: 'image',
};

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

describe('shouldShowImageThumbnail', () => {
  it('shows image previews when the Images sub-option is enabled', () => {
    expect(
      shouldShowImageThumbnail(imageItem, {
        enabled: true,
        images: true,
        videos: false,
        text: false,
      }),
    ).toBe(true);
  });

  it('shows image previews for image extension filters even without Images sub-option', () => {
    expect(
      shouldShowImageThumbnail(
        imageItem,
        { enabled: true, images: false, videos: false, text: true },
        '*.jpg',
      ),
    ).toBe(true);
  });

  it('does not show image previews when thumbnails are disabled', () => {
    expect(
      shouldShowImageThumbnail(
        imageItem,
        { enabled: false, images: true, videos: false, text: false },
        '*.jpg',
      ),
    ).toBe(false);
  });
});

describe('shouldShowDirectoryCover', () => {
  it('loads cover art only when thumbnails and Images are enabled', () => {
    expect(
      shouldShowDirectoryCover({ enabled: true, images: true, videos: false, text: false }),
    ).toBe(true);
    expect(
      shouldShowDirectoryCover({ enabled: true, images: false, videos: false, text: true }),
    ).toBe(false);
  });

  it('includes common movie-library cover filenames', () => {
    expect(DIRECTORY_COVER_FILES).toEqual([
      'fanart.jpg',
      'poster.jpg',
      'backdrop.jpg',
      'folder.jpg',
    ]);
  });
});

describe('thumbnail helpers', () => {
  it('normalizes directory hrefs with a trailing slash', () => {
    expect(normalizeDirectoryHref('https://example.com/movies/a')).toBe('https://example.com/movies/a/');
  });

  it('matches extension filters against item extensions', () => {
    expect(extensionFilterMatchesItem('*.jpg', imageItem)).toBe(true);
    expect(extensionFilterMatchesItem('*.png', imageItem)).toBe(false);
  });

  it('detects image extension filters', () => {
    expect(isImageExtensionFilter('*.jpg')).toBe(true);
    expect(isImageExtensionFilter('*.mkv')).toBe(false);
  });
});
