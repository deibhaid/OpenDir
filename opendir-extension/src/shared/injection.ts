/** URLs where OpenDir can run content scripts (excludes browser error pages). */
export function isInjectableUrl(url: string | undefined): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'chrome-error:' || parsed.protocol === 'chrome:') {
      return false;
    }

    return (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:' ||
      parsed.protocol === 'file:'
    );
  } catch {
    return false;
  }
}

export function isIgnorableScriptingError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('error page') ||
    message.includes('Cannot access') ||
    message.includes('No tab with id') ||
    message.includes('The tab was closed') ||
    message.includes('The extensions gallery cannot be scripted')
  );
}
