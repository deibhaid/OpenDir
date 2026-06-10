import { describe, expect, it } from 'vitest';
import { isIgnorableScriptingError, isInjectableUrl } from '../src/shared/injection';

describe('isInjectableUrl', () => {
  it('allows http, https, and file URLs', () => {
    expect(isInjectableUrl('https://downloads.rainbowda.sh/movies/')).toBe(true);
    expect(isInjectableUrl('http://example.com/')).toBe(true);
    expect(isInjectableUrl('file:///Users/me/')).toBe(true);
  });

  it('rejects browser internal and error pages', () => {
    expect(isInjectableUrl('chrome-error://chromewebdata/')).toBe(false);
    expect(isInjectableUrl('chrome://extensions/')).toBe(false);
    expect(isInjectableUrl(undefined)).toBe(false);
    expect(isInjectableUrl('not-a-url')).toBe(false);
  });
});

describe('isIgnorableScriptingError', () => {
  it('treats error-page injection failures as ignorable', () => {
    expect(
      isIgnorableScriptingError(new Error('Frame with ID 0 is showing error page')),
    ).toBe(true);
  });
});
