/**
 * OpenDir version bump (single-digit semver segments).
 *
 * Rule when drafting a new release:
 * - Increment patch: 0.0.1 -> 0.0.2
 * - Patch max 9, then minor +1: 0.0.9 -> 0.1.0
 * - Minor max 9, then major +1: 0.9.9 -> 1.0.0
 */

export function bumpVersion(current) {
  const parts = current.split('.').map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error(`Invalid version: ${current}`);
  }

  let [major, minor, patch] = parts;
  patch += 1;
  if (patch > 9) {
    patch = 0;
    minor += 1;
  }
  if (minor > 9) {
    minor = 0;
    major += 1;
  }

  return `${major}.${minor}.${patch}`;
}
