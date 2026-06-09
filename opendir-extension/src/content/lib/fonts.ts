export type FontFamily = 'mono' | 'sans' | 'serif' | 'system';

export const DEFAULT_FONT_FAMILY: FontFamily = 'mono';

export const FONT_STACKS: Record<FontFamily, string> = {
  mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`,
  sans: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  serif: `ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif`,
  system: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
};

export const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: 'mono', label: 'Directory' },
  { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'system', label: 'System' },
];

export function isFontFamily(value: unknown): value is FontFamily {
  return typeof value === 'string' && value in FONT_STACKS;
}

export function applyFontFamily(font: FontFamily): void {
  document.documentElement.style.setProperty('--opendir-font-family', FONT_STACKS[font]);
}
