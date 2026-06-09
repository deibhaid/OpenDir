/**
 * OpenDir version bump (standard semver patch increment).
 *
 * Each run increments only the patch segment by 1:
 * 0.1.8 -> 0.1.9 -> 0.1.10 -> 0.1.11
 *
 * Run `npm run version:bump` once per release commit (before build).
 */

export function bumpVersion(current) {
  const parts = current.split('.').map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error(`Invalid version: ${current}`);
  }

  const [major, minor, patch] = parts;
  return `${major}.${minor}.${patch + 1}`;
}
