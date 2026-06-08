/** Mount Radix overlays inside the app root so they stay styled and above the header. */
export function getAppPortalContainer(): HTMLElement | undefined {
  return document.getElementById('root') ?? undefined;
}
