import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { readPackageVersion, syncManifestVersion } from '../scripts/sync-version.mjs';

const extRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

describe('syncManifestVersion', () => {
  it('keeps manifest.json version aligned with package.json', () => {
    syncManifestVersion();
    const pkgVersion = readPackageVersion();
    const manifest = JSON.parse(readFileSync(resolve(extRoot, 'manifest.json'), 'utf8'));
    expect(manifest.version).toBe(pkgVersion);
  });
});
