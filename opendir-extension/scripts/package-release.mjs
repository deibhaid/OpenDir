#!/usr/bin/env node
/**
 * Package OpenDir dist/ for GitHub release upload.
 * Run from repo root after `npm run build` in opendir-extension/.
 */

import { readFileSync, mkdirSync, cpSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { readPackageVersion } from './sync-version.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extRoot = resolve(__dirname, '..');
const repoRoot = resolve(extRoot, '..');
const version = readPackageVersion();
const distManifest = JSON.parse(readFileSync(resolve(extRoot, 'dist/manifest.json'), 'utf8'));

if (distManifest.version !== version) {
  throw new Error(
    `Version mismatch: package.json is ${version} but dist/manifest.json is ${distManifest.version}. Run npm run build after bumping.`,
  );
}

const packageDir = resolve(repoRoot, 'release', `opendir-extension-v${version}`);
const zipPath = resolve(repoRoot, 'release', `OpenDir-${version}.zip`);

rmSync(packageDir, { recursive: true, force: true });
mkdirSync(packageDir, { recursive: true });
cpSync(resolve(extRoot, 'dist'), resolve(packageDir, 'dist'), { recursive: true });
for (const doc of ['CHANGELOG.md', 'NOTICE.md', 'RELEASE.md']) {
  cpSync(resolve(extRoot, doc), resolve(packageDir, doc));
}

rmSync(zipPath, { force: true });
execSync(`zip -r "${zipPath}" "opendir-extension-v${version}"`, {
  cwd: resolve(repoRoot, 'release'),
  stdio: 'inherit',
});

console.log(`Created ${zipPath} (manifest v${distManifest.version})`);
