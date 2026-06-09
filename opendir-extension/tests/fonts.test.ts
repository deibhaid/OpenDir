import { describe, expect, it } from 'vitest';
import { applyFontFamily, FONT_STACKS, isFontFamily } from '../src/content/lib/fonts';

describe('fonts', () => {
  it('recognizes valid font families', () => {
    expect(isFontFamily('mono')).toBe(true);
    expect(isFontFamily('sans')).toBe(true);
    expect(isFontFamily('comic')).toBe(false);
  });

  it('applies the selected stack to the document root', () => {
    applyFontFamily('serif');
    expect(document.documentElement.style.getPropertyValue('--opendir-font-family')).toBe(
      FONT_STACKS.serif,
    );
    applyFontFamily('mono');
  });
});
