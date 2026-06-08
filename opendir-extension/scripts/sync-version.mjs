import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const extRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** package.json is the canonical version; manifest.json must match for Chrome + GitHub releases. */
export function readPackageVersion() {
  const pkg = JSON.parse(readFileSync(resolve(extRoot, 'package.json'), 'utf8'));
  if (!pkg.version || typeof pkg.version !== 'string') {
    throw new Error('package.json is missing a string "version" field');
  }
  return pkg.version;
}

export function syncManifestVersion() {
  const version = readPackageVersion();
  const manifestPath = resolve(extRoot, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.version = version;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return version;
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) {
  const version = syncManifestVersion();
  console.log(`Synced manifest.json version to ${version}`);
}
