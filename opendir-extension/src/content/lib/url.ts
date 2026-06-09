/** decodeURIComponent that returns the input when encoding is invalid. */
export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
